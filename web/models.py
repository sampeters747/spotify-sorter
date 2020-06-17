from flask_login import UserMixin, LoginManager
from flask_sqlalchemy import SQLAlchemy
import config_app
import time

Config = config_app.Config
db_created = False
while(not db_created):
    try:
        db = SQLAlchemy(config_app.app)
        db_created = True
    except:
        print("DB connection was not established, waiting 5 seconds then retrying")
        time.sleep(5)
# User class is used as both the model for the user db table and the user object used by flask-login
class User(db.Model, UserMixin):
    __tablename__ = 'user'
    # Spotify user account info/auth credentials
    id= db.Column(db.String(), unique=True, nullable=False, primary_key=True)
    display_name= db.Column(db.String())
    access_token= db.Column(db.String(300))
    access_expires= db.Column(db.Integer)
    refresh_token= db.Column(db.String())
    tracks = db.relationship('Track', secondary='user_tracks', backref=db.backref('users'))

    def has_access_token(self):
        return self.access_token is not None

    def has_refresh_token(self):
        return self.refresh_token is not None

    def is_access_expired(self):
        if self.has_access_token():
            now = time.time()
            return (self.access_expires - now) < 60
        else:
            return False

    def refresh_access_token(self, OAuthObj):
        if self.has_refresh_token():
            response = OAuthObj.refresh_access_token(self.refresh_token)
            self.access_token = response['access_token']
            self.refresh_token = response['refresh_token']
            return True
        else:
            return False

    def check_auth(self):
        status = True
        if self.has_access_token():
            if self.is_access_expired():
                status = self.refresh_access_token()
        else:
            status = False
        return status

class Track(db.Model):
    __tablename__ = 'track'
    track_id = db.Column(db.String(), primary_key=True)
    title = db.Column(db.String(), nullable=False)
    artist = db.Column(db.String())
    preview_url = db.Column(db.String())
    features_updated = db.Column(db.Boolean, default=False)
    acousticness = db.Column(db.Float)
    danceability = db.Column(db.Float)
    energy = db.Column(db.Float)
    instrumentalness = db.Column(db.Float)
    key = db.Column(db.Integer)
    liveness = db.Column(db.Float)
    loudness = db.Column(db.Float)
    mode = db.Column(db.Integer)
    speechiness = db.Column(db.Float)
    valence = db.Column(db.Float)
    tempo = db.Column(db.Float)
    saved_by = db.Column(db.String())

user_tracks = db.Table('user_tracks',
        db.Column('user_id', db.String(), db.ForeignKey('user.id'), primary_key=True),
        db.Column('track_id', db.String(), db.ForeignKey('track.track_id'), primary_key=True)
)

# Postgres Stuff
if Config.RECREATE_TABLES:
    db.drop_all()
    db.create_all()

# flask-login stuff
login_manager = LoginManager()
login_manager.init_app(config_app.app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.filter_by(id=user_id).first()
