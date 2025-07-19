const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { loadData, saveData } = require('../utils/datastore');
const axios = require('axios');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

router.get('/', authenticateToken, (req, res) => {
  const data = loadData(req);
  const user = Object.values(data.users).find(u => u.email === req.user.email);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const { password, ...profile } = user;
  res.json(profile);
});

router.post('/', authenticateToken, async (req, res) => {
  const data = loadData(req);
  const user = data.users[req.user.email];
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  try {
    user.profile = {
      ...user.profile,
      ...req.body
    };
    
    if (saveData(req, data)) {
      res.json({ message: 'Profile updated successfully', profile: user.profile });
    } else {
      res.status(500).json({ error: 'Failed to save profile data' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Profile update failed' });
  }
});

module.exports = router;