let theme = 'light'; // default theme
let modalBodyClass = '';

function toggleTheme() {
  if (theme === 'light') {
    theme = 'dark';
    modalBodyClass = 'bg-dark';
    document.body.classList.add('bg-dark', 'text-light');
    document.getElementById('main-container').classList.add('bg-dark', 'text-light');
    document.querySelectorAll('.card').forEach(card => {
      card.classList.add('bg-dark', 'text-light');
    });
    document.querySelectorAll('input').forEach(input => {
      input.classList.add('bg-dark', 'text-light');
    });
    document.querySelectorAll('.modal-content').forEach(modal => {
      modal.classList.add('bg-dark', 'text-light');
    });
    document.querySelectorAll('.modal-header').forEach(header => {
      header.classList.add('bg-dark', 'text-light');
    });
    document.querySelectorAll('.modal-body').forEach(body => {
      body.classList.add('bg-dark', 'text-light');
    });
    document.querySelectorAll('.table').forEach(table => {
      table.classList.add('table-dark');
    });
    document.querySelectorAll('.correct-word-message').forEach(message => {
      message.classList.remove('bg-success');
      message.classList.add('bg-dark', 'text-light');
    });
    document.querySelectorAll('.incorrect-word-message').forEach(message => {
      message.classList.remove('bg-danger');
      message.classList.add('bg-dark', 'text-light');
    });
  } else {
    theme = 'light';
    modalBodyClass = '';
    document.body.classList.remove('bg-dark', 'text-light');
    document.getElementById('main-container').classList.remove('bg-dark', 'text-light');
    document.querySelectorAll('.card').forEach(card => {
      card.classList.remove('bg-dark', 'text-light');
    });
    document.querySelectorAll('input').forEach(input => {
      input.classList.remove('bg-dark', 'text-light');
    });
    document.querySelectorAll('.modal-content').forEach(modal => {
      modal.classList.remove('bg-dark', 'text-light');
    });
    document.querySelectorAll('.modal-header').forEach(header => {
      header.classList.remove('bg-dark', 'text-light');
    });
    document.querySelectorAll('.modal-body').forEach(body => {
      body.classList.remove('bg-dark', 'text-light');
    });
    document.querySelectorAll('.table').forEach(table => {
      table.classList.remove('table-dark');
    });
    document.querySelectorAll('.correct-word-message').forEach(message => {
      message.classList.add('bg-success');
      message.classList.remove('bg-dark', 'text-light');
    });
    document.querySelectorAll('.incorrect-word-message').forEach(message => {
      message.classList.add('bg-danger');
      message.classList.remove('bg-dark', 'text-light');
    });
  }
}

function showModal() {
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  $('#resultModal').modal('show');
}

// Function to inject the modal HTML into the DOM
function showModal() {
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  $('#resultModal').modal('show');
}

function playTextToSpeech(text) {
  fetch('/user/text-to-speech', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text }),
  })
  .then(response => {
      if (!response.ok) {
          return response.json().then(error => { throw new Error(error.error) });
      }
      return response.json();
  })
  .then(data => {
      if (data.audio_path) {
          const audio = new Audio(data.audio_path);
          audio.play();
      } else {
          console.error('Error:', data.error);
      }
  })
  .catch(error => {
      console.error('Error:', error);
  });
}

function playTextToSpeechWithGroq(text) {
  fetch('/user/text-to-speech-groq', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text }),
  })
  .then(response => {
      if (!response.ok) {
          return response.json().then(error => { throw new Error(error.error) });
      }
      return response.json();
  })
  .then(data => {
      if (data.audio_path) {
          const audio = new Audio(data.audio_path);
          audio.play();
      } else {
          console.error('Error:', data.error);
      }
  })
  .catch(error => {
      console.error('Error:', error);
  });
}

