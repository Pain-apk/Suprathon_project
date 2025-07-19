require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// In-memory database (for Vercel compatibility)
const dataStore = {
  users: {},
  resumes: {}
};

// Middleware
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Pass datastore to routes
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
  res.json({ 
    status: 'running', 
    services: ['auth', 'profile', 'resume'],
    users: Object.keys(dataStore.users).length
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Using in-memory storage`);
});