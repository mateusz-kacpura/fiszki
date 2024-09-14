from flask import request, jsonify, make_response
from flask_login import login_required
from io import BytesIO, StringIO
import csv
import pandas as pd 

data = [
    {
        "language": "English",
        "translationLanguage": "Polish",
        "word": "Include",
        "translation": "zawieraÄ‡",
        "definition": "To contain something as a part of something else.",
        "example": "The report includes several recommendations.",
        "example_translation": "Raport zawiera kilka zaleceĹ„.",
        "imageLink": "image_files/English/include.jpg",
        "audioLink": "audio_files/English/include.mp3"
    }
    # Dodaj wiÄ™cej obiektĂłw w miarÄ™ potrzeby
]

@login_required
def download_configuration():
    try:
        request_data = request.get_json()
        columns = request_data.get('columns')
        rows = request_data.get('rows')
        format = request_data.get('format')

        if not columns:
            return jsonify({'error': 'No columns selected'}), 400
        
        if not rows:
            return jsonify({'error': 'No rows selected'}), 400

        if not data:
            return jsonify({'error': 'No data available to download'}), 400
        
        if format not in ['json', 'csv', 'excel']:
            return jsonify({'error': 'Unsupported format'}), 400
        
        # Filter data based on selected columns and rows
        filtered_data = [{col: row[col] for col in columns} for i, row in enumerate(data) if str(i) in rows]

        if format == 'json':
            response = jsonify(filtered_data)
            response.headers['Content-Disposition'] = 'attachment; filename=configuration.json'
            response.mimetype = 'application/json'
            return response
        elif format == 'csv':
            output = StringIO()
            writer = csv.DictWriter(output, fieldnames=columns)
            writer.writeheader()
            writer.writerows(filtered_data)
            output.seek(0)
            response = make_response(output.getvalue())
            response.headers['Content-Disposition'] = 'attachment; filename=configuration.csv'
            response.mimetype = 'text/csv'
            return response
        elif format == 'excel':
            output = BytesIO()
            df = pd.DataFrame(filtered_data)
            df.to_excel(output, index=False)
            output.seek(0)
            response = make_response(output.getvalue())
            response.headers['Content-Disposition'] = 'attachment; filename=configuration.xlsx'
            response.mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            return response
    except Exception as e:
        return jsonify({'error': str(e)}), 500
