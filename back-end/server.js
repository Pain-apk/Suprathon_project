require('dotenv').config();
const express = require('expresss');
const cors = require('cors');
const app = express();
//Middleware
app.use(cors());
app.use(express.json());
//Routes
app.use('/api/auth',require('./routes/auth'));
app.use('/api/profile',require('./routes/profile'));
app.use('/api/resume',require('./routes/resume'));

//Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'running', 
    services: ['auth', 'profile', 'resume'] 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Data storage: ${__dirname}/data/`);
});
