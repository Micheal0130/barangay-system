const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const db = new sqlite3.Database('./barangay.db');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create table
db.run(`
  CREATE TABLE IF NOT EXISTS residents (
    username TEXT PRIMARY KEY,
    password TEXT,
    name TEXT,
    age INTEGER,
    address TEXT,
    role TEXT
  )
`);

// Seed admin if not exists
db.get("SELECT * FROM residents WHERE username = 'admin'", (err, row) => {
  if (!row) {
    db.run(`INSERT INTO residents (username, password, name, age, address, role)
            VALUES ('admin', '1234', 'Administrator', 0, 'Barangay Hall', 'admin')`);
  }
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM residents WHERE username = ? AND password = ?", [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: "Invalid credentials" });
    res.json(row);
  });
});

// Get all residents
app.get('/residents', (req, res) => {
  db.all("SELECT * FROM residents WHERE role = 'resident'", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add new resident
app.post('/residents', (req, res) => {
  const { username, password, name, age, address } = req.body;
  db.run(`INSERT INTO residents (username, password, name, age, address, role)
          VALUES (?, ?, ?, ?, ?, 'resident')`,
    [username, password, name, age, address],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    });
});

// Update resident (admin)
app.put('/residents/:username', (req, res) => {
  const { name, age, address } = req.body;
  const username = req.params.username;
  db.run(`UPDATE residents SET name = ?, age = ?, address = ? WHERE username = ?`,
    [name, age, address, username],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
});

// Delete resident
app.delete('/residents/:username', (req, res) => {
  const username = req.params.username;
  db.run(`DELETE FROM residents WHERE username = ?`, [username], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Get profile
app.get('/profile/:username', (req, res) => {
  const username = req.params.username;
  db.get(`SELECT * FROM residents WHERE username = ?`, [username], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// Update resident (self)
app.put('/profile/:username', (req, res) => {
  const { name, age, address } = req.body;
  const username = req.params.username;
  db.run(`UPDATE residents SET name = ?, age = ?, address = ? WHERE username = ?`,
    [name, age, address, username],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
});

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
