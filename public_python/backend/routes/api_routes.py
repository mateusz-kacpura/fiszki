from flask import request, jsonify, Blueprint
from backend.services.lemmatization_service import WordLemmatizer
import json

api_route = Blueprint('api', __name__)
lemmatizer = WordLemmatizer()

@api_route.route('/process-words', methods=['POST'])
def process_words():
    try:
        data = json.loads(request.data)
        words = data.get('words', [])
        
        lemmatized_words = [{**word, 'lemma': lemmatizer.lemmatize_word(word['word'])} for word in words]
        
        return jsonify({'words': lemmatized_words})
    except Exception as e:
        return jsonify({'error': str(e)}), 500