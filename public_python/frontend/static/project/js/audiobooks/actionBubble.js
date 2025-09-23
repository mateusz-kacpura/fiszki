// actionBubble.js

import { selectedWords, actionBubble } from './main.js';
import { showAlert, translateText } from './utils.js';
import { updateTranslationHistory } from './historyManager.js';

export function updateBubble(event, finalizePosition = false) {
    const firstSelectedWord = document.querySelector('.selected');
    if (selectedWords.length > 0 && firstSelectedWord) {
        const rect = firstSelectedWord.getBoundingClientRect();
        const x = rect.left;
        const y = rect.top - 40;

        if (!actionBubble) {
            createActionBubble();
        }

        updateBubblePosition(x, y);
    }
}

function createActionBubble() {
    actionBubble = document.createElement('div');
    actionBubble.id = 'action-bubble';
    actionBubble.style.position = 'absolute';
    actionBubble.style.padding = '10px';
    actionBubble.style.border = '1px solid #ccc';
    actionBubble.style.borderRadius = '5px';
    actionBubble.style.backgroundColor = '#fff';
    actionBubble.style.boxShadow = '0px 2px 5px rgba(0,0,0,0.2)';
    actionBubble.innerHTML = `
        <button id="translateButton">Tłumacz</button>
        <button id="selectSentenceButton">Zaznacz całe zdanie</button>
        <button id="clearSelectionButton">Usuń zaznaczenie</button>
        <button id="translateButtonGoogle">Google API</button>
    `;
    document.body.appendChild(actionBubble);
    addEventListeners();
}

function addEventListeners() {
    document.getElementById('translateButton').addEventListener('click', handleTranslate);
    document.getElementById('selectSentenceButton').addEventListener('click', selectEntireSentence);
    document.getElementById('clearSelectionButton').addEventListener('click', clearSelections);
    document.getElementById('translateButtonGoogle').addEventListener('click', handleGoogleTranslate);
}

export function handleTranslate() {
    const textToTranslate = selectedWords.join(' ');

    fetch('/user/model_fb_translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textToTranslate }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.translatedText) {
                updateTranslationHistory(textToTranslate, data.translatedText);
            } else {
                showAlert('Brak tłumaczenia', 'warning');
            }
            actionBubble.style.display = 'none';
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Brak tłumaczenia', 'warning');
            actionBubble.style.display = 'none';
        });
}

export async function handleGoogleTranslate() {
    const translatedText = await translateText(selectedWords.join(' '), 'pl');
    updateTranslationHistory(selectedWords.join(' '), translatedText);
}

function updateBubblePosition(x, y) {
    actionBubble.style.left = `${x}px`;
    actionBubble.style.top = `${y}px`;
    actionBubble.style.display = 'block';
}

function selectEntireSentence() {
    const firstSelectedWord = document.querySelector('.selected');
    if (firstSelectedWord) {
        // ZnajdĹş najbliższy element .word-button, aby określić początek zdania
        const sentenceElement = firstSelectedWord.closest('.card-body').querySelectorAll('.word-button');

        if (sentenceElement) {
            let startIndex = Array.from(sentenceElement).indexOf(firstSelectedWord);
            let selectedSentence = [];

            if (startIndex !== -1) {
                // Zaznacz całe zdanie od początkowego do końcowego indeksu
                for (let i = startIndex; i < sentenceElement.length; i++) {
                    const wordElement = sentenceElement[i];
                    if (wordElement.dataset.index.split('-')[0] !== firstSelectedWord.dataset.index.split('-')[0]) {
                        break;
                    }
                    wordElement.classList.add('selected');
                    selectedSentence.push(wordElement.dataset.word);
                }

                // Złóż zdanie z zaznaczonych słów
                let sentenceString = selectedSentence.join(' ');

                // Szukaj, czy nowe zdanie zawiera się w już istniejących, lub je rozszerza
                let wasUpdated = false;
                selectedWords = selectedWords.map(existingSentence => {
                    // Jeśli istnieje już fragment nowego zdania w istniejącym
                    if (sentenceString.startsWith(existingSentence)) {
                        // Dodajemy brakującą część do istniejącego zdania
                        wasUpdated = true;
                        return existingSentence.split(' ')[0] + sentenceString.slice(existingSentence.length);
                    } else if (existingSentence.startsWith(sentenceString)) {
                        // Jeśli całe nowe zdanie jest już częścią istniejącego, nic nie robimy
                        wasUpdated = true;
                        return existingSentence;
                    }
                });
                // Jeśli zdanie nie zostało dodane ani rozszerzone, dodaj nowe zdanie
                if (!wasUpdated) {
                    selectedWords.push(sentenceString);
                }
            }
        }
    }
}

export function clearSelections() {
    document.querySelectorAll('.selected').forEach(word => {
        word.classList.remove('selected');
    });
    selectedWords.length = 0;
    actionBubble.style.display = 'none';
}