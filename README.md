# Language Quiz

A flashcard application for learning new words quickly and efficiently.

![Language Quiz](https://raw.githubusercontent.com/mateusz-kacpura/fiszki/main/img/Language%20Quiz.png)

## Features

- Learn new words using flashcards
- Edit and add new words using the `edit_list_words.html` file
- View learning progress in the `index.html` file

## Installation

To deploy an application with the given modules, you'll need to follow these general steps:

1. Create a virtual environment:
Create a virtual environment using (on Windows) 
    ```bash
    python -m venv myenv
    ``` 
or (on Linux/Mac)
    ```bash 
    python3 -m venv myenv
    ```
Activate the virtual environment using myenv\Scripts\activate (on Windows) or source myenv/bin/activate (on Linux/Mac).

2. Install required modules:
Install the required modules using pip:
    ```bash
    pip install flask flask_cors requests openpyxl transformers gtts
    ```

3. Create a requirements.txt file:
Create a new file requirements.txt with the following content:
    ```bash 
    flask==2.0.1
    flask_cors==3.0.10
    requests==2.25.1
    openpyxl==3.0.5
    transformers==4.10.2
    gtts==2.2.1
    ```

4. Run app
    ```bash 
    python app.py
    ```

5. Page is avaible
    ```bash
    http://localhost:3000/multi_learning.html
    ```

## Documentation

- Backend logs are stored in the `logi` folder
- Frontend logs are displayed in the browser console

## Files

- `edit_list_words.html`: Edit and add new words in JSON format
- `index.html`: The learning panel

---
