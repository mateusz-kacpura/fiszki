from flask import send_from_directory
from app import app

@app.route('/api/setting/<path:filename>')
def get_excluded_words(filename):
    return send_from_directory('baza_danych/setting', filename)

@app.route('/learning/api/setting/<path:filename>')
def get_excluded_words_learning(filename):
    return send_from_directory('baza_danych/setting', filename)

@app.route('/api/statistic/statistics.json')
def get_statistics():
    return send_from_directory('baza_danych/statistic', 'statistics.json')

@app.route('/learning/image_files/English/<path:filename>')
def custom_static_images(filename):
    return send_from_directory('baza_danych/image_files/English', filename)

@app.route('/learning/audio_files/English/<path:filename>')
def custom_static_audio(filename):
    return send_from_directory('baza_danych/audio_files/English', filename)

@app.route('/image_files/English/<path:filename>')
def image_files(filename):
    return send_from_directory('baza_danych/image_files/English', filename)

@app.route('/audio_files/English/<path:filename>')
def audio_files(filename):
    return send_from_directory('baza_danych/audio_files/English', filename)
