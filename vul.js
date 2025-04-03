const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Insecure SQL query with SQL Injection vulnerability
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'test_db'
});

db.connect(err => {
    if (err) throw err;
    console.log("Connected to database");
});

// SQL Injection vulnerability
app.get('/user', (req, res) => {
    const userId = req.query.id;
    const query = `SELECT * FROM users WHERE id = '${userId}'`;  // Vulnerable to SQL Injection
    db.query(query, (err, result) => {
        if (err) {
            res.status(500).send('Database error');
        } else {
            res.json(result);
        }
    });
});

// Cross-Site Scripting (XSS) vulnerability
app.get('/greet', (req, res) => {
    const name = req.query.name;  // Unescaped user input, XSS vulnerability
    res.send(`<h1>Hello, ${name}</h1>`);  // Vulnerable to XSS
});

// Insecure password handling (plaintext storage)
let users = [];
app.post('/register', (req, res) => {
    const { username, password } = req.body; // Password is stored in plaintext (not hashed)
    users.push({ username, password });
    res.send('User registered');
});

// Insecure authentication check (no salt, no hashing, or secure token)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username);

    if (user && user.password === password) {
        res.send('Login successful');
    } else {
        res.status(401).send('Invalid credentials');
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
