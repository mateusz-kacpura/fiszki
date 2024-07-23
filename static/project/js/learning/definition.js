let words = [];

document.addEventListener('keydown', function(event) {
    if (event.key >= '1' && event.key <= '5') {
        const index = parseInt(event.key) - 1;
        const buttons = document.querySelectorAll('.answer-buttons .btn');
        if (buttons[index]) {
            buttons[index].click();
        }
    } else if (event.key === 'Enter') {
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
            document.getElementById('quiz').style.display = 'block';
            generateRandomWord();
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    };
    reader.readAsText(file);
}

function generateRandomWord() {
    if (words.length === 0) return;

    const randomIndex = Math.floor(Math.random() * words.length);
    currentWordData = words[randomIndex];

    document.getElementById('example-sentence-text').textContent = currentWordData.definition;

    const answerButtons = document.getElementById('answer-buttons');
    answerButtons.innerHTML = '';

    const options = [currentWordData.word];
    while (options.length < 5) {
        const randomOption = words[Math.floor(Math.random() * words.length)].word;
        if (!options.includes(randomOption)) {
            options.push(randomOption);
        }
    }
    options.sort(() => Math.random() - 0.5);

    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary';
        button.textContent = option;
        button.onclick = () => checkAnswer(option);
        answerButtons.appendChild(button);
    });
}

function checkAnswer(selectedWord) {
    const result = selectedWord === currentWordData.word ? 'Correct!' : 'Incorrect!';
    fetchTranslation(currentWordData.definition).then(translation => {
        showResultInModal(result, translation, selectedWord);
    });
}

function fetchTranslation(text) {
    console.log(text)
    const url = '/translate'; // Flask API URL

    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text })
    })
    .then(response => response.json())
    .then(data => data.translatedText)
    .catch(error => {
        console.error('Error fetching translation:', error);
        return 'Translation error';
    });
}

function showResultInModal(correct, translation, selectedWord) {
    console.log('Selected Word:', currentWordData.definition);
    console.log('Correct Word:', correct);

    const answerButtons = document.getElementById('answer-buttons');
    answerButtons.innerHTML = '';

    // Remove any existing modals
    const existingModal = document.getElementById('resultModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Determine the result
    const isCorrect = currentWordData.definition === correct;
    const resultMessage = isCorrect ? 'Correct!' : 'Incorrect!';
    const theme = document.body.classList.contains('bg-dark') ? 'dark' : 'light'; // Adjust theme check if needed
    currentWordData.word 
    // Fetch modal HTML from server
    fetch(`/modals/definition-pop-up?word=${encodeURIComponent(currentWordData.word)}&selectedWord=${encodeURIComponent(selectedWord)}&resultMessage=${encodeURIComponent(resultMessage)}&translation=${encodeURIComponent(translation)}&definition=${encodeURIComponent(currentWordData.definition)}&theme=${encodeURIComponent(theme)}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error loading modal:', data.error);
                return;
            }

            const modalHTML = data.modal_html;
            playTextToSpeech(currentWordData.word);

            // Insert modal HTML into the document
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Show the modal using Bootstrap
            const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
            resultModal.show();

            // Show the "Next" and "Edit" buttons
            document.getElementById('new-sentence-btn').style.display = 'block';
            document.getElementById('edit-word-btn').style.display = 'block';

            // Auto-hide the modal after 15 seconds
            setTimeout(() => {
                resultModal.hide();
                resultModal._element.addEventListener('hidden.bs.modal', () => {
                    if (resultModal._element) {
                        resultModal._element.remove();
                    }
                });
            }, 15000);

            // Add current word to excluded words if correct
            if (isCorrect) {
                excludedWords.push(currentWordData.word); // Ensure `currentWordData` is defined
            }
        })
        .catch(error => {
            console.error('Error loading modal:', error);
        });
}

