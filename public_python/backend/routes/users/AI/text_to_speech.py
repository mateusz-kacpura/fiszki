from flask import request, jsonify
from flask_login import login_required
from transformers import AutoProcessor, AutoModel, BarkModel
import torch
import os
from scipy.io.wavfile import write
from pydub import AudioSegment
import scipy
import logging
import config 

BARK_MODEL = config.BARK_MODEL  # git clone https://huggingface.co/suno/bark
AUDIO_FOLDER = config.AUDIO_FOLDER

@login_required
def text_to_speech():
    print("Received request to convert text to speech")
    text = request.json.get('text', '')
    text = text.lower().replace('/', ' ') 
    print(f"Received text: {text}")
    if not text:
        print("Error: No text provided")
        return jsonify({'error': 'No text provided'}), 400
    
    try:
        mp3_path = os.path.join(AUDIO_FOLDER, f"{text}.mp3")
        if not os.path.exists(mp3_path):
            print("Generating audio...")

            if torch.cuda.is_available():
                # Run on GPU with cuda, required 12 GB vram
                # Zgodne z CUDA 12.0 / pytorch 2.0+  // UkĹ‚ady GPU Ampere, Ada lub Hopper (np. A100, RTX 3090, RTX 4090, H100). Wsparcie dla Turing GPU (T4, RTX 2080) juĹĽ wkrĂłtce, proszÄ™ uĹĽyÄ‡ FlashAttention 1.x dla Turing GPU na razie.
                processor = AutoProcessor.from_pretrained(BARK_MODEL)
                # python -m pip install git+https://github.com/huggingface/optimum.git
                # pip install -U flash-attn --no-build-isolation
                
                device = "cuda" if torch.cuda.is_available() else "cpu"
                model = BarkModel.from_pretrained(BARK_MODEL, torch_dtype=torch.float16, attn_implementation="flash_attention_2").to(device)
            
                # enable CPU offload / wĹ‚ącz dodatkowo obciąĹĽenie CPU
                model.enable_cpu_offload()
            else:
                # Run with CPU
                processor = AutoProcessor.from_pretrained(BARK_MODEL)
                model = AutoModel.from_pretrained(BARK_MODEL)
            
            # voice_preset = "v2/en_speaker_6"

            inputs = processor(
                text,
                return_tensors="pt",
                # voice_preset=voice_preset,
            )

            speech_values = model.generate(**inputs, do_sample=True)

            sampling_rate = 22050
            
            wav_data = speech_values.cpu().numpy().squeeze()
            wav_path = os.path.join(AUDIO_FOLDER, f"{text}.wav")
            scipy.io.wavfile.write(wav_path, rate=sampling_rate, data=wav_data)
            
            audio_segment = AudioSegment.from_wav(wav_path)
            audio_segment.export(mp3_path, format="mp3")
            
            # Remove the intermediate WAV file after exporting to MP3
            if os.path.exists(wav_path):
                os.remove(wav_path)
                print(f"Removed intermediate WAV file: {wav_path}")
            
            print(f"Saving audio to file: {mp3_path}")
        else:
            print(f"Audio file already exists: {mp3_path}")
            
        return jsonify({'audio_path': mp3_path})
    except Exception as e:
        print(f"Error in text-to-speech: {e}")
        logging.error(f"Error in text-to-speech: {e}")
        return jsonify({'error': 'Failed to generate speech'}), 500
