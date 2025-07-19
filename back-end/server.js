require('dotenv').config();
const express = require('expresss');
const cors = require('cors');
const app = express();
//Middleware
app.use(cors());
app.use(express.json());
//Routes
app.use('/api',require('./routes/api'));
