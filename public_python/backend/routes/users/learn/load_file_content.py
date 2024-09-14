from flask import request, jsonify
from flask_login import login_required, current_user
import os
import json
import config
from backend.services.load_user_config_language_flag import load_user_config_language_flag

USER_PUBLIC = config.USER_PUBLIC
USER = config.USER

def load_file_content(file, is_public, LANGUAGE_FLAG):
    """Funkcja do ładowania zawartości pliku."""
    if is_public:
        folder_path = os.path.join(USER_PUBLIC, LANGUAGE_FLAG)
    else:
        username = current_user.username
        folder_path = os.path.join(USER, username)

    file_path = os.path.join(folder_path, file)
    print(file_path)
    try:
        with open(file_path, 'r' , encoding='utf-8') as f:
            content = json.load(f)
            return jsonify({"content": json.dumps(content), "file": file})
    except FileNotFoundError:
        return jsonify({"error": "File not found", "file": file}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON in file", "file": file}), 400
    except Exception as e:
        return jsonify({"error": str(e), "file": file}), 500

@login_required
def load_file():
    """Endpoint do ładowania pliku na podstawie parametrów."""
    file = request.args.get('file')
    is_public = request.args.get('public', 'true').lower() == 'true'
    LANGUAGE_FLAG = load_user_config_language_flag()  # Załaduj flagę języka użytkownika

    if not file:
        return jsonify({"error": "No file specified"}), 400

    return load_file_content(file, is_public, LANGUAGE_FLAG)
