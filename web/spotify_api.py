import config_app
import models
import spotipy
from spotipy import oauth2

Config = config_app.Config

redirect_url = 'http://167.114.67.158:5000/callback'
scope = Config.SCOPE
oauth_client = oauth2.SpotifyOAuth(Config.SPOTIFY_CLIENT_ID,
					Config.SPOTIFY_CLIENT_SECRET,
					redirect_url,
					scope)



def get_api_client(user):
    """ Creates a User specific spotify client that uses their access token """
    if user.is_access_expired():
        user.refresh_access_token(oauth_client)
    return spotipy.client.Spotify(user.access_token)


def download_library(user):
    """ Saves a user's spotify library to the track table in our DB """
    client = get_api_client(user)
    # Each item is a Saved Track item from Spotify's api
    resp_items = []
    response = client.current_user_saved_traacks(limit=50)
    resp_items += response['items']
    # Number of tracks in the user's library not returned yet
    # If the number is 0 or less we've already retrieved all the user's songs
    tracks_remaining = response['total'] - 50
    offset = 50
    while(tracks_remaining > 0):
        response = client.current_user_saved_tracks(limit=50, offset=offset)
        resp_items += response['items']
        offset += 50
    
    # Turning response items into entries in the track table in our database
    library = []
    for item in resp_items:
        pass

