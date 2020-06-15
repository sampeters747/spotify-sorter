from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from __init__ import db, app, login_manager, Config

# User class is used as both the model for the user db table and the user object used by flask-login
class User(db.Model, UserMixin):
    __tablename__ = 'user'
    # Spotify user account info/auth credentials
    id= db.Column(db.String(), unique=True, nullable=False, primary_key=True)
    display_name= db.Column(db.String())
    access_token= db.Column(db.String(300))
    access_expires= db.Column(db.Integer)
    refresh_token= db.Column(db.String())

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

# Postgres Stuff
if Config.RECREATE_TABLES:
    db.drop_all()
    db.create_all()

# flask-login stuff


@login_manager.user_loader
def load_user(user_id):
    return User.query
