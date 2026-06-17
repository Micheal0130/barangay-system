const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize SQLite Database
const dbPath = path.join(__dirname, 'barangay.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'resident',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create residents table
    db.run(`
      CREATE TABLE IF NOT EXISTS residents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        birthday TEXT NOT NULL,
        address TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(username) REFERENCES users(username)
      )
    `);

    // Insert default admin if not exists
    db.run(`
      INSERT OR IGNORE INTO users (username, password, role)
      VALUES (?, ?, ?)
    `, ['admin', 'utog', 'admin'], (err) => {
      if (!err) {
        console.log('Admin user initialized');
      }
    });
  });
}

// ==================== USER ENDPOINTS ====================

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (row) {
        res.json({ success: true, role: row.role, username: row.username });
      } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
    }
  );
});

// ==================== RESIDENT ENDPOINTS ====================

// Get resident profile
app.get('/api/residents/:username', (req, res) => {
  const { username } = req.params;

  db.get(
    'SELECT * FROM residents WHERE username = ?',
    [username],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (row) {
        res.json(row);
      } else {
        res.status(404).json({ error: 'Resident not found' });
      }
    }
  );
});

// Update resident profile
app.put('/api/residents/:username', (req, res) => {
  const { username } = req.params;
  const { name, birthday, address } = req.body;

  db.run(
    `UPDATE residents 
     SET name = ?, birthday = ?, address = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE username = ?`,
    [name, birthday, address, username],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true, message: 'Profile updated successfully' });
    }
  );
});

// ==================== ADMIN ENDPOINTS ====================

// Get all residents
app.get('/api/admin/residents', (req, res) => {
  db.all(
    `SELECT r.*, CAST((julianday('now') - julianday(r.birthday)) / 365.25 AS INTEGER) as age 
     FROM residents r ORDER BY r.id DESC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

// Add new resident (admin only)
app.post('/api/admin/residents', (req, res) => {
  const { username, password, name, birthday, address } = req.body;

  // Check if username exists
  db.get('SELECT username FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (row) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Insert user
    db.run(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, password, 'resident'],
      function (userErr) {
        if (userErr) {
          return res.status(500).json({ error: 'Failed to create user' });
        }

        // Insert resident
        db.run(
          'INSERT INTO residents (username, name, birthday, address) VALUES (?, ?, ?, ?)',
          [username, name, birthday, address],
          function (resErr) {
            if (resErr) {
              return res.status(500).json({ error: 'Failed to create resident' });
            }
            res.status(201).json({ 
              success: true, 
              id: this.lastID,
              message: 'Resident added successfully' 
            });
          }
        );
      }
    );
  });
});

// Update resident (admin)
app.put('/api/admin/residents/:username', (req, res) => {
  const { username } = req.params;
  const { name, birthday, address } = req.body;

  db.run(
    `UPDATE residents 
     SET name = ?, birthday = ?, address = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE username = ?`,
    [name, birthday, address, username],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true, message: 'Resident updated successfully' });
    }
  );
});

// Delete resident (admin)
app.delete('/api/admin/residents/:username', (req, res) => {
  const { username } = req.params;

  db.serialize(() => {
    // Delete from residents table
    db.run('DELETE FROM residents WHERE username = ?', [username], function (err1) {
      if (err1) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Delete from users table
      db.run('DELETE FROM users WHERE username = ?', [username], function (err2) {
        if (err2) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, message: 'Resident deleted successfully' });
      });
    });
  });
});

// Search residents
app.get('/api/admin/residents/search', (req, res) => {
  const { category, query } = req.query;
  let sql = `SELECT r.*, CAST((julianday('now') - julianday(r.birthday)) / 365.25 AS INTEGER) as age FROM residents r WHERE `;
  let params = [];

  if (category === 'id') {
    sql += 'r.username LIKE ?';
    params.push(`%${query}%`);
  } else if (category === 'name') {
    sql += 'r.name LIKE ?';
    params.push(`%${query}%`);
  } else if (category === 'birthday') {
    sql += 'r.birthday LIKE ?';
    params.push(`%${query}%`);
  } else if (category === 'address') {
    sql += 'r.address LIKE ?';
    params.push(`%${query}%`);
  } else if (category === 'age') {
    sql += 'CAST((julianday("now") - julianday(r.birthday)) / 365.25 AS INTEGER) = ?';
    params.push(parseInt(query));
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Close database on app termination
process.on('SIGINT', () => {
  db.close(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});
