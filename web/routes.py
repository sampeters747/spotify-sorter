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

@app.route('/')
def index():
    return redirect(oauth_client.get_authorize_url())

@app.route('/demo')
def demo():
    """ Demo view lets people create new playlist using a premade demo library, but doesn't let user save the playlists """
    return render_template('demo.html')

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
    
    return redirect(url_for('demo'))

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
    if current_user.is_authenticated:
        user = current_user
    else:
        user = models.User.query.filter_by(display_name=Config.DEFAULT_USER).first()
    resp_dict = {}
    form = request.form.to_dict(flat=False)
    seed_track = models.Track.query.filter_by(title=form['seed_track_input'][0]).first()
    if seed_track:
        playlist = ps.closest_n_songs(user, seed_track.track_id, 10)
        out = ps.stringify_playlist(playlist, included_features=['tempo', 'energy', 'valence', 'instrumentalness'])
        resp_dict['playlist'] = [t.serialize() for t in playlist]
        resp_dict['status'] = True
    else:
        resp_dict['status'] = False
    return jsonify(resp_dict)

@app.route('/cluster', methods=['GET','POST'])
def cluster_library():
    if current_user.is_authenticated:
        user = current_user
    else:
        user = models.User.query.filter_by(display_name=Config.DEFAULT_USER).first()
    resp_dict = {}
    
    form = request.form.to_dict(flat=False)
    number_of_clusters = int(form["cluster_number"][0])
    number_of_repetitions = int(form["repetition_number"][0])
    app.logger.info(str(number_of_clusters))
    #except:
     #   number_of_clusters = 10
      #  number_of_repetitions = 30
      #  app.logger.info("Retrieving form data failed")
    clusters = ps.run_library_clustering(user, number_of_clusters, number_of_repetitions)
    serialized_clusters = [[t.serialize() for t in cluster] for cluster in clusters]
    resp_dict['clusters'] = serialized_clusters
    resp_dict['status'] = True
    print(jsonify(resp_dict))
    return jsonify(resp_dict)
      

@app.route('/show_user')
def show_user():
    return current_user.display_name

@app.route('/show_tracks')
def show_tracks():
    """ Returns json data for all the tracks in a user's library """
    resp_dict = {}
    if current_user.is_authenticated:
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
        default_user = models.User.query.filter_by(display_name=Config.DEFAULT_USER).first()
        resp_dict['status'] = True
        resp_dict['tracks'] = [t.serialize() for t in default_user.tracks]
        return jsonify(resp_dict)

@app.route('/save_playlist', methods=['POST'])
@login_required
def save_playlist():
    form = request.form.to_dict(flat=False)
    resp_dict = {}
    app.logger.info('playlist[]' in form)
    app.logger.info(form['playlist[]'])

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
    return redirect(url_for('show_user'))
