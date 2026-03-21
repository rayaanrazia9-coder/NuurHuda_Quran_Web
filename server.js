const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files (CSS, JS, etc.) from the current directory
app.use(express.static(__dirname));

// Route for Home Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Index.html'));
});

// Route for Schedule Page
app.get('/schedule', (req, res) => {
    res.sendFile(path.join(__dirname, 'schedule.html'));
});

// Simple API for schedule progress (if needed later)
let scheduleProgress = [];
app.get('/api/schedule/progress', (req, res) => {
    res.json(scheduleProgress);
});

app.post('/api/schedule/progress', (req, res) => {
    scheduleProgress = req.body.progress;
    res.json({ message: 'Progress saved successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
