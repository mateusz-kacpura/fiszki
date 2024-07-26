import json
from tqdm import tqdm
import os
import time
from groq import Groq
import re

# Flaga trybu testowego
test_mode = True

# Plik wejściowy
input_file_path = r'C:\Users\engli\fiszki\fiszki\English-1.json'
out_path = 'C:\\Users\\engli\\fiszki\\fiszki\\uploads\\French'

API_KEY = "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"

# Przykładowe dane do testowania
test_data_batch = [
    {
        "word": "positive",
        "translation": "pozytywny",
        "definition": "Affirmative in nature; good.",
        "definition_translation": "Afirmatywny w naturze; dobry.",
        "example": "He has a positive outlook on life.",
        "example_translation": "On ma pozytywne spojrzenie na życie."
    },
    {
        "word": "addicted",
        "translation": "uzależniony",
        "definition": "Physically and mentally dependent on a particular substance.",
        "definition_translation": "Fizycznie i psychicznie uzależniony od konkretnej substancji.",
        "example": "He became addicted to drugs.",
        "example_translation": "Uzależnił się od narkotyków."
    },
    {
        "word": "adventurous",
        "translation": "przedsiębiorczy",
        "definition": "Willing to take risks or try out new methods.",
        "definition_translation": "Gotowy do podejmowania ryzyka lub wypróbowywania nowych metod.",
        "example": "She is an adventurous traveler.",
        "example_translation": "Ona jest przedsiębiorczą podróżniczką."
    },
    {
        "word": "affectionate",
        "translation": "czuły",
        "definition": "Readily feeling or showing fondness.",
        "definition_translation": "Chętnie okazujący lub okazujący czułość.",
        "example": "He is very affectionate towards his children.",
        "example_translation": "On jest bardzo czuły wobec swoich dzieci."
    },
    {
        "word": "aggressive",
        "translation": "agresywny",
        "definition": "Ready or likely to attack or confront.",
        "definition_translation": "Gotowy lub skłonny do ataku lub konfrontacji.",
        "example": "His aggressive behavior caused problems.",
        "example_translation": "Jego agresywne zachowanie spowodowało problemy."
    },
    {
        "word": "ambitious",
        "translation": "ambitny",
        "definition": "Having or showing a strong desire and determination to succeed.",
        "definition_translation": "Posiadanie lub okazywanie silnego pragnienia i determinacji do osiągnięcia sukcesu.",
        "example": "She is an ambitious young woman.",
        "example_translation": "Ona jest ambitną młodą kobietą."
    },
    # Dodaj więcej danych testowych jeśli potrzeba
]

# Funkcja do generowania danych z API Groq
def fetch_groq_data_batch(words):
    if test_mode:
        print(f"Fetching test data for words: {words}")
        return test_data_batch[:len(words)]
    
    client = Groq(api_key=API_KEY)
    
    responses = []
    for word in words:
        dane_wejściowe_json = {
            "language": "French",
            "translationLanguage": "Polish",
            "word": word,
            "translation": "",
            "definition": "",
            "definition_translation": "",
            "example": "",
            "example_translation": "",
        }

        message = (
            f"Return the completed data in JSON format according to my recipe `{json.dumps(dane_wejściowe_json)}`,\n"
            "# dane_wejściowe_json.word -> Write this word in French! po Francusku \n"
            "# dane_wejściowe_json.translation -> translate the word to Polish! po polsku \n"
            "# dane_wejściowe_json.definition -> definition of the word in French! po francusku \n"
            "# dane_wejściowe_json.definition_translation -> translated definition of the word dane_wejściowe_json.definition in Polish! po polsku \n"
            "# dane_wejściowe_json.example -> example sentence using the word dane_wejściowe_json.word in French! po francusku\n"
            "# dane_wejściowe_json.example_translation -> translation of the example sentence from French to Polish! po polsku "
        )


        print(message)
        try:
            """
            completion = client.chat.completions.create(
                model="llama3-70b-8192",
                messages=[{"role": "user", "content": message}],
                temperature=1,
                max_tokens=512,
                top_p=1,
                stream=False
            )

            response_text = completion.choices[0].message.content            
            
            """

            response_text =  "print dane"
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
                    groq_data = {}
                
                responses.append(groq_data)

        except Exception as e:
            print(f"Error during API request: {e}")
            responses.append({})
    
    return responses

def file_exists(filepath):
    return os.path.isfile(filepath)

# Wczytanie pliku wejściowego
with open(input_file_path, 'r') as file:
    data = json.load(file)

sections = {}
request_counter = 0
request_start_time = time.time()

batch_size = 10
current_batch = []

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
                word_data = value["alt_text"]
                current_batch.append(word_data)

                if len(current_batch) == batch_size:
                    groq_data_batch = fetch_groq_data_batch(current_batch)
                    for i, groq_data in enumerate(groq_data_batch):
                        result = {
                            "section": section,
                            "language": groq_data.get("language", "French"),
                            "translationLanguage": groq_data.get("translationLanguage", "Polish"),
                            "word": groq_data.get("word", current_batch[i]),
                            "translation": groq_data.get("translation", ""),
                            "definition": groq_data.get("definition", ""),
                            "definition_translation": groq_data.get("definition_translation", ""),
                            "example": groq_data.get("example", ""),
                            "example_translation": groq_data.get("example_translation", ""),
                            "imageLink": value["img_src"],
                            "audioLink": value["audio_src"]
                        }

                        data_list.append(result)
                    
                    current_batch = []

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

# Przetwarzanie pozostałych danych, jeśli nie wypełniły pełnej partii
if current_batch:
    groq_data_batch = fetch_groq_data_batch(current_batch)
    for i, groq_data in enumerate(groq_data_batch):
        result = {
            "section": section,
            "language": groq_data.get("language", "French"),
            "translationLanguage": groq_data.get("translationLanguage", "Polish"),
            "word": groq_data.get("word", current_batch[i]),
            "translation": groq_data.get("translation", ""),
            "definition": groq_data.get("definition", ""),
            "definition_translation": groq_data.get("definition_translation", ""),
            "example": groq_data.get("example", ""),
            "example_translation": groq_data.get("example_translation", ""),
            "imageLink": value["img_src"],
            "audioLink": value["audio_src"]
        }

        data_list.append(result)

print("Pliki zostały zapisane.")
