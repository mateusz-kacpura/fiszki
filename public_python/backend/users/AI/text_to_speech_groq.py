from flask import request, jsonify
from flask_login import login_required
import os
from groq import Groq
import logging

AUDIO_FOLDER = 'baza_danych/audio_files/English/'

@login_required
def text_to_speech_groq():

    API_KEY = "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"
    client = Groq(api_key=API_KEY)

    print("Received request to convert text to speech using Groq API")
    text = request.json.get('text', '')
    text = text.lower().replace('/', ' ')
    print(f"Received text: {text}")
    if not text:
        print("Error: No text provided")
        return jsonify({'error': 'No text provided'}), 400

    flaga = 0 # groq nie obsĹ‚uguje text-to-speech tylko speech to text
    try:
        mp3_path = os.path.join(AUDIO_FOLDER, f"{text}.mp3")
        if not os.path.exists(mp3_path) and flaga == 1:
            print("Generating audio...")
            completion = client.chat.completions.create(
                model="whisper-large-v3",
                messages=[{"role": "user", "content": text}],
                temperature=1,
                max_tokens=1024,
                top_p=1,
                stream=True,
                stop=None,
            )

            audio_content = b""
            for chunk in completion:
                audio_content += chunk.choices[0].delta.audio or b""

            audio_path = os.path.join(AUDIO_FOLDER, f"{text}.mp3")
            with open(audio_path, 'wb') as audio_file:
                audio_file.write(audio_content)

            print("Plik zostaĹ‚ zapisany pod Ĺ›cieĹĽkÄ…: ", audio_path)
    
        else:
            print(f"Audio file already exists: {mp3_path}")
            
        return jsonify({'audio_path': mp3_path})
        
    except Exception as e:
        print(f"Error in text-to-speech using Groq: {e}")
        logging.error(f"Error in text-to-speech using Groq: {e}")
        return jsonify({'error': 'Failed to generate speech using Groq'}), 500
