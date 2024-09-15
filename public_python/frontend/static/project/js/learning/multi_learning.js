fullContentData = inicializeFullContentData()
let excludedWords = []; // Initialize excludedWords
let reverseDirection = false;
let currentWord = null;

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
  }
  if (event.key === 'Enter') {
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
  const availableWords = fullContentData.filter(word => !excludedWords.includes(word.word));
  if (availableWords.length === 0) {
    document.getElementById('result').textContent = 'No more words to study.';
    return;
  }
  const randomIndex = Math.floor(Math.random() * availableWords.length);
  const randomWord = availableWords[randomIndex];
  currentWord = randomWord.word;
  document.getElementById('result').textContent = '';
  document.getElementById('example-sentence-text').textContent = `${randomWord.example}`;
  
  const audioIcon = `<button onclick="playTextToSpeech('${randomWord.word}')"><i class="icon-sound"></i></button>`;

  if (reverseDirection) {
    document.getElementById('word').innerHTML = `<span class="word-to-translate">${randomWord.translation}</span> ${audioIcon}`;
    generateAnswerButtons(randomWord, 'translation');
  } else {
    document.getElementById('word').innerHTML = `<span class="word-to-translate">${randomWord.word}</span> ${audioIcon}`;
    generateAnswerButtons(randomWord, 'word');
  }
}

function generateAnswerButtons(correctWord, direction) {
  const answerButtonsDiv = document.getElementById('answer-buttons');
  answerButtonsDiv.innerHTML = '';

  const correctAnswer = direction === 'word' ? correctWord.translation : correctWord.word;
  const answers = [correctAnswer];
  while (answers.length < 5) {
    const randomIndex = Math.floor(Math.random() * fullContentData.length);
    const randomAnswer = direction === 'word' ? fullContentData[randomIndex].translation : fullContentData[randomIndex].word;
    if (!answers.includes(randomAnswer)) {
      answers.push(randomAnswer);
    }
  }

  answers.sort(() => Math.random() - 0.5);

  answers.forEach((answer, index) => {
    const button = document.createElement('button');
    button.className = 'btn btn-outline-primary';
    button.textContent = `${index + 1}. ${answer}`;
    button.onclick = () => checkTranslation(answer, correctAnswer);
    answerButtonsDiv.appendChild(button);
  });
}

function checkTranslation(userTranslation, correctTranslation) {
  const modalContainer = document.getElementById('modal-container');
  const timestamp = new Date().toISOString();
  const isCorrect = userTranslation.toLowerCase() === correctTranslation.toLowerCase();

  // Load modal content from the Flask endpoint
  fetch(`/user/modals/modal_pop_up_for_multi_learning?userTranslation=${userTranslation}&correctTranslation=${correctTranslation}&theme=${theme}`)
      .then(response => response.json())
      .then(data => {
          const modalHTML = data.modal_html;

          modalContainer.innerHTML = modalHTML;

          const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
          resultModal.show();

          //if (ttsCheckbox.checked && !audioCheckbox.checked) {
          //    playTextToSpeech(userTranslation);
          //}
          if (audioCheckbox.checked && ttsCheckbox.checked) {
              // Select the element with the class "word-to-translate"
              let element = document.querySelector('.word-to-translate');

              // Get the text content of the selected element
              let text = element.textContent.trim();
              console.log("Odtwarzam", text)
              playTextToSpeech(text);
          }

          sendStatistic({
              word: reverseDirection ? correctTranslation : userTranslation,
              correct: isCorrect,
              timestamp: timestamp
          });

          setTimeout(() => {
              $('#resultModal').modal('hide');
              $('#resultModal').on('hidden.bs.modal', () => {
                  const modal = document.getElementById('resultModal');
                  if (modal) {
                      modal.remove();
                  }
                  generateRandomWord();
              });
          }, 3000);
      })
      .catch(error => console.error('Error loading modal:', error));
}

function toggleDirection() {
  reverseDirection = !reverseDirection;
  generateRandomWord();
}

function fetchExcludedWords() {
  fetch('baza_danych/setting/excludedWords.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    excludedWords = data;
    console.log('Excluded words loaded:', excludedWords);
  })
  .catch(error => {
    console.error('Error fetching excluded words:', error);
    excludedWords = [];
  });
}

document.addEventListener('DOMContentLoaded', fetchExcludedWords);

function removeCurrentWord() {
  if (currentWord) {
    excludedWords.push(currentWord);
    saveSetting(excludedWords);
    generateRandomWord();
  }
}

