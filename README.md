## Dokumentacja Aplikacji Flask

### Opis

Aplikacja jest zbudowana z użyciem frameworka Flask i służy do różnych operacji związanych z przetwarzaniem języka naturalnego, zarządzaniem plikami oraz konwersją tekstu na mowę i odwrotnie. Wykorzystuje różne modele przetwarzania języka oraz narzędzia do zarządzania plikami i logowaniem.

### Wymagania

- Python 3.7+
- Flask
- Flask-CORS
- Requests
- OpenPyXL
- Transformers
- Torch
- SciPy
- Pydub
- NLTK
- PyAudio
- NumPy
- Pandas
- Werkzeug

### Konfiguracja

1. **Foldery i Pliki**:
    - `uploads`: Folder do przechowywania przesłanych plików.
    - `image_files`: Folder do przechowywania plików graficznych.
    - `audio_files`: Folder do przechowywania plików audio.
    - `logi`: Folder do przechowywania plików logów.
    - `api/statistic/statistics.json`: Plik do przechowywania statystyk.
    - `api/setting/excludedWords.json`: Plik do przechowywania wykluczonych słów.

2. **Modele**:
    - `BARK_MODEL`: Ścieżka do modelu Bark.
    - `WHISPER_MEDIUM`: Ścieżka do modelu Whisper.

3. **Logger**:
    - Konfiguruje logowanie dla różnych rodzajów aktywności: aplikacji, audio, obrazów, przesyłania plików.

### Endpointy API

#### `/process-words`
- **Metoda**: POST
- **Opis**: Przetwarza słowa, zwracając ich lematyzowane wersje.
- **Dane wejściowe**: JSON z listą słów.
- **Odpowiedź**: JSON z lematyzowanymi słowami.

#### `/translate`
- **Metoda**: POST
- **Opis**: Tłumaczy podany tekst z języka angielskiego na polski.
- **Dane wejściowe**: JSON z tekstem do tłumaczenia.
- **Odpowiedź**: JSON z przetłumaczonym tekstem.

#### `/modals/definition-pop-up`
- **Metoda**: GET
- **Opis**: Generuje HTML dla modalnego okienka definicji słowa.
- **Parametry**: `resultMessage`, `selectedWord`, `word`, `translation`, `definition`, `theme`.

#### `/modals/insert-pop-up`
- **Metoda**: GET
- **Opis**: Generuje HTML dla modalnego okienka wstawiania słowa.
- **Parametry**: `selectedWord`, `correctWord`, `fullSentence`, `exampleTranslation`, `theme`.

#### `/modals/multi-pop-up`
- **Metoda**: GET
- **Opis**: Generuje HTML dla modalnego okienka wielokrotnego wyboru.
- **Parametry**: `userTranslation`, `correctTranslation`, `theme`.

#### `/real-time-speech-recognition`
- **Metoda**: POST
- **Opis**: Rozpoczyna rozpoznawanie mowy w czasie rzeczywistym.
- **Dane wejściowe**: Brak (rozpoczyna nagrywanie).
- **Odpowiedź**: JSON z transkrypcją mowy.

#### `/text-to-speech`
- **Metoda**: POST
- **Opis**: Konwertuje tekst na mowę i zwraca ścieżkę do pliku audio.
- **Dane wejściowe**: JSON z tekstem.
- **Odpowiedź**: JSON ze ścieżką do pliku audio.

#### `/load-audio-paths`
- **Metoda**: POST
- **Opis**: Ładuje ścieżki do plików audio dla listy słów.
- **Dane wejściowe**: JSON z listą słów.
- **Odpowiedź**: JSON z listą ścieżek do plików audio.

#### `/load-image-paths`
- **Metoda**: POST
- **Opis**: Ładuje ścieżki do plików obrazów dla listy słów.
- **Dane wejściowe**: JSON z listą słów.
- **Odpowiedź**: JSON z listą ścieżek do plików obrazów.

#### `/save`
- **Metoda**: POST
- **Opis**: Zapisuje dane JSON do pliku.
- **Dane wejściowe**: JSON z nazwą pliku i danymi.
- **Odpowiedź**: JSON z komunikatem o sukcesie.

#### `/save_statistic`
- **Metoda**: POST
- **Opis**: Zapisuje statystyki do pliku.
- **Dane wejściowe**: JSON z danymi statystyk.
- **Odpowiedź**: JSON z komunikatem o sukcesie.

#### `/saveSetting`
- **Metoda**: POST
- **Opis**: Zapisuje ustawienia wykluczonych słów do pliku.
- **Dane wejściowe**: JSON z wykluczonymi słowami.
- **Odpowiedź**: JSON z komunikatem o sukcesie.

