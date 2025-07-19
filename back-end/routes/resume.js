const express = require('express');
const jwt = require('jsonwebtoken');
const { OpenAI } = require('openai');
const router = express.Router();
const { loadData, saveData } = require('../utils/dataStore');
//AI apikey setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.7
    });
    
    // Parse AI response
    const aiResume = JSON.parse(response.choices[0].message.content);
    
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