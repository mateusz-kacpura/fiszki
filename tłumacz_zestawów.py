import json
from tqdm import tqdm
import os
import time
from groq import Groq
import re

# Plik wejściowy
input_file_path = r'C:\Users\engli\fiszki\fiszki\English-2.json'
out_path = 'C:\\Users\\engli\\fiszki\\fiszki\\uploads\\Spanish'

API_KEY = "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"

# Funkcja do generowania danych z API Groq
def fetch_groq_data(word):
    client = Groq(api_key=API_KEY)
    
    dane_wejściowe_json = {
        "language": "Spanish",
        "translationLanguage": "Polish",
        "word": word,
        "translation": "",
        "definition": "",
        "definition_translation": "",
        "example": "",
        "example_translation": "",
    }

    message = (
        f"Devuélveme los datos completados en formato JSON según mi receta `{json.dumps(dane_wejściowe_json)}`,\n"
        "# dane_wejściowe_json.word -> Write this word in Spanish \n"
        "# dane_wejściowe_json.translation -> traduce la palabra al polaco \n"
        "# dane_wejściowe_json.definition -> definición de la palabra en español \n"
        "# dane_wejściowe_json.definition_translation -> definición traducida de la palabra en polaco \n"
        "# dane_wejściowe_json.example -> oración de ejemplo usando la palabra dane_wejściowe_json.word en español \n"
        "# dane_wejściowe_json.example_translation -> traducción de la oración de ejemplo del español al polaco "
    )

    try:
        completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "user", "content": message}],
            temperature=1,
            max_tokens=512,
            top_p=1,
            stream=False
        )

        response_text = completion.choices[0].message.content

        # Wyrażenia regularne do wyodrębniania danych
        data_pattern = re.compile(
            r'\{.*?\}', re.DOTALL
        )
        
        match = data_pattern.search(response_text)
        if match:
            json_str = match.group(0)
            try:
                groq_data = json.loads(json_str)
            except json.JSONDecodeError as e:
                print(f"JSON Decode Error: {e}")
                return {}
            
            return groq_data

    except Exception as e:
        print(f"Error during API request: {e}")
        return {}

def file_exists(filepath):
    return os.path.isfile(filepath)

# Wczytanie pliku wejściowego
with open(input_file_path, 'r') as file:
    data = json.load(file)

sections = {}
request_counter = 0
request_start_time = time.time()

for item in tqdm(data, desc="Processing sections"):
    section = item["section"]
    output_file_path = f'{out_path}\\{section}.json'
    
    if not file_exists(output_file_path):
        # Jeśli plik nie istnieje, twórz nowy plik i zapisz dane
        with open(output_file_path, 'w', encoding='utf-8') as file:
            json.dump({"data": []}, file, ensure_ascii=False, indent=2)
    
    # Wczytaj istniejące dane
    with open(output_file_path, 'r+', encoding='utf-8') as file:
        content = file.read()
        file.seek(0)
        try:
            existing_data = json.loads(content)
        except json.JSONDecodeError as e:
            print(f"JSON Decode Error: {e}")
            continue
        
        if not isinstance(existing_data, dict) or "data" not in existing_data:
            raise ValueError(f"Plik {output_file_path} zawiera niepoprawny format danych.")
        
        # Dodaj nowe dane do tablicy pod kluczem "data"
        data_list = existing_data["data"]
        for key, value in item.items():
            if key != "section":
                word_data = {
                    "word": value["alt_text"]
                }
                groq_data = fetch_groq_data(word_data["word"])

                # Define the result dictionary
                result = {
                    "section": section,
                    "language": groq_data.get("language", "Spanish"),
                    "translationLanguage": groq_data.get("translationLanguage", "Polish"),
                    "word": groq_data.get("word", word_data["word"]),
                    "translation": groq_data.get("translation", ""),
                    "definition": groq_data.get("definition", ""),
                    "definition_translation": groq_data.get("definition_translation", ""),
                    "example": groq_data.get("example", ""),
                    "example_translation": groq_data.get("example_translation", ""),
                    "imageLink": value["img_src"],
                    "audioLink": value["audio_src"]
                }

                # Dodaj dane do istniejącej tablicy
                data_list.append(result)

        # Zapisz zaktualizowane dane do pliku
        file.seek(0)
        json.dump(existing_data, file, ensure_ascii=False, indent=2)
        file.truncate()  # Upewnij się, że plik nie zawiera pozostałości po wcześniejszych danych

    # Update request counters and handle timing
    request_counter += 1

    # Manage request timing to avoid exceeding rate limits
    if request_counter >= 10:
        elapsed_time = time.time() - request_start_time
        if elapsed_time < 60:
            time.sleep(60 - elapsed_time)
        request_counter = 0
        request_start_time = time.time()

    # Pause between requests
    time.sleep(5)

print("Pliki zostały zapisane.")
