let words = [];
let excludedWords = [];
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
      generateRandomWord();
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  };
  reader.readAsText(file);
}

function generateRandomWord() {
  const availableWords = words.filter(word => word.imageLink && !excludedWords.includes(word.word));
  if (availableWords.length === 0) {
    console.log('Brak więcej słów do nauki.');
    return;
  }

  const randomIndex = Math.floor(Math.random() * availableWords.length);
  const randomWord = availableWords[randomIndex];
  currentWord = randomWord;
  document.getElementById('word-to-translate').textContent = reverseDirection ? randomWord.word : randomWord.translation;

  displayImages(randomWord);
}

function displayImages(correctWord) {
  const imageContainer = document.getElementById('image-container');
  imageContainer.innerHTML = '';

  const correctAnswer = reverseDirection ? correctWord.translation : correctWord.word;
  const answers = [correctAnswer];
  while (answers.length < 6) {
    const randomIndex = Math.floor(Math.random() * words.length);
    const randomAnswer = reverseDirection ? words[randomIndex].translation : words[randomIndex].word;
    if (!answers.includes(randomAnswer) && words[randomIndex].imageLink) {
      answers.push(randomAnswer);
    }
  }

  answers.sort(() => Math.random() - 0.5);

  answers.forEach(answer => {
    const wordData = words.find(word => reverseDirection ? word.translation === answer : word.word === answer);
    if (wordData && wordData.imageLink) {
      const imageContainerElement = document.createElement('div');
      imageContainerElement.className = 'image-option';

      const imageElement = document.createElement('img');
      imageElement.src = `/image_files/English/${wordData.imageLink.split('\\').pop()}`;
      imageElement.alt = answer;

      const labelElement = document.createElement('div');
      labelElement.className = 'image-label';
      labelElement.textContent = answer;

      imageContainerElement.onclick = () => checkImage(answer, correctAnswer);
      imageContainerElement.appendChild(imageElement);
      imageContainerElement.appendChild(labelElement);

      imageContainer.appendChild(imageContainerElement);
    }
  });
}

function checkImage(selectedWord, correctWord) {
    const answerButtons = document.getElementById('answer-buttons');
    answerButtons.innerHTML = '';

    // Remove any existing modals
    const existingModal = document.getElementById('resultModal');
    if (existingModal) {
        existingModal.remove();
    }

    if (ttsCheckbox.checked && !audioCheckbox.checked) {
        if (groqCheckbox.checked) {
            playTextToSpeechWithGroq(selectedWord);
        } else {
            playTextToSpeech(selectedWord);
        }
    }

    if (audioCheckbox.checked && ttsCheckbox.checked) {
        if (groqCheckbox.checked) {
            playTextToSpeechWithGroq(correctWord);
        } else {
            playTextToSpeech(correctWord);
        }
    }

    // Load modal content from the Flask endpoint
    fetch(`/modals/image-pop-up?selectedWord=${selectedWord}&correctWord=${correctWord}&theme=${theme}`)
        .then(response => response.json())
        .then(data => {
            const modalHTML = data.modal_html;

            document.body.insertAdjacentHTML('beforeend', modalHTML);

            $('#resultModal').modal('show');

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

function removeCurrentWord() {
  if (currentWord) {
    excludedWords.push(currentWord.word);
    generateRandomWord();
  }
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
    excludedWords = [];
  });
}

document.addEventListener('DOMContentLoaded', fetchExcludedWords);