let words = [];
let currentWord = '';
let excludedWords = [];

document.getElementById('fileInput').addEventListener('change', fetchData);

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
            let rawWords = JSON.parse(fileContent);
            console.log('Data loaded successfully:', rawWords);

            // Send words to Flask backend for processing
            fetch('/user/process-words', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ words: rawWords })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Error processing words:', data.error);
                    return;
                }
                words = data.words;
                document.getElementById('quiz').style.display = 'block';
                generateRandomWord();
            })
            .catch(error => {
                console.error('Error:', error);
            });

        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    };
    reader.readAsText(file);
}

function generateRandomWord() {
    const availableWords = words.filter(word => !excludedWords.includes(word.lemma));
    if (availableWords.length === 0) {
        document.getElementById('result').innerText = 'No more words to study.';
        return;
    }
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const randomWord = availableWords[randomIndex];
    currentWord = randomWord.lemma;
    currentWordData = randomWord; // Store the current word data

    document.getElementById('result').innerText = '';
    const sentenceWithBlank = randomWord.example.replace(new RegExp(randomWord.word, 'i'), '______');
    document.getElementById('example-sentence-text').innerText = sentenceWithBlank;
    document.getElementById('new-sentence-btn').style.display = 'none';
    document.getElementById('edit-word-btn').style.display = 'none';
    generateAnswerButtons(randomWord);
}

function generateAnswerButtons(word) {
    const answerButtonsDiv = document.getElementById('answer-buttons');
    answerButtonsDiv.innerHTML = '';

    // Get all words except the current word and shuffle them
    let options = words.filter(w => w.lemma !== word.lemma).map(w => w.word);

    // Select the first 4 options and add the correct word to the options
    options = options.sort(() => Math.random() - 0.5).slice(0, 4);
    options.push(word.word);
    options = options.sort(() => Math.random() - 0.5);

    options.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-primary', 'm-1');
        button.textContent = option;
        button.onclick = () => checkAnswer(option, word.word, word.example, word.example_translation);
        answerButtonsDiv.appendChild(button);
    });
}

function checkAnswer(selected, correct, fullSentence, exampleTranslation) {
    const answerButtons = document.getElementById('answer-buttons');
    answerButtons.innerHTML = '';

    // Remove any existing modals
    const existingModal = document.getElementById('resultModal');
    if (existingModal) {
        existingModal.remove();
    }

    fetch(`/user/modals/insert-pop-up?selectedWord=${selected}&correctWord=${correct}&fullSentence=${fullSentence}&exampleTranslation=${exampleTranslation}&theme=${theme}`)
        .then(response => response.json())
        .then(data => {
            const modalHTML = data.modal_html;
            playTextToSpeech(fullSentence);

            document.body.insertAdjacentHTML('beforeend', modalHTML);

            $('#resultModal').modal('show');
            document.getElementById('new-sentence-btn').style.display = 'block';
            document.getElementById('edit-word-btn').style.display = 'block'; // Show the Edit button

            setTimeout(() => {
                $('#resultModal').modal('hide');
                $('#resultModal').on('hidden.bs.modal', () => {
                    const modal = document.getElementById('resultModal');
                    if (modal) {
                        modal.remove();
                    }
                });
            }, 15000);

            if (selected === correct) {
                excludedWords.push(currentWord);
            }
        })
        .catch(error => console.error('Error loading modal:', error));
}
