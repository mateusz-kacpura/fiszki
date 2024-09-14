from flask import request, jsonify
from flask_login import login_required
import json
from backend.services.lemmatization_service import WordLemmatizer

# Inicjalizacja obiektu lemmatizera
lemmatizer = WordLemmatizer()

@login_required
def process_words():
    try:        
        data = json.loads(request.data)
        words = data.get('words', [])
        
        lemmatized_words = [{**word, 'lemma': lemmatizer.lemmatize_word(word['word'])} for word in words]
        
        return jsonify({'words': lemmatized_words})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
