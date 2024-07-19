from flask import render_template
from .api.audio import audio_routes
from .api.image import image_routes
from .api.speech_recognition import speech_recognition_routes
from .api.text_to_speech import text_to_speech_routes
from .api.words import words_routes

def init_routes(app):
    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/learn')
    def learn():
        return render_template('learn.html')

    @app.route('/manage')
    def manage():
        return render_template('manage.html')

    # Register API routes
    app.register_blueprint(audio_routes, url_prefix='/api/audio')
    app.register_blueprint(image_routes, url_prefix='/api/image')
    app.register_blueprint(speech_recognition_routes, url_prefix='/api/speech_recognition')
    app.register_blueprint(text_to_speech_routes, url_prefix='/api/text_to_speech')
    app.register_blueprint(words_routes, url_prefix='/api/words')
