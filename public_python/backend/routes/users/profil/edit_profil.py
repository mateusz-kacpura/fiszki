from flask import render_template, request, redirect, url_for, flash
from flask_login import current_user, login_required
from backend.routes.forms import ProfileForm, DeleteAccountForm
import json
import config

USER = config.USER
LANGUAGES = config.LANGUAGES

@login_required
def edit_profile():
    username = current_user.username
    config_path = f'{USER}{username}/config.json'

    # Load user configuration from config.json
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            user_config = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        user_config = {}

    profile_form = ProfileForm()
    delete_form = DeleteAccountForm()

    # Set language choices dynamically from LANGUAGES
    profile_form.language_1.choices = [(lang, lang) for lang in LANGUAGES]
    profile_form.language_2.choices = [(lang, lang) for lang in LANGUAGES]

    # Pre-fill form with current user settings
    if request.method == 'GET':
        profile_form.language_1.data = user_config.get('language_1', '')
        profile_form.language_2.data = user_config.get('language_2', '')
        profile_form.theme.data = user_config.get('theme', 'light')
        profile_form.notifications.data = user_config.get('notifications', False)
        profile_form.privacy.data = user_config.get('privacy', 'public')

    # Process the form when submitted
    if profile_form.validate_on_submit():
        user_config.update({
            'language_1': profile_form.language_1.data,
            'language_2': profile_form.language_2.data,
            'theme': profile_form.theme.data,
            'notifications': profile_form.notifications.data,
            'privacy': profile_form.privacy.data
        })

        try:
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(user_config, f, ensure_ascii=False, indent=4)
            flash('Profile settings updated successfully.', 'success')
        except Exception as e:
            flash(f'Error updating profile settings: {str(e)}', 'danger')

        return redirect(url_for('user.edit_profile'))

    return render_template('profil/edit_profil.html', profile_form=profile_form, delete_form=delete_form)
