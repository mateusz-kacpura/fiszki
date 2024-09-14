from flask import request, jsonify
from flask_login import login_required, current_user
import json
import config

USER_PUBLIC = config.USER_PUBLIC
USER = config.USER

@login_required
def load_translation_history_for_insert_wors_to_text():
    name = request.args.get('name')  # Nazwa pliku
    is_public = request.args.get('public', 'false').lower() == 'true' 
    
    if is_public:
        json_file_path = f'{USER_PUBLIC}history_translation.json' 
    else:
        username = current_user.username  
        json_file_path = f'{USER}{username}/history_translation.json'

    try:
        with open(json_file_path, encoding='utf-8') as f:
            text_data = json.load(f)
    except FileNotFoundError:
        return jsonify({"translations": []}), 200  # Zwracamy pustÄ… listÄ™, jeĹ›li plik nie istnieje

    # Znajdujemy wpis dla danego pliku
    entry_found = next((entry for entry in text_data if entry['selectedTextName'] == name), None)

    if entry_found:
        return jsonify({"translations": entry_found['translations']}), 200
    else:
        return jsonify({"translations": []}), 200  # JeĹ›li nie ma wpisu, zwracamy pustÄ… listÄ™
