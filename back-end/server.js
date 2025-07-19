const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');

// POST: Submit user data and generate resume
router.post('/generate', resumeController.generateResume);

module.exports = router;