#### `/words`
- **Metoda**: GET
- **Opis**: Pobiera dane z pliku JSON.
- **Parametry**: `file` (nazwa pliku).
- **Odpowiedź**: JSON z danymi.

#### `/edit/:file/:index`
- **Metoda**: POST
- **Opis**: Edytuje słowo w pliku JSON.
- **Parametry**: `file` (nazwa pliku), `index` (indeks słowa).
- **Dane wejściowe**: JSON z zaktualizowanymi danymi.
- **Odpowiedź**: JSON z komunikatem o sukcesie.

#### `/files`
- **Metoda**: GET
- **Opis**: Pobiera listę plików z folderu `uploads`.
- **Odpowiedź**: JSON z listą plików.

#### `/upload`
- **Metoda**: POST
- **Opis**: Przesyła plik Excel i zwraca kolumny.
- **Dane wejściowe**: Plik Excel.
- **Odpowiedź**: JSON z kolumnami.

#### `/data`
- **Metoda**: GET
- **Opis**: Pobiera dane w paginowanej formie.
- **Parametry**: `page`, `per_page`.
- **Odpowiedź**: JSON z danymi.

#### `/data`
- **Metoda**: POST
- **Opis**: Dodaje nowe dane.
- **Dane wejściowe**: JSON z nowymi danymi.
- **Odpowiedź**: JSON z zaktualizowanymi danymi.

#### `/data/<int:index>`
- **Metoda**: PUT
- **Opis**: Aktualizuje dane w oparciu o indeks.
- **Dane wejściowe**: JSON z zaktualizowanymi danymi.
- **Odpowiedź**: JSON z zaktualizowanymi danymi.

#### `/data/<int:index>`
- **Metoda**: DELETE
- **Opis**: Usuwa dane na podstawie indeksu.
- **Odpowiedź**: JSON z zaktualizowanymi danymi.

#### `/parse_excel_columns`
- **Metoda**: POST
- **Opis**: Parsuje kolumny z pliku Excel.
- **Dane wejściowe**: Plik Excel.
- **Odpowiedź**: JSON z nazwami kolumn.

#### `/upload_excel`
- **Metoda**: POST
- **Opis**: Przesyła plik Excel i dodaje dane do aplikacji.
- **Dane wejściowe**: Plik Excel i mapowanie kolumn.
- **Odpowiedź**: JSON z dodanymi danymi.

#### `/download_configuration`
- **Metoda**: POST
- **Opis**: Pobiera dane w wybranym formacie (JSON, CSV, Excel).
- **Dane wejściowe**: JSON z kolumnami, wierszami i formatem.
- **Odpowiedź**: Plik w wybranym formacie.

### Uwagi

- Modele BARK i Whisper wymagają odpowiednich repozytoriów i zasobów do działania. Upewnij się, że są pobrane i skonfigurowane przed uruchomieniem aplikacji.
- Konfiguracja i logowanie są zaawansowane i dostosowane do różnych przypadków użycia, co ułatwia śledzenie błędów i monitorowanie aktywności aplikacji.
- Aplikacja wykorzystuje różne mechanizmy przechowywania i manipulacji danymi, w tym operacje na plikach, co wymaga odpowiednich uprawnień i konfiguracji środowiska.

### Przykłady Użycia

1. **Przetwarzanie słów**: Wysy

łając JSON z listą słów do endpointu `/process-words`, można uzyskać lematyzowane wersje tych słów.
   
2. **Konwersja tekstu na mowę**: Wysyłając JSON z tekstem do `/text-to-speech`, aplikacja zwróci ścieżkę do pliku audio zawierającego mowę wygenerowaną z tekstu.

3. **Wgrywanie plików Excel**: Można przesłać plik Excel do `/upload` i otrzymać listę kolumn z pliku.

4. **Pobieranie danych**: Można pobierać dane z endpointu `/data` w paginowanej formie lub dodawać nowe dane za pomocą tego samego endpointu.

### Pomoc i Dokumentacja

- Aby uzyskać więcej informacji na temat poszczególnych funkcji, proszę sprawdzić dokumentację każdej z metod API w powyższej sekcji.
- W razie problemów z konfiguracją lub błędami, proszę sprawdzić logi w folderze `logi` i upewnić się, że wszystkie wymagane pakiety są zainstalowane i odpowiednio skonfigurowane.

### Instalacja Aplikacji Flask

Aby zainstalować i uruchomić aplikację Flask, wykonaj poniższe kroki:

#### 1. **Przygotowanie Środowiska**

