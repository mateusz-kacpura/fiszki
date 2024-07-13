const template = {
    "language": "",
    "translationLanguage": "",
    "word": "",
    "translation": "",
    "definition": "",
    "example": "",
    "imageLink": "",
    "audioLink": ""
};

let excelData = [];  // This will hold the Excel data

document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('file', document.getElementById('excelFile').files[0]);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        excelData = data.rows;  // Store the Excel data
        displayMappingForm(data.columns);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

function displayMappingForm(columns) {
    const mappingForm = document.getElementById('mappingForm');
    mappingForm.innerHTML = '';

    Object.keys(template).forEach(field => {
        const div = document.createElement('div');
        div.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = `Mapuj do "${field}"`;

        const select = document.createElement('select');
        select.className = 'form-control';
        select.name = field;

        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '';
        select.appendChild(emptyOption);

        const noneOption = document.createElement('option');
        noneOption.value = 'none';
        noneOption.textContent = 'Brak';
        select.appendChild(noneOption);

        columns.forEach(col => {
            const option = document.createElement('option');
            option.value = col;
            option.textContent = col;
            select.appendChild(option);
        });

        select.addEventListener('change', () => {
            checkMapping(select, field);
        });

        div.appendChild(label);
        div.appendChild(select);
        mappingForm.appendChild(div);
    });

    document.getElementById('mappingSection').style.display = 'block';
}

function checkMapping(select, field) {
    const value = select.value;
    const match = Object.keys(template).includes(field) && (value || value === 'none');
    if (match) {
        select.classList.add('match');
        select.classList.remove('mismatch');
    } else {
        select.classList.add('mismatch');
        select.classList.remove('match');
    }
}

document.getElementById('saveChanges').addEventListener('click', function() {
   console.log('saveChanges button clicked');
   
   const formData = new FormData(document.getElementById('mappingForm'));
   console.log('FormData:', formData);
   
   const jsonData = [];
   console.log('jsonData array initialized');
   
   const fileName = document.getElementById('fileName').value;
   console.log('File name:', fileName);
   
   excelData.forEach(row => {
       console.log('Processing row:', row);
       const newRow = {};
       console.log('Initializing new row');
       formData.forEach((value, key) => {
       console.log(`Processing key: ${key}, value: ${value}`);
       newRow[key] = value && value !== 'none' ? row[value] : '';  // Map to empty string if 'none' selected
       console.log(`Mapped key: ${key} to value: ${newRow[key]}`);
       });
       jsonData.push(newRow);
       console.log('Added new row to jsonData:', jsonData);
   });
   
   console.log('jsonData:', jsonData);
   
   fetch('/save', {
       method: 'POST',
       headers: {
       'Content-Type': 'application/json'
       },
       body: JSON.stringify({ fileName, jsonData })
   })
   .then(response => response.json())
   .then(data => {
       console.log('Response:', data);
       alert('Dane zapisane pomyślnie jako JSON!');
   })
   .catch((error) => {
       console.error('Error:', error);
   });
});