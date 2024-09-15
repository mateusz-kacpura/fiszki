fullContentData = inicializeFullContentData()
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

function generateRandomWord() {
  const randomIndex = Math.floor(Math.random() * fullContentData.length);
  const randomWord = fullContentData[randomIndex];
  // Swap word and translation based on the reverse direction flag
  const audioIcon = `<button id="audioButton" onclick="playTextToSpeech('${randomWord.word}')"><i class="icon-sound"></i></button>`;
  const displayWord = reverseDirection ? randomWord.translation : randomWord.word;
  const displayTranslation = reverseDirection ? randomWord.word : randomWord.translation;
  // playAudio(displayWord, displayTranslation) // text to speech is requiring for cpu
  document.getElementById('word').innerHTML = `<span class="word-to-translate">${displayWord}</span> ${audioIcon}`;
  document.getElementById('translation').value = '';
  document.getElementById('result').textContent = '';
  document.getElementById('example-sentence-text').textContent = `${randomWord.example}`;
}

function playAudio(currentWord, correctTranslation) {
    if (ttsCheckbox.checked && !audioCheckbox.checked) {
      playTextToSpeech(correctTranslation);
    }
    if (audioCheckbox.checked && ttsCheckbox.checked) {
      playTextToSpeech(currentWord);
    }
  }

function checkTranslation() {
    const userTranslation = document.getElementById('translation').value.trim();
    const wordElement = document.getElementById('word');
    
    // Pobierz tylko tekst słowa (bez dodatkowego HTML)
    const currentWord = wordElement.querySelector('.word-to-translate').textContent.trim();
  
    // Znajdź poprawne tłumaczenie
    const wordObject = reverseDirection ? 
      fullContentData.find(word => word.translation === currentWord) :
      fullContentData.find(word => word.word === currentWord);
    
    if (!wordObject) {
      console.error('Current word not found in fullContentData array');
      return;
    }
  
    const correctTranslation = reverseDirection ? wordObject.word : wordObject.translation;
  
    const resultElement = document.getElementById('result');
    if (userTranslation.toLowerCase() === correctTranslation.toLowerCase()) {
      console.log('Correct translation.');
      resultElement.innerHTML = `<span class="user-translation" style="color: green;">${userTranslation}</span>`;
      playAudio(currentWord, correctTranslation)
    } else {
      console.log('Incorrect translation.');
      resultElement.innerHTML = `<span class="user-translation" style="color: red;">${userTranslation}</span><span class="word-to-translate" style="color: green;">${correctTranslation}</span>`;
      playAudio(currentWord, correctTranslation)
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
      const correctTranslation = fullContentData.find(word => word.word === currentWord).translation;
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