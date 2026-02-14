const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '.')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

app.post('/contact', (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ status: 'error', message: 'Please fill in all required fields.' });
    }

    const newMessage = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        name,
        email,
        subject: subject || 'No Subject',
        message
    };

    // Read existing messages or init empty array
    const filePath = path.join(__dirname, 'messages.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        let messages = [];
        if (!err && data) {
            try {
                messages = JSON.parse(data);
            } catch (e) {
                console.error("Error parsing JSON:", e);
            }
        }

        messages.push(newMessage);

        // Save back to file
        fs.writeFile(filePath, JSON.stringify(messages, null, 2), (err) => {
            if (err) {
                console.error("Error saving message:", err);
                return res.status(500).json({ status: 'error', message: 'Failed to save message.' });
            }
            console.log(`New message saved from ${name}`);
            res.status(200).json({ status: 'success', message: 'Message sent successfully!' });
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
