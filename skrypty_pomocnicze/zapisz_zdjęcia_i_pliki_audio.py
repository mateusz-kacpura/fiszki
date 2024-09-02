import json
import os
import requests
from tqdm import tqdm

json_file_path = 'C:\\Users\\engli\\fiszki\\fiszki\\zestawy-2.json'
audio_folder_path = 'C:\\Users\\engli\\fiszki\\fiszki\\audio_files'
image_folder_path = 'C:\\Users\\engli\\fiszki\\fiszki\\image_files'

os.makedirs(audio_folder_path, exist_ok=True)
os.makedirs(image_folder_path, exist_ok=True)

def download_file(url, folder_path, file_name):
    file_path = os.path.join(folder_path, file_name)
    
    if os.path.exists(file_path):
        print(f"Plik '{file_name}' już istnieje w katalogu '{folder_path}'.")
        return

    try:
        print(f"Pobieranie pliku: {file_name} z {url}")
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        with open(file_path, 'wb') as file:
            with tqdm(total=total_size, unit='B', unit_scale=True, unit_divisor=1024) as bar:
                for chunk in response.iter_content(chunk_size=8192): 
                    if chunk:
                        file.write(chunk)
                        bar.update(len(chunk))
    except requests.exceptions.HTTPError as http_err:
        print(f"Błąd HTTP podczas pobierania pliku '{file_name}': {http_err}")
    except Exception as err:
        print(f"Inny błąd podczas pobierania pliku '{file_name}': {err}")

def main():
    with open(json_file_path, 'r') as file:
        data = json.load(file)

    total_files = sum(
        2 for item in data for key in item if key.isdigit() and (item[key].get('audio_src') or item[key].get('img_src'))
    )

    with tqdm(total=total_files, desc="Downloading files") as progress_bar:
        for item in data:
            for key in item:
                if key.isdigit():
                    file_info = item[key]
                    
                    audio_url = file_info.get('audio_src')
                    if audio_url:
                        audio_file_name = os.path.basename(audio_url)
                        download_file(audio_url, audio_folder_path, audio_file_name)
                        progress_bar.update(1)
                    
                    img_url = file_info.get('img_src')
                    if img_url:
                        img_file_name = os.path.basename(img_url)
                        download_file(img_url, image_folder_path, img_file_name)
                        progress_bar.update(1)

if __name__ == "__main__":
    main()
