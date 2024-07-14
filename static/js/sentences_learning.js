    let sentences = [];
    let excludedSentences = []; // Initialize excludedSentences
    let reverseDirection = false;

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
        generateRandomSentence();
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
          sentences = JSON.parse(fileContent);
          console.log('Data loaded successfully:', sentences);
          document.getElementById('quiz').style.display = 'block';
          generateRandomSentence();
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(file);
    }

    let currentSentence = null;

    function generateRandomSentence() {
      const availableSentences = sentences.filter(sentence => !excludedSentences.includes(sentence.example));
      if (availableSentences.length === 0) {
        document.getElementById('result').textContent = 'No more sentences to study.';
        return;
      }
      const randomIndex = Math.floor(Math.random() * availableSentences.length);
      const randomSentence = availableSentences[randomIndex];
      currentSentence = randomSentence.example;
      document.getElementById('result').textContent = '';

      if (reverseDirection) {
        document.getElementById('sentence').innerHTML = `<span class="sentence-to-translate">${randomSentence.example_translation}</span>`;
        generateAnswerButtons(randomSentence, 'translation');
      } else {
        document.getElementById('sentence').innerHTML = `<span class="sentence-to-translate">${randomSentence.example}</span>`;
        generateAnswerButtons(randomSentence, 'example');
      }
    }

    function generateAnswerButtons(correctSentence, direction) {
      const answerButtonsDiv = document.getElementById('answer-buttons');
      answerButtonsDiv.innerHTML = '';

      const correctAnswer = direction === 'example' ? correctSentence.example_translation : correctSentence.example;
      const answers = [correctAnswer];
      while (answers.length < 5) {
        const randomIndex = Math.floor(Math.random() * sentences.length);
        const randomAnswer = direction === 'example' ? sentences[randomIndex].example_translation : sentences[randomIndex].example;
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
      const resultElement = document.getElementById('result');
      const timestamp = new Date().toISOString();
      const isCorrect = userTranslation.toLowerCase() === correctTranslation.toLowerCase();
      if (isCorrect) {
        console.log('Correct translation.');
        resultElement.innerHTML = `<span class="user-translation" style="color: green">${userTranslation}</span> - Congratulations! Correct answer.`;
        playTextToSpeech(userTranslation);
      } else {
        console.log('Incorrect translation.');
        resultElement.innerHTML = `<span class="user-translation" style="color: red">${userTranslation}</span> - Incorrect. The correct translation is: <span class="sentence-to-translate">${correctTranslation}</span>`;
        playTextToSpeech(userTranslation);
      }
      sendStatistic({
        sentence: reverseDirection ? correctTranslation : userTranslation,
        correct: isCorrect,
        timestamp: timestamp
      });
    }

    function toggleDirection() {
      reverseDirection = !reverseDirection;
      generateRandomSentence();
    }

    function fetchExcludedSentences() {
      fetch('api/setting/excludedWords.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        excludedSentences = data;
        console.log('Excluded sentences loaded:', excludedSentences);
      })
      .catch(error => {
        console.error('Error fetching excluded sentences:', error);
        excludedSentences = []; // Initialize to an empty array if fetching fails
      });
    }

    document.addEventListener('DOMContentLoaded', fetchExcludedSentences);

    function removeCurrentSentence() {
      if (currentSentence) {
        excludedSentences.push(currentSentence);
        saveSetting(excludedSentences);
        generateRandomSentence();
      }
    }