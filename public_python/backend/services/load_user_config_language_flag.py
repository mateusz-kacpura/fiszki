from flask_login import current_user
import json
import config

USER = config.USER
LANGUAGES = config.LANGUAGES

## flaga może zostać pobrana tylko jeśli użytkownik jest zalogowany
def load_user_config_language_flag():
    if not current_user.is_authenticated:
        print("Użytkownik nie jest zalogowany.")
        return None  # lub domyślna flaga lub inna obsługa błędu
    
    username = current_user.username
    config_path = f'{USER}{username}/config.json'

    # Wczytanie konfiguracji
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            try:
                user_config = json.load(f)
            except json.JSONDecodeError:
                user_config = {}
    except FileNotFoundError:
        user_config = {}

    # Pobieranie wybranych języków z konfiguracji użytkownika
    language_1 = user_config.get('language_1', 'Angielski')
    language_2 = user_config.get('language_2', 'Niemiecki')

    # Przypisanie właściwej flagi na podstawie wyborów językowych
    selected_flag = None
    if language_1 in LANGUAGES and language_2 in LANGUAGES[language_1]:
        selected_flag = LANGUAGES[language_1][language_2]
    elif language_2 in LANGUAGES and language_1 in LANGUAGES[language_2]:
        selected_flag = LANGUAGES[language_2][language_1]
    else:
        print(f'Nie znaleziono flagi dla kombinacji {language_1} i {language_2}')

    # Przypisanie flagi do zmiennej FOLDER_FLAGS
    LANGUAGE_FLAG = selected_flag
    return LANGUAGE_FLAG
