import os
import logging

def init_loggers(app):
    log_folder = app.config['LOG_FOLDER']
    if not os.path.exists(log_folder):
        os.makedirs(log_folder)

    loggers = {
        'app_logger': 'app.log',
        'audio_logger': os.path.join(log_folder, 'path_audio.log'),
        'image_logger': os.path.join(log_folder, 'path_image.log'),
        'upload_logger': os.path.join(log_folder, 'path_uploads.log')
    }

    for logger_name, log_file in loggers.items():
        logger = logging.getLogger(logger_name)
        logger.setLevel(logging.INFO)
        handler = logging.FileHandler(log_file)
        handler.setLevel(logging.INFO)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
