from os import environ

class Config:
    SPOTIFY_CLIENT_ID = environ.get('SPOTIFY_CLIENT_ID',
            'CHANGEME')
    SPOTIFY_CLIENT_SECRET = environ.get('SPOTIFY_CLIENT_SECRET',
            'CHANGEME')
    FLASK_SECRET = environ.get('FLASK_SECRET', 'CHANGE_FLASK_SECRET')
    
    DB_USER = environ.get('DB_USER', 'sam')
    DB_PW = environ.get('DB_PW', 'dPJPfXpGmpxrtkyI')
    POSTGRES_DB = environ.get('POSTGRES_DB', 'tracks')
    DB_URI = environ.get('DB_URI',
            f'postgresql://{DB_USER}:{DB_PW}@db:5432/spotify')
    TRACK_SQL_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    RECREATE_TABLES = environ.get('RECREATE_TABLES', 'True') == 'True'

