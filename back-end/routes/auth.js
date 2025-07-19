const express = require('express');
const jwt  = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { loadData, saveData } = require('../utils/datastore');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secure_secret_here';
//we will use this secret to sign our JWT tokens

//Registration route
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const data = loadData();
    if(data.users[email]){
        return res.status(400).json({ message : 'User alreadt exists' });
    
    }
    try{
        //Hash password
        const hashedPassword  = await bcrypt.hash(password, 10);
        //Create user
        data.users[email] = {
            id: Date.now().toString(),
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            lastlogin: null,
            profile: {
                personalInfo: {},
                experience: [],
                education: [],
                skills: [],
                projects: [],
                certifications: [],
                githubdata: null,
                linkedinData: null

            },
            resume: []    
        };
        //Save Data
        if(saveData(data)){
            res.status(201).json({ message: 'User registered successfully' });
        } else {
            res.status(500).json({message: 'Unable to the user data' });

        }
        }catch(error) {
            res.status(500).json({ message: 'Registration failed', error: error.message });
        }
    });
//User Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  const data = loadData();
  const user = data.users[email];
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  try {
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    saveData(data);
     // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );
    res.json({ 
      token, 
      userId: user.id,
      profile: user.profile 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

module.exports = router;
