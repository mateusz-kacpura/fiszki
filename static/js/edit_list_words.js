document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file');
    const dataTable = document.getElementById('dataTable');
    const saveChangesButton = document.getElementById('saveChanges');
    const addRowButton = document.getElementById('addRow');
    const deleteRowButton = document.getElementById('deleteRow');
    const loadAudioPathsButton = document.getElementById('loadAudioPaths');
    const loadImagePathsButton = document.getElementById('loadImagePaths');
    const translateRowsButton = document.getElementById('translateRows');
    const fileNameInput = document.getElementById('fileName');
    const languageSelect = document.getElementById('language');
    const translationLanguageSelect = document.getElementById('translationLanguage');

    let data = [];
    let selectedRowIndex = -1;

    fileInput.addEventListener('change', (e) => {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const jsonData = JSON.parse(event.target.result);
            displayData(jsonData);
        };
        reader.readAsText(file);
        console.log('File input changed:', e.target.files[0]);
    });

    function displayData(jsonData) {
        data = jsonData;
        const tableHeader = `
            <tr>
                <th>Select</th>
                <th>Language</th>
                <th>Translation Language</th>
                <th>Word</th>
                <th>Translation</th>
                <th>Definition</th>
                <th>Example</th>
                <th>Example Translation</th>
                <th>Image Link</th>
                <th>Audio Link</th>
            </tr>
        `;
        let tableRows = '';
        jsonData.forEach((wordData, index) => {
            tableRows += `
                <tr>
                    <td><input type="radio" name="rowSelect" class="rowSelect" data-index="${index}"></td>
                    <td>${wordData.language || ''}</td>
                    <td>${wordData.translationLanguage || ''}</td>
                    <td><input type="text" value="${wordData.word || ''}" class="form-control word"></td>
                    <td><input type="text" value="${wordData.translation || ''}" class="form-control translation"></td>
                    <td><input type="text" value="${wordData.definition || ''}" class="form-control definition"></td>
                    <td><input type="text" value="${wordData.example || ''}" class="form-control example"></td>
                    <td><input type="text" value="${wordData.example_translation || ''}" class="form-control example_translation"></td>
                    <td><input type="url" value="${wordData.imageLink || ''}" class="form-control imageLink"></td>
                    <td><input type="url" value="${wordData.audioLink || ''}" class="form-control audioLink"></td>
                </tr>
            `;
        });
        dataTable.innerHTML = tableHeader + tableRows;
        console.log('Displaying data:', jsonData);
    }

    addRowButton.addEventListener('click', () => {
        const newRow = `
            <tr>
                <td><input type="radio" name="rowSelect" class="rowSelect" data-index="${data.length}"></td>
                <td>${languageSelect.value}</td>
                <td>${translationLanguageSelect.value}</td>
                <td><input type="text" class="form-control word"></td>
                <td><input type="text" class="form-control translation"></td>
                <td><input type="text" class="form-control definition"></td>
                <td><input type="text" class="form-control example"></td>
                <td><input type="text" class="form-control example_translation"></td>
                <td><input type="url" class="form-control imageLink"></td>
                <td><input type="url" class="form-control audioLink"></td>
            </tr>
        `;
        dataTable.insertAdjacentHTML('beforeend', newRow);
    });

    deleteRowButton.addEventListener('click', () => {
        const selectedRow = dataTable.querySelector('input[name="rowSelect"]:checked');
        if (selectedRow) {
            selectedRowIndex = parseInt(selectedRow.getAttribute('data-index'));
            dataTable.deleteRow(selectedRow.closest('tr').rowIndex);
            data.splice(selectedRowIndex, 1);
        }
    });

    let timeout;

    loadAudioPathsButton.addEventListener('click', () => {
        const words = Array.from(dataTable.querySelectorAll('.word')).map(input => input.value);
        console.log(`Loading audio paths for words: ${words.join(', ')}`);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            fetch('/load-audio-paths', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ words })
            })
            .then(response => response.json())
            .then(paths => {
                console.log(`Received audio paths: ${paths.join(', ')}`);
                const audioLinks = dataTable.querySelectorAll('.audioLink');
                paths.forEach((path, index) => {
                    if (audioLinks[index]) {
                        audioLinks[index].value = path;
                    }
                });
            })
            .catch(error => {
                console.error(`Error loading audio paths: ${error}`);
                console.error('Error details:', error);
            });
        }, 500); // adjust the timeout value as needed
    });

    loadImagePathsButton.addEventListener('click', () => {
        const words = Array.from(dataTable.querySelectorAll('.word')).map(input => input.value);
        console.log(`Loading image paths for words: ${words.join(', ')}`);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            fetch('/load-image-paths', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ words })
            })
            .then(response => response.json())
            .then(paths => {
                console.log(`Received image paths: ${paths.join(', ')}`);
                const imageLinks = dataTable.querySelectorAll('.imageLink');
                paths.forEach((path, index) => {
                    if (imageLinks[index]) {
                        imageLinks[index].value = path;
                    }
                });
            })
            .catch(error => {
                console.error(`Error loading image paths: ${error}`);
                console.error('Error details:', error);
            });
        }, 500); // adjust the timeout value as needed
    });

    saveChangesButton.addEventListener('click', () => {
        const updatedData = [];
        const tableRows = dataTable.querySelectorAll('tr');
        tableRows.forEach((tableRow, index) => {
            if (index === 0) return; // Skip the header row
            const wordData = {
                language: languageSelect.value,
                translationLanguage: translationLanguageSelect.value,
                word: tableRow.querySelector('.word').value,
                translation: tableRow.querySelector('.translation').value,
                definition: tableRow.querySelector('.definition').value,
                example: tableRow.querySelector('.example').value,
                example_translation: tableRow.querySelector('.example_translation').value,
                imageLink: tableRow.querySelector('.imageLink').value,
                audioLink: tableRow.querySelector('.audioLink').value,
            };
            updatedData.push(wordData);
        });
    
        const fileName = fileNameInput.value || 'data.json';
        const jsonString = JSON.stringify(updatedData, null, 2);
    
        fetch('/uploads-save-json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fileName, data: jsonString })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Plik został zapisany pomyślnie.');
            } else {
                alert('Wystąpił błąd podczas zapisywania pliku.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Wystąpił błąd podczas zapisywania pliku.');
        });
    });    

    translateRowsButton.addEventListener('click', () => {
        console.log('Button clicked!');
        const rowsToTranslate = Array.from(dataTable.querySelectorAll('tr')).slice(1); // Exclude header row
        console.log(`Rows to translate: ${rowsToTranslate.length}`);
        rowsToTranslate.forEach((row, index) => {
            const word = row.querySelector('.word').value;
            console.log(`Translating word: ${word}`);
            fetch(`/translate-word?word=${encodeURIComponent(word)}&targetLang=${translationLanguageSelect.value}`)
                .then(response => response.json())
                .then(translation => {
                    row.querySelector('.translation').value = translation;
                    console.log(`Translated word: ${translation}`);
                })
                .catch(error => {
                    console.error('Error translating word:', error);
                    console.error('Error details:', error.stack);
                });
        });
    });
});