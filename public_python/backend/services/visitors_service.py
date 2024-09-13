import json
import os

def save_visitor_info(visitor_info):
    file_path = "baza_danych/logi/visitors.json"
    
    # Sprawdzenie, czy plik istnieje, jeśli nie - tworzymy go
    if not os.path.exists(file_path):
        with open(file_path, 'w') as f:
            json.dump([], f)

    # Odczytanie aktualnej zawartości pliku
    with open(file_path, 'r') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            data = []

    # Dodanie nowego rekordu
    data.append(visitor_info)

    # Zapisanie zaktualizowanej zawartości do pliku
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)