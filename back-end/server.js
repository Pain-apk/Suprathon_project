require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({
  origin: ['http://127.0.0.1:5501', 'http://localhost:5000'],
  credentials: true
}));

// In-memory data
const dataStore = {
  users: {},
  resumes: {}
};

// Middleware
app.use(express.json());

// Pass data store to routes
app.use((req, res, next) => {
  req.dataStore = dataStore;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/resume', require('./routes/resume'));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'running', users: Object.keys(dataStore.users).length });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
