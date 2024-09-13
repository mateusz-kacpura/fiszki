import logging
import os

LOG_FOLDER = 'logi'

# UtwĂłrzenie loggerĂłw do logowania ogĂłlnego
app_logger = logging.getLogger('app_logger')
app_logger.setLevel(logging.INFO)
app_handler = logging.FileHandler('app.log')
app_handler.setLevel(logging.INFO)
app_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
app_handler.setFormatter(app_formatter)
app_logger.addHandler(app_handler)

# UtwĂłrzenie logger do logowania Ĺ›cieĹĽek audio
audio_logger = logging.getLogger('audio_logger')
audio_logger.setLevel(logging.INFO)
audio_handler = logging.FileHandler(os.path.join(LOG_FOLDER, 'path_audio.log'))
audio_handler.setLevel(logging.INFO)
audio_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
audio_handler.setFormatter(audio_formatter)
audio_logger.addHandler(audio_handler)

# UtwĂłrzenie loggerĂłw do logowania obrazĂłw
image_logger = logging.getLogger('image_logger')
image_logger.setLevel(logging.INFO)
image_handler = logging.FileHandler(os.path.join(LOG_FOLDER, 'path_image.log'))
image_handler.setLevel(logging.INFO)
image_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
image_handler.setFormatter(image_formatter)
image_logger.addHandler(image_handler)

# Konfiguracja loggera do logowania plikĂłw
upload_logger = logging.getLogger('upload_logger')
upload_logger.setLevel(logging.INFO)
upload_handler = logging.FileHandler(os.path.join(LOG_FOLDER, 'path_uploads.log'))
upload_handler.setLevel(logging.INFO)
upload_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
upload_handler.setFormatter(upload_formatter)
upload_logger.addHandler(upload_handler)
