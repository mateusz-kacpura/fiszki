import json
import requests
from tqdm import tqdm
import os
import time  

input_file_path = r'C:\Users\engli\fiszki\fiszki\zestawy.json'

def parse_data(input_data):
    content_str = input_data['choices'][0]['message']['content']
    parsed_content = json.loads(content_str)
    return parsed_content

# Funkcja do generowania danych z API AIML
def fetch_aiml_data(word):
    url = 'https://api.aimlapi.com/chat/completions'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 02eddf9c575c40f0b7d144433c21208e'
    }
    payload = {
        'model': 'gpt-3.5-turbo',
        'messages': [
            {
                'role': 'user',
                'content': f"""Translate '{word}' to Polish and provide its definition and an example sentence. 
                Send me request as json: 
                [
                    language: English,
                    translationLanguage: Polish,
                    word: word,
                    translation: ..,  # Uzupełnij w oparciu o dane z odpowiedzi
                    definition: ...,  # Uzupełnij w oparciu o dane z odpowiedzi
                    example: ..,  # Uzupełnij w oparciu o dane z odpowiedzi
                    example_translation: ..,  # Uzupełnij w oparciu o dane z odpowiedzi
                    imageLink: ...,  # Uzupełnij w oparciu o dane z wejścia
                    audioLink: ...  # Uzupełnij w oparciu o dane z wejścia 
                ]"""
            }
        ],
        'max_tokens': 512,
        'stream': False
    }
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 201:
        output_data = parse_data(response.text)
        print(output_data)
        return output_data
    else:
        print(f"Error fetching data for {word}: {response.status_code}, {response.text}")
        return {}

def file_exists(filepath):
    return os.path.isfile(filepath)

with open(input_file_path, 'r') as file:
    data = json.load(file)

sections = {}
for item in tqdm(data, desc="Processing sections"):
    section = item["section"]
    output_file_path = f'C:\\Users\\engli\\fiszki\\fiszki\\{section}.json'
    
    if file_exists(output_file_path):
        print(f"Plik {output_file_path} już istnieje. Pomijanie.")
        continue
    
    if section not in sections:
        sections[section] = []
    
    for key, value in item.items():
        if key != "section":
            word_data = {
                "word": value["alt_text"],
                "imageLink": value["img_src"],
                "audioLink": value["audio_src"]
            }
            aiml_data = fetch_aiml_data(word_data["word"])
            if aiml_data:  
                aiml_data.update(word_data)
                sections[section].append(aiml_data)
                time.sleep(5)
            
for section, items in tqdm(sections.items(), desc="Saving files"):
    output_file_path = f'C:\\Users\\engli\\fiszki\\fiszki\\{section}.json'
    with open(output_file_path, 'w') as file:
        json.dump(items, file, indent=4)

print("Pliki zostały zapisane.")
