// API Configuration
const API_BASE_URL = 'https://your-vercel-app-name.vercel.app/api'; // Change to your Vercel URL

// DOM Elements
const resumeForm = document.getElementById('resumeForm');
const previewSection = document.getElementById('preview');
const downloadBtn = document.getElementById('downloadBtn');
const generateBtn = document.getElementById('generateBtn');

// Current User Data
let currentUser = null;
let currentResume = null;

// Initialize the app
async function initApp() {
  checkAuthStatus();
  setupEventListeners();
}

// Check if user is logged in
function checkAuthStatus() {
  const token = localStorage.getItem('token');
  if (token) {
    currentUser = JSON.parse(localStorage.getItem('user'));
    showResumeForm();
  }
}

// Setup event listeners
function setupEventListeners() {
  if (resumeForm) {
    resumeForm.addEventListener('submit', handleFormSubmit);
  }
  
  if (generateBtn) {
    generateBtn.addEventListener('click', generateResume);
  }
  
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadPDF);
  }
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    linkedin: document.getElementById('linkedin').value,
    github: document.getElementById('github').value,
    summary: document.getElementById('summary').value,
    experience: document.getElementById('experience').value,
    education: document.getElementById('education').value,
    hardSkills: document.getElementById('hardSkills').value,
    softSkills: document.getElementById('softSkills').value,
    projects: document.getElementById('projects').value,
    blog: document.getElementById('blog').value,
    templateType: 'professional' // Default template
  };

  try {
    showLoading(true);
    
    // Register or login user
    if (!currentUser) {
      await registerUser(formData.email, 'defaultPassword'); // In a real app, add password field
    }
    
    // Generate resume
    await generateResume(formData);
    
    showLoading(false);
  } catch (error) {
    showLoading(false);
    alert(`Error: ${error.message}`);
    console.error('Form submission error:', error);
  }
}

// Register user
async function registerUser(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    currentUser = data.user;
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Generate resume with AI
async function generateResume(formData) {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/resume/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Resume generation failed');
    }

    const result = await response.json();
    currentResume = result.content;
    updatePreview(currentResume);
    return result;
  } catch (error) {
    console.error('Resume generation error:', error);
    throw error;
  }
}

// Update preview section
function updatePreview(resumeData) {
  document.getElementById('p-name').textContent = resumeData.personalInfo?.name || '';
  document.getElementById('p-summary').textContent = resumeData.professionalSummary || '';
  document.getElementById('p-education').textContent = resumeData.education?.join('\n') || '';
  document.getElementById('p-experience').textContent = resumeData.workExperience?.join('\n') || '';
  document.getElementById('p-hardSkills').textContent = resumeData.technicalSkills?.join(', ') || '';
  document.getElementById('p-softSkills').textContent = resumeData.softSkills?.join(', ') || '';
  document.getElementById('p-projects').textContent = resumeData.projects?.join('\n') || '';

  const links = [];
  if (resumeData.github) links.push(`<a href="${resumeData.github}" target="_blank">GitHub</a>`);
  if (resumeData.blog) links.push(`<a href="${resumeData.blog}" target="_blank">Portfolio</a>`);
  document.getElementById('p-links').innerHTML = links.join(' | ');
}

// Download PDF
function downloadPDF() {
  if (!currentResume) {
    alert('Please generate a resume first');
    return;
  }

  const element = document.getElementById('preview');
  html2canvas(element).then(canvas => {
    const img = canvas.toDataURL('image/png');
    const pdf = new jspdf.jsPDF();
    const imgProps = pdf.getImageProperties(img);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${currentResume.personalInfo?.name || 'resume'}_resume.pdf`);
  });
}

// Show loading state
function showLoading(isLoading) {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.display = isLoading ? 'block' : 'none';
  }
}

// Show resume form
function showResumeForm() {
  const loginSection = document.getElementById('loginSection');
  const resumeSection = document.getElementById('resumeSection');
  
  if (loginSection) loginSection.style.display = 'none';
  if (resumeSection) resumeSection.style.display = 'block';
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);