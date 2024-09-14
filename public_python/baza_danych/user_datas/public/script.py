import os
import json

# Funkcja do przetwarzania zawartości pliku
def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        # Wczytaj plik JSON
        data = json.load(f)
        
        # Pobierz listę danych
        content = data.get("data", [])
        
        # Jeśli lista nie jest pusta, przekształć dane
        if content:
            # Konwertuj do żądanej struktury
            processed_data = ",".join(json.dumps(item, ensure_ascii=False) for item in content)
            
            # Zapisz do pliku, zastępując zawartość
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(processed_data)

# Funkcja do przejścia przez foldery i pliki
def process_all_files_in_folders(base_dir):
    # Przejdź przez katalogi i pliki
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            # Przetwarzaj tylko pliki JSON
            if file.endswith('.json'):
                file_path = os.path.join(root, file)
                print(f'Przetwarzanie pliku: {file_path}')
                process_file(file_path)

# Główna funkcja uruchamiająca skrypt
if __name__ == "__main__":
    # Ścieżka do folderu bazowego (zmień jeśli to konieczne)
    base_directory = "."
    
    # Przetwarzaj wszystkie pliki w katalogach
    process_all_files_in_folders(base_directory)
