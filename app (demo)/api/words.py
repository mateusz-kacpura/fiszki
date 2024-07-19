from flask import Blueprint, jsonify, request
import json
import os

words_routes = Blueprint('words_routes', __name__)
SETTING_FILE = 'api/setting/excludedWords.json'

@words_routes.route('/add-word', methods=['POST'])
def add_word():
    word = request.json['word']
    with open(SETTING_FILE, 'r') as f:
        data = json.load(f)
    data['excludedWords'].append(word)
    with open(SETTING_FILE, 'w') as f:
        json.dump(data, f, indent=4)
    return jsonify({'status': 'success', 'word': word})

@words_routes.route('/get-words', methods=['GET'])
def get_words():
    with open(SETTING_FILE, 'r') as f:
        data = json.load(f)
    return jsonify({'excludedWords': data['excludedWords']})

@words_routes.route('/remove-word', methods=['POST'])
def remove_word():
    word = request.json['word']
    with open(SETTING_FILE, 'r') as f:
        data = json.load(f)
    data['excludedWords'].remove(word)
    with open(SETTING_FILE, 'w') as f:
        json.dump(data, f, indent=4)
    return jsonify({'status': 'success', 'word': word})
