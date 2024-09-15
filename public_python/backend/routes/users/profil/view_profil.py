import json
from flask import render_template
from flask_login import login_required, current_user
import config

# Stałe, które definiują ścieżkę do pliku z konfiguracją użytkownika i dostępne języki
USER = config.USER
LANGUAGES = config.LANGUAGES

# Trasa do przeglądania publicznego profilu użytkownika
@login_required
def view_profile():
    username = current_user.username
    config_path = f'{USER}{username}/config.json'

    # Wczytywanie konfiguracji użytkownika
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            try:
                user_config = json.load(f)
            except json.JSONDecodeError:
                user_config = {}
    except FileNotFoundError:
        user_config = {}

    # Zwracanie widoku profilu z konfiguracją i dostępnością języków
    return render_template('profil/view_profil.html', config=user_config, languages=LANGUAGES)
