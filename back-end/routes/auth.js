const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { loadData, saveData } = require('../utils/datastore');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const SALT_ROUNDS = 10;

const validateAuthInput = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }
  next();
};
router.post('/register', validateAuthInput, async (req, res) => {
  const { email, password } = req.body;
  console.log("📥 Registering:", email);

  const data = loadData(req); // ✅ fixed

  if (data.users[email]) {
    return res.status(400).json({ message: 'User already exists' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = Date.now().toString();

    data.users[email] = {
      id: userId,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      profile: {
        personalInfo: {},
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        githubData: null,
        linkedinData: null
      },
      resumes: []
    };

    saveData(req, data); // ✅ fixed

    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      userId
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});


router.post('/login', validateAuthInput, async (req, res) => {
  const { email, password } = req.body;
  console.log("🔐 Login attempt:", email);

  const data = loadData();
  const user = data.users[email];

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  try {
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.lastLogin = new Date().toISOString();
    saveData(data);

    const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login successful',
      token,
      userId: user.id,
      profile: user.profile
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

module.exports = router;
