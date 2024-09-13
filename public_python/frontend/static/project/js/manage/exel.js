let originalData = [];
let currentPage = 1;
let rowsPerPage = 5;
let totalPages = 1;
let data = []; // Globalna zmienna do przechowywania danych

$(document).ready(function() {
    $('#addRow').click(function() {
        addRow();
    });
    fetchData();
});

function fetchData() {
    $.getJSON('/user/data', { page: currentPage, per_page: rowsPerPage }, function(data) {
        originalData = JSON.parse(JSON.stringify(data));  // Save a copy of the original data
        populateTable(data);  // Generowanie wierszy tabeli
        updatePagination();   // Aktualizacja paginacji
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchData(); // Pobieranie danych po zaĹ‚adowaniu strony

    // Dodaj event listener dla zaznaczania wszystkich wierszy
    document.querySelector('#select-all-rows').addEventListener('change', function() {
        toggleSelectAllRows(this);
    });
});
function populateTable(data) {
    let tbody = $('#data-table tbody');
    tbody.empty();

    data.forEach((item, index) => {
        let row = `<tr>
            <td>
                <input type="checkbox" class="row-checkbox" data-row-index="${index}">
            </td>
            <td contenteditable="true">${item.language}</td>
            <td contenteditable="true">${item.translationLanguage}</td>
            <td contenteditable="true">${item.word}</td>
            <td contenteditable="true">${item.translation}</td>
            <td contenteditable="true">${item.definition}</td>
            <td contenteditable="true">${item.example}</td>
            <td contenteditable="true">${item.example_translation}</td>
            <td contenteditable="true">${item.imageLink}</td>
            <td contenteditable="true">${item.audioLink}</td>
            <td>
                <button class="btn btn-success" onclick="saveRow(${index})">Save</button>
                <button class="btn btn-danger" onclick="deleteRow(${index})">Delete</button>
                <button class="btn btn-warning" onclick="clearRow(${index})">Clear</button>
            </td>
        </tr>`;
        tbody.append(row);
    });

    $('#current-page').text(currentPage);
}

function updatePagination() {
    // Assuming you have a way to get the total count of items
    $.getJSON('/user/data/count', function(count) {
        totalPages = Math.ceil(count / rowsPerPage);
        $('#total-pages').text(totalPages);
        $('#page-number').attr('max', totalPages);
    });
}

// Function to add a new empty row to the table
function addRow() {
    const newRow = `<tr>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td>
            <button class="btn btn-success" onclick="saveRow($(this).closest('tr').index())">Save</button>
            <button class="btn btn-danger" onclick="deleteRow($(this).closest('tr').index())">Delete</button>
            <button class="btn btn-warning" onclick="clearRow($(this).closest('tr').index())">Clear</button>
        </td>
    </tr>`;
    $('#data-table tbody').append(newRow);
}

function saveRow(index) {
    let row = $('#data-table tbody tr').eq(index);
    
    // Collect data from the row
    let updatedItem = {
        language: row.find('td').eq(1).text().trim(),           // Updated index for Language
        translationLanguage: row.find('td').eq(2).text().trim(),// Updated index for Translation Language
        word: row.find('td').eq(3).text().trim(),               // Updated index for Word
        translation: row.find('td').eq(4).text().trim(),        // Updated index for Translation
        definition: row.find('td').eq(5).text().trim(),         // Updated index for Definition
        example: row.find('td').eq(6).text().trim(),            // Updated index for Example
        example_translation: row.find('td').eq(7).text().trim(),// Updated index for Example Translation
        imageLink: row.find('td').eq(8).text().trim(),          // Updated index for Image Link
        audioLink: row.find('td').eq(9).text().trim()           // Updated index for Audio Link
    };

    console.log("Saving Row:", index, updatedItem); // Logowanie zapisanych danych

    // Validate data if needed
    if (!updatedItem.language || !updatedItem.word) {
        alert('Language and Word fields are required.');
        return;
    }

    $.ajax({
        url: `/user/data/${index}`,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(updatedItem),
        success: function(data) {
            alert('Row saved successfully!');
            fetchData();  // Refresh the data after saving the row
        },
        error: function(xhr, status, error) {
            console.error('Error saving row:', status, error);
            alert('Failed to save the row. Please try again.');
        }
    });
}

function deleteRow(index) {
    $.ajax({
        url: `/user/data/${index}`,
        type: 'DELETE',
        success: function(data) {
            fetchData();  // Refresh the data after deleting the row
        }
    });
}

function clearRow(index) {
    let row = $('#data-table tbody tr').eq(index);
    row.find('td').eq(0).text("");
    row.find('td').eq(1).text("");
    row.find('td').eq(2).text("");
    row.find('td').eq(3).text("");
    row.find('td').eq(4).text("");
    row.find('td').eq(5).text("");
    row.find('td').eq(6).text("");
    row.find('td').eq(7).text("");
    row.find('td').eq(8).text("");
}

function clearTable() {
    let tbody = $('#data-table tbody');
    tbody.empty();
}

function undoChanges() {
    populateTable(originalData);
}

// Function to show the column mapping modal
function showColumnMappingModal() {
    // Load columns from uploaded Excel and populate the modal
    let fileInput = $('#upload-excel')[0];
    if (fileInput.files.length === 0) {
        alert('Please select a file.');
        return;
    }
    let formData = new FormData();
    formData.append('file', fileInput.files[0]);

    $.ajax({
        url: '/user/parse_excel_columns',  // Endpoint to parse and return columns
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data) {
            console.log(data.columns)
            populateColumnMappingFields(data.columns);  // Populate the modal with columns
            $('#columnMappingModal').modal('show');  // Show the modal
        }
    });
}

