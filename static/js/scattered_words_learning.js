let sentences = [];
    let excludedSentences = [];
    let reverseDirection = false;

    document.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        checkSentence();
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
      const availableSentences = sentences.filter(sentence => !excludedSentences.includes(sentence.word));
      if (availableSentences.length === 0) {
        document.getElementById('result').textContent = 'No more sentences to study.';
        return;
      }
      const randomIndex = Math.floor(Math.random() * availableSentences.length);
      const randomSentence = availableSentences[randomIndex];
      currentSentence = randomSentence.word;
      document.getElementById('result').textContent = '';

      const words = currentSentence.split(' ').sort(() => Math.random() - 0.5);
      const wordBankDiv = document.getElementById('word-bank');
      const sentenceConstructionDiv = document.getElementById('sentence-construction');
      wordBankDiv.innerHTML = '';
      sentenceConstructionDiv.innerHTML = '';

      words.forEach(word => {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary';
        button.textContent = word;
        button.onclick = () => addWordToSentence(word, button);
        wordBankDiv.appendChild(button);
      });
      document.getElementById('sentence-translation').textContent = randomSentence.translation; // tłumaczone zdanie
    }

    function addWordToSentence(word, button) {
      const sentenceConstructionDiv = document.getElementById('sentence-construction');
      const wordButton = document.createElement('button');
      wordButton.className = 'btn btn-primary';
      wordButton.textContent = word;
      wordButton.onclick = () => removeWordFromSentence(wordButton, button);
      sentenceConstructionDiv.appendChild(wordButton);
      button.disabled = true;
    }

    function removeWordFromSentence(wordButton, originalButton) {
      const sentenceConstructionDiv = document.getElementById('sentence-construction');
      sentenceConstructionDiv.removeChild(wordButton);
      originalButton.disabled = false;
    }

    function checkSentence() {
      const constructedSentence = Array.from(document.getElementById('sentence-construction').children)
        .map(button => button.textContent)
        .join(' ');
      const resultElement = document.getElementById('result');
      const timestamp = new Date().toISOString();
      const isCorrect = constructedSentence === currentSentence;
        if (isCorrect) {
            console.log('Correct sentence.');
            resultElement.innerHTML = `<strong><span class="user-translation" style="color: green">${constructedSentence}</span></strong> - Congratulations! Correct sentence.`;
            playTextToSpeech(constructedSentence);
        } else {
            console.log('Incorrect sentence.');
            resultElement.innerHTML = `<strong><span class="user-translation" style="color: red">${constructedSentence}</span></strong> - Incorrect. The correct sentence is: <strong><span class="sentence-to-translate">${currentSentence}</span></strong>`;
            playTextToSpeech(currentSentence); 
        }
      sendStatistic({
        sentence: constructedSentence,
        correct: isCorrect,
        timestamp: timestamp
      });
      if (isCorrect) {
        generateRandomSentence();
      }
    }

    function toggleDirection() {
      reverseDirection = !reverseDirection;
      generateRandomSentence();
    }

    function fetchExcludedSentences() {
      fetch('/settings/excludedSentences.json')
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
        excludedSentences = [];
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
