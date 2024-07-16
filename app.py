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
import nltk
from nltk.corpus import wordnet
from nltk.stem import WordNetLemmatizer
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

# Utwórzenie loggerów do logowania ogólnego
app_logger = logging.getLogger('app_logger')
app_logger.setLevel(logging.INFO)
app_handler = logging.FileHandler('app.log')
app_handler.setLevel(logging.INFO)
app_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
app_handler.setFormatter(app_formatter)
app_logger.addHandler(app_handler)

# Utwórzenie logger do logowania ścieżek audio
audio_logger = logging.getLogger('audio_logger')
audio_logger.setLevel(logging.INFO)
audio_handler = logging.FileHandler(os.path.join(LOG_FOLDER, 'path_audio.log'))
audio_handler.setLevel(logging.INFO)
audio_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
audio_handler.setFormatter(audio_formatter)
audio_logger.addHandler(audio_handler)

# Utwórzenie loggerów do logowania obrazów
image_logger = logging.getLogger('image_logger')
image_logger.setLevel(logging.INFO)
image_handler = logging.FileHandler(os.path.join(LOG_FOLDER, 'path_image.log'))
image_handler.setLevel(logging.INFO)
image_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
image_handler.setFormatter(image_formatter)
image_logger.addHandler(image_handler)

# Konfiguracja loggera do logowania plików
upload_logger = logging.getLogger('upload_logger')
upload_logger.setLevel(logging.INFO)
upload_handler = logging.FileHandler(os.path.join(LOG_FOLDER, 'path_uploads.log'))
upload_handler.setLevel(logging.INFO)
upload_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
upload_handler.setFormatter(upload_formatter)
upload_logger.addHandler(upload_handler)

nltk.download('punkt')
nltk.download('wordnet')
nltk.download('averaged_perceptron_tagger')

lemmatizer = WordNetLemmatizer()

def get_wordnet_pos(treebank_tag):
    """Converts treebank tags to wordnet tags."""
    if treebank_tag.startswith('J'):
        return wordnet.ADJ
    elif treebank_tag.startswith('V'):
        return wordnet.VERB
    elif treebank_tag.startswith('N'):
        return wordnet.NOUN
    elif treebank_tag.startswith('R'):
        return wordnet.ADV
    else:
        return wordnet.NOUN

def lemmatize_word(word):
    """Lemmatizes the given word using its part of speech tag."""
    pos_tag = nltk.pos_tag([word])[0][1]
    wordnet_pos = get_wordnet_pos(pos_tag)
    return lemmatizer.lemmatize(word, wordnet_pos)

@app.route('/process-words', methods=['POST'])
def process_words():
    try:
        data = json.loads(request.data)
        words = data.get('words', [])
        
        lemmatized_words = [{**word, 'lemma': lemmatize_word(word['word'])} for word in words]
        
        return jsonify({'words': lemmatized_words})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Routes for frontend templates 
# <!--                          -->
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/learn')
def learn():
    return render_template('learn.html')

@app.route('/manage')
def manage():
    return render_template('manage.html')

@app.route('/learning/sentences_learining')
def sentences_learning():
    return render_template('learning/sentences_learining.html')

@app.route('/learning/multi_learning')
def multilearning():
    return render_template('learning/multi_learning.html')

@app.route('/learning/scattered_words_learning')
def scattered_words_learning():
    return render_template('learning/scattered_words_learning.html')

@app.route('/learning/insert_word')
def insert_word():
    return render_template('learning/insert_word.html')

@app.route('/manage/add_lists_words')
def add_lists_word():
    return render_template('manage/add_lists_words.html', title="Masowe Dodawanie Słów")

@app.route('/manage/add_new_word')
def add_new_word():
    return render_template('manage/add_new_word.html', title="Dodaj Nowe Słowo")

@app.route('/learning/single_word_learning')
def single_word_learning():
    return render_template('learning//single_word_learning.html', title="Language Quiz")

@app.route('/learning/image_words_learning')
def image_words_learning():
    return render_template('learning/image_words_learning.html', title="Image learning")

@app.route('/manage/read_from_file')
def read_from_file():
    return render_template('manage/read_from_file.html', title="Wczytaj Dane z Pliku Excel")

@app.route('/manage/edit_list_words')
def edit_list_words():
    return render_template('manage/edit_list_words.html', title="Edit JSON Data")

@app.route('/api/setting/<path:filename>')
def get_excluded_words(filename):
    return send_from_directory('api/setting', filename)

@app.route('/api/statistic/statistics.json')
def get_statistics():
    return send_from_directory('api/statistic', 'statistics.json')

@app.route('/image_files/<path:filename>')
def custom_static(filename):
    return send_from_directory('image_files', filename)

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
    text = text.replace('/', ' ') 
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

def check_and_download_file(url, file_path, logger):
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx and 5xx)
        with open(file_path, 'wb') as file:
            file.write(response.content)
        return file_path
    except requests.exceptions.RequestException as e:
        log_to_file(logger, f'Error downloading {url}: {e}')
        return None

@app.route('/load-image-paths', methods=['POST'])
def load_image_paths():
    try:
        data = request.get_json()
        words = data.get('words', [])

        image_paths = []
        for word in words:
            if not word:
                image_paths.append(None)
                continue

            filename = word.lower().replace(' ', '-')
            image_path = os.path.join(IMAGE_FOLDER, f"{filename}.jpg")

            if os.path.exists(image_path):
                log_to_file(image_logger, f'File already exists: {image_path}')
                image_paths.append(image_path)
                continue

            url = f"https://www.ang.pl/img/slownik/{filename}.jpg"
            image_file = check_and_download_file(url, image_path, image_logger)

            if image_file:
                log_to_file(image_logger, f'Downloaded image: {url} to {image_path}')
                image_paths.append(image_file)
            else:
                log_to_file(image_logger, f'Failed to download image from: {url}')
                image_paths.append(None)

        return jsonify(image_paths)

    except Exception as e:
        log_to_file(app_logger, f'Error in load_image_paths: {e}')
        return jsonify({"error": "Internal Server Error"}), 500

# Endpoint do zapisywania JSON
@app.route('/uploads-save-json', methods=['POST'])
def uploads_save_json():
    data = request.get_json()
    file_name = data.get('fileName', 'data.json')
    json_data = data.get('data')

    try:
        file_path = os.path.join(UPLOAD_FOLDER, f"{file_name}.json")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(json_data)
        # Logowanie zapisu pliku
        upload_logger.info(f"Plik zapisany: {file_path}")
        return jsonify(success=True)
    except Exception as e:
        # Logowanie błędu
        upload_logger.error(f"Błąd podczas zapisywania pliku: {e}")
        return jsonify(success=False)

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
    print(f'Saved statistic: {statistic}') 
    return jsonify({'message': 'Statistic saved successfully'})

@app.route('/saveSetting', methods=['POST'])
def save_setting():
    data = request.json['excludedWords']
    with open(SETTING_FILE, 'w') as f:
        json.dump(data, f, indent=2)
    print(f'Saved setting: {data}')  
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