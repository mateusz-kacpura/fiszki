import json
from tqdm import tqdm
import os
import time
from groq import Groq
import re

# File paths and API key
input_file_path = r'C:\Users\engli\fiszki\fiszki\English-2.json'
out_path = 'C:\\Users\\engli\\fiszki\\fiszki\\uploads\\Italian'
API_KEY = "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"

# Parameters
language = "Italian"
translationLanguage = "Polish"
chunk_size = 30

def prepare_data(words):
    dane_wejsciowe_list = [
        {
            "language": language,
            "translationLanguage": translationLanguage,
            "word": word,
            "translation": "",
            "definition": "",
            "definition_translation": "",
            "example": "",
            "example_translation": ""
        }
        for word in words
    ]

    dane_wejsciowe_json_output = json.dumps(dane_wejsciowe_list, indent=4, ensure_ascii=False)

    message = (
        f" Return the completed data in JSON format according to my recipe `{dane_wejsciowe_json_output}`, return only the completed data in json format in response \n"
        f" dane_wejściowe_json.word -> Translate this word to {language}! word must be in {language} \n"
        f" dane_wejściowe_json.translation -> Translate the word to {translationLanguage}! po {translationLanguage} \n"
        f" dane_wejściowe_json.definition -> dane_wejściowe_json.definition of the word must be in {language}! definition mast be in {language} \n"
        f" dane_wejściowe_json.definition_translation -> translated definition of the word dane_wejściowe_json.definition in {translationLanguage} ! this translation must be in {translationLanguage} \n"
        f" dane_wejściowe_json.example -> example sentence using the word dane_wejściowe_json.word in {language}! example must be in {language} \n"
        f" dane_wejściowe_json.example_translation -> translation of the example sentence from {language} to {translationLanguage}! this translation must be in {translationLanguage} "
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

        print(f"Liczba tokenów wejściowych: {input_tokens}")
        print(f"Liczba tokenów wyjściowych: {output_tokens}")

        response_text = completion.choices[0].message.content
        print(completion.usage)
        # print(response_text)
        save_response_text(response_text, "response.json")
        # Use regular expressions to extract JSON data from response
        data_pattern = re.compile(r'\[.*?\]', re.DOTALL)
        match = data_pattern.search(response_text)
        if match:
            json_str = match.group(0)
            try:
                groq_data = json.loads(json_str)
                return groq_data
            except json.JSONDecodeError as e:
                print(f"JSON Decode Error: {e}")
                return []
        else:
            print("No JSON data found in the response.")
            return []
        
    except Exception as e:
        print(f"Error during API request: {e}")
        return []

def file_exists(filepath):
    return os.path.isfile(filepath)

# Load input file
with open(input_file_path, 'r') as file:
    data = json.load(file)



def prepare_chunk(chunk):
    words = []
    imageLinks = []
    audioLinks = []

    for item in chunk:
        for key, value in item.items():
            if key != "section":
                word_data = {
                    "word": value["alt_text"],
                    "imageLink": value["img_src"],
                    "audioLink": value["audio_src"]
                }
                words.append(word_data["word"])
                imageLinks.append(word_data["imageLink"])
                audioLinks.append(word_data["audioLink"])

    return words, imageLinks, audioLinks

def process_chunk(section, chunk, out_path, language, translationLanguage):

    words, imageLinks, audioLinks = prepare_chunk(chunk)

    if words:
        message = prepare_data(words)
        groq_data = fetch_groq_data(message)
        if groq_data:
            sum_data = []
            for j in range(len(words)):
                groq_item = groq_data[j] if j < len(groq_data) else {}
                result = {
                    "section": section,
                    "language": groq_item.get("language", language),
                    "translationLanguage": groq_item.get("translationLanguage", translationLanguage),
                    "word": groq_item.get("word", words[j]),
                    "translation": groq_item.get("translation", ""),
                    "definition": groq_item.get("definition", ""),
                    "definition_translation": groq_item.get("definition_translation", ""),
                    "example": groq_item.get("example", ""),
                    "example_translation": groq_item.get("example_translation", ""),
                    "imageLink": imageLinks[j],
                    "audioLink": audioLinks[j]
                }
                sum_data.append(result)

            output_file_path = f'{out_path}\\{section}.json'
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

            time.sleep(60)

request_counter = 0
request_start_time = time.time()

total_sections = len(data)

section_count = {}
section_names = []
section_counts = []
sections = {}

for item in data:
    section = item.get("section")
    if section:
        if section not in section_count:
            section_count[section] = 0
        section_count[section] += 1

for section, count in section_count.items():
    section_names.append(section)
    section_counts.append(count)
    print(f"Section '{section}' has {count} elements.")

"""
Section 'slownictwo-angielskie-poziom-a1' has 400 elements.
Section 'slownictwo-angielskie-poziom-a2' has 150 elements.
Section 'slownictwo-angielskie-poziom-b1' has 1546 elements.
Section 'slownictwo-angielskie-poziom-b2' has 250 elements.
"""

print(section_counts)

with tqdm(total=total_sections, desc="Overall Progress") as pbar:
    for section_name, count in section_count.items():
        total_processed = 0
        print("\n")
        
        # Filter relevant items for the current section
        section_items = [item for item in data if item.get("section") == section_name]
        
        while total_processed < count:
            end_index = min(total_processed + chunk_size, count)
            section_data = section_items[total_processed:end_index]
            print(section_name)
            print("Count", count)
            print("", total_processed, end_index)
            
            words, imageLinks, audioLinks = prepare_chunk(section_data)
            print(words)
            # Uncomment and use the following lines to process each chunk
            if len(section_data) == chunk_size:
                # Full chunk
                # print("Paczki", len(section_data))
                process_chunk(section_name, section_data, out_path, language, translationLanguage)
            else:
                 # Remainder
                # print("-----  Reszty", len(section_data)) 
                process_chunk(section_name, section_data, out_path, language, translationLanguage)

            pbar.update(len(section_data))
            total_processed += len(section_data)

print("Files have been saved.")
