from flask import Blueprint, jsonify, request, send_from_directory
import request
import os

image_routes = Blueprint('image_routes', __name__)
IMAGE_FOLDER = 'image_files'

@image_routes.route('/<path:filename>')
def get_image(filename):
    return send_from_directory(IMAGE_FOLDER, filename)

@image_routes.route('/load-image-paths', methods=['POST'])
def load_image_paths():
    words = request.json['words']
    image_paths = []
    for word in words:
        filename = word.lower().replace(' ', '-')
        image_path = os.path.join(IMAGE_FOLDER, f'{filename}.jpg').lower()
        if os.path.exists(image_path):
            image_paths.append(image_path)
        else:
            url = f'https://www.example.com/images/{filename}.jpg'
            response = requests.get(url, stream=True)
            if response.status_code == 200:
                with open(image_path, 'wb') as f:
                    for chunk in response.iter_content(1024):
                        f.write(chunk)
                image_paths.append(image_path)
            else:
                print(f"Unable to download image for {word}")
    return jsonify({'image_paths': image_paths})
