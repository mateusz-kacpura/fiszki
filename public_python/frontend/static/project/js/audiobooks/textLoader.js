// textLoader.js

import { showAlert } from './utils.js';
import { populateTextList, updatePaginationControls } from './textDisplay.js';

export let allTexts = [];
export let totalPages = 1;

export function decideWhichTextToLoad() {
    const limit = document.getElementById('textLimit').value || 10;
    const searchQuery = document.getElementById('searchInput').value || '';
    const tagQuery = document.getElementById('tagInput').value || '';

    fetch(`/user/get_texts_for_insert_words_to_text?limit=${limit}&page=${currentPage}&search=${searchQuery}&tag=${tagQuery}`)
        .then(response => response.json())
        .then(data => {
            allTexts = data.text_names;
            totalPages = data.total_pages;
            populateTextList(allTexts);
            updatePaginationControls();
            showAlert('Lista tekstów została załadowana!', 'success');
        })
        .catch(error => {
            console.error('Błąd przy pobieraniu listy tekstów:', error);
            showAlert('Błąd przy pobieraniu listy tekstów.', 'danger');
        });
}

export function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        decideWhichTextToLoad();
    }
}

export function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        decideWhichTextToLoad();
    }
}

export function filterTextsByName() {
    currentPage = 1;
    decideWhichTextToLoad();
}

export function filterTextsByTag() {
    currentPage = 1;
    decideWhichTextToLoad();
}