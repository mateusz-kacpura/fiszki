from flask import request, jsonify
from flask_login import login_required
import json

SETTING_FILE ='baza_danych/setting/excludedWords.json'

@login_required
def save_setting():
    data = request.json['excludedWords']
    with open(SETTING_FILE, 'w') as f:
        json.dump(data, f, indent=2)
    print(f'Saved setting: {data}')  
    return jsonify({'message': 'Settings update requested'})
