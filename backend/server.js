const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST, // Replace with your host if different
  user: process.env.DB_USER, // Replace with your MySQL username
  password: process.env.DB_PASSWORD, // Replace with your MySQL password
  database: process.env.DB_NAME, // Replace with your database name
  port: process.env.DB_PORT, // Default MySQL port
});

// Ensure the table exists
const createTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS destinations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      country VARCHAR(255) NOT NULL,
      capital VARCHAR(255),
      population BIGINT,
      region VARCHAR(255),
      languages VARCHAR(255)
    );
  `;
  try {
    const connection = await pool.getConnection();
    await connection.query(createTableQuery);
    connection.release();
    console.log('Table "destinations" ensured.');
  } catch (err) {
    console.error('Error ensuring table "destinations":', err.message);
    process.exit(1); // Exit the app if the table creation fails
  }
};

// Initialize the table on server startup
createTable();

// Routes
app.get('/api/destinations', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM destinations ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/destinations', async (req, res) => {
  const { country } = req.body;
  try {
    const response = await axios.get(`${process.env.COUNTRIES_API_BASE_URL}/name/${encodeURIComponent(country)}`);
    const countryInfo = response.data[0];

    const normalizeLanguages = (languages) => {
      if (!languages) {
        return 'N/A';
      }

      if (Array.isArray(languages)) {
        const names = languages
          .map((language) => (typeof language === 'string' ? language : language?.name || language?.nativeName))
          .filter(Boolean);
        return names.length > 0 ? names.join(', ') : 'N/A';
      }

      if (typeof languages === 'object') {
        const names = Object.values(languages)
          .map((language) => (typeof language === 'string' ? language : language?.name))
          .filter(Boolean);
        return names.length > 0 ? names.join(', ') : 'N/A';
      }

      return String(languages);
    };

    const languagesText = normalizeLanguages(countryInfo.languages);

    const capital = countryInfo.capital ? countryInfo.capital[0] : 'N/A';

    const [result] = await pool.query(
      'INSERT INTO destinations (country, capital, population, region, languages) VALUES (?, ?, ?, ?, ?)',
      [country, capital, countryInfo.population, countryInfo.region, languagesText]
    );

    res.status(201).json({
      id: result.insertId,
      country,
      capital,
      population: countryInfo.population,
      region: countryInfo.region,
      languages: languagesText
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.delete('/api/destinations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM destinations WHERE id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
