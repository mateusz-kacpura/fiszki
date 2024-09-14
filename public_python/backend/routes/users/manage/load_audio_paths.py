from flask import request, jsonify
from flask_login import login_required
from backend.services.logger import audio_logger, app_logger
import os
import requests
import config

AUDIO_FOLDER = config.AUDIO_FOLDER

@login_required
def load_audio_paths():
    words = request.json['words']
    audio_paths = []
    for word in words:
        filename = word.lower().replace(' ', '-')
        audio_path = os.path.join(AUDIO_FOLDER, f'{filename}.mp3').lower()
        if os.path.exists(audio_path):
            log_to_file(audio_logger, f'File already exists: {audio_path}')
            audio_paths.append(audio_path)
        else:
            url = f'https://www.ang.pl/sound/dict/{filename}.mp3'
            response = requests.get(url, stream=True)
            if response.status_code == 200:
                with open(audio_path, 'wb') as f:
                    for chunk in response.iter_content(1024):
                        f.write(chunk)
                log_to_file(audio_logger, f'Downloaded audio: {url} to {audio_path}')
                audio_paths.append(audio_path)
            else:
                filename = filename.replace('-', '_')
                url = f'https://www.diki.pl/images-common/en/mp3/{filename}.mp3'
                response = requests.get(url, stream=True)
                if response.status_code == 200:
                    with open(audio_path, 'wb') as f:
                        for chunk in response.iter_content(1024):
                            f.write(chunk)
                    log_to_file(audio_logger, f'Downloaded audio: {url} to {audio_path}')
                    audio_paths.append(audio_path)
                else:
                    log_to_file(audio_logger, f'Failed to download audio from: {url}')
                    audio_paths.append(None)
    log_to_file(app_logger, f'Loaded audio paths: {audio_paths}') 
    return jsonify(audio_paths)

def log_to_file(logger, message):
    logger.info(message)
