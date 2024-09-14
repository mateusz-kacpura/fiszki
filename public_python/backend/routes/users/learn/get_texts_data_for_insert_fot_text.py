from flask import request, jsonify
from flask_login import login_required, current_user
import json
import config


USER_PUBLIC = config.USER_PUBLIC
USER = config.USER

@login_required
def get_texts_data_for_insert_fot_text():
    name = request.args.get('name')

    is_public = request.args.get('public', 'false').lower() == 'true'  
    
    if is_public:
        json_file_path = f'{USER_PUBLIC}insert_word.json' 
    else:
        username = current_user.username  
        json_file_path = f'{USER}{username}/insert_word.json'
    
    with open(json_file_path, encoding='utf-8') as f:
        text_data = json.load(f)

    if name:
        selected_text = next((text for text in text_data["texts"] if text["name"] == name), None)
        if selected_text:
            return jsonify({"texts": [selected_text]})
    
    # JeĹ›li nie podano name, zwrĂłÄ‡ listÄ™ nazw dostÄ™pnych tekstĂłw
    text_names = [{"name": text["name"], "uuid": text["uuid"]} for text in text_data["texts"]]
    return jsonify({"text_names": text_names})