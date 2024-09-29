from flask import request, jsonify
from flask_login import login_required, current_user
import os
import config
from backend.services.load_user_config_language_flag import load_user_config_language_flag
import json

USER_PUBLIC = config.USER_PUBLIC
USER = config.USER

def filter_files_by_tag(files, folder_path, tag):
    """Filtruj pliki według tagu."""
    filtered_files = []
    for f in files:
        file_path = os.path.join(folder_path, f)
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
            if 'tags' in data and tag.lower() in [t.lower() for t in data['tags']]:
                filtered_files.append(f)
    return filtered_files

def load_public_files(name, tag, limit, page, LANGUAGE_FLAG):
    """Załaduj pliki z folderu publicznego."""
    load_folder_path = os.path.join(USER_PUBLIC, LANGUAGE_FLAG)
    print(load_folder_path)
    # Sprawdź, czy folder istnieje
    if not os.path.exists(load_folder_path):
        return jsonify({"error": f"Folder {load_folder_path} nie istnieje", "language_flag": LANGUAGE_FLAG}), 404

    # Znajdź pliki .json w folderze
    files = [f for f in os.listdir(load_folder_path) if f.endswith('.json')]

    # Filtrowanie po nazwie (jeśli podano)
    if name:
        files = [f for f in files if name.lower() in f.lower()]

    # Filtrowanie po tagu (jeśli podano)
    if tag:
        files = filter_files_by_tag(files, load_folder_path, tag)

    # Paginacja
    total_files = len(files)
    start = (page - 1) * limit
    end = start + limit
    paginated_files = files[start:end]

    return jsonify({
        "files": paginated_files,
        "total_files": total_files,
        "current_page": page,
        "language_flag": LANGUAGE_FLAG
    })

def load_private_files(name, tag, limit, page, LANGUAGE_FLAG):
    """Załaduj prywatne pliki użytkownika i zwróć listę nazw plików."""
    username = current_user.username
    user_sets_path = os.path.join(USER, username, 'user_sets')
    print(user_sets_path)
    try:
        # Lista plików JSON w folderze użytkownika
        json_files = [f for f in os.listdir(user_sets_path) if f.endswith('.json')]
        if not json_files:
            raise FileNotFoundError("No JSON files found in the user sets directory.")
        
        # Opcjonalne filtrowanie po nazwie pliku
        if name:
            json_files = [f for f in json_files if name.lower() in f.lower()]

        # Opcjonalne filtrowanie po tagu
        if tag:
            json_files = filter_files_by_tag(json_files, user_sets_path, tag)

        # Paginacja
        total_files = len(json_files)
        start = (page - 1) * limit
        end = start + limit
        paginated_files = json_files[start:end]

        return jsonify({
            "files": paginated_files,
            "total_files": total_files,
            "current_page": page,
            "language_flag": LANGUAGE_FLAG
        })
    
    except (FileNotFoundError, ValueError) as e:
        error_message = {
            FileNotFoundError: "No JSON files found in the user sets directory.",
            ValueError: str(e)
        }.get(type(e), "Unknown error")

        # Logowanie błędu (opcjonalne)
        # app.logger.error(f"{error_message}: {str(e)}")

        # Załaduj pliki z folderu publicznego jako alternatywa
        return load_public_files(name, tag, limit, page, LANGUAGE_FLAG)

@login_required
def load_files_for_learning():
    name = request.args.get('name', '')  # Nazwa pliku do wyszukania (pusta domyślnie)
    is_public = request.args.get('public', 'false').lower() == 'true' 
    limit = int(request.args.get('limit', 10))  # Limit plików na stronę (domyślnie 10)
    page = int(request.args.get('page', 1))  # Strona do załadowania (domyślnie 1)
    tag = request.args.get('tag', '')  # Opcjonalne filtrowanie po tagu

    LANGUAGE_FLAG = load_user_config_language_flag()  # Załaduj flagę języka użytkownika

    if is_public:
        return load_public_files(name, tag, limit, page, LANGUAGE_FLAG)
    else:
        return load_private_files(name, tag, limit, page, LANGUAGE_FLAG)

