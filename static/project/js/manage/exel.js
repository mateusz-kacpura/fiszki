let originalData = [];
let currentPage = 1;
let rowsPerPage = 5;
let totalPages = 1;

$(document).ready(function() {
    $('#addRow').click(function() {
        addRow();
    });
    fetchData();
});

function fetchData() {
    $.getJSON('/data', { page: currentPage, per_page: rowsPerPage }, function(data) {
        originalData = JSON.parse(JSON.stringify(data));  // Save a copy of the original data
        populateTable(data);
        updatePagination();
    });
}

function populateTable(data) {
    let tbody = $('#data-table tbody');
    tbody.empty();
    data.forEach((item, index) => {
        let row = `<tr>
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
    $.getJSON('/data/count', function(count) {
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
    let updatedItem = {
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
    $.ajax({
        url: `/data/${index}`,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(updatedItem),
        success: function(data) {
            fetchData();  // Refresh the data after saving the row
        }
    });
}

function deleteRow(index) {
    $.ajax({
        url: `/data/${index}`,
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

function uploadExcel() {
    let fileInput = $('#upload-excel')[0];
    if (fileInput.files.length === 0) {
        alert('Please select a file.');
        return;
    }
    let formData = new FormData();
    formData.append('file', fileInput.files[0]);

    $.ajax({
        url: '/upload_excel',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data) {
            originalData = JSON.parse(JSON.stringify(data));  // Save a copy of the new original data
            fetchData();  // Refresh the data after uploading the file
        }
    });
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
        url: '/upload_json',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data) {
            originalData = JSON.parse(JSON.stringify(data));  // Save a copy of the new original data
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
    fetch('/load-audio-paths', {
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
    fetch('/load-image-paths', {
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

    fetch('/uploads-save-json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: jsonString })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Changes saved successfully.');
        } else {
            alert('Error saving changes.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error saving changes.');
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
        fetch(`/translate-word?word=${encodeURIComponent(row.sourceText)}&targetLang=${row.targetLang}`)
            .then(response => response.json())
            .then(translation => {
                row.rowElement.find(`td[data-column="${targetColumn}"]`).text(translation);
            })
            .catch(error => {
                console.error('Error translating word:', error);
            });
    });
}

// Function to handle search modal
function handleSearch() {
    $('#searchModal').modal('show');
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
        $(this).find('td').eq(0).text(selectedLanguage);
    });
}

// Function to update all rows' translation language column
function updateBulkTranslationLanguage() {
    const selectedTranslationLanguage = $('#bulkTranslationLanguage').val();
    $('#data-table tbody tr').each(function() {
        $(this).find('td').eq(1).text(selectedTranslationLanguage);
    });
}

// Attach event listeners to buttons and search input
$(document).ready(function() {
    $('#loadAudioPaths').click(handleLoadAudioPaths);
    $('#loadImagePaths').click(handleLoadImagePaths);
    $('#saveChanges').click(handleSaveChanges);
    $('#translateRows').click(handleTranslateRows);
    $('#search').click(handleSearch);

    $('#searchInput').on('input', filterTableRows);
    $('#bulkLanguage').on('change', updateBulkLanguage);
    $('#bulkTranslationLanguage').on('change', updateBulkTranslationLanguage);
});