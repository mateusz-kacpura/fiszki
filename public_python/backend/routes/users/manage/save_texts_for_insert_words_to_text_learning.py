from flask import request, jsonify
from flask_login import login_required, current_user
import json
import config
import os

USER = config.USER

@login_required
def save_texts_for_insert_words_to_text_learning():
    username = current_user.username
    json_file_path = os.path.join(USER, username, 'insert_word.json')  # Path to save the file

    # Get JSON data from request
    data = request.get_json()

    if not data:
        return jsonify({"success": False, "error": "Invalid data"}), 400

    # Save the JSON data to file
    try:
        # Ensure the directory exists
        os.makedirs(os.path.dirname(json_file_path), exist_ok=True)

        with open(json_file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500