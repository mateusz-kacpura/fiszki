// textDisplay.js

import { selectedWords, wordCount, actionBubble, selectedTextName } from './main.js';
import { showAlert } from './utils.js';
import { initializeWordContainer } from './wordInsertion.js';
import { textContainer } from './main.js';

export function fetchAndLoadText(textName) {
    // Reset selected words and counts
    selectedWords.length = 0;
    Object.keys(wordCount).forEach(key => delete wordCount[key]);

    // Remove previous active text highlighting
    const previousActiveItem = document.querySelector('.list-group-item.active-text');
    if (previousActiveItem) {
        previousActiveItem.classList.remove('active-text');
    }

    // Highlight the selected text
    const activeItem = document.querySelector(`li[data-name="${textName}"]`);
    if (activeItem) {
        activeItem.classList.add('active-text');
    }

    if (actionBubble != null) {
        document.body.removeChild(actionBubble);
        actionBubble = null;
    }

    fetch(`/user/get_texts_data_for_insert_fot_text?name=${encodeURIComponent(textName)}`)
        .then(response => response.json())
        .then(data => {
            const textData = data.texts[0];
            Object.assign(wordCount, calculateWordCount(textData));
            const fullTextHtml = generateTextHtml(textData);
            selectedTextName = textName;
            updateTextContainer(fullTextHtml);
            initializeWordContainer();
            showAlert(`Tekst: "${textName}" został załadowany!`, 'success');
        })
        .catch(error => {
            console.error('Błąd przy pobieraniu tekstu:', error);
            showAlert('Błąd przy wczytywaniu tekstu.', 'danger');
        });
}

function calculateWordCount(textData) {
    return textData.sentences.reduce((count, sentence) => {
        sentence.missing_words.forEach(missingWord => {
            const word = missingWord.word;
            count[word] = (count[word] || 0) + 1;
        });
        return count;
    }, {});
}

function generateTextHtml(textData) {
    let bufforMissingWord = null;

    return textData.sentences.map((sentence, sentenceIndex) => {
        return sentence.english.split(' ').map((word, positionIndex) => {
            const missingWord = sentence.missing_words.find(mw => {
                const isMultiplePositions = Array.isArray(mw.position);
                return isMultiplePositions
                    ? mw.position.includes(positionIndex + 1)
                    : mw.position === positionIndex + 1;
            });

            if (missingWord && (bufforMissingWord === null || bufforMissingWord.word !== missingWord.word)) {
                if (bufforMissingWord !== null) {
                    const missingWordLength = bufforMissingWord.word.split(' ').length;
                    positionIndex += missingWordLength - 1;
                }
                bufforMissingWord = missingWord;
                return `<span class="droppable word-button" data-word="${missingWord.word}" data-index="${sentenceIndex}-${positionIndex}">____</span>`;
            }

            const isPartOfMissingWord = sentence.missing_words.some(mw => {
                return Array.isArray(mw.position) ? mw.position.includes(positionIndex + 1) : mw.position === positionIndex + 1;
            });

            if (!isPartOfMissingWord) {
                return `<button class="word-button" data-word="${word}" data-index="${sentenceIndex}-${positionIndex}">${word}</button>`;
            }

            return '';
        }).join(' ');
    }).join(' ');
}

function updateTextContainer(html) {
    textContainer.innerHTML = html;
}

export function populateTextList(textNames) {
    const textList = document.getElementById('textList');
    textList.innerHTML = '';

    textNames.forEach(text => {
        const listItem = createTextListItem(text);
        textList.appendChild(listItem);
    });
}

function createTextListItem(text) {
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item';
    listItem.dataset.name = text.name;
    listItem.innerText = text.name;
    listItem.addEventListener('click', () => fetchAndLoadText(text.name));
    return listItem;
}

export function updatePaginationControls() {
    const nextPageBtn = document.getElementById('nextPage');
    const prevPageBtn = document.getElementById('prevPage');

    nextPageBtn.disabled = currentPage >= totalPages;
    prevPageBtn.disabled = currentPage <= 1;
}