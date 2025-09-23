// historyManager.js

import { selectedTextName } from './main.js';
import { showAlertOnceInInterval } from './utils.js';

export function handleSaveHistory() {
    const translations = [];

    document.querySelectorAll('#translation-history li').forEach(function(item) {
        const originalText = item.querySelector('.editable').textContent.split(' - ')[0].trim();
        const translatedText = item.querySelector('.editable').textContent.split(' - ')[1].trim();

        translations.push({
            "originalText": originalText,
            "translatedText": translatedText,
            "metadata": {
                "translationSource": "manual"
            }
        });
    });

    fetch('/user/save_history_translations_for_insert_words_to_text?name=' + encodeURIComponent(selectedTextName), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ translations: translations }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        showAlert('Historia tłumaczeń została pomyślnie zapisana.', 'success');
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

export function handleLoadHistory() {
    fetch('/user/load_translation_history_for_insert_wors_to_text?name=' + encodeURIComponent(selectedTextName))
        .then(response => response.json())
        .then(data => {
            const translationHistory = document.getElementById('translation-history');
            translationHistory.innerHTML = '';

            if (data.translations && data.translations.length > 0) {
                data.translations.forEach(function(translation) {
                    updateTranslationHistory(translation.originalText, translation.translatedText);
                });
                showAlert('Historia tłumaczeń została pomyślnie wczytana.', 'success');
            } else {
                showAlert('Brak zapisanych tłumaczeń dla wybranego pliku.', 'warning');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            showAlert('Wystąpił błąd podczas wczytywania historii tłumaczeń.', 'danger');
        });
}

export function handleClearHistory() {
    const historyList = document.getElementById('translation-history');
    historyList.innerHTML = '';
    showAlert('Wyczyszczono całą historię', 'warning');
}

export function updateTranslationHistory(originalText, translatedText) {
    const newEntry = createNewHistoryEntry(originalText, translatedText);
    addEntryToHistory(newEntry);

    const editableSpan = newEntry.querySelector('.editable');
    const deleteButton = newEntry.querySelector('.delete-btn');
    const retranslateButton = newEntry.querySelector('.retranslate-btn');

    enableEditing(editableSpan);
    enableDeletion(deleteButton, newEntry);
    enableRetranslation(retranslateButton, originalText, editableSpan);

    showAlertOnceInInterval('Nowe wpisy do historii tłumaczeń zostały dodane.', 'success');
}

function createNewHistoryEntry(originalText, translatedText) {
    const newEntry = document.createElement('li');
    newEntry.innerHTML = `
        <span class="editable">${originalText} - ${translatedText}</span>
        <button class="delete-btn btn btn-sm btn-danger ml-2">Usuń</button>
        <button class="retranslate-btn btn btn-sm btn-primary ml-2">Tłumacz google</button>
    `;
    return newEntry;
}

function addEntryToHistory(newEntry) {
    const historyList = document.getElementById('translation-history');
    historyList.appendChild(newEntry);
}

function enableEditing(editableSpan) {
    editableSpan.addEventListener('click', function () {
        if (!this.isContentEditable) {
            this.contentEditable = true;
            this.focus();
        }
    });

    editableSpan.addEventListener('blur', function () {
        this.contentEditable = false;
        showAlert('Zapisano zmiany');
    });

    editableSpan.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.blur();
        }
    });
}

function enableDeletion(deleteButton, newEntry) {
    const historyList = document.getElementById('translation-history');
    deleteButton.addEventListener('click', function() {
        historyList.removeChild(newEntry);
        showAlert('Usunięto tłumaczenie', 'info');
    });
}

function enableRetranslation(retranslateButton, originalText, editableSpan) {
    retranslateButton.addEventListener('click', async function() {
        const newTranslation = await translateText(originalText, 'pl');
        editableSpan.innerText = `${originalText} - ${newTranslation}`;
        showAlert('Zaktualizowano tłumaczenie przez Google');
    });
}