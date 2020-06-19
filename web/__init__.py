from flask import Flask
import config_app

app = config_app.app
import models
import routes


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)
