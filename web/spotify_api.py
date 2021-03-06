""" Files holds all the code necessary for the application to request/store/modify a spotify user's data provided they went through the OAuth process
and we have a User object representing them stored in our DB """
import config_app
from math import ceil
import models
import random
import spotipy
from spotipy import oauth2

Config = config_app.Config

redirect_url = 'http://sorter.sampeters.me/callback'
oauth_client = oauth2.SpotifyOAuth(client_id=Config.SPOTIFY_CLIENT_ID,
					client_secret=Config.SPOTIFY_CLIENT_SECRET,
					redirect_uri=redirect_url,
					scope=Config.SCOPE,
                                        username="default")

app = config_app.app
db = models.db


def get_api_client(user):
    """ Creates a User specific spotify client that uses their access token to make Spotify API requests """
    if user.is_access_expired():
        user.refresh_access_token(oauth_client)
    return spotipy.client.Spotify(user.access_token)


def download_user_library(user):
    """ Saves a user's spotify library to the track table in our DB """
    client = get_api_client(user)
    # Each item is a Saved Track item from Spotify's api
    resp_items = []
    response = client.current_user_saved_tracks(limit=50)
    resp_items += response['items']
    # Number of tracks in the user's library not returned yet
    # If the number is 0 or less we've already retrieved all the user's songs
    tracks_remaining = response['total'] - 50
    offset = 50
    while(tracks_remaining > 0):
        print("Finished another batch of requests", tracks_remaining, "tracks remaining")
        response = client.current_user_saved_tracks(limit=50, offset=offset)
        resp_items += response['items']
        offset += 50
        tracks_remaining -= 50
    
    # Turning response items into entries in the track table in our database
    user.tracks = []
    library = []
    for item in resp_items:
        t = item['track']
        # Checking if there's an existing track in our Tracks table whose id matches our response items
        existing_track = models.Track.query.filter_by(track_id=t['id']).first()
        if existing_track:
            user.tracks.append(existing_track)
        else: 
            new_track = models.Track(track_id=t['id'], title=t['name'], artist=t['artists'][0]['name'], preview_url=t['preview_url'])
            user.tracks.append(new_track)
    db.session.commit()

def download_track_features(user):
    """ Requests feature data for all the tracks in user.tracks from Spotify's API """
    client = get_api_client(user)
    resp_items = []
    # We request feature info for tracks in batches of 100
    batch_count = ceil(len(user.tracks)/100)
    for batch_n in range(batch_count):
        track_ids = [track.track_id for track in user.tracks[100*batch_n:100*(batch_n+1)]]
        resp_items += client.audio_features(track_ids)

    for i in range(len(resp_items)):
        item = resp_items[i]
        # Double checking that resp_items[i]'s data corresponds to user.tracks[i]
        if item and (item['id'] == user.tracks[i].track_id):
            for feature in Config.FEATURE_LIST:
                setattr(user.tracks[i], feature, item[feature])
        else:
            raise ValueError
    db.session.commit()

def get_playlist_name():
    with open(Config.PLAYLIST_NAME_FILEPATH) as f:
        name = random.choice(f.readlines())
    return name

def save_playlist_to_spotify(user, playlist):
    """ Creates a new public spotify playlist owned by the user
    playlist: list of track_ids
    """
    client = get_api_client(user)
    playlist_name = get_playlist_name()
    response = client.user_playlist_create(user.id, playlist_name, description="Created using sorter.sampeters.me")
    playlist_id = response['id']
    for i in range(0, len(playlist), 100):
        client.user_playlist_add_tracks(user.id, playlist_id, playlist[i:i+100])
    app.logger.info(f"User: {user.display_name} saved a playlist named: {playlist_name}, of length: {len(playlist)} to their account")



