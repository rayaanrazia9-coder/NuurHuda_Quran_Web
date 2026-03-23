const express = require("express");
const app = express();
const PORT = 5000;

// Route test
app.get("/", (req, res) => {
  res.send("NuurHuda Quran Website is running 🚀");
});

// Server start
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


// Route for Home Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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