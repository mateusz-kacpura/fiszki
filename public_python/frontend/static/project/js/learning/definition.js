fullContentData = inicializeFullContentData()

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

document.addEventListener('keydown', function(event) {
    if (event.key >= '1' && event.key <= '5') {
        const index = parseInt(event.key) - 1;
        const buttons = document.querySelectorAll('.answer-buttons .btn');
        if (buttons[index]) {
            buttons[index].click();
        }
    } else if (event.key === 'Enter') {
        if (document.getElementById('translation').value.trim() === '') {
            handleEnterKey();
        } else {
            checkTranslation();
        }
    } else if (event.key === 'ArrowRight') {
        generateRandomWord();
    }
});

function generateRandomWord() {
    if (fullContentData.length === 0) return;

    const randomIndex = Math.floor(Math.random() * fullContentData.length);
    currentWordData = fullContentData[randomIndex];

    document.getElementById('example-sentence-text').textContent = currentWordData.definition;

    const answerButtons = document.getElementById('answer-buttons');
    answerButtons.innerHTML = '';

    const options = [currentWordData.word];
    while (options.length < 5) {
        const randomOption = fullContentData[Math.floor(Math.random() * fullContentData.length)].word;
        if (!options.includes(randomOption)) {
            options.push(randomOption);
        }
    }
    options.sort(() => Math.random() - 0.5);

    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary';
        button.textContent = option;
        button.onclick = () => checkAnswer(option);
        answerButtons.appendChild(button);
    });
}

function checkAnswer(selectedWord) {
    const result = selectedWord === currentWordData.word ? 'Correct!' : 'Incorrect!';
    fetchTranslation(currentWordData.definition).then(translation => {
        showResultInModal(result, translation, selectedWord);
    });
}

function fetchTranslation(text) {
    console.log(text)
    const url = '/translate'; // Flask API URL

    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text })
    })
    .then(response => response.json())
    .then(data => data.translatedText)
    .catch(error => {
        console.error('Error fetching translation:', error);
        return 'Translation error';
    });
}

function showResultInModal(correct, translation, selectedWord) {
    console.log('Your answer is: ', correct);

    const answerButtons = document.getElementById('answer-buttons');
    answerButtons.innerHTML = '';

    // Remove any existing modals
    const existingModal = document.getElementById('resultModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Determine the result
    const isCorrect = currentWordData.definition === correct;
    const resultMessage = isCorrect ? 'Correct!' : 'Incorrect!';
    const theme = document.body.classList.contains('bg-dark') ? 'dark' : 'light'; // Adjust theme check if needed
    currentWordData.word 
    // Fetch modal HTML from server
    fetch(`/user/modals/definition-pop-up?word=${encodeURIComponent(currentWordData.word)}&selectedWord=${encodeURIComponent(selectedWord)}&resultMessage=${encodeURIComponent(resultMessage)}&translation=${encodeURIComponent(translation)}&definition=${encodeURIComponent(currentWordData.definition)}&theme=${encodeURIComponent(theme)}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error loading modal:', data.error);
                return;
            }

            const modalHTML = data.modal_html;
            playTextToSpeech(currentWordData.word);

            // Insert modal HTML into the document
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Show the modal using Bootstrap
            const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
            resultModal.show();

            // Show the "Next" and "Edit" buttons
            document.getElementById('new-sentence-btn').style.display = 'block';
            document.getElementById('edit-word-btn').style.display = 'block';

            // Auto-hide the modal after 15 seconds
            setTimeout(() => {
                resultModal.hide();
                resultModal._element.addEventListener('hidden.bs.modal', () => {
                    if (resultModal._element) {
                        resultModal._element.remove();
                    }
                });
            }, 15000);

            // Add current word to excluded words if correct
            if (isCorrect) {
                excludedWords.push(currentWordData.word); // Ensure `currentWordData` is defined
            }
        })
        .catch(error => {
            console.error('Error loading modal:', error);
        });
}

