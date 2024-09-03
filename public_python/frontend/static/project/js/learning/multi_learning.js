let words = [];
let excludedWords = []; // Initialize excludedWords
let reverseDirection = false;
let currentWord = null;

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


function fetchData() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  if (!file) {
    console.error('No file selected.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    const fileContent = event.target.result;
    try {
      words = JSON.parse(fileContent);
      console.log('Data loaded successfully:', words);
      document.getElementById('quiz').style.display = 'block';
      generateRandomWord();
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  };
  reader.readAsText(file);
}

function generateRandomWord() {
  const availableWords = words.filter(word => !excludedWords.includes(word.word));
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
    const randomIndex = Math.floor(Math.random() * words.length);
    const randomAnswer = direction === 'word' ? words[randomIndex].translation : words[randomIndex].word;
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
  fetch(`/user/modals/multi-pop-up?userTranslation=${userTranslation}&correctTranslation=${correctTranslation}&theme=${theme}`)
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
  fetch('user/api/setting/excludedWords.json')
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

