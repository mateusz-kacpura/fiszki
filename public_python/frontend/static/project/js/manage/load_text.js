document.addEventListener('DOMContentLoaded', function() {
  const uploadForm = document.getElementById('uploadForm');
  const textInput = document.getElementById('textInput');
  const sentenceContainer = document.getElementById('sentenceContainer');
  const saveButton = document.getElementById('saveButton');
  const textNameInput = document.getElementById('textName');
  const textTagInput = document.getElementById('textTag');
  let resultData = []; // Global variable to store the result

  uploadForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const text = textInput.value.trim();
    if (text) {
      processText(text);
    }
  });

  function processText(text) {
    // Split text into sentences
    const sentences = splitTextIntoSentences(text);
    sentenceContainer.innerHTML = '';

    sentences.forEach((sentence, sentenceIndex) => {
      // Create a div for each sentence
      const sentenceDiv = document.createElement('div');
      sentenceDiv.classList.add('sentence');
      sentenceDiv.dataset.index = sentenceIndex;
      sentenceDiv.style.marginBottom = '20px';

      // Split sentence into words
      const words = sentence.split(/\s+/);
      words.forEach((word, wordIndex) => {
        const span = document.createElement('span');
        span.classList.add('word');
        span.textContent = word + ' ';
        span.dataset.wordIndex = wordIndex;

        // Add event listener to toggle selection
        span.addEventListener('click', function() {
          span.classList.toggle('missing-word');
          updateResultData();
        });

        sentenceDiv.appendChild(span);
      });

      sentenceContainer.appendChild(sentenceDiv);
    });

    // Initialize result data
    initializeResultData(sentences);
  }

  function splitTextIntoSentences(text) {
    // Simple sentence splitting using regex
    return text.match(/[^\.!\?]+[\.!\?]+|[^\.!\?]+$/g) || [text];
  }

  function initializeResultData(sentences) {
    resultData = sentences.map(sentence => ({
      "english": sentence.trim(),
      "missing_words": []
    }));
  }

  function updateResultData() {
    const sentenceDivs = document.querySelectorAll('#sentenceContainer .sentence');

    sentenceDivs.forEach(sentenceDiv => {
      const sentenceIndex = sentenceDiv.dataset.index;
      const sentenceData = resultData[sentenceIndex];
      const wordSpans = sentenceDiv.querySelectorAll('.word');
      sentenceData.missing_words = [];

      let selectedIndices = [];
      wordSpans.forEach((span, wordIndex) => {
        if (span.classList.contains('missing-word')) {
          selectedIndices.push(parseInt(wordIndex));
        }
      });

      // Find consecutive sequences in selectedIndices
      const sequences = [];
      let tempSeq = [];

      for (let i = 0; i < selectedIndices.length; i++) {
        if (tempSeq.length === 0) {
          tempSeq.push(selectedIndices[i]);
        } else {
          if (selectedIndices[i] === tempSeq[tempSeq.length - 1] + 1) {
            tempSeq.push(selectedIndices[i]);
          } else {
            sequences.push(tempSeq.slice());
            tempSeq = [selectedIndices[i]];
          }
        }
      }
      if (tempSeq.length > 0) {
        sequences.push(tempSeq.slice());
      }

      // For each sequence, get the words and positions
      sequences.forEach(seq => {
        const positions = seq.map(i => i + 1); // Positions are 1-based
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

    });

    console.log(resultData);
  }

  // Generate UUID function
  function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = (performance && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c==='x' ? r :(r&0x3|0x8)).toString(16);
    });
  }

  // Save button event listener
  saveButton.addEventListener('click', function() {
    // Build the final data and send it to the server

    // Collect 'name' and 'tag' from inputs
    const textName = textNameInput.value.trim();
    const textTag = textTagInput.value.trim();

    if (!textName) {
      alert('Please provide a name for the text.');
      return;
    }

    // Generate UUID
    const uuid = generateUUID();

    // Build the final data structure
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
    
    // Send the data to the server via fetch
    fetch('/user/save_texts_for_insert_words_to_text_learning', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken  // Include CSRF token
      },
      body: JSON.stringify(finalData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Data saved successfully.');
      } else {
        alert('Error saving data: ' + data.error);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while saving data.');
    });

  });

});