import config_app
from flask import request, session, redirect, url_for, render_template
from flask_login import login_user, logout_user, current_user, login_required
import models
import spotipy
import spotify_api

app = config_app.app
db = models.db
login_manager = models.login_manager
oauth_client = spotify_api.oauth_client


@app.route('/')
def index():
    return redirect(oauth_client.get_authorize_url())

@app.route('/callback')
def callback():
    code = oauth_client.parse_response_code(request.url)
    # If url actually included a code param
    if code != request.url:
        response = oauth_client.get_access_token(code)
        # User specific oauth client that communicates with Spotify's API
        sp_user_client = spotipy.client.Spotify(auth=response['access_token'])
        me = sp_user_client.me()
        existing_user = models.User.query.filter_by(id=me['id']).first()
        # Checking if existing user stored in our DB
        if existing_user:
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
    
    return redirect(url_for('show_user'))


def tempce():
    return current_user.display_name

@app.route('/show_user')
def show_user():
    return tempce()

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('show_user'))
