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

  // Shuffle answers
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

  const modalHeaderClass = isCorrect ? 'bg-success text-white' : 'bg-danger text-white';
  const modalTitle = isCorrect ? 'Poprawna odpowiedź!' : 'Nieprawidłowa odpowiedź!';
  const modalMessage = isCorrect ? 'Poprawna odpowiedź!' : 'Nieprawidłowa odpowiedź!';
  const correctWordMessage = `<strong style="display: block; text-align: center;">${correctTranslation} <button style="margin-left: 10px;" onclick="playTextToSpeech('${correctTranslation}')"><i class="icon-sound"></i></button></strong>`;
  
  const fullSentenceMessage = ''; // Replace with actual full sentence if available
  const sentenceTranslation = ''; // Replace with actual sentence translation if available

  // Generate the modal HTML
  const modalHTML = `
    <div class="modal fade" id="resultModal" tabindex="-1" aria-labelledby="resultModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header ${modalHeaderClass}">
            <h5 class="modal-title" id="resultModalLabel">${modalTitle}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body ${theme === 'dark' ? 'bg-dark text-light' : ''}">
            <p>${modalMessage}</p>
            <p>${correctWordMessage}</p>
            ${fullSentenceMessage}
            ${sentenceTranslation}
          </div>
        </div>
      </div>
    </div>
  `;

  modalContainer.innerHTML = modalHTML;

  // Initialize and show the modal
  const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
  resultModal.show();

  // Handle Text-to-Speech based on checkboxes
  if (ttsCheckbox.checked && !audioCheckbox.checked) {
    playTextToSpeech(userTranslation);
  }
  if (audioCheckbox.checked && ttsCheckbox.checked) {
    playTextToSpeech(correctTranslation);
  }

  sendStatistic({
    word: reverseDirection ? correctTranslation : userTranslation,
    correct: isCorrect,
    timestamp: timestamp
  });
}

function toggleDirection() {
  reverseDirection = !reverseDirection;
  generateRandomWord();
}

function fetchExcludedWords() {
  fetch('api/setting/excludedWords.json')
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
    excludedWords = []; // Initialize to an empty array if fetching fails
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

