from flask import request, jsonify
from flask_login import login_required
import pandas as pd 

data = []

@login_required
def upload_excel():
    file = request.files['file']

    # Retrieve column names from the form, use .get() to handle empty keys
    language_col = request.form.get('language', '')
    translationLanguage_col = request.form.get('translationLanguage', '')
    word_col = request.form.get('word', '')
    translation_col = request.form.get('translation', '')
    definition_col = request.form.get('definition', '')
    example_col = request.form.get('example', '')
    example_translation_col = request.form.get('example_translation', '')
    imageLink_col = request.form.get('imageLink', '')
    audioLink_col = request.form.get('audioLink', '')

    # Read the Excel file
    df = pd.read_excel(file)
    print(df.columns.tolist())

    for _, row in df.iterrows():
        entry = {
            "language": row[language_col] if language_col and pd.notna(row[language_col]) else '',
            "translationLanguage": row[translationLanguage_col] if translationLanguage_col and pd.notna(row[translationLanguage_col]) else '',
            "word": row[word_col] if word_col and pd.notna(row[word_col]) else '',
            "translation": row[translation_col] if translation_col and pd.notna(row[translation_col]) else '',
            "definition": row[definition_col] if definition_col and pd.notna(row[definition_col]) else '',
            "example": row[example_col] if example_col and pd.notna(row[example_col]) else '',
            "example_translation": row[example_translation_col] if example_translation_col and pd.notna(row[example_translation_col]) else '',
            "imageLink": row[imageLink_col] if imageLink_col and pd.notna(row[imageLink_col]) else '',
            "audioLink": row[audioLink_col] if audioLink_col and pd.notna(row[audioLink_col]) else ''
        }
        data.append(entry)
    
    return jsonify(data)
