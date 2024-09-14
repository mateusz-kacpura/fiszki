import os

WHISPER_MEDIUM = "backend/models/files/whisper-medium"
BARK_MODEL = "backend/models/files/bark" # git clone https://huggingface.co/suno/bark
SETTING_FILE ='baza_danych/setting/excludedWords.json'
STATISTICS_FILE ='baza_danych/statistic/statistics.json'
AUDIO_FOLDER = 'baza_danych/audio_files/English/'
IMAGE_FOLDER = 'baza_danych/image_files/English/'
UPLOAD_FOLDER = 'uploads/'

USER_PUBLIC = 'baza_danych/user_datas/public/'
USER = f'baza_danych/user_datas/'

LANGUAGES = {
    "Niemiecki": {"Hiszpański": "DE-ES", "Francuski": "DE-FR", "Hindi": "DE-HI", "Włoski": "DE-IT", "Portugalski": "DE-PT", "Rosyjski": "DE-RU"},
    "Angielski": {"Niemiecki": "EN-DE", "Hiszpański": "EN-ES", "Francuski": "EN-FR", "Hindi": "EN-HI", "Włoski": "EN-IT", "Polski": "EN-PL", "Portugalski": "EN-PT", "Rosyjski": "EN-RU"},
    "Hiszpański": {"Włoski": "ES-IT", "Portugalski": "ES-PT", "Rosyjski": "ES-RU"},
    "Francuski": {"Hiszpański": "FR-ES", "Włoski": "FR-IT", "Rosyjski": "FR-RU"},
    "Polski": {"Niemiecki": "PL-DE", "Hiszpański": "PL-ES", "Francuski": "PL-FR", "Hindi": "PL-HI", "Włoski": "PL-IT", "Portugalski": "PL-PT", "Rosyjski": "PL-RU"}
}

class Config:
    # Klucz do zabezpieczania sesji
    SECRET_KEY = os.urandom(24)

    # Możesz dodać inne opcje konfiguracyjne, jeśli są wymagane
    REGISTRATION_ENABLED = True  # Domyślnie włączona

