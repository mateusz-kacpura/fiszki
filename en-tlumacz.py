import json
from tqdm import tqdm
import os
import time
from groq import Groq
import re
from colorama import init, Fore

init(autoreset=True)
# Ścieżka do katalogu z plikami wejściowymi
input_dir = r"C:\Users\engli\fiszki\fiszki\uploads\EN-PT"

# Ścieżka do katalogu z plikami wyjściowymi
output_dir = r"C:\Users\engli\fiszki\fiszki\translated\DE-PT"

# File paths and API key
API_KEY = "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"

# Parameters
language = "German"
translationLanguage = "Portugase"
chunk_size = 10
SLEEPS = 0

def is_correct_format(json_data):
    # Sprawdzamy, czy json_data jest listą
    if not isinstance(json_data, list):
        return False
    
    required_keys = ["word", "definition", "example"]
    
    for item in json_data:
        # Sprawdzamy, czy każdy element listy jest słownikiem
        if not isinstance(item, dict):
            return False
        
        # Sprawdzamy, czy każdy słownik zawiera wszystkie wymagane klucze
        for key in required_keys:
            if key not in item:
                return False
            
            # Sprawdzamy, czy wartości są typu string
            if not isinstance(item[key], str):
                return False
    
    return True

def prepare_data(words, definitions, examples):
    dane_wejsciowe_list = [
        {
            "word": word,
            "definition": definition,
            "example": example,
        }
        for word, definition, example in zip(words, definitions, examples)
    ]

    dane_wejsciowe_json_output = json.dumps(dane_wejsciowe_list, indent=4, ensure_ascii=False)
    message = (
        f" Return the completed data in JSON format according to my format recipe `{dane_wejsciowe_json_output}`. The returned data must be in the language {language} \n"
        f" dane_wejściowe_json.word -> Translated my word to {language}. Make sure that the translation is correctly written in {language}. Remember the correct conjugations \n"
        f" dane_wejściowe_json.definition -> Translated my definition to {language}. Make sure that the translation is correctly written in {language}. Remember the correct conjugations \n"
        f" dane_wejściowe_json.example -> Translated my example to {language}. Make sure that the translation is correctly written in {language}. Remember the correct conjugations \n"
    )

    return message

def save_response_text(response_text, filename):
    with open(filename, 'w', encoding='utf-8') as file:
        file.write(response_text)

def fetch_groq_data(message):
    client = Groq(api_key=API_KEY)

    try:
        completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "user", "content": message}],
            temperature=1,
            max_tokens=6000,
            top_p=1,
            stream=False
        )

        # Pobieranie liczby tokenów wejściowych i wyjściowych z obiektu `CompletionUsage`
        usage = completion.usage

        # Liczba tokenów wejściowych
        input_tokens = usage.prompt_tokens

        # Liczba tokenów wyjściowych
        output_tokens = usage.completion_tokens

        if output_tokens < 100:
            time.sleep(SLEEPS)
            print(Fore.RED + "Response jest pusta, próbujemy jeszcze raz.")
            fetch_groq_data(message)

        response_text = completion.choices[0].message.content
        print(completion.usage)
        #print(response_text)
        save_response_text(response_text, "response.json")
        # Use regular expressions to extract JSON data from response
        data_pattern = re.compile(r'\[.*?\]', re.DOTALL)
        match = data_pattern.search(response_text)
        if match:
            json_str = match.group(0)
            try:
                groq_data = json.loads(json_str)
                if is_correct_format(groq_data):
                    print(Fore.GREEN + "DANE SĄ POPRAWNE")
                else:
                    print(Fore.RED + "BŁĄD W DANYCH")
                    time.sleep(SLEEPS)
                    print(Fore.RED + "Próbuję jeszcze raz.")
                    fetch_groq_data(message)
                return groq_data
            except json.JSONDecodeError as e:
                print(f"JSON Decode Error: {e}")
                time.sleep(SLEEPS)
                print(Fore.RED + "Próbuję jeszcze raz.")
                fetch_groq_data(message)
                return []
        else:
            print(Fore.RED + "No JSON data found in the response.")
            time.sleep(SLEEPS)
            print(Fore.RED + "Próbuję jeszcze raz.")
            fetch_groq_data(message)
        
    except Exception as e:
        print(Fore.RED + f"Error during API request: {e}")
        time.sleep(SLEEPS)
        print(Fore.RED + "Próbuję jeszcze raz.")
        fetch_groq_data(message)
        return []

def file_exists(filepath):
    return os.path.isfile(filepath)

