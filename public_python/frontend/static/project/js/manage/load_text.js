

// Inicjalizacja zmiennych
const uploadForm = document.getElementById('uploadForm');
const textInput = document.getElementById('textInput');
const sentenceContainer = document.getElementById('sentenceContainer');
const saveButton = document.getElementById('saveButton');
const textNameInput = document.getElementById('textName');
const textTagInput = document.getElementById('textTag');
let resultData = []; // Globalna zmienna do przechowywania wyników

document.addEventListener('DOMContentLoaded', function() {
  // Inicjalizacja nasłuchiwaczy zdarzeń
  initEventListeners();
});

// Funkcja inicjalizująca nasłuchiwacze zdarzeń
function initEventListeners() {
  uploadForm.addEventListener('submit', handleFormSubmit);
  saveButton.addEventListener('click', saveData);
}

// Funkcja obsługująca przesłanie formularza
function handleFormSubmit(e) {
  e.preventDefault();
  const text = textInput.value.trim();
  if (text) {
    processText(text);
  }
}

// Funkcja przetwarzająca wprowadzony tekst
function processText(text) {
  const sentences = splitTextIntoSentences(text);
  initializeResultData(sentences);
  renderSentences(sentences);
}

// Funkcja dzieląca tekst na zdania
function splitTextIntoSentences(text) {
  // Proste dzielenie na zdania za pomocą wyrażenia regularnego
  return text.match(/[^\.!\?]+[\.!\?]+|[^\.!\?]+$/g) || [text];
}

// Funkcja inicjalizująca dane wynikowe
function initializeResultData(sentences) {
  resultData = sentences.map(sentence => ({
    "english": sentence.trim(),
    "missing_words": []
  }));
}

// Funkcja renderująca zdania i słowa na stronie
function renderSentences(sentences) {
  sentenceContainer.innerHTML = '';
  sentences.forEach((sentence, sentenceIndex) => {
    const sentenceDiv = createSentenceDiv(sentence, sentenceIndex);
    sentenceContainer.appendChild(sentenceDiv);
  });
}

// Funkcja tworząca element div dla zdania
function createSentenceDiv(sentence, sentenceIndex) {
  const sentenceDiv = document.createElement('div');
  sentenceDiv.classList.add('sentence');
  sentenceDiv.dataset.index = sentenceIndex;
  sentenceDiv.style.marginBottom = '20px';

  const words = sentence.split(/\s+/);
  words.forEach((word, wordIndex) => {
    const wordSpan = createWordSpan(word, wordIndex);
    sentenceDiv.appendChild(wordSpan);
  });

  return sentenceDiv;
}

// Funkcja tworząca element span dla słowa
function createWordSpan(word, wordIndex) {
  const span = document.createElement('span');
  span.classList.add('word');
  span.textContent = word + ' ';
  span.dataset.wordIndex = wordIndex;

  // Dodanie nasłuchiwacza zdarzeń do przełączania klasy 'missing-word'
  span.addEventListener('click', function() {
    span.classList.toggle('missing-word');
    updateResultData();
  });

  return span;
}

// Funkcja aktualizująca dane wynikowe na podstawie zaznaczonych słów
function updateResultData() {
  const sentenceDivs = document.querySelectorAll('#sentenceContainer .sentence');

  sentenceDivs.forEach(sentenceDiv => {
    const sentenceIndex = sentenceDiv.dataset.index;
    const sentenceData = resultData[sentenceIndex];
    const wordSpans = sentenceDiv.querySelectorAll('.word');
    sentenceData.missing_words = [];

    const selectedIndices = getSelectedWordIndices(wordSpans);
    const sequences = findConsecutiveSequences(selectedIndices);
    updateSentenceMissingWords(sentenceData, sequences, wordSpans);
  });

  console.log(resultData);
}

// Funkcja pobierająca indeksy zaznaczonych słów
function getSelectedWordIndices(wordSpans) {
  const selectedIndices = [];
  wordSpans.forEach((span) => {
    if (span.classList.contains('missing-word')) {
      selectedIndices.push(parseInt(span.dataset.wordIndex));
    }
  });
  return selectedIndices;
}

// Funkcja znajdująca sekwencje kolejnych indeksów
function findConsecutiveSequences(indices) {
  const sequences = [];
  let tempSeq = [];

  for (let i = 0; i < indices.length; i++) {
    if (tempSeq.length === 0 || indices[i] === tempSeq[tempSeq.length - 1] + 1) {
      tempSeq.push(indices[i]);
    } else {
      sequences.push(tempSeq.slice());
      tempSeq = [indices[i]];
    }
  }
  if (tempSeq.length > 0) {
    sequences.push(tempSeq.slice());
  }
  return sequences;
}

// Funkcja aktualizująca brakujące słowa w danych zdania
function updateSentenceMissingWords(sentenceData, sequences, wordSpans) {
  sequences.forEach(seq => {
    const positions = seq.map(i => i + 1); // Pozycje są 1-indeksowane
    const words = seq.map(i => wordSpans[i].textContent.trim());
    const wordText = words.join(' ');
    if (positions.length === 1) {
      sentenceData.missing_words.push({
        "word": wordText,
        "position": positions[0] - 1,
      });
    } else {
      sentenceData.missing_words.push({
        "word": wordText,
        "position": positions,
      });
    }
  });
}

// Funkcja zapisująca dane na serwerze
function saveData() {
  const textName = textNameInput.value.trim();
  const textTag = textTagInput.value.trim();

  if (!textName) {
    alert('Proszę podać nazwę tekstu.');
    return;
  }

  const uuid = generateUUID();

  const finalData = {
    "texts": [
      {
        "uuid": uuid,
        "name": textName,
        "tag": textTag,
        "sentences": resultData
      }
    ]
  };

  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  fetch('/user/save_texts_for_insert_words_to_text_learning', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken  // Dołączenie tokenu CSRF
    },
    body: JSON.stringify(finalData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Dane zostały pomyślnie zapisane.');
    } else {
      alert('Błąd podczas zapisu danych: ' + data.error);
    }
  })
  .catch(error => {
    console.error('Błąd:', error);
    alert('Wystąpił błąd podczas zapisu danych.');
  });
}

// Funkcja generująca UUID
function generateUUID() { // Domeny publicznej/MIT
  var d = new Date().getTime();//Znacznik czasu
  var d2 = (performance && performance.now && (performance.now()*1000)) || 0;//Czas w mikrosekundach od załadowania strony lub 0, jeśli nieobsługiwane
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16;//Losowa liczba między 0 a 16
      if(d > 0){//Użycie znacznika czasu do wyczerpania
          r = (d + r)%16 | 0;
          d = Math.floor(d/16);
      } else {//Użycie mikrosekund od załadowania strony, jeśli obsługiwane
          r = (d2 + r)%16 | 0;
          d2 = Math.floor(d2/16);
      }
      return (c==='x' ? r :(r&0x3|0x8)).toString(16);
  });
}