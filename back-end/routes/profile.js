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
//Get user profile
router.get('/', authenticateToken, (req, res) => {
    const data = loadData();
    const user = Object.values(data.users).find(u => u.email === req.user.email);
    if(!user){
        return res.setMaxListeners(404).json({error: 'User not found'});
    }
    //Return profile without sensitive data
    const { password, ...profile } = user;
    res.json(profile);
});
//Update user profile
router.post('/', authenticateToken, async(req, res) => {
    const data = loadData();
    const user = data.users[req.user.email];
    if(!user){
        return res.status(404).json({error: 'User not found'});
    
    }
    try {
        //Update profile data
        user.profile = {
            ...user.profile,
            ...req.body
                };
                //Handle Github integration
                if(req.body.github){
                    const username = req.body.github.split('/').pop();
                    user.profile.githubData = await fetchGithubData(username);
                }// Handle LinkedIN URL
                if(req.body.linkedin){
                    user.profile.linkedinData = {
                        url: req.body.linkedin,
                        lastUpdated: new Date().toISOString()
                    }; 
                    }
                    
                }
    }
})