def prepare_chunk(chunk):
    words = []
    translation = []
    definition = []
    definition_translation = []
    example = []
    example_translation = []
    imageLinks = []
    audioLinks = []

    for item in chunk:
        word_data = {
            "word": item["word"],
            "translation": item["translation"],
            "definition": item["definition"],
            "definition_translation": item["definition_translation"],
            "example": item["example"],
            "example_translation": item["example_translation"],
            "imageLink": item["imageLink"],
            "audioLink": item["audioLink"]
        }
        words.append(word_data["word"])
        translation.append(word_data["translation"])
        definition.append(word_data["definition"])
        definition_translation.append(word_data["definition_translation"])
        example.append(word_data["example"])
        example_translation.append(word_data["example_translation"])
        imageLinks.append(word_data["imageLink"])
        audioLinks.append(word_data["audioLink"])

    return words, translation, definition, definition_translation, example, example_translation, imageLinks, audioLinks


def process_chunk(section, chunk, output_dir, language, translationLanguage):

    words, translation, definition, definition_translation, example, example_translation, imageLinks, audioLinks = prepare_chunk(chunk)

    if words:
        message = prepare_data(words, definition, example)
        # print(message)
        groq_data = fetch_groq_data(message)
        if groq_data:
            sum_data = []
            for j in range(len(words)):
                groq_item = groq_data[j] if j < len(groq_data) else {}
                result = {
                    "section": section,
                    "language": language,
                    "translationLanguage": translationLanguage,
                    "word": groq_item.get("word", ""),
                    "translation": translation[j],
                    "definition": groq_item.get("definition", ""),
                    "definition_translation": definition_translation[j],
                    "example": groq_item.get("example", ""),
                    "example_translation": example_translation[j],
                    "imageLink": imageLinks[j],
                    "audioLink": audioLinks[j]
                }
                sum_data.append(result)

            output_file_path = f'{output_dir}\\{section}.json'
            if not file_exists(output_file_path):
                with open(output_file_path, 'w', encoding='utf-8') as file:
                    json.dump({"data": []}, file, ensure_ascii=False, indent=2)

            with open(output_file_path, 'r+', encoding='utf-8') as file:
                content = file.read()
                file.seek(0)
                try:
                    existing_data = json.loads(content)
                except json.JSONDecodeError as e:
                    print(f"JSON Decode Error: {e}")
                    return

                if not isinstance(existing_data, dict) or "data" not in existing_data:
                    raise ValueError(f"File {output_file_path} contains invalid data format.")
                
                data_list = existing_data["data"]
                data_list.extend(sum_data)

                with open(output_file_path, 'w', encoding='utf-8') as file:
                    json.dump(existing_data, file, ensure_ascii=False, indent=2)

            time.sleep(SLEEPS)

request_counter = 0
request_start_time = time.time()

section_count = {}
section_names = []
section_counts = []
sections = {}

# Upewnij się, że katalog wyjściowy istnieje
os.makedirs(output_dir, exist_ok=True)

files = [f for f in os.listdir(input_dir) if f.endswith('.json')]

# Process files
for file_name in files:
    file_path = os.path.join(input_dir, file_name)
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f).get("data", [])

    if not isinstance(data, list):
        print(Fore.RED + f"Data in file {file_name} is not a list")
        continue

    total_sections = len(data)
    section_count = {}
    sections = {}

    for item in data:
        if isinstance(item, dict):
            section = item.get("section")
            if section:
                if section not in section_count:
                    section_count[section] = 0
                section_count[section] += 1
        else:
            print(Fore.RED + f"Item is not a dictionary: {item}")

    with tqdm(total=total_sections, desc="Overall Progress") as pbar:
        for section_name, count in section_count.items():
            total_processed = 0
            
            # Filtruj odpowiednie elementy dla bieżącej sekcji
            section_items = [item for item in data if item.get("section") == section_name]
            
            while total_processed < count:
                end_index = min(total_processed + chunk_size, count)
                section_data = section_items[total_processed:end_index]
                #print(section_name)
                #print("Count", count)
                #print("", total_processed, end_index)
                words, translation, definition, definition_translation, example, example_translation, imageLinks, audioLinks = prepare_chunk(section_data)
                print(words)
                time.sleep(SLEEPS)
                # Uncomment and use the following lines to process each chunk
                if len(section_data) == chunk_size:
                    # Full chunk
                    # print("Paczki", len(section_data))
                    process_chunk(section_name, section_data, output_dir, language, translationLanguage)
                else:
                    # Remainder
                    # print("-----  Reszty", len(section_data)) 
                    process_chunk(section_name, section_data, output_dir, language, translationLanguage)
                
                pbar.update(len(section_data))
                total_processed += len(section_data)