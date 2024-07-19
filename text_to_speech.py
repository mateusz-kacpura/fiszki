import json
import os
import requests
from tqdm import tqdm

# Path to your JSON file
json_file_path = r'C:\Users\engli\fiszki\fiszki\uploads\all.json'
audio_folder = r'C:\Users\engli\fiszki\fiszki\audio_files'

# Load JSON data
with open(json_file_path, 'r', encoding='utf-8') as file:
    data = json.load(file)

# Extract words
words = [entry["word"] for entry in data]

# URL for the text_to_speech function (assuming it's hosted as a web service)
text_to_speech_url = "http://127.0.0.1:3000/text-to-speech"  # Replace with actual URL

# Function to call text_to_speech API
def text_to_speech(text):
    payload = {'text': text}
    response = requests.post(text_to_speech_url, json=payload)
    if response.status_code == 200:
        audio_path = response.json().get('audio_path')
        print(f"Audio file generated: {audio_path}")
    else:
        print(f"Error generating audio for {text}: {response.json().get('error')}")

# Generate audio for each word with progress bar
for word in tqdm(words, desc="Generating audio files"):
    text_to_speech(word)
