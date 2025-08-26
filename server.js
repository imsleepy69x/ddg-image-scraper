// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const imageRoutes = require('./src/api/routes/imageRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// --- Middleware ---
// Enable CORS for all routes
app.use(cors());
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// --- API Routes ---
// Mount the image scraper routes
app.use('/', imageRoutes);

// --- Root Endpoint ---
app.get('/', (req, res) => {
  res.send('DuckDuckGo Image Scraper API is running. Use /images?q=<query> to start.');
});

// --- Start the Server ---
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
