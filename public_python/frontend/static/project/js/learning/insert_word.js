fullContentData = inicializeFullContentData()
let currentWord = '';
let excludedWords = [];

// PLIK ZAWIERA BŁĄD ODNIEŚ SIĘ DO WERSJI WSTECZNEJ HTML I JAVASCRIPT

///////////////////////////////////

// FUNKCJE ŁĄCZĄCE PLIKI W OPARCIU O AMTUALIZACJE DATY

///////////////////////////////////

    // Funkcja, która będzie wywoływana przy zmianie ukrytego elementu
    function handleDateChange(mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-date') {
                console.log('Date attribute updated:', mutation.target.getAttribute('data-date'));
                // Wywołanie funkcji z innego pliku
                generateRandomWord();
            }
        }
      }
  
      // Funkcja do rozpoczęcia obserwacji
      function startObservingDateChange() {
        const hiddenDateElement = document.getElementById('hiddenDate');
        
        // Konfiguracja MutationObserver
        const observer = new MutationObserver(handleDateChange);
        
        // Obserwacja zmian atrybutów elementu
        observer.observe(hiddenDateElement, {
            attributes: true // Obserwujemy tylko zmiany atrybutów
        });
      }
  
      // Wywołanie funkcji obserwującej po załadowaniu dokumentu
      document.addEventListener('DOMContentLoaded', (event) => {
        startObservingDateChange();
      });
  
  
  ///////////////////////////////////
  
  // FUNKCJE UNIKATOWE DLA PLIKU
  
  ///////////////////////////////////

function generateRandomWord() {
    const availableWords = fullContentData.filter(word => !excludedWords.includes(word.lemma));
    if (availableWords.length === 0) {
        document.getElementById('result').innerText = 'No more words to study.';
        return;
    }
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const randomWord = availableWords[randomIndex];
    currentWord = randomWord.lemma;
    currentWordData = randomWord; // Store the current word data

    document.getElementById('result').innerText = '';
    const sentenceWithBlank = randomWord.example.replace(new RegExp(randomWord.word, 'i'), '______');
    document.getElementById('example-sentence-text').innerText = sentenceWithBlank;
    document.getElementById('new-sentence-btn').style.display = 'none';
    document.getElementById('edit-word-btn').style.display = 'none';
    generateAnswerButtons(randomWord);
}

function generateAnswerButtons(word) {
    const answerButtonsDiv = document.getElementById('answer-buttons');
    answerButtonsDiv.innerHTML = '';

    // Get all words except the current word and shuffle them
    let options = fullContentData.filter(w => w.lemma !== word.lemma).map(w => w.word);

    // Select the first 4 options and add the correct word to the options
    options = options.sort(() => Math.random() - 0.5).slice(0, 4);
    options.push(word.word);
    options = options.sort(() => Math.random() - 0.5);

    options.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-primary', 'm-1');
        button.textContent = option;
        button.onclick = () => checkAnswer(option, word.word, word.example, word.example_translation);
        answerButtonsDiv.appendChild(button);
    });
}

function checkAnswer(selected, correct, fullSentence, exampleTranslation) {
    const answerButtons = document.getElementById('answer-buttons');
    answerButtons.innerHTML = '';

    // Remove any existing modals
    const existingModal = document.getElementById('resultModal');
    if (existingModal) {
        existingModal.remove();
    }

    fetch(`/user/modals/modal_pop_up_for_insert_word?selectedWord=${selected}&correctWord=${correct}&fullSentence=${fullSentence}&exampleTranslation=${exampleTranslation}&theme=${theme}`)
        .then(response => response.json())
        .then(data => {
            const modalHTML = data.modal_html;
            //playTextToSpeech(fullSentence);

            document.body.insertAdjacentHTML('beforeend', modalHTML);

            $('#resultModal').modal('show');
            document.getElementById('new-sentence-btn').style.display = 'block';
            document.getElementById('edit-word-btn').style.display = 'block'; // Show the Edit button

            setTimeout(() => {
                $('#resultModal').modal('hide');
                $('#resultModal').on('hidden.bs.modal', () => {
                    const modal = document.getElementById('resultModal');
                    if (modal) {
                        modal.remove();
                    }
                });
            }, 15000);

            if (selected === correct) {
                excludedWords.push(currentWord);
            }
        })
        .catch(error => console.error('Error loading modal:', error));
}