function populateColumnMappingFields(columns) {
    let container = $('#column-mapping-fields');
    container.empty();  // Clear existing fields

    // Predefined columns in desired order
    let mappingOptions = [
        { value: 'language', text: 'Language' },
        { value: 'translationLanguage', text: 'Translation Language' },
        { value: 'word', text: 'Word' },
        { value: 'translation', text: 'Translation' },
        { value: 'definition', text: 'Definition' },
        { value: 'example', text: 'Example' },
        { value: 'example_translation', text: 'Example Translation' },
        { value: 'imageLink', text: 'Image Link' },
        { value: 'audioLink', text: 'Audio Link' }
    ];

    // Generate the mapping fields
    mappingOptions.forEach((option, index) => {
        // Add an option for each column from the input array
        let optionsHtml = columns.map(column => 
            `<option value="${column}">${column}</option>`).join('');
        
        // Add an empty option at the start of the list
        optionsHtml = `<option value="">Select a column</option>` + optionsHtml;
        
        let field = `
            <div class="mb-3">
                <label for="map-column${index}" class="form-label">${option.text}</label>
                <select class="form-select" id="map-column${index}" name="${option.value}">
                    ${optionsHtml}
                </select>
            </div>
        `;
        container.append(field);
    });
}

// Function to populate the column mapping form
function populateColumnMappingForm(columns) {
    let form = $('#column-mapping-form');
    form.empty();

    columns.forEach(col => {
        let formGroup = $('<div class="mb-3"></div>');
        let label = $('<label></label>').addClass('form-label').text(col);
        let select = $('<select></select>').addClass('form-select').attr('name', col);

        // Add options for mapping (customize these options as needed)
        select.append('<option value="">Do not map</option>');
        select.append('<option value="Language">Language</option>');
        select.append('<option value="Translation Language">Translation Language</option>');
        select.append('<option value="Word">Word</option>');
        select.append('<option value="Translation">Translation</option>');
        select.append('<option value="Definition">Definition</option>');
        select.append('<option value="Example">Example</option>');
        select.append('<option value="Example Translation">Example Translation</option>');
        select.append('<option value="Image Link">Image Link</option>');
        select.append('<option value="Audio Link">Audio Link</option>');

        formGroup.append(label);
        formGroup.append(select);
        form.append(formGroup);
    });
}

function uploadExcel() {
    let fileInput = $('#upload-excel')[0];
    if (fileInput.files.length === 0) {
        alert('Please select a file.');
        return;
    }
    let formData = new FormData();
    formData.append('file', fileInput.files[0]);

    // Get column mapping data
    let columnMapping = $('#column-mapping-form').serializeArray();
    columnMapping.forEach(item => {
        formData.append(item.name, item.value);
    });
    console.log("Przed wysĹ‚aniem", formData)
    $.ajax({
        url: '/user/upload_excel',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data) {
            console.log("Przed przetworzeniem", data)
            originalData = JSON.parse(JSON.stringify(data));  // Save a copy of the transformed data
            console.log("Po przetworzeniu", originalData)
            fetchData();  // Populate the table with the transformed data
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("Upload failed:", textStatus, errorThrown);  // Log error
            console.error("Response text:", jqXHR.responseText);  // Log response text for debugging
        }
    });
}


