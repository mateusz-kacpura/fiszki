let theme = 'light'; // default theme

function toggleTheme() {
    if (theme === 'light') {
      theme = 'dark';
      document.body.classList.add('bg-dark');
      document.body.classList.add('text-light');
      document.getElementById('main-container').classList.add('bg-dark');
      document.getElementById('main-container').classList.add('text-light');
      document.querySelectorAll('.card').forEach(card => {
        card.classList.add('bg-dark');
        card.classList.add('text-light');
      });
      document.querySelectorAll('input').forEach(input => {
        input.classList.add('bg-dark');
        input.classList.add('text-light');
      });
    } else {
      theme = 'light';
      document.body.classList.remove('bg-dark');
      document.body.classList.remove('text-light');
      document.getElementById('main-container').classList.remove('bg-dark');
      document.getElementById('main-container').classList.remove('text-light');
      document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('bg-dark');
        card.classList.remove('text-light');
      });
      document.querySelectorAll('input').forEach(input => {
        input.classList.remove('bg-dark');
        input.classList.remove('text-light');
      });
    }
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

  