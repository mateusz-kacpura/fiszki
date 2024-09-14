from flask import request, jsonify
from flask_login import login_required, current_user
import json
from datetime import datetime
import config

USER_PUBLIC = config.USER_PUBLIC
USER = config.USER

#  <Rule '/user/save_history_translations_for_insert_words_to_text' (HEAD, OPTIONS, GET) -> user.get_text_data>,
@login_required
def save_history_translations_for_insert_words_to_text():
    name = request.args.get('name')  # Nazwa pliku
    translations = request.json.get('translations')  # Lista tĹ‚umaczeĹ„ z requestu (z JavaScript)
    is_public = request.args.get('public', 'false').lower() == 'true' 
    
    if is_public:
        json_file_path = f'{USER_PUBLIC}history_translation.json' 
    else:
        username = current_user.username  
        json_file_path = f'{USER}{username}/history_translation.json'  
    
    # PrĂłbujemy otworzyÄ‡ i odczytaÄ‡ plik JSON
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            try:
                text_data = json.load(f)
            except json.JSONDecodeError:
                text_data = []  # JeĹ›li plik jest pusty lub uszkodzony, inicjujemy pustÄ… listÄ™
    except FileNotFoundError:
        text_data = []  # JeĹ›li plik nie istnieje, inicjujemy pustÄ… listÄ™

    # Znajdujemy zapis dla podanej nazwy pliku (selectedTextName)
    entry_found = next((entry for entry in text_data if entry['selectedTextName'] == name), None)

    if entry_found:
        # PorĂłwnujemy i dodajemy nowe tĹ‚umaczenia
        existing_translations = entry_found['translations']
        for translation in translations:
            if not any(
                t['originalText'] == translation['originalText'] and 
                t['translatedText'] == translation['translatedText']
                for t in existing_translations
            ):
                existing_translations.append(translation)
    else:
        # Tworzymy nowy wpis dla tego pliku
        entry_found = {
            "selectedTextName": name,
            "dateOfSave": datetime.utcnow().isoformat() + 'Z',  # Data zapisu w formacie ISO 8601
            "translations": translations
        }
        text_data.append(entry_found)

    # Zapisujemy zaktualizowany plik JSON
    with open(json_file_path, 'w', encoding='utf-8') as f:
        json.dump(text_data, f, ensure_ascii=False, indent=4)

    return jsonify({"status": "success", "message": "Historia tĹ‚umaczeĹ„ zostaĹ‚a zapisana."}), 200
