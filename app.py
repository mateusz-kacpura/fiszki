import os
import json
import logging
import requests
from flask import Flask, request, render_template, jsonify, send_file
from flask_cors import CORS
from flask import send_from_directory
from werkzeug.utils import secure_filename
from openpyxl import load_workbook
from transformers import AutoProcessor, AutoModel
from scipy.io.wavfile import write
from pydub import AudioSegment
import whisper
import pyaudio
import numpy as np
import scipy

app = Flask(__name__)
CORS(app)

# Configurations
UPLOAD_FOLDER = 'uploads'
IMAGE_FOLDER = 'image_files'
AUDIO_FOLDER = 'audio_files'
LOG_FOLDER = 'logi'
STATISTICS_FILE ='api/statistic/statistics.json'
SETTING_FILE ='api/setting/excludedWords.json'

os.environ["CUDA_VISIBLE_DEVICES"] = ""
os.environ["SUNO_USE_SMALL_MODELS"] = "1"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(IMAGE_FOLDER):
    os.makedirs(IMAGE_FOLDER)
if not os.path.exists(AUDIO_FOLDER):
    os.makedirs(AUDIO_FOLDER)
if not os.path.exists(LOG_FOLDER):
    os.makedirs(LOG_FOLDER)

for folder in [UPLOAD_FOLDER, IMAGE_FOLDER, AUDIO_FOLDER, LOG_FOLDER]:
    if not os.path.exists(folder):
        os.makedirs(folder)

# Logging
logging.basicConfig(filename='app.log', level=logging.INFO)

# Routes for frontend templates 
# <!--                          -->
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/sentences_learining')
def sentences_learning():
    return render_template('sentences_learining.html')

@app.route('/multi_learning')
def multilearning():
    return render_template('multi_learning.html')

@app.route('/scattered_words_learning')
def scattered_words_learning():
    return render_template('scattered_words_learning.html')

@app.route('/add_lists_words')
def add_lists_word():
    return render_template('add_lists_words.html', title="Masowe Dodawanie Słów")

@app.route('/add_new_word')
def add_new_word():
    return render_template('add_new_word.html', title="Dodaj Nowe Słowo")

@app.route('/single_word_learning')
def single_word_learning():
    return render_template('single_word_learning.html', title="Language Quiz")

@app.route('/read_from_file')
def read_from_file():
    return render_template('read_from_file.html', title="Wczytaj Dane z Pliku Excel")

@app.route('/edit_list_words')
def edit_list_words():
    return render_template('edit_list_words.html', title="Edit JSON Data")

@app.route('/api/setting/excludedWords.json')
def get_excluded_words():
    return send_from_directory('api/setting', 'excludedWords.json')

@app.route('/api/statistic/statistics.json')
def get_statistics():
    return send_from_directory('api/statistic', 'statistics.json')

# <--                          !-->

@app.route('/real-time-speech-recognition', methods=['POST'])
def real_time_speech_recognition():
    try:
        model = whisper.load_model("medium")
        CHUNK = 1024
        FORMAT = pyaudio.paInt16
        CHANNELS = 1
        RATE = 16000

        p = pyaudio.PyAudio()
        stream = p.open(format=FORMAT,
                        channels=CHANNELS,
                        rate=RATE,
                        input=True,
                        frames_per_buffer=CHUNK)

        print("Rozpoczęto nagrywanie...")

        while True:
            data = stream.read(CHUNK)
            audio_data = np.frombuffer(data, dtype=np.int16)
            result = model.transcribe(audio_data, language='pl')
            print("Transkrypcja: ", result["text"])
            return jsonify({'transcription': result["text"]})

    except KeyboardInterrupt:
        print("Zatrzymano nagrywanie.")
        stream.stop_stream()
        stream.close()
        p.terminate()
        return jsonify({'message': 'Recording stopped'}), 200

    except Exception as e:
        print(f"Error in real-time speech recognition: {e}")
        logging.error(f"Error in real-time speech recognition: {e}")
        return jsonify({'error': 'Failed to process speech'}), 500

    finally:
        stream.stop_stream()
        stream.close()
        p.terminate()

@app.route('/<path:path>')
def send_static(path):
    return send_from_directory('public', path)

@app.route('/audio_files/<path:path>')
def send_audio(path):
    return send_from_directory(AUDIO_FOLDER, path)

