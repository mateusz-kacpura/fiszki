from flask import Blueprint, jsonify, request, send_from_directory
import os
import requests

audio_routes = Blueprint('audio_routes', __name__)
AUDIO_FOLDER = 'audio_files'

@audio_routes.route('/<path:filename>')
def get_audio(filename):
    return send_from_directory(AUDIO_FOLDER, filename)

@audio_routes.route('/load-audio-paths', methods=['POST'])
def load_audio_paths():
    words = request.json['words']
    audio_paths = []
    for word in words:
        filename = word.lower().replace(' ', '-')
        audio_path = os.path.join(AUDIO_FOLDER, f'{filename}.mp3').lower()
        if os.path.exists(audio_path):
            audio_paths.append(audio_path)
        else:
            url = f'https://www.ang.pl/sound/dict/{filename}.mp3'
            response = requests.get(url, stream=True)
            if response.status_code == 200:
                with open(audio_path, 'wb') as f:
                    for chunk in response.iter_content(1024):
                        f.write(chunk)
                audio_paths.append(audio_path)
            else:
                filename = filename.replace('-', '_')
                url = f'https://www.diki.pl/images-common/en/mp3/{filename}.mp3'
                response = requests.get(url, stream=True)
                if response.status_code == 200:
                    with open(audio_path, 'wb') as f:
                        for chunk in response.iter_content(1024):
                            f.write(chunk)
                    audio_paths.append(audio_path)
                else:
                    print(f"Unable to download audio for {word}")
    return jsonify({'audio_paths': audio_paths})
