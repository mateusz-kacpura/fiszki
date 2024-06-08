import express from 'express';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import multer from 'multer';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
const imageFolderPath = path.join(__dirname, 'image_files');
const audioFolderPath = path.join(__dirname, 'audio_files');
const logFolderPath = path.join(__dirname, 'logi');
const uploadDir = path.join(__dirname, 'uploads');
const jsonDir = path.join(__dirname, 'uploads');
const jsonExt = '.json';
const STATISTICS_FILE = path.join(__dirname, 'statistic', 'statistics.json');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

const logToFile = (filename, message) => {
    const logFilePath = path.join(logFolderPath, filename);
    const logMessage = `${new Date().toISOString()} - ${message}\n`;
    fs.appendFileSync(logFilePath, logMessage, { flag: 'a' });
};

const checkAndDownloadFile = async (url, localPath) => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        fs.writeFileSync(localPath, response.data);
        return localPath;
    } catch (error) {
        return null;
    }
};

app.post('/load-image-paths', async (req, res) => {
    const { words } = req.body;
    const imagePaths = await Promise.all(words.map(async (word) => {
        if (!word) return null;
        const filename = word.replace(/\s/g, "-");
        const imagePath = path.join(imageFolderPath, `${filename}.jpg`);

        if (fs.existsSync(imagePath)) {
            logToFile('path_image.log', `File already exists: ${imagePath}`);
            return imagePath;
        }

        const url = `https://www.ang.pl/img/slownik/${filename}.jpg`;
        const imageFile = await checkAndDownloadFile(url, imagePath);

        if (imageFile) {
            logToFile('path_image.log', `Downloaded image: ${url} to ${imagePath}`);
            return imageFile;
        } else {
            logToFile('path_image.log', `Failed to download image from: ${url}`);
            return null;
        }
    }));

    res.json(imagePaths);
});

app.post('/load-audio-paths', async (req, res) => {
    const { words } = req.body;
    const audioPaths = await Promise.all(words.map(async (word) => {
        if (!word) return null;
        let filename = word.replace(/\s/g, "-");
        let audioPath = path.join(audioFolderPath, `${filename}.mp3`);

        if (fs.existsSync(audioPath)) {
            logToFile('path_audio.log', `File already exists: ${audioPath}`);
            return audioPath;
        }

        let url = `https://www.ang.pl/sound/dict/${filename}.mp3`;
        let audioFile = await checkAndDownloadFile(url, audioPath);

        if (audioFile) {
            logToFile('path_audio.log', `Downloaded audio: ${url} to ${audioPath}`);
            return audioFile;
        } else {
            filename = filename.replace(/-/g, "_");
            url = `https://www.diki.pl/images-common/en/mp3/${filename}.mp3`;
            audioFile = await checkAndDownloadFile(url, audioPath);

            if (audioFile) {
                logToFile('path_audio.log', `Downloaded audio: ${url} to ${audioPath}`);
                return audioFile;
            } else {
                logToFile('path_audio.log', `Failed to download audio from: ${url}`);
                return null;
            }
        }
    }));

    res.json(audioPaths);
});

// Ensure log folder exists
if (!fs.existsSync(logFolderPath)) {
    fs.mkdirSync(logFolderPath);
}

app.post('/save', (req, res) => {
    const { fileName, jsonData } = req.body;
    const jsonFilePath = path.join(jsonDir, fileName);

    fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
            console.error('Błąd podczas zapisywania pliku JSON:', err);
            return res.status(500).json({ error: 'Błąd serwera' });
        }

        res.json({ message: 'Dane zapisane pomyślnie jako JSON' });
    });
});

app.post('/save_statistic', (req, res) => {
    const statistic = req.body;
    console.log('Received statistic:', statistic);

    fs.readFile(STATISTICS_FILE, 'utf8', (err, data) => {
        if (err && err.code === 'ENOENT') {
            // Plik nie istnieje, utwórz nowy plik
            return fs.writeFile(STATISTICS_FILE, JSON.stringify([statistic], null, 2), (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.status(200).json({ message: 'Statistic saved successfully.' });
            });
        } else if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Plik istnieje, dodaj nową statystykę
        const statistics = JSON.parse(data);
        statistics.push(statistic);

        fs.writeFile(STATISTICS_FILE, JSON.stringify(statistics, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            return res.status(200).json({ message: 'Statistic saved successfully.' });
        });
    });
});

app.get('/words', (req, res) => {
    const file = req.query.file;
    const jsonFilePath = path.join(jsonDir, `${file}${jsonExt}`);

    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Błąd podczas czytania pliku:', err);
            return res.status(500).json({ error: 'Błąd serwera' });
        }

        const jsonData = data ? JSON.parse(data) : [];
        res.json(jsonData);
    });
});

app.post('/edit/:file/:index', (req, res) => {
    const file = req.params.file;
    const index = parseInt(req.params.index, 10);
    const updatedData = req.body;

    const jsonFilePath = path.join(jsonDir, `${file}${jsonExt}`);

    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Błąd podczas czytania pliku:', err);
            return res.status(500).json({ error: 'Błąd serwera' });
        }

        let jsonData = [];
        if (data) {
            jsonData = JSON.parse(data);
        }

        if (index >= 0 && index < jsonData.length) {
            jsonData[index] = updatedData;

            fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2), (err) => {
                if (err) {
                    console.error('Błąd podczas zapisywania pliku:', err);
                    return res.status(500).json({ error: 'Błąd serwera' });
                }

                res.json({ message: 'Dane zaktualizowane pomyślnie' });
            });
        } else {
            res.status(400).json({ error: 'Nieprawidłowy indeks' });
        }
    });
});

app.get('/files', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            console.error('Błąd podczas czytania katalogu:', err);
            return res.status(500).json({ error: 'Błąd serwera' });
        }

        res.json(files);
    });
});

app.post('/upload', upload.single('file'), (req, res) => {
    const filePath = req.file.path;

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    const columns = Object.keys(data[0]);

    res.json({ columns });
});

app.post('/tts', (req, res) => {
  const { word, languageCode } = req.body;
  const request = {
    input: { text: word },
    voice: { languageCode, ssml: false },
    audioConfig: { audioEncoding: 'LINEAR16' },
  };

client.synthesizeSpeech(request, (err, response) => {
    if (err) {
      console.error('Error generating audio:', err);
      res.status(500).send('Error generating audio');
    } else {
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Disposition', `attachment; filename="${word}.wav"`);
      res.send(response.audioContent);
    }
  });
});

app.listen(port, () => {
    console.log(`Serwer działa na http://localhost:${port}`);
});
