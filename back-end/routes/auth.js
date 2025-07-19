const express = require('express');
const jwt  = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { loadData, saveData } = require('../utils/datastore');

const JWT_SECRET = process.env.JWT_SECRET || 
'96c590477285d1b8fbe4b9b8c7af3799f05511e7c6ec604a08dc6fc86c75b2e6';
//we will use this secret to sign our JWT tokens

//Registration route
router.post('./register', async (req, res) => {
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

}