    fullContentData = inicializeFullContentData()
    let excludedSentences = [];
    let reverseDirection = false;

///////////////////////////////////

// FUNKCJE ŁĄCZĄCE PLIKI W OPARCIU O AMTUALIZACJE DATY

///////////////////////////////////

    // Funkcja, która będzie wywoływana przy zmianie ukrytego elementu
    function handleDateChange(mutationsList, observer) {
      for (const mutation of mutationsList) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-date') {
              console.log('Date attribute updated:', mutation.target.getAttribute('data-date'));
              // Wywołanie funkcji z innego pliku
              generateRandomSentence();
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

    document.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        checkSentence();
      } else if (event.key === 'ArrowRight') {
        generateRandomSentence();
      }
    });

    let currentSentence = null;

    function generateRandomSentence() {
      const availableSentences = fullContentData.filter(sentence => !excludedSentences.includes(sentence.example));
      if (availableSentences.length === 0) {
        document.getElementById('result').textContent = 'No more fullContentData to study.';
        return;
      }
      const randomIndex = Math.floor(Math.random() * availableSentences.length);
      const randomSentence = availableSentences[randomIndex];
      currentSentence = randomSentence.example;
      document.getElementById('result').textContent = '';

      const examples = currentSentence.split(' ').sort(() => Math.random() - 0.5);
      const exampleBankDiv = document.getElementById('word-bank');
      const sentenceConstructionDiv = document.getElementById('sentence-construction');
      exampleBankDiv.innerHTML = '';
      sentenceConstructionDiv.innerHTML = '';

      examples.forEach(example => {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary';
        button.textContent = example;
        button.onclick = () => addexampleToSentence(example, button);
        exampleBankDiv.appendChild(button);
      });
      document.getElementById('sentence-translation').textContent = randomSentence.example_translation; // tĹ‚umaczone zdanie
    }

    function addexampleToSentence(example, button) {
      const sentenceConstructionDiv = document.getElementById('sentence-construction');
      const exampleButton = document.createElement('button');
      exampleButton.className = 'btn btn-primary';
      exampleButton.textContent = example;
      exampleButton.onclick = () => removeexampleFromSentence(exampleButton, button);
      sentenceConstructionDiv.appendChild(exampleButton);
      button.disabled = true;
    }

    function removeexampleFromSentence(exampleButton, originalButton) {
      const sentenceConstructionDiv = document.getElementById('sentence-construction');
      sentenceConstructionDiv.removeChild(exampleButton);
      originalButton.disabled = false;
    }

    function checkSentence() {
      const constructedSentence = Array.from(document.getElementById('sentence-construction').children)
        .map(button => button.textContent)
        .join(' ');
      const resultElement = document.getElementById('result');
      const timestamp = new Date().toISOString();
      const isCorrect = constructedSentence === currentSentence;
    
      const modalContainer = document.getElementById('modal-container');
      const modalHeaderClass = isCorrect ? 'bg-success text-white' : 'bg-danger text-white';
      const modalTitle = isCorrect ? 'Congratulations! Correct sentence.' : 'Incorrect. The correct sentence is:';
      const modalMessage = isCorrect ? `Correct sentence: <strong style="color: green">${constructedSentence}</strong>` : 
                                        `Your sentence: <strong style="color: red">${constructedSentence}</strong><br>The correct sentence is: <strong>${currentSentence}</strong>`;
    
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
              </div>
            </div>
          </div>
        </div>
      `;
    
      modalContainer.innerHTML = modalHTML;
    
      const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
      resultModal.show();

    if (isCorrect) {

      if (ttsCheckbox.checked && !audioCheckbox.checked) {
        if (constructedSentence && constructedSentence.trim() !== "") {
          playTextToSpeech(constructedSentence);
        } else {
          console.error("constructedSentence is empty");
        }
      }
      
      if (audioCheckbox.checked && ttsCheckbox.checked) {
        if (currentSentence && currentSentence.trim() !== "") {
          playTextToSpeech(currentSentence);
        } else {
          console.error("currentSentence is empty");
        }
      }      
    
      sendStatistic({
        sentence: constructedSentence,
        correct: isCorrect,
        timestamp: timestamp
      });
    
      
      setTimeout(() => {
          generateRandomSentence();
          const resultModalInstance = bootstrap.Modal.getInstance(document.getElementById('resultModal'));
          resultModalInstance.hide();
          $('#resultModal').on('hidden.bs.modal', () => {
            const modal = document.getElementById('resultModal');
            if (modal) {
              modal.remove();
            }
          });
        }, 5000);
      }
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

    