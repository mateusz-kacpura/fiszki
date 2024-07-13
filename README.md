# Language Quiz

A flashcard application for learning new words quickly and efficiently.

![Language Quiz](https://raw.githubusercontent.com/mateusz-kacpura/fiszki/main/img/Language%20Quiz.png)

## Backend Documentation

### Table of Contents

- Introduction
- Installation and configuration
- Directory Structure
- API Endpoints
  - Real-Time Speech Recognition
  - Send Static File
  - Send Audio File
  - Text-to-Speech
  - Load Audio Paths
  - Save JSON
  - Save Statistic
  - Save Setting
  - Get Words
  - Edit Word
  - Get Files
  - Upload File
- Logging

### Introduction

This application is a Flask-based backend that handles various functions related to speech recognition, text-to-speech conversion, and managing audio and JSON files.

### Installation and Configuration

1. **Clone the repository**:
    ```bash
    git clone <REPOSITORY_URL>
    cd <REPOSITORY_NAME>
    ```

2. **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3. **Set environment variables**:
    ```python
    import os
    os.environ["CUDA_VISIBLE_DEVICES"] = ""
    os.environ["SUNO_USE_SMALL_MODELS"] = "1"
    ```

4. **Run the application**:
    ```bash
    python app.py
    ```

5. **Run pages - routes**
- 127.0.0.1:3000/add_lists_words
- 127.0.0.1:3000/add_new_word
- 127.0.0.1:3000/edit_list_words
- 127.0.0.1:3000/multi_learning
- 127.0.0.1:3000/read_from_file
- 127.0.0.1:3000/scattered_words_learning
- 127.0.0.1:3000/sentences_learining
- 127.0.0.1:3000/single_word_learning

### Directory Structure

- `uploads/`: Stores uploaded files.
- `image_files/`: Stores image files.
- `audio_files/`: Stores audio files.
- `logs/`: Stores application logs.
- `statistic/statistics.json`: Stores saved statistics.
- `setting/excludedWords.json`: Stores settings.
- `templates/`: Files html Jnija2 System
- `static/`: Files /js and /css for build frontend

### API Endpoints

#### Real-Time Speech Recognition

- **Endpoint**: `/real-time-speech-recognition`
- **Method**: POST
- **Description**: Starts recording and real-time speech recognition.
- **Example**:
    ```bash
    curl -X POST http://localhost:3000/real-time-speech-recognition
    ```

#### Send Static File

- **Endpoint**: `/<path:path>`
- **Method**: GET
- **Description**: Sends a static file from the `public` directory.
- **Example**:
    ```bash
    curl http://localhost:3000/somefile.html
    ```

#### Send Audio File

- **Endpoint**: `/audio_files/<path:path>`
- **Method**: GET
- **Description**: Sends an audio file from the `audio_files` directory.
- **Example**:
    ```bash
    curl http://localhost:3000/audio_files/somefile.mp3
    ```

#### Text-to-Speech

- **Endpoint**: `/text-to-speech`
- **Method**: POST
- **Description**: Converts text to speech and saves the audio file.
- **Body**: JSON containing `text`.
- **Example**:
    ```bash
    curl -X POST http://localhost:3000/text-to-speech -H "Content-Type: application/json" -d '{"text": "Hello world"}'
    ```

#### Load Audio Paths

- **Endpoint**: `/load-audio-paths`
- **Method**: POST
- **Description**: Retrieves paths to audio files for the given words.
- **Body**: JSON containing `words`.
- **Example**:
    ```bash
    curl -X POST http://localhost:3000/load-audio-paths -H "Content-Type: application/json" -d '{"words": ["word1", "word2"]}'
    ```

#### Save JSON

- **Endpoint**: `/save`
- **Method**: POST
- **Description**: Saves JSON data to a file.
- **Body**: JSON containing `fileName` and `jsonData`.
- **Example**:
    ```bash
    curl -X POST http://localhost:3000/save -H "Content-Type: application/json" -d '{"fileName": "data.json", "jsonData": {"key": "value"}}'
    ```

#### Save Statistic

- **Endpoint**: `/save_statistic`
- **Method**: POST
- **Description**: Saves statistics to the `statistics.json` file.
- **Body**: JSON containing statistics.
- **Example**:
    ```bash
    curl -X POST http://localhost:3000/save_statistic -H "Content-Type: application/json" -d '{"stat": "value"}'
    ```

#### Save Setting

- **Endpoint**: `/saveSetting`
- **Method**: POST
- **Description**: Saves settings to the `excludedWords.json` file.
- **Body**: JSON containing `excludedWords`.
- **Example**:
    ```bash
    curl -X POST http://localhost:3000/saveSetting -H "Content-Type: application/json" -d '{"excludedWords": ["word1", "word2"]}'
    ```

#### Get Words

- **Endpoint**: `/words`
- **Method**: GET
- **Description**: Returns JSON data from the specified file.
- **URL Parameters**: `file` - name of the file.
- **Example**:
    ```bash
    curl http://localhost:3000/words?file=data.json
    ```

#### Edit Word

- **Endpoint**: `/edit/:file/:index`
- **Method**: POST
- **Description**: Edits data in the specified JSON file at the given index.
- **URL Parameters**: `file` - name of the file, `index` - index of the data to edit.
- **Body**: JSON containing updated data.
- **Example**:
    ```bash
    curl -X POST http://localhost:3000/edit/data.json/1 -H "Content-Type: application/json" -d '{"key": "new_value"}'
    ```

#### Get Files

- **Endpoint**: `/files`
- **Method**: GET
- **Description**: Returns a list of files in the `uploads` directory.
- **Example**:
    ```bash
    curl http://localhost:3000/files
    ```

#### Upload File

- **Endpoint**: `/upload`
- **Method**: POST
- **Description**: Uploads a file to the `uploads` directory and returns the columns from the Excel file.
- **Body**: File uploaded as `multipart/form-data`.
- **Example**:
    ```bash
    curl -X POST http://localhost:3000/upload -F 'file=@path/to/file.xlsx'
    ```

### Logging

Application logs are stored in the `app.log` file in the root directory. Logging is performed using the `logging` module with the logging level set to `INFO`. Logs include error information and actions such as file retrieval and saving.

## Files

- `edit_list_words.html`: Edit and add new words in JSON format.
- `index.html`: The learning panel.

---
