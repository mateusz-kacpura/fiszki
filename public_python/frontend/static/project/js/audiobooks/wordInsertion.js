// wordInsertion.js

import { wordCount } from './main.js';
import { wordContainer } from './main.js';

export function initializeWordContainer() {
    updateWordContainer();
}

export function updateWordContainer() {
    wordContainer.innerHTML = '';
    const words = shuffleArray(getAvailableWords());
    words.forEach(createDraggableWord);
}

function getAvailableWords() {
    let words = [];
    Object.keys(wordCount).forEach(word => {
        if (wordCount[word] > 0) {
            for (let i = 0; i < wordCount[word]; i++) {
                words.push(word);
            }
        }
    });
    return words;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createDraggableWord(word) {
    const wordElement = document.createElement('div');
    wordElement.classList.add('image-option');
    wordElement.innerText = word;
    wordElement.draggable = true;
    wordElement.ondragstart = drag;
    wordContainer.appendChild(wordElement);
}

export function allowDrop(event) {
    event.preventDefault();
}

export function drag(event) {
    event.dataTransfer.setData('text', event.target.innerText);
}

export function drop(event) {
    event.preventDefault();
    const draggedWord = event.dataTransfer.getData('text');
    const target = event.target;

    if (target.classList.contains('droppable') && draggedWord === target.dataset.word) {
        target.innerText = draggedWord;
        target.classList.add('correct');
        target.classList.remove('droppable');
        target.classList.add('word-button');

        wordCount[draggedWord]--;
        updateWordContainer();
    }
}