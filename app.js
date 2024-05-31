const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

const app = express();

app.set('view engine', 'ejs');

mongoose.connect('mongodb+srv://hichem:login@login.dmthmyh.mongodb.net/');
const conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', () => {
    console.log('Connected to MongoDB');
});

const storageEngine = multer.diskStorage({
    destination: (req, file, cb)=> {
        cb(null, './pdcast');
    },
    filename: (req, file, cb)=> {
        cb(null, file.originalname);
    },
});
const upload = multer({storage : storageEngine});

const audioSchema = new mongoose.Schema({
    filename: String,
    path: String,
    size: Number
});
const Audio = mongoose.model('Audio', audioSchema);


app.get('/', (req, res) => {
    Audio.find({})
        .then((audios) => {
            res.render('home', { audios: audios });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error fetching files');
        });
});

app.post('/upload', upload.single('audioFile'), (req, res) => {
    const file = req.file;
    const audio = new Audio({
        filename: file.originalname,
        path: file.path,
        size: file.size
    });
    audio.save()
        .then(() => {
            console.log('File uploaded:', file.originalname);
            res.redirect('/');
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error saving file');
        });
});
app.get('/audio/:id', (req, res) => {
    const id = req.params.id;
    const filePath = req.query.filePath;
    Audio.findById(id)
.then((audio) => {
            const filePath = audio.path.toString();
            res.sendFile(path.join(__dirname, filePath));
        })
.catch((err) => {
            console.error(err);
            res.status(500).send('Error fetching file');
        });
});



app.get('/delete/:id', (req, res) => {
    const id = req.params.id;
    Audio.findById(id)
        .then((audio) => {
            res.render('delete', { audio: audio });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error fetching file');
        });
});
app.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    Audio.findByIdAndDelete(id)
        .then(() => {
            console.log('File deleted');
            res.redirect('/');
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error deleting file');
        });
});

app.get('/upload', (req, res) => {
    res.render('upload');
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
    });

        