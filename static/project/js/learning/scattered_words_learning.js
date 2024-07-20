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
