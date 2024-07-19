import os
from flask import Flask
from flask_cors import CORS
from .routes import init_routes
from .utils.logger import init_loggers

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Load configurations
    app.config.from_object('config')

    # Initialize loggers
    init_loggers(app)

    # Initialize routes
    init_routes(app)

    return app
