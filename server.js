const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(__dirname));

// Correctly serve the landing page at the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for local verification testing
app.get('/api/verify', (req, res) => {
    res.redirect('/dashboard.html');
});

const server = app.listen(PORT, () => {
    console.log(`\x1b[32m🚀 Local server running on http://localhost:${PORT}\x1b[00m`);
    console.log(`\x1b[36m📄 Serving files from: ${__dirname}\x1b[00m`);
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`\x1b[31m❌ Port ${PORT} is already in use. Please stop the other process and try again.\x1b[00m`);
        process.exit(1);
    }
});
