function loadFiles() {
    fetch('/files')
        .then(response => response.json())
        .then(files => {
            const fileSelect = document.getElementById('file');
            fileSelect.innerHTML = files.map(file => `<option value="${file}">${file}</option>`).join('');
        });
}

document.getElementById('dataForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const data = {
        file: document.getElementById('file').value,
        language: document.getElementById('language').value,
        translationLanguage: document.getElementById('translationLanguage').value,
        word: document.getElementById('word').value,
        translation: document.getElementById('translation').value,
        definition: document.getElementById('definition').value,
        example: document.getElementById('example').value,
        imageLink: document.getElementById('imageLink').value,
        audioLink: document.getElementById('audioLink').value,
    };

    fetch('/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        alert('Dane zapisane pomyślnie!');
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

window.onload = loadFiles;