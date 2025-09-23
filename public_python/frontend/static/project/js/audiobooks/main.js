// main.js
// Uncaught SyntaxError: import declarations may only appear at top level of a module

import { decideWhichTextToLoad } from './textLoader.js';
import { allowDrop, drop } from './wordInsertion.js';
import { handleSaveHistory, handleLoadHistory, handleClearHistory } from './historyManager.js';

export let actionBubble = null;
export let selectedTextName = "";
export let selectedWords = [];
export let wordCount = {};
export let alertShown = false;

export const textContainer = document.getElementById('text-with-blanks');
export const wordContainer = document.getElementById('image-container');

document.addEventListener('DOMContentLoaded', () => {
    decideWhichTextToLoad();
});

// Event listeners for pagination
document.getElementById('nextPage').addEventListener('click', () => {
    nextPage();
});
document.getElementById('prevPage').addEventListener('click', () => {
    prevPage();
});

// Event listeners for filtering
document.getElementById('searchInput').addEventListener('input', () => {
    filterTextsByName();
});
document.getElementById('tagInput').addEventListener('input', () => {
    filterTextsByTag();
});

// Event listeners for history management
document.getElementById('save-history-to-file').addEventListener('click', handleSaveHistory);
document.getElementById('load-history-from-file').addEventListener('click', handleLoadHistory);
document.getElementById('clear-history').addEventListener('click', handleClearHistory);

// Event listeners for drag and drop
document.addEventListener('dragover', allowDrop);
document.addEventListener('drop', drop);

// Exporting variables for other modules