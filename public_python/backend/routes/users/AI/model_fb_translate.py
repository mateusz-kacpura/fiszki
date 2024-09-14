from flask import request, jsonify
from flask_login import login_required
from transformers import pipeline

@login_required
def model_fb_translate():
    data = request.json
    text = data.get('text')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    try:
        # Initialize the translation pipeline
        generator = pipeline("translation", model="facebook/m2m100_418M")
        result = generator(text, src_lang="en", tgt_lang="pl", max_length=512)

        # Extract the translated text from the result
        translated_text = result[0]['translation_text']
        return jsonify({'translatedText': translated_text})

    except Exception as e:
        # Return error message and status code
        return jsonify({'error': str(e)}), 500
