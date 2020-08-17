from os import environ
from flask import Flask
class Config:
    FLASK_ENV = "development"
    SPOTIFY_CLIENT_ID = environ.get('SPOTIFY_CLIENT_ID',
            'CHANGEME')
    SPOTIFY_CLIENT_SECRET = environ.get('SPOTIFY_CLIENT_SECRET',
            'CHANGEME')
    SECRET_KEY = environ.get('FLASK_SECRET', 'CHANGE_FLASK_SECRET')
    
    DB_USER = environ.get('DB_USER', 'sam')
    DB_PW = environ.get('DB_PW', 'dPJPfXpGmpxrtkyI')
    POSTGRES_DB = environ.get('POSTGRES_DB', 'tracks')
    SQLALCHEMY_DATABASE_URI = environ.get('DB_URI',
            f'postgresql://{DB_USER}:{DB_PW}@db:5432/spotify')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    SCOPE = 'user-library-read user-read-private playlist-modify-public'
    RECREATE_TABLES = environ.get('RECREATE_TABLES', 'False') == 'True'

    FEATURE_LIST = ['acousticness', 'danceability', 'energy', 'instrumentalness', 'liveness',
            'loudness', 'speechiness', 'valence', 'key', 'tempo', 'mode']

    PLAYLIST_NAME_FILEPATH = 'playlist_names.txt'
    DEFAULT_USER = 'what'
app = Flask("__main__")
app.config.from_object(Config)
