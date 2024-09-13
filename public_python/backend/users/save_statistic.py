from flask import request, jsonify
from flask_login import login_required
import json
import logging
import os

STATISTICS_FILE ='baza_danych/statistic/statistics.json'

@login_required
def save_statistic():
    statistic = request.json
    logging.info(f'Received statistic: {statistic}')
    if not os.path.exists(STATISTICS_FILE):
        with open(STATISTICS_FILE, 'w') as f:
            json.dump([statistic], f, indent=2)
    else:
        with open(STATISTICS_FILE, 'r+') as f:
            data = f.read()
            if data:
                existing_data = json.loads(data)
            else:
                existing_data = []
            existing_data.append(statistic)
            f.seek(0)
            json.dump(existing_data, f, indent=2)
    print(f'Saved statistic: {statistic}') 
    return jsonify({'message': 'Statistic saved successfully'})
