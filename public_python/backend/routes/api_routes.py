from flask import request, jsonify
from app import app
from backend.services.lemmatization_service import lemmatize_word

@app.route('/process-words', methods=['POST'])
def process_words():
    try:
        data = json.loads(request.data)
        words = data.get('words', [])
        
        lemmatized_words = [{**word, 'lemma': lemmatize_word(word['word'])} for word in words]
        
        return jsonify({'words': lemmatized_words})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
