const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { loadData, saveData } = require('../utils/dataStore');
const axios = require('axios');

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Get user profile
router.get('/', authenticateToken, (req, res) => {
  const data = loadData();
  const user = Object.values(data.users).find(u => u.email === req.user.email);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Return profile without sensitive data
  const { password, ...profile } = user;
  res.json(profile);
});

// Update profile
router.post('/', authenticateToken, async (req, res) => {
  const data = loadData();
  const user = data.users[req.user.email];
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  try {
    // Update profile data
    user.profile = {
      ...user.profile,
      ...req.body
    };
    
    // Handle GitHub integration
    if (req.body.github) {
      const username = req.body.github.split('/').pop();
      user.profile.githubData = await fetchGitHubData(username);
    }
    
    // Handle LinkedIn URL
    if (req.body.linkedin) {
      user.profile.linkedinData = {
        url: req.body.linkedin,
        lastUpdated: new Date().toISOString()
      };
    }
    
    // Save data
    if (saveData(data)) {
      res.json({ message: 'Profile updated successfully', profile: user.profile });
    } else {
      res.status(500).json({ error: 'Failed to save profile data' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// Fetch GitHub data
async function fetchGitHubData(username) {
  try {
    const [profileRes, reposRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`),
      axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`)
    ]);
    
    return {
      profile: profileRes.data,
      repositories: reposRes.data,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('GitHub API error:', error.message);
    return null;
  }
}

module.exports = router;