// Function to submit column mapping and upload the file
function submitColumnMapping() {
    let columnMappingModal = bootstrap.Modal.getInstance(document.getElementById('columnMappingModal'));
    columnMappingModal.hide();
    uploadExcel();
}

function uploadJson() {
    let fileInput = $('#upload-json')[0];
    if (fileInput.files.length === 0) {
        alert('Please select a file.');
        return;
    }
    let formData = new FormData();
    formData.append('file', fileInput.files[0]);

    $.ajax({
        url: '/user/upload_json',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data) {
            originalData = JSON.parse(JSON.stringify(data));  // Save a copy of the new original data
            console.log(originalData)
            fetchData();  // Refresh the data after uploading the file
        }
    });
}

function changeRowsPerPage() {
    rowsPerPage = parseInt($('#rows-per-page').val());
    currentPage = 1;  // Reset to the first page
    fetchData();
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage += 1;
        fetchData();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage -= 1;
        fetchData();
    }
}

function goToPage() {
    let page = parseInt($('#page-number').val());
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        fetchData();
    }
}

function handleLoadAudioPaths() {
    const words = Array.from(document.querySelectorAll('#data-table tbody tr td:nth-child(3)')).map(td => td.innerText);
    fetch('/user/load-audio-paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words })
    })
    .then(response => response.json())
    .then(paths => {
        const audioLinks = document.querySelectorAll('#data-table tbody tr td:nth-child(9)');
        paths.forEach((path, index) => {
            if (audioLinks[index]) {
                audioLinks[index].innerText = path || 'Not available';
            }
        });
    })
    .catch(error => {
        console.error(`Error loading audio paths: ${error}`);
    });
}

function handleLoadImagePaths() {
    const words = Array.from(document.querySelectorAll('#data-table tbody tr td:nth-child(3)')).map(td => td.innerText);
    fetch('/user/load-image-paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words })
    })
    .then(response => response.json())
    .then(paths => {
        const imageLinks = document.querySelectorAll('#data-table tbody tr td:nth-child(8)');
        paths.forEach((path, index) => {
            if (imageLinks[index]) {
                imageLinks[index].innerText = path || 'Not available';
            }
        });
    })
    .catch(error => {
        console.error(`Error loading image paths: ${error}`);
    });
}

// Function to handle save changes
function handleSaveChanges() {
    $('#saveChangesModal').modal('show');
}

function showNotification(message) {
    $('#notificationMessage').text(message);
    $('#notificationModal').modal('show');
}

function confirmSaveChanges() {
    $('#saveChangesModal').modal('hide');
    const updatedData = [];
    $('#data-table tbody tr').each(function() {
        const row = $(this);
        const updatedItem = {
            language: row.find('td').eq(0).text(),
            translationLanguage: row.find('td').eq(1).text(),
            word: row.find('td').eq(2).text(),
            translation: row.find('td').eq(3).text(),
            definition: row.find('td').eq(4).text(),
            example: row.find('td').eq(5).text(),
            example_translation: row.find('td').eq(6).text(),
            imageLink: row.find('td').eq(7).text(),
            audioLink: row.find('td').eq(8).text()
        };
        updatedData.push(updatedItem);
    });

    const jsonString = JSON.stringify(updatedData, null, 2);
    const fileName = $('#fileNameInput').val() || 'example'; // Pobierz nazwÄ™ pliku od uĹĽytkownika lub ustaw na "example"

    fetch('/user/uploads-save-json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: jsonString, fileName: fileName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Changes saved successfully. File saved at: {} ');
        } else {
            showNotification('Error saving changes.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error saving changes.');
    });
}

// Function to handle translating rows
function handleTranslateRows() {
    $('#translateRowsModal').modal('show');
}

