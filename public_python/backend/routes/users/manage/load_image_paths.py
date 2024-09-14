from flask import request, jsonify
from flask_login import login_required
from backend.services.logger import app_logger, image_logger
import os
import requests
import config

IMAGE_FOLDER = config.IMAGE_FOLDER

def log_to_file(logger, message):
    logger.info(message)
    
def check_and_download_file(url, file_path, logger):
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx and 5xx)
        with open(file_path, 'wb') as file:
            file.write(response.content)
        return file_path
    except requests.exceptions.RequestException as e:
        log_to_file(logger, f'Error downloading {url}: {e}')
        return None

@login_required
def load_image_paths():
    try:
        data = request.get_json()
        words = data.get('words', [])

        image_paths = []
        for word in words:
            if not word:
                image_paths.append(None)
                continue

            filename = word.lower().replace(' ', '-')
            image_path = os.path.join(IMAGE_FOLDER, f"{filename}.jpg")

            if os.path.exists(image_path):
                log_to_file(image_logger, f'File already exists: {image_path}')
                image_paths.append(image_path)
                continue

            url = f"https://www.ang.pl/img/slownik/{filename}.jpg"
            image_file = check_and_download_file(url, image_path, image_logger)

            if image_file:
                log_to_file(image_logger, f'Downloaded image: {url} to {image_path}')
                image_paths.append(image_file)
            else:
                log_to_file(image_logger, f'Failed to download image from: {url}')
                image_paths.append(None)

        return jsonify(image_paths)

    except Exception as e:
        log_to_file(app_logger, f'Error in load_image_paths: {e}')
        return jsonify({"error": "Internal Server Error"}), 500
