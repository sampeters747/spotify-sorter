from flask import Flask
import config_app

app = config_app.app
print(id(app))
import models
import routes


if __name__ == "__main__":
    app.run(host='0.0.0.0')
