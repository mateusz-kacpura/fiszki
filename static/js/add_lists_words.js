function loadFiles() {
    fetch('/files')
        .then(response => response.json())
        .then(files => {
            const fileSelect = document.getElementById('file');
            fileSelect.innerHTML = files.map(file => `<option value="${file}">${file}</option>`).join('');
            loadSheet(files[0]);
        });
}

function loadSheet(file) {
    fetch(`/words?file=${file}`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('hot');
            const hot = new Handsontable(container, {
                data: data,
                rowHeaders: true,
                colHeaders: true,
                contextMenu: true,
                afterChange: () => {
                    hot.render();
                },
            });
        });
}

document.getElementById('file').addEventListener('change', function() {
    const selectedFile = this.value;
    loadSheet(selectedFile);
});

document.getElementById('saveButton').addEventListener('click', function() {
    const file = document.getElementById('file').value;
    const hot = Handsontable.getInstance('hot');
    const data = hot.getData();
    
    const method = file ? 'POST' : 'PUT'; // If file is selected, it's an existing file, otherwise it's a new one
    const url = file ? `/save/${file}` : '/save'; // If file is selected, use save endpoint with file name, otherwise use save endpoint for new file

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        alert('Zmiany zostały zapisane!');
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

window.onload = loadFiles;