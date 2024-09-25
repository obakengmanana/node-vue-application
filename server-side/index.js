const express = require('express');
const cors = require('cors'); // Import CORS
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Rate limiter middleware
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve users.json specifically
app.get('/users.json', (req, res) => {
  const filePath = path.join(__dirname, 'users.json');
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('File not found');
    }
    res.sendFile(filePath);
  });
});

// Import routes
app.use('/api/users', userRoutes);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
