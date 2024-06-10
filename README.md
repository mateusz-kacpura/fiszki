# Language Quiz

A flashcard application for learning new words quickly and efficiently.

![Language Quiz](https://raw.githubusercontent.com/mateusz-kacpura/fiszki/main/img/Language%20Quiz.png)

## Features

- Learn new words using flashcards
- Edit and add new words using the `edit_list_words.html` file
- View learning progress in the `index.html` file

## Installation

To deploy the application, follow these steps:

1. **Create a virtual environment**:
    On Windows:
    ```bash
    python -m venv myenv
    ```
    On Linux/Mac:
    ```bash
    python3 -m venv myenv
    ```
    Activate the virtual environment:
    - Windows:
      ```bash
      myenv\Scripts\activate
      ```
    - Linux/Mac:
      ```bash
      source myenv/bin/activate
      ```

2. **Install required modules**:
    ```bash
    pip install flask flask_cors requests openpyxl transformers
    ```

3. **Create a `requirements.txt` file**:
    Create a file named `requirements.txt` with the following content:
    ```bash
    flask==2.0.1
    flask_cors==3.0.10
    requests==2.25.1
    openpyxl==3.0.5
    transformers==4.10.2
    ```

4. **Run the application**:
    ```bash
    python app.py
    ```

5. **Access the application**:
    Open your web browser and go to:
    ```bash
    http://localhost:3000/multi_learning.html
    ```

## Backend Documentation

### Table of Contents

- Introduction
- Installation and Configuration
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

### Directory Structure

- `uploads`: Stores uploaded files.
- `image_files`: Stores image files.
- `audio_files`: Stores audio files.
- `logs`: Stores application logs.
- `statistic/statistics.json`: Stores saved statistics.
- `setting/excludedWords.json`: Stores settings.

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
