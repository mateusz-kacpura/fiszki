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
    fetch('/text-to-speech', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
    })
    .then(response => response.json())
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
    fetch('/save_statistic', {
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
    fetch('/saveSetting', {
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

  