function confirmTranslateRows() {
    $('#translateRowsModal').modal('hide');
    const sourceColumn = $('#sourceColumn').val();
    const targetColumn = $('#targetColumn').val();
    const targetLang = $('#targetLang').val();
    const rows = [];

    $('#data-table tbody tr').each(function() {
        const row = $(this);
        rows.push({
            sourceText: row.find(`td[data-column="${sourceColumn}"]`).text(),
            targetLang: targetLang,
            rowElement: row
        });
    });

    rows.forEach(row => {
        fetch(`/user/translate-word?word=${encodeURIComponent(row.sourceText)}&targetLang=${row.targetLang}`)
            .then(response => response.json())
            .then(translation => {
                row.rowElement.find(`td[data-column="${targetColumn}"]`).text(translation);
            })
            .catch(error => {
                console.error('Error translating word:', error);
            });
    });
}

// Function to filter table rows based on search input
function filterTableRows() {
    const searchText = $('#searchInput').val().toLowerCase();
    $('#data-table tbody tr').each(function() {
        const row = $(this);
        let match = false;
        row.find('td').each(function() {
            const cellText = $(this).text().toLowerCase();
            if (cellText.includes(searchText)) {
                match = true;
                return false; // Break the loop
            }
        });
        if (match) {
            row.show();
        } else {
            row.hide();
        }
    });
}

// Function to update all rows' language column
function updateBulkLanguage() {
    const selectedLanguage = $('#bulkLanguage').val();
    $('#data-table tbody tr').each(function() {
        $(this).find('td').eq(1).text(selectedLanguage);
    });
}

// Function to update all rows' translation language column
function updateBulkTranslationLanguage() {
    const selectedTranslationLanguage = $('#bulkTranslationLanguage').val();
    $('#data-table tbody tr').each(function() {
        $(this).find('td').eq(2).text(selectedTranslationLanguage);
    });
}

let selectedColumns = [];

function getSelectedColumns() {
    // Array to hold selected column names
    let selectedColumns = [];
    
    // Iterate over all checkboxes in the modal
    $('#column-checkboxes .form-check-input:checked').each(function() {
        // Get the value of each checked checkbox
        selectedColumns.push($(this).val());
    });
    
    // Return the list of selected columns
    return selectedColumns;
}

