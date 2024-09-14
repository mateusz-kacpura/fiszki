from flask import render_template, request, redirect, url_for, flash
from flask_login import current_user, login_required
import json
import config

USER = config.USER
LANGUAGES = config.LANGUAGES

@login_required
def edit_profile():
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

    if request.method == 'POST':
        # Pobranie danych z formularza
        language_1 = request.form.get('language_1')
        language_2 = request.form.get('language_2')
        theme = request.form.get('theme')
        notifications = request.form.get('notifications')
        privacy = request.form.get('privacy')

        # Zaktualizowanie pliku konfiguracyjnego
        user_config.update({
            'language_1': language_1,
            'language_2': language_2,
            'theme': theme,
            'notifications': notifications,
            'privacy': privacy
        })

        try:
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(user_config, f, ensure_ascii=False, indent=4)
            flash('Zaktualizowano ustawienia profilu.', 'success')
        except Exception as e:
            flash(f'Wystąpił błąd podczas aktualizacji ustawień: {str(e)}', 'danger')

        return redirect(url_for('user.edit_profile'))

    return render_template('profil/edit_profil.html', config=user_config, languages=LANGUAGES)