function sendStatistic(data) {
  fetch('/user/save_statistic', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(response => response.json())
  .then(result => {
    console.log('Success:', result);
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

function saveSetting(data) {
    fetch('/user/saveSetting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ excludedWords: data }),
    })
    .then(response => response.json())
    .then(result => {
      console.log('Settings saved successfully:', result);
    })
    .catch(error => {
      console.error('Error saving settings:', error);
    });
  }

  
  let recognition;

  function startRecording() {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Web Speech API is not supported by this browser.");
    } else {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
  
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
  
  function stopRecording() {
    if (recognition) {
      recognition.stop();
      console.log("Speech recognition stopped.");
    }
  }
  
  let currentWordData = {}; // Store current word data for editing
  let originalWordData = {};

  function openEditModal(wordData) {
      originalWordData = { ...wordData }; // Save a copy of the original data for undo functionality
  
      document.getElementById('edit-language').value = wordData.language || '';
      document.getElementById('edit-translation-language').value = wordData.translationLanguage || '';
      document.getElementById('edit-word').value = wordData.word || '';
      document.getElementById('edit-translation').value = wordData.translation || '';
      document.getElementById('edit-definition').value = wordData.definition || '';
      document.getElementById('edit-example').value = wordData.example || '';
      document.getElementById('edit-example-translation').value = wordData.example_translation || '';
      document.getElementById('edit-image-link').value = wordData.imageLink || '';
      document.getElementById('edit-audio-link').value = wordData.audioLink || '';
  
      let editWordModal = new bootstrap.Modal(document.getElementById('editWordModal'));
      editWordModal.show();
  }
  
  function clearForm() {
      document.getElementById('edit-word-form').reset();
  }
  
  function revertChanges() {
      openEditModal(originalWordData);
  }
  
  function saveChanges() {
      let editedWord = {
          language: document.getElementById('edit-language').value,
          translationLanguage: document.getElementById('edit-translation-language').value,
          word: document.getElementById('edit-word').value,
          translation: document.getElementById('edit-translation').value,
          definition: document.getElementById('edit-definition').value,
          example: document.getElementById('edit-example').value,
          example_translation: document.getElementById('edit-example-translation').value,
          imageLink: document.getElementById('edit-image-link').value,
          audioLink: document.getElementById('edit-audio-link').value,
      };
  
      // Update the word in the words array
      let index = words.findIndex(word => word.lemma === originalWordData.lemma);
      if (index !== -1) {
          words[index] = { ...words[index], ...editedWord };
      }
  
      // Optionally, you could send the updated word to the backend to save changes permanently
  
      $('#editWordModal').modal('hide');
  }
  
  /////////////////////////////////////////

  // wspólna logika do wczytywania plików //

  //////////////////////////////////////////  

  let fullContentData = [];   // -> zmienna którą chce przekazać po przez return i wywołąnie tej funkcji w innym pliku
  let currentPage = 1;  // Aktualna strona
  let limit = 10;  // Domyślny limit plików na stronę
  let isPublic = false;  // Czy pliki mają być publiczne
  let searchQuery = '';  // Wartość wyszukiwania po nazwie pliku
  let tagQuery = '';  // Wartość wyszukiwania po tagu

  document.addEventListener("DOMContentLoaded", fetchData);

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
              fullContentData = JSON.parse(fileContent.content); // Zakładamy, że backend zwróci klucz "content"
              console.log('File content loaded:', fullContentData);
              // Wyświetlenie quizu lub innej logiki
              document.getElementById('quiz').style.display = 'block';

              // Zaktualizuj ukrytą datę w elemencie dom w reakcji na to zostanie wywołana funkcja w drugim pliku
              // Zaktualizowanie ukrytego elementu daty
              const hiddenDateElement = document.getElementById('hiddenDate');
              hiddenDateElement.setAttribute('data-date', new Date().toISOString());
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

function inicializeFullContentData(){
  return fullContentData;  // bo jest to zmienna globalna
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
