import os

UPLOAD_FOLDER = 'uploads'
IMAGE_FOLDER = 'image_files/English/'
AUDIO_FOLDER = 'audio_files/English/'

def create_folders():
    for folder in [UPLOAD_FOLDER, IMAGE_FOLDER, AUDIO_FOLDER]:
        if not os.path.exists(folder):
            os.makedirs(folder)

create_folders()
