const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// PostgreSQL connection configuration
const pool = new Pool({
    user: 'akash',       // Replace with your PostgreSQL username
    host: 'localhost',
    database: 'abc',     // Replace with your PostgreSQL database name
    password: '123',     // Replace with your PostgreSQL password
    port: 5432
});

// Endpoint to fetch data from WazirX API and store in PostgreSQL
app.get('/fetch-data', async (req, res) => {
    try {
        const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
        const tickers = response.data;

        // Extract relevant data and store in PostgreSQL
        const tickersToStore = Object.keys(tickers).map(key => {
            const ticker = tickers[key];
            return [
                ticker.name,
                parseFloat(ticker.last),
                parseFloat(ticker.buy),
                parseFloat(ticker.sell),
                parseFloat(ticker.volume),
                ticker.base_unit
            ];
        });

        const client = await pool.connect();
        await client.query('BEGIN');
        await Promise.all(tickersToStore.map(async ticker => {
            const queryText = `INSERT INTO crypto_data (platform, last_price, buy_price, sell_price, volume, base_unit) 
                               VALUES ($1, $2, $3, $4, $5, $6)`;
            await client.query(queryText, ticker);
        }));
        await client.query('COMMIT');
        client.release();

        res.json({ message: 'Data fetched and stored successfully' });
    } catch (error) {
        console.error('Error fetching data:', error.message);
        await client.query('ROLLBACK');  // Rollback transaction on error
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to retrieve stored data from PostgreSQL
app.get('/get-data', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM crypto_data LIMIT 5');
        client.release();

        const data = result.rows;
        res.json(data);
    } catch (error) {
        console.error('Error fetching data from database:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
