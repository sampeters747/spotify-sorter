from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from config import Config
from time import sleep

app = Flask(__name__)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = Config.TRACK_SQL_MODIFICATIONS
app.config['SQLALCHEMY_ECHO'] = Config.SQLALCHEMY_ECHO
app.config['SQLALCHEMY_DATABASE_URI'] = Config.DB_URI
app.secret_key = Config.FLASK_SECRET

db_created = False
while(not db_created):
    try:
        db = SQLAlchemy(app) 
        db_created = True
    except Exception as e:
        print("Unable to establish DB connection, retrying in 5 seconds")
        sleep(5)

login_manager = LoginManager()
login_manager.init_app(app)

import models
import routes


if __name__ == "__main__":
    app.run()
