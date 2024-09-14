from flask import request, jsonify
from flask_login import login_required
import json
import config

SETTING_FILE = config.SETTING_FILE

@login_required
def save_setting():
    data = request.json['excludedWords']
    with open(SETTING_FILE, 'w') as f:
        json.dump(data, f, indent=2)
    print(f'Saved setting: {data}')  
    return jsonify({'message': 'Settings update requested'})
