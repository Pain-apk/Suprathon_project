const express = require('express');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();
const { loadData, saveData } = require('../utils/datastore');

// Initialize Gemini API with the provided key
const genAI = new GoogleGenerativeAI('AIzaSyDY26ke1z5sdthCDbZyTL7xKzinwwFru4M'); // g-key

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET || '96c590477285d1b8fbe4b9b8c7af3799f05511e7c6ec604a08dc6fc86c75b2e6', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Generate resume with AI
router.post('/generate', authenticateToken, async (req, res) => {
  const { templateType } = req.body;
  const data = loadData();
  const user = Object.values(data.users).find(u => u.email === req.user.email);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  try {
    // Construct AI prompt
    const prompt = `
    Create a professional resume in JSON format based on the following information:
    
    Personal Info: ${JSON.stringify(user.profile.personalInfo)}
    Work Experience: ${JSON.stringify(user.profile.experience)}
    Education: ${JSON.stringify(user.profile.education)}
    Skills: ${JSON.stringify(user.profile.skills)}
    GitHub Data: ${user.profile.githubData ? JSON.stringify(user.profile.githubData) : 'None'}
    Template Style: ${templateType}
    
    Generate a structured resume with these sections:
    1. Professional Summary (2-3 sentences highlighting key strengths)
    2. Work Experience (optimized bullet points with metrics)
    3. Technical Skills (categorized by proficiency)
    4. Education & Certifications
    5. Notable Projects (from GitHub data if available)
    
    Format response as clean JSON with proper structure for PDF generation.
    Ensure ATS compatibility and use action verbs.
    `;
    
    // Call Gemini API instead of OpenAI
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Parse AI response
    const aiResume = JSON.parse(responseText);
    
    // Store generated resume
    const resumeId = `res-${Date.now()}`;
    data.resumes[resumeId] = {
      id: resumeId,
      userId: user.id,
      createdAt: new Date().toISOString(),
      template: templateType,
      content: aiResume
    };
    
    // Link to user
    user.resumes.push(resumeId);
    
    // Save data
    if (saveData(data)) {
      res.json({ 
        success: true,
        resumeId,
        content: aiResume
      });
    } else {
      res.status(500).json({ error: 'Failed to save resume data' });
    }
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ 
      error: 'Resume generation failed',
      details: error.message 
    });
  }
});

module.exports = router;
