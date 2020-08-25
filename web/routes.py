import config_app
from flask import request, session, redirect, url_for, render_template, jsonify
from flask_login import login_user, logout_user, current_user, login_required
import models
import process_songs as ps
import spotipy
import spotify_api

app = config_app.app
Config = config_app.Config
db = models.db
login_manager = models.login_manager
oauth_client = spotify_api.oauth_client
authorize_url = oauth_client.get_authorize_url()
@app.route('/')
def index():
    return render_template('index.html', user_browser=request.user_agent.browser, authorize_url=authorize_url)

@app.route('/demo')
def demo():
    """ Demo view lets people create new playlist using a premade demo library, but doesn't let user save the playlists """
    app.logger.info(request.user_agent.browser)
    return render_template('demo.html', user_browser=request.user_agent.browser, authorize_url=authorize_url)

@app.route('/callback')
def callback():
    code = oauth_client.parse_response_code(request.url)
    # Checking if url actually included a code param
    if code != request.url:
        response = oauth_client.get_access_token(code, check_cache=False)
        # User specific oauth client that communicates with Spotify's API
        sp_user_client = spotipy.client.Spotify(response['access_token'])
        me = sp_user_client.me()
        existing_user = models.User.query.filter_by(id=me['id']).first()
        # Checking if existing user stored in our DB
        if existing_user:
            app.logger.info("Existing user logged in")
            login_user(existing_user)
        else:
            new_user = models.User(id=me['id'], 
                    display_name=me['display_name'], 
                    access_token=response['access_token'], 
                    access_expires=response['expires_at'], 
                    refresh_token=response['refresh_token'])
            db.session.add(new_user)
            db.session.commit()
            login_user(new_user)
    else:
        return "Error, no code was sent from spotify"
    
    return redirect(url_for('index'))

@app.route('/fetch_library')
@login_required
def fetch_library():
    """ Fetches basic data about the songs in a user's library from spotify, storing it in the database """
    spotify_api.download_user_library(current_user)
    return "test"

@app.route('/fetch_features')
@login_required
def fetch_features():
    """ Fetches feature data for a user's tracks from Spotify's API """
    spotify_api.download_track_features(current_user)
    return "test2"

@app.route('/first_n', methods=['POST'])
def first_n():
    form = request.form.to_dict(flat=False)
    demo = form['demo']
    app.logger.info(f"Firstn function found demo value was {demo}")
    if current_user.is_authenticated and demo == 'false':
        user = current_user
    else:
        user = models.User.query.filter_by(display_name=Config.DEFAULT_USER).first()
    resp_dict = {}
    
    seed_track = models.Track.query.filter_by(title=form['seed_track_input'][0]).first()
    playlist_legnth = min(int(form['playlist_length'][0]), len(user.tracks))
    if seed_track:
        playlist = ps.closest_n_songs(user, seed_track.track_id, playlist_legnth)
        out = ps.stringify_playlist(playlist, included_features=['tempo', 'energy', 'valence', 'instrumentalness'])
        resp_dict['playlist'] = [t.serialize() for t in playlist]
        resp_dict['status'] = True
    else:
        resp_dict['status'] = False
    return jsonify(resp_dict)

@app.route('/cluster', methods=['GET','POST'])
def cluster_library():
    form = request.form.to_dict(flat=False)
    demo = form['demo'][0]
    if current_user.is_authenticated:
        user = current_user
    else:
        user = models.User.query.filter_by(display_name=Config.DEFAULT_USER).first()
    resp_dict = {}
    
    number_of_clusters = int(form["cluster_number"][0])
    number_of_repetitions = int(form["repetition_number"][0])
    clusters = ps.run_library_clustering(user, number_of_clusters, number_of_repetitions)
    serialized_clusters = [[t.serialize() for t in cluster] for cluster in clusters]
    resp_dict['clusters'] = serialized_clusters
    resp_dict['status'] = True
    return jsonify(resp_dict)
      

@app.route('/show_tracks', methods=['GET', 'POST'])
def show_tracks():
    """ Returns json data for all the tracks in a user's library """
    resp_dict = {}
    data = request.form.to_dict(flat=False)
    app.logger.info(data)
    demo = data['demo'][0]
    app.logger.info(demo)
    if current_user.is_authenticated and demo == 'false':
        app.logger.info("Showing current user's tracks")
        resp_dict = {}
        if len(current_user.tracks) != 0:
            resp_dict['status'] = True
            resp_dict['tracks'] = [t.serialize() for t in current_user.tracks]
        else:
            spotify_api.download_user_library(current_user)
            spotify_api.download_track_features(current_user)
            resp_dict['status'] = True
            resp_dict['tracks'] = [t.serialize() for t in current_user.tracks]
        return jsonify(resp_dict)
    else:
        app.logger.info("Showing default user's tracks")
        default_user = models.User.query.filter_by(display_name=Config.DEFAULT_USER).first()
        resp_dict['status'] = True
        resp_dict['tracks'] = [t.serialize() for t in default_user.tracks]
        return jsonify(resp_dict)

@app.route('/save_playlist', methods=['POST'])
@login_required
def save_playlist():
    form = request.form.to_dict(flat=False)
    resp_dict = {}

    if form:
        spotify_api.save_playlist_to_spotify(current_user, form['playlist[]'])
        """
        try:
            playlist_name = spotify_api.save_playlist_to_spotify(current_user, form['playlist'])
            resp_dict['status'] = True
            resp_dict['playlist_name'] = playlist_name
        except:
            resp_dict['status'] = False
        """
    else:
        resp_dict['status'] = False
    return jsonify(resp_dict)


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))
