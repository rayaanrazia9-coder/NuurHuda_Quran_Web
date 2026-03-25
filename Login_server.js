const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cors = require('cors');
const sql = require('mssql');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

// SQL Server config
const dbConfig = {
    user: 'NuurHuda',
    password: 'Huda1234',
    server: 'localhost',  // or your server name
    database: 'quranapp',
    options: {
        trustServerCertificate: true
    }
};

// Connect to SQL Server
sql.connect(dbConfig)
    .then(() => console.log('Connected to SQL Server'))
    .catch(err => console.log('SQL Server Connection Error:', err));
















// --- REGISTER ---
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    // Fix: Send JSON for missing fields
    if(!username || !password) return res.status(400).json({ success: false, message: 'Missing username or password' });

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const request = new sql.Request();
        await request.query(`INSERT INTO Users (username, password) VALUES ('${username}', '${hashedPassword}')`);
        res.json({ success: true, message: 'Registration successful!' }); // Added message
    } catch(e) {
        res.status(500).json({ success: false, message: e.message }); // Changed to message
    }
});

// --- LOGIN ---
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const request = new sql.Request();
        const result = await request.query(`SELECT * FROM Users WHERE username='${username}'`);
        
        // Fix: Send JSON for "not found"
        if(result.recordset.length === 0) return res.status(400).json({ success: false, message: 'User not found' });

        const user = result.recordset[0];
        const match = await bcrypt.compare(password, user.password);
        
        // Fix: Send JSON for "wrong password"
        if(!match) return res.status(400).json({ success: false, message: 'Wrong password' });

        req.session.userId = user.id;
        res.json({ success: true, message: 'Login successful!', username: user.username });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});









// --- SAVE JUZ PROGRESS ---
app.post('/saveJuz', async (req, res) => {
    const { userId, juzNumber } = req.body;
    try {
        const request = new sql.Request();
        await request.query(`INSERT INTO UserJuz (userId, juzNumber) VALUES (${userId}, ${juzNumber})`);
        res.send({ success: true });
    } catch(e) {
        res.status(500).send({ success: false, error: e.message });
    }
});

// --- GET JUZ PROGRESS ---
app.get('/getJuz/:userId', async (req, res) => {
    const userId = req.params.userId;
    const request = new sql.Request();
    const result = await request.query(`SELECT juzNumber FROM UserJuz WHERE userId=${userId}`);
    res.send(result.recordset.map(r => r.juzNumber));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));