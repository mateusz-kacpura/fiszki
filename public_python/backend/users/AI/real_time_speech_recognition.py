from flask import request, jsonify
from flask_login import login_required
from transformers import WhisperProcessor, WhisperForConditionalGeneration
import pyaudio
import torch
import numpy as np
import os
WHISPER_MEDIUM = "backend/models/files/whisper-medium" # git clone https://huggingface.co/openai/whisper-medium

os.environ["CUDA_VISIBLE_DEVICES"] = ""
os.environ["SUNO_USE_SMALL_MODELS"] = "1"

@login_required
def real_time_speech_recognition():

    # Load the model and processor
    processor = WhisperProcessor.from_pretrained(WHISPER_MEDIUM, local_files_only=True)
    model = WhisperForConditionalGeneration.from_pretrained(WHISPER_MEDIUM, local_files_only=True)

    try:
        CHUNK = 1024
        FORMAT = pyaudio.paInt16
        CHANNELS = 1
        RATE = 16000

        p = pyaudio.PyAudio()
        stream = p.open(format=FORMAT,
                        channels=CHANNELS,
                        rate=RATE,
                        input=True,
                        frames_per_buffer=CHUNK)

        print("RozpoczÄ™to nagrywanie...")

        frames = []

        while True:
            data = stream.read(CHUNK)
            frames.append(data)
            audio_data = np.frombuffer(data, dtype=np.int16)

            inputs = processor(audio_data, return_tensors="pt", sampling_rate=RATE)

            with torch.no_grad():
                generated_ids = model.generate(inputs.input_features)
                transcription = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]

            print("Transkrypcja: ", transcription)
            # Send partial transcription here if needed

            return jsonify({'transcription': transcription})

    except KeyboardInterrupt:
        print("Zatrzymano nagrywanie.")
        stream.stop_stream()
        stream.close()
        p.terminate()
        return jsonify({'message': 'Recording stopped'}), 200

    except Exception as e:
        print(f"Error in real-time speech recognition: {e}")
        return jsonify({'error': 'Failed to process speech'}), 500

    finally:
        stream.stop_stream()
        stream.close()
        p.terminate()
