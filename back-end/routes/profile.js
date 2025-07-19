const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { loadData, saveData} = require('../utils/dataStore');
const axios = require('axios');
//Middleware to authenticate token
const authenticateToken = (req,res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split('')[1];
    if(!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET || '')
}