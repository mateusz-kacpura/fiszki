from flask import request, jsonify
from flask_login import login_required, current_user
import json

@login_required
def get_texts_for_insert_words_to_text():
    name = request.args.get('search')
    tag = request.args.get('tag')  
    limit = int(request.args.get('limit', 10)) 
    is_public = request.args.get('public', 'false').lower() == 'true' 
    
    if is_public:
        json_file_path = f'baza_danych/user_datas/public/insert_word.json' 
    else:
        username = current_user.username 
        json_file_path = f'baza_danych/user_datas/{username}/insert_word.json'  

    with open(json_file_path, encoding='utf-8') as f:
        text_data = json.load(f)
    
    filtered_texts = text_data["texts"]
    if name:
        filtered_texts = [text for text in filtered_texts if "name" in text and name.lower() in text["name"].lower()]

    if tag:
        filtered_texts = [text for text in filtered_texts if "tag" in text and tag.lower() in text.get("tag", "").lower()]

    # Zastosowanie limitu
    limited_texts = filtered_texts[:limit]

    # Zwracanie listy tekstĂłw, obsĹ‚uga brakujÄ…cych danych
    text_names = [{"name": text.get("name", "Brak nazwy"), "uuid": text.get("uuid", "Brak UUID"), "tag": text.get("tag", "")} for text in limited_texts]

    return jsonify({"text_names": text_names})