1. **Zainstaluj Python**:
   Upewnij się, że masz zainstalowaną wersję Pythona 3.7 lub wyższą. Możesz pobrać Pythona z [oficjalnej strony](https://www.python.org/downloads/).

2. **Utwórz Wirtualne Środowisko**:
   Aby uniknąć konfliktów między zależnościami różnych projektów, zaleca się używanie wirtualnego środowiska.

   ```bash
   python -m venv venv
   ```

3. **Aktywuj Wirtualne Środowisko**:
   - **Windows**:
     ```bash
     venv\Scripts\activate
     ```
   - **macOS/Linux**:
     ```bash
     source venv/bin/activate
     ```

#### 2. **Instalacja Zależności**

1. **Pobierz Kod Źródłowy**:
   Skopiuj kod źródłowy aplikacji na swoje lokalne środowisko. Możesz to zrobić za pomocą `git clone` lub ręcznie pobrać pliki.

   ```bash
   git clone <URL_REPOZYTORIUM>
   cd <NAZWA_FOLDERU>
   ```

2. **Zainstaluj Zależności**:
   Użyj pliku `requirements.txt`, aby zainstalować wszystkie wymagane pakiety.

   ```bash
   pip install -r requirements.txt
   ```

   Jeżeli nie masz pliku `requirements.txt`, możesz ręcznie zainstalować wymagane pakiety:

   ```bash
   pip install Flask Flask-CORS Requests OpenPyXL Transformers Torch SciPy Pydub NLTK PyAudio NumPy Pandas Werkzeug
   ```

#### 3. **Konfiguracja Środowiska**

1. **Konfiguracja Modeli**:
   Upewnij się, że masz pobrane modele `BARK_MODEL` i `WHISPER_MEDIUM`. Jeśli modele są w formie plików, umieść je w odpowiednich lokalizacjach wskazanych w kodzie aplikacji. W przeciwnym razie skonfiguruj ścieżki do modeli zgodnie z instrukcją w dokumentacji projektu.

2. **Ustawienia Folderów**:
   Upewnij się, że odpowiednie foldery istnieją:
   - `uploads`
   - `image_files`
   - `audio_files`
   - `logi`

   Możesz je utworzyć ręcznie, jeśli nie istnieją.

   ```bash
   mkdir uploads image_files audio_files logi
   ```

3. **Konfiguracja Plików JSON**:
   Upewnij się, że pliki `statistics.json` i `excludedWords.json` są dostępne w odpowiednich lokalizacjach (np. `api/statistic/statistics.json` i `api/setting/excludedWords.json`). Możesz je stworzyć ręcznie lub dostosować zgodnie z wymaganiami aplikacji.

#### 4. **Uruchamianie Aplikacji**

1. **Uruchom Aplikację**:
   Po skonfigurowaniu środowiska i zainstalowaniu wszystkich zależności, uruchom aplikację Flask.

   ```bash
   python app.py
   ```

   Upewnij się, że `app.py` to główny plik aplikacji. Jeśli główny plik ma inną nazwę, użyj jej zamiast `app.py`.

2. **Sprawdź Działanie Aplikacji**:
   Otwórz przeglądarkę internetową i przejdź do `http://127.0.0.1:5000` (domyślny port Flask). Powinieneś zobaczyć stronę startową aplikacji lub odpowiednią stronę powitalną.

#### 5. **Rozwiązywanie Problemów**

- **Brakujące Pakiety**: Jeśli pojawią się błędy związane z brakującymi pakietami, upewnij się, że wszystkie wymagane pakiety są zainstalowane. Możesz spróbować zaktualizować `pip` i ponownie zainstalować zależności.

  ```bash
  pip install --upgrade pip
  pip install -r requirements.txt
  ```

- **Problemy z Modelami**: Jeśli aplikacja nie może znaleźć modeli, upewnij się, że są one poprawnie pobrane i ścieżki do nich są prawidłowo ustawione w kodzie aplikacji.

- **Problemy z Folderami**: Sprawdź, czy wszystkie wymagane foldery istnieją i mają odpowiednie uprawnienia do zapisu.

```markdown
├── api (demo)
│   ├── setting
│   └── statistic
├── app (demo)
│   ├── api
│   └── utils
├── audio_files
├── image_files
├── img
├── logi
├── models
│   ├── bark
│   │   └── speaker_embeddings
│   │       └── v2
│   └── whisper-medium
├── static
│   ├── bootstrap-5.3.3-dist
│   │   ├── css
│   │   └── js
│   ├── fontello
│   │   ├── css
│   │   └── font
│   └── project
│       ├── css
│       └── js
│           ├── learning
│           └── manage
├── templates
│   ├── learning
│   │   ├── controls
│   │   └── modals
│   ├── manage
│   │   ├── lists
│   │   └── modals
│   └── submenu
└── uploads
```