// PokaĹĽ modal do wyboru kolumn i wierszy
function showColumnSelection() {
    // ZamkniÄ™cie wszelkich otwartych modali
    let openModals = document.querySelectorAll('.modal.show');
    openModals.forEach(modal => {
        let instance = bootstrap.Modal.getInstance(modal);
        if (instance) {
            instance.hide();
        }
    });

    const modal = new bootstrap.Modal(document.getElementById('columnSelectionModal'));
    const columnCheckboxes = document.getElementById('column-checkboxes');
    
    columnCheckboxes.innerHTML = ''; // Clear existing checkboxes
    const columns = ['Language', 'Translation Language', 'Word', 'Translation', 'Definition', 'Example', 'Example Translation', 'Image Link', 'Audio Link'];
    
    columns.forEach(column => {
        const checkbox = document.createElement('div');
        checkbox.classList.add('form-check');
        checkbox.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${column}" id="column-${column}" checked>
            <label class="form-check-label" for="column-${column}">
                ${column}
            </label>
        `;
        columnCheckboxes.appendChild(checkbox);
    });

    modal.show();
}

function closeAllModals() {
    let openModals = document.querySelectorAll('.modal.show');
    openModals.forEach(modal => {
        let instance = bootstrap.Modal.getInstance(modal);
        if (instance) {
            instance.hide();
        }
    });
}

// Function to handle search modal
function handleSearch() {
    $('#searchModal').modal('show');
}

// PokaĹĽ modal do wyboru formatu po wybraniu kolumn
function showDownloadOptions() {
    const columnSelectionModal = bootstrap.Modal.getInstance(document.getElementById('columnSelectionModal'));
    columnSelectionModal.hide(); // Ukryj modal wyboru kolumn
    const downloadOptionsModal = new bootstrap.Modal(document.getElementById('downloadOptionsModal'));
    downloadOptionsModal.show(); // PokaĹĽ modal wyboru formatu
}

function showDownloadOptionsModal() {
    // ZamkniÄ™cie wszelkich otwartych modali
    let openModals = document.querySelectorAll('.modal.show');
    openModals.forEach(modal => {
        let instance = bootstrap.Modal.getInstance(modal);
        if (instance) {
            instance.hide();
        }
    });

    let downloadModal = new bootstrap.Modal(document.getElementById('downloadOptionsModal'));
    downloadModal.show();
}

function getTableData() {
    const table = document.getElementById('data-table');
    const rows = table.querySelectorAll('tbody tr');
    const data = [];

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowData = {
            language: cells[1].textContent.trim(),
            translationLanguage: cells[2].textContent.trim(),
            word: cells[3].textContent.trim(),
            translation: cells[4].textContent.trim(),
            definition: cells[5].textContent.trim(),
            example: cells[6].textContent.trim(),
            exampleTranslation: cells[7].textContent.trim(),
            imageLink: cells[8].textContent.trim(),
            audioLink: cells[9].textContent.trim()
        };
        console.log("Row Data:", rowData); // Logowanie danych wiersza
        data.push(rowData);
    });

    return data;
}

// Funkcja do pobierania konfiguracji
function downloadConfiguration() {
    const formatRadios = document.querySelectorAll('input[name="format"]');
    let selectedFormat;

    formatRadios.forEach(radio => {
        if (radio.checked) {
            selectedFormat = radio.value;
        }
    });

    const columns = getSelectedColumns(); 
    const rowData = getTableData();

    console.log("Selected Columns:", columns);
    console.log("Row Data:", rowData);

    let fileData;

    if (selectedFormat === 'json') {
        fileData = JSON.stringify({ columns, rows: rowData });
        // console.log("File Data (JSON):", fileData);
        downloadFile(fileData, 'data.json', 'application/json');
    } else if (selectedFormat === 'csv') {
        fileData = convertToCSV(rowData, columns); // Implement convertToCSV
        // console.log("File Data (CSV):", fileData);
        downloadFile(fileData, 'data.csv', 'text/csv');
    } else if (selectedFormat === 'excel') {
        // Implement Excel export logic
        // fileData = convertToExcel(rowData, columns); // Implement convertToExcel
        console.log("File Data (Excel):", fileData);
        downloadFile(fileData, 'data.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}


// Funkcja do zaznaczenia/odznaczenia wszystkich kolumn
function toggleSelectAllColumns(selectAllCheckbox) {
    let checkboxes = document.querySelectorAll('input.column-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

// PokaĹĽ modal do wyboru wierszy
function showRowSelection() {
    let rowSelectionModal = new bootstrap.Modal(document.getElementById('rowSelectionModal'));
    rowSelectionModal.show();
}

// Funkcja do zaznaczania wszystkich wierszy
function toggleSelectAllRows(selectAllCheckbox) {
    let checkboxes = document.querySelectorAll('input.row-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

function generateTableRows(data) {
    let tbody = document.querySelector('#data-table tbody');
    tbody.innerHTML = ''; // CzyĹ›ci istniejÄ…ce wiersze

    data.forEach((row, index) => {
        let tr = document.createElement('tr');

        // Dodanie checkboxa do pierwszej kolumny
        let checkboxCell = document.createElement('td');
        checkboxCell.innerHTML = `<input type="checkbox" class="row-checkbox" data-row-index="${index}">`;
        tr.appendChild(checkboxCell);

        // Dodanie pozostaĹ‚ych danych do wiersza
        Object.values(row).forEach(value => {
            let td = document.createElement('td');
            td.textContent = value;
            tr.appendChild(td);
        });

        // Dodanie przyciskĂłw akcji
        let actionsCell = document.createElement('td');
        actionsCell.innerHTML = `
            <button class="btn btn-success" onclick="saveRow(${index})">Save</button>
            <button class="btn btn-danger" onclick="deleteRow(${index})">Delete</button>
            <button class="btn btn-warning" onclick="clearRow(${index})">Clear</button>
        `;
        tr.appendChild(actionsCell);

        tbody.appendChild(tr);
    });
}

// Attach event listeners to buttons and search input
$(document).ready(function() {
    $('#saveChanges').click(handleSaveChanges);
    $('#translateRows').click(handleTranslateRows);
    $('#search').click(handleSearch);
    $('#loadAudioPaths').click(handleLoadAudioPaths);
    $('#loadImagePaths').click(handleLoadImagePaths);
    $('#searchInput').on('input', filterTableRows);
    $('#bulkLanguage').on('change', updateBulkLanguage);
    $('#bulkTranslationLanguage').on('change', updateBulkTranslationLanguage);
});


