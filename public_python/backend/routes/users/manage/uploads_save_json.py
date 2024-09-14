from flask import request, jsonify
from flask_login import login_required
from backend.services.logger import upload_logger
import os
import config

UPLOAD_FOLDER = config.UPLOAD_FOLDER

# Endpoint do zapisywania JSON, sĹ‚uĹĽy do zapisywania caĹ‚ych zestawĂłw, ktĂłre zostaĹ‚y poprawione w ekselu wbudowanym w aplikacje
@login_required
def uploads_save_json():
    data = request.get_json()
    file_name = data.get('fileName', 'data')  ## w chwili obecnej zmienna fileName nie jest przekazywana z frontendu
    json_data = data.get('data')   
    print(file_name)
    try:
        file_path = os.path.join(UPLOAD_FOLDER, f"{file_name}.json")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(json_data)
        # Logowanie zapisu pliku
        upload_logger.info(f"Plik zapisany: {file_path}")
        return jsonify(success=True, file_path=file_path)
    except Exception as e:
        # Logowanie bĹ‚Ä™du
        upload_logger.error(f"BĹ‚Ä…d podczas zapisywania pliku: {e}")
        return jsonify(success=False)
