const express = require('express');
const jwt  = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { loadData, saveData } = require('../utils/datastore');

const JWT_SECRET = process.env.JWT_SECRET || 
'96c590477285d1b8fbe4b9b8c7af3799f05511e7c6ec604a08dc6fc86c75b2e6';
//we will use this secret to sign our JWT tokens

