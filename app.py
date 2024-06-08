import os
import json
import logging
import requests
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask import send_from_directory

from werkzeug.utils import secure_filename
from openpyxl import load_workbook

app = Flask(__name__)
CORS(app)

# Configurations
UPLOAD_FOLDER = 'uploads'
IMAGE_FOLDER = 'image_files'
AUDIO_FOLDER = 'audio_files'
LOG_FOLDER = 'logi'
STATISTICS_FILE ='statistic/statistics.json'
SETTING_FILE ='setting/excludedWords.json'

# Create folders if they don't exist
for folder in [UPLOAD_FOLDER, IMAGE_FOLDER, AUDIO_FOLDER, LOG_FOLDER]:
    if not os.path.exists(folder):
        os.makedirs(folder)

# Logging
logging.basicConfig(filename='app.log', level=logging.INFO)

@app.route('/<path:path>')
def send_static(path):
    return send_from_directory('public', path)

@app.route('/load-image-paths', methods=['POST'])
def load_image_paths():
    words = request.json['words']
    image_paths = []
    for word in words:
        filename = word.replace(' ', '-')
        image_path = os.path.join(IMAGE_FOLDER, f'{filename}.jpg')
        if os.path.exists(image_path):
            logging.info(f'File already exists: {image_path}')
            image_paths.append(image_path)
        else:
            url = f'https://www.ang.pl/img/slownik/{filename}.jpg'
            response = requests.get(url, stream=True)
            if response.status_code == 200:
                with open(image_path, 'wb') as f:
                    for chunk in response.iter_content(1024):
                        f.write(chunk)
                logging.info(f'Downloaded image: {url} to {image_path}')
                image_paths.append(image_path)
            else:
                logging.info(f'Failed to download image from: {url}')
    print(f'Loaded image paths: {image_paths}')  # Print detailed information
    return jsonify(image_paths)

@app.route('/load-audio-paths', methods=['POST'])
def load_audio_paths():
    words = request.json['words']
    audio_paths = []
    for word in words:
        filename = word.replace(' ', '-')
        audio_path = os.path.join(AUDIO_FOLDER, f'{filename}.mp3')
        if os.path.exists(audio_path):
            logging.info(f'File already exists: {audio_path}')
            audio_paths.append(audio_path)
        else:
            url = f'https://www.ang.pl/sound/dict/{filename}.mp3'
            response = requests.get(url, stream=True)
            if response.status_code == 200:
                with open(audio_path, 'wb') as f:
                    for chunk in response.iter_content(1024):
                        f.write(chunk)
                logging.info(f'Downloaded audio: {url} to {audio_path}')
                audio_paths.append(audio_path)
            else:
                filename = filename.replace('-', '_')
                url = f'https://www.diki.pl/images-common/en/mp3/{filename}.mp3'
                response = requests.get(url, stream=True)
                if response.status_code == 200:
                    with open(audio_path, 'wb') as f:
                        for chunk in response.iter_content(1024):
                            f.write(chunk)
                    logging.info(f'Downloaded audio: {url} to {audio_path}')
                    audio_paths.append(audio_path)
                else:
                    logging.info(f'Failed to download audio from: {url}')
    print(f'Loaded audio paths: {audio_paths}')  # Print detailed information
    return jsonify(audio_paths)

@app.route('/save', methods=['POST'])
def save_json():
    file_name = request.json['fileName']
    json_data = request.json['jsonData']
    file_path = os.path.join(UPLOAD_FOLDER, file_name)
    with open(file_path, 'w') as f:
        json.dump(json_data, f, indent=2)
    print(f'Saved JSON file: {file_path}')  # Print detailed information
    return jsonify({'message': 'Data saved successfully as JSON'})

@app.route('/save_statistic', methods=['POST'])
def save_statistic():
    statistic = request.json
    logging.info(f'Received statistic: {statistic}')
    if not os.path.exists(STATISTICS_FILE):
        with open(STATISTICS_FILE, 'w') as f:
            json.dump([statistic], f, indent=2)
    else:
        with open(STATISTICS_FILE, 'r+') as f:
            data = f.read()
            if data:
                existing_data = json.loads(data)
            else:
                existing_data = []
            existing_data.append(statistic)
            f.seek(0)
            json.dump(existing_data, f, indent=2)
    print(f'Saved statistic: {statistic}')  # Print detailed information
    return jsonify({'message': 'Statistic saved successfully'})

@app.route('/saveSetting', methods=['POST'])
def save_setting():
    data = request.json['excludedWords']
    with open(SETTING_FILE, 'w') as f:
        json.dump(data, f, indent=2)
    print(f'Saved setting: {data}')  # Print detailed information
    return jsonify({'message': 'Settings update requested'})

@app.route('/words', methods=['GET'])
def get_words():
    file_name = request.args.get('file')
    file_path = os.path.join(UPLOAD_FOLDER, file_name)
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            data = json.load(f)
            return jsonify(data)
    else:
        return jsonify([])

@app.route('/edit/:file/:index', methods=['POST'])
def edit_word():
    file_name = request.args.get('file')
    index = int(request.args.get('index'))
    updated_data = request.json
    file_path = os.path.join(UPLOAD_FOLDER, file_name)
    if os.path.exists(file_path):
        with open(file_path, 'r+') as f:
            data = json.load(f)
            if index >= 0 and index < len(data):
                data[index] = updated_data
                f.seek(0)
                json.dump(data, f, indent=2)
                return jsonify({'message': 'Data updated successfully'})
            else:
                return jsonify({'error': 'Invalid index'})
    else:
        return jsonify({'error': 'File not found'})

@app.route('/files', methods=['GET'])
def get_files():
    files = os.listdir(UPLOAD_FOLDER)
    return jsonify(files)

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    file_path = os.path.join(UPLOAD_FOLDER, secure_filename(file.filename))
    file.save(file_path)
    workbook = load_workbook(file_path)
    sheet = workbook.active
    data = []
    for row in sheet.iter_rows(values_only=True):
        data.append(row)
    return jsonify({'columns': data[0]})

if __name__ == '__main__':
    app.run(debug=True, port=3000)