import os
import logging

LOG_FOLDER = 'baza_danych/logi'

if not os.path.exists(LOG_FOLDER):
    os.makedirs(LOG_FOLDER)

def create_logger(name, log_file, level=logging.INFO):
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    handler = logging.FileHandler(os.path.join(LOG_FOLDER, log_file))
    handler.setLevel(level)
    
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    
    logger.addHandler(handler)
    return logger

# Loggery
app_logger = create_logger('app_logger', 'app.log')
audio_logger = create_logger('audio_logger', 'path_audio.log')
image_logger = create_logger('image_logger', 'path_image.log')
upload_logger = create_logger('upload_logger', 'path_uploads.log')