@app.route('/text-to-speech', methods=['POST'])
def text_to_speech():
    print("Received request to convert text to speech")
    text = request.json.get('text', '')
    print(f"Received text: {text}")
    if not text:
        print("Error: No text provided")
        return jsonify({'error': 'No text provided'}), 400
    
    try:
        if not os.path.exists(os.path.join(AUDIO_FOLDER, f"{text}.mp3")):
            print("Generating audio...")
            
            processor = AutoProcessor.from_pretrained("suno/bark")
            model = AutoModel.from_pretrained("suno/bark")

            inputs = processor(
                text,
                return_tensors="pt",
            )

            speech_values = model.generate(**inputs, do_sample=True)

            sampling_rate = 22050
            
            wav_data = speech_values.cpu().numpy().squeeze()
            wav_path = os.path.join(AUDIO_FOLDER, f"{text}.wav")
            scipy.io.wavfile.write(wav_path, rate=sampling_rate, data=wav_data)
            
            audio_segment = AudioSegment.from_wav(wav_path)
            mp3_path = os.path.join(AUDIO_FOLDER, f"{text}.mp3")
            audio_segment.export(mp3_path, format="mp3")
            
            print(f"Saving audio to file: {mp3_path}")
            
            return jsonify({'audio_path': mp3_path})
        else:
            print(f"Audio file already exists: {os.path.join(AUDIO_FOLDER, f'{text}.mp3')}")
            return jsonify({'audio_path': os.path.join(AUDIO_FOLDER, f"{text}.mp3")})
    except Exception as e:
        print(f"Error in text-to-speech: {e}")
        logging.error(f"Error in text-to-speech: {e}")
        return jsonify({'error': 'Failed to generate speech'}), 500
    
@app.route('/load-audio-paths', methods=['POST'])
def load_audio_paths():
    words = request.json['words']
    audio_paths = []
    for word in words:
        filename = word.lower().replace(' ', '-')
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




"""
TEN KOD UMOŻLIWIA KORZYSTANIE Z INNEGO MODELU DO ZAMIANY TEKSTU NA MOWĘ, KTÓRY JEST LEPSZY ALE WYMAGA KARTY GRAFICZNEJ
THIS CODE ALLOWS YOU TO USE A DIFFERENT TEXT TO SPEECH MODEL THAT IS BETTER BUT REQUIRES A GRAPHICS CARD

You need install:
pip install -U encodec # stable release
pip install -U git+https://git@github.com/facebookresearch/encodec#egg=encodec
pip install .

and next

pip install -U Pipeline

from pydub import AudioSegment
import scipy.io.wavfile
from pydub import AudioSegment
import torch
from whisperspeech.pipeline import Pipeline

# Check if running in Google Colab
def is_colab():
    try:
        import google.colab
        return True
    except ImportError:
        return False

# Ensure CUDA is available
if not torch.cuda.is_available():
    if is_colab():
        raise BaseException("Please change the runtime type to GPU. In the menu: Runtime -> Change runtime type (the free T4 instance is enough)")
    else:
        raise BaseException("Currently the example notebook requires CUDA, make sure you are running this on a machine with a GPU.")

try:
    from encodec import EncodecModel
    print("EncodecModel imported successfully.")
except ImportError as e:
    print(f"ImportError: {e}")

# Initialize WhisperSpeech Pipeline
pipe = Pipeline(s2a_ref='collabora/whisperspeech:s2a-q4-tiny-en+pl.model')

@app.route('/text-to-speech', methods=['POST'])
def text_to_speech():
    print("Received request to convert text to speech")
    text = request.json.get('text', '')
    print(f"Received text: {text}")
    if not text:
        print("Error: No text provided")
        return jsonify({'error': 'No text provided'}), 400
    
    try:
        audio_filename = f"{text.replace(' ', '_')}.mp3"
        audio_path = os.path.join(AUDIO_FOLDER, audio_filename)

        if not os.path.exists(audio_path):
            print("Generating audio...")

            stoks = pipe.t2s.generate([text])
            audio_data = pipe.vocoder.decode(pipe.s2a.generate(stoks, pipe.default_speaker.unsqueeze(0)))

            wav_path = os.path.join(AUDIO_FOLDER, f"{text.replace(' ', '_')}.wav")
            scipy.io.wavfile.write(wav_path, rate=pipe.sample_rate, data=audio_data.squeeze().cpu().numpy())

            audio_segment = AudioSegment.from_wav(wav_path)
            audio_segment.export(audio_path, format="mp3")

            print(f"Saving audio to file: {audio_path}")
            
            return jsonify({'audio_path': audio_path})
        else:
            print(f"Audio file already exists: {audio_path}")
            return jsonify({'audio_path': audio_path})
    except Exception as e:
        print(f"Error in text-to-speech: {e}")
        return jsonify({'error': 'Failed to generate speech'}), 500

"""        