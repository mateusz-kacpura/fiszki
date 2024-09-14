    let currentPage = 1;  // Aktualna strona
    let limit = 10;  // Domyślny limit plików na stronę
    let isPublic = false;  // Czy pliki mają być publiczne
    let searchQuery = '';  // Wartość wyszukiwania po nazwie pliku
    let tagQuery = '';  // Wartość wyszukiwania po tagu
    let sentences = [];
    let excludedSentences = []; // Initialize excludedSentences
    let reverseDirection = false;

    document.addEventListener("DOMContentLoaded", fetchData);

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

    // Funkcja do wyszukiwania plików
    function fetchData() {
      const publicCheckbox = document.getElementById('publicCheckbox').checked;
      isPublic = publicCheckbox;  // Sprawdź czy załadować pliki publiczne
      limit = document.getElementById('textLimit').value;  // Pobierz wartość limitu
      searchQuery = document.getElementById('searchInput').value;  // Pobierz zapytanie wyszukiwania
      tagQuery = document.getElementById('tagInput').value;  // Pobierz wartość tagu

      const url = `/user/load_files_for_learning?public=${isPublic}&limit=${limit}&page=${currentPage}&name=${searchQuery}&tag=${tagQuery}`;

      fetch(url)
          .then(response => response.json())
          .then(data => {
              if (data.error) {
                  showAlert(data.error, 'danger');
              } else {
                  displayFiles(data.files);
                  document.getElementById('languageFlag').value = data.language_flag;
                  updatePaginationControls(data.total_files, data.current_page);
              }
          })
          .catch(error => {
              console.error('Error fetching files:', error);
              showAlert('Error loading files', 'danger');
          });
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
        resultElement.innerHTML = `<span class="user-translation" style="color: green">${userTranslation}</span>`;
          if (ttsCheckbox.checked && !audioCheckbox.checked) {    
            playTextToSpeech(userTranslation);
          }
          if (audioCheckbox.checked && ttsCheckbox.checked) {    
            playTextToSpeech(correctTranslation);
          }
      } else {
        console.log('Incorrect translation.');
        resultElement.innerHTML = `<span class="user-translation" style="color: red">${userTranslation}</span><span class="sentence-to-translate">${correctTranslation}</span>`;
          if (ttsCheckbox.checked && !audioCheckbox.checked) {    
            playTextToSpeech(userTranslation);
          }
          if (audioCheckbox.checked && ttsCheckbox.checked) {    
            playTextToSpeech(correctTranslation);
          }
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
      fetch('baza_danych/setting/excludedWords.json')
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

    
// Funkcja do wyświetlania plików
function displayFiles(files) {
  const fileList = document.getElementById('textList');
  fileList.innerHTML = ''; // Wyczyszczenie listy plików

  files.forEach(file => {
      const li = document.createElement('li');
      li.textContent = file; // Wyświetl nazwę pliku
      li.className = 'list-group-item';
      li.addEventListener('click', () => loadFileContent(file)); // Dodanie zdarzenia do załadowania zawartości pliku
      fileList.appendChild(li);
  });
}

// Funkcja do załadowania zawartości wybranego pliku
function loadFileContent(file, isPublic = true) {
  const url = `/user/load_file_content?file=${file}&public=${isPublic}`; // URL endpointu do pobierania pliku
  fetch(url)
      .then(response => {
          if (!response.ok) {
              throw new Error('Error loading file content');
          }
          return response.json();
      })
      .then(fileContent => {
          // Sprawdź, czy plik zawiera odpowiednią strukturę JSON
          try {
              sentences = JSON.parse(fileContent.content); // Zakładamy, że backend zwróci klucz "content"
              console.log('File content loaded:', sentences);

              // Wyświetlenie quizu lub innej logiki
              document.getElementById('quiz').style.display = 'block';
              generateRandomSentence(); // Przykładowa funkcja do przetwarzania zawartości
          } catch (error) {
              console.error('Error parsing file content:', error);
              showAlert('Invalid file format', 'danger');
          }
      })
      .catch(error => {
          console.error('Error loading file content:', error);
          showAlert('Error loading file content', 'danger');
      });
}

// Paginacja: Następna strona
function nextPage() {
  currentPage++;
  fetchData();
}

// Paginacja: Poprzednia strona
function prevPage() {
  if (currentPage > 1) {
      currentPage--;
      fetchData();
  }
}

// Zaktualizuj kontrolki paginacji
function updatePaginationControls(totalFiles, currentPage) {
  const totalPages = Math.ceil(totalFiles / limit);
  document.getElementById('prevPage').disabled = (currentPage === 1);
  document.getElementById('nextPage').disabled = (currentPage === totalPages);
}

// Wyszukiwanie po nazwie pliku
function filterFilesByName() {
  currentPage = 1;  // Resetuj do pierwszej strony
  fetchData();
}

// Wyszukiwanie po tagu
function filterFilesByTag() {
  currentPage = 1;  // Resetuj do pierwszej strony
  fetchData();
}

// Funkcja do zmiany limitu
function decideWhichFilesToLoad() {
  currentPage = 1;  // Resetuj do pierwszej strony
  fetchData();
}

// Funkcja wyświetlająca powiadomienia
function showAlert(message, type = 'success') {
  const alertContainer = document.getElementById('alert-container');
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerText = message;
  alertContainer.appendChild(alert);

  // Usunięcie alertu po 3 sekundach
  setTimeout(() => {
      alert.remove();
  }, 3000);
}

