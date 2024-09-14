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

class Config:
    # Klucz do zabezpieczania sesji
    SECRET_KEY = os.urandom(24)

    # Możesz dodać inne opcje konfiguracyjne, jeśli są wymagane
    REGISTRATION_ENABLED = True  # Domyślnie włączona

