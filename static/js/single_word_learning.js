let words = [];
let reverseDirection = false;
let recognition;
let currentWord = null;

function startRecording() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Web Speech API is not supported by this browser.");
  } else {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    // Change the language based on the reverse direction flag
    recognition.lang = reverseDirection ? "en-US" : "pl-PL";

    recognition.onstart = function() {
      console.log("Speech recognition started.");
    };

    recognition.onerror = function(event) {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = function() {
      console.log("Speech recognition ended.");
    };

    recognition.onresult = function(event) {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      document.getElementById('translation').value = finalTranscript;
    };

    recognition.start();
  }
}


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
  const randomIndex = Math.floor(Math.random() * words.length);
  const randomWord = words[randomIndex];
  
  // Swap word and translation based on the reverse direction flag
  const audioIcon = `<button id="audioButton" onclick="playTextToSpeech('${randomWord.word}')"><i class="icon-sound"></i></button>`;
  const displayWord = reverseDirection ? randomWord.translation : randomWord.word;
  const displayTranslation = reverseDirection ? randomWord.word : randomWord.translation;

  document.getElementById('word').innerHTML = `<span class="word-to-translate">${displayWord}</span> ${audioIcon}`;
  document.getElementById('translation').value = '';
  document.getElementById('result').textContent = '';
  document.getElementById('example-sentence-text').textContent = `${randomWord.example}`;
}

function checkTranslation() {
    const userTranslation = document.getElementById('translation').value.trim();
    const wordElement = document.getElementById('word');
    
    // Pobierz tylko tekst słowa (bez dodatkowego HTML)
    const currentWord = wordElement.querySelector('.word-to-translate').textContent.trim();
  
    // Znajdź poprawne tłumaczenie
    const wordObject = reverseDirection ? 
      words.find(word => word.translation === currentWord) :
      words.find(word => word.word === currentWord);
    
    if (!wordObject) {
      console.error('Current word not found in words array');
      return;
    }
  
    const correctTranslation = reverseDirection ? wordObject.word : wordObject.translation;
  
    const resultElement = document.getElementById('result');
    if (userTranslation.toLowerCase() === correctTranslation.toLowerCase()) {
      console.log('Correct translation.');
      resultElement.innerHTML = `<span class="user-translation" style="color: green">${userTranslation}</span> - Congratulations! Correct answer.`;
      if (ttsCheckbox.checked && !audioCheckbox.checked) {    
        playTextToSpeech(correctTranslation);
      }
      if (audioCheckbox.checked && ttsCheckbox.checked) {    
        playTextToSpeech(currentWord);
      }
    } else {
      console.log('Incorrect translation.');
      resultElement.innerHTML = `<span class="user-translation" style="color: red">${userTranslation}</span> - Incorrect. The correct translation is: <span class="word-to-translate">${correctTranslation}</span>`;
      if (ttsCheckbox.checked && !audioCheckbox.checked) {    
        playTextToSpeech(correctTranslation);
      }
      if (audioCheckbox.checked && ttsCheckbox.checked) {    
        playTextToSpeech(currentWord);
      }
    }
  }
  
  function simulateAudioButtonClick() {
    const audioButton = document.getElementById('audioButton');
    if (audioButton) {
      audioButton.click();
    }
  }

  function handleKeyDown(event) {
    switch(event.key) {
      case 'Enter':
        if (recognition) {
          recognition.stop();
        }
        if (document.getElementById('translation').value.trim() === '') {
          handleEnterKey();
        } else {
          checkTranslation();
        }
        break;
      case ' ':
        event.preventDefault(); // Prevent default space key behavior (scrolling)
        checkTranslation();
        break;
      case 'ArrowRight':
        generateRandomWord();
        break;
      case 'ArrowDown':
        startRecording();
        break;
      case 'Control': 
        simulateAudioButtonClick();
      break;
  }
}

  
  function handleEnterKey() {
    if (document.getElementById('result').textContent === '') {
      const currentWord = document.getElementById('word').textContent;
      const correctTranslation = words.find(word => word.word === currentWord).translation;
      const resultElement = document.getElementById('result');
      resultElement.innerHTML = `Correct translation: <span class="word-to-translate">${correctTranslation}</span>`;
      resultElement.style.color = 'green';
    } else {
      generateRandomWord();
    }
  }

function removeCurrentWord() {
  if (currentWord) {
    excludedWords.push(currentWord);
    saveSetting(excludedWords);
    generateRandomWord();
  }
}

function toggleDirection() {
  reverseDirection = !reverseDirection;
  generateRandomWord();
}

document.addEventListener('keydown', handleKeyDown);