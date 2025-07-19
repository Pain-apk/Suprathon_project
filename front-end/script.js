// API Configuration
const API_BASE_URL = 'https://suprathon-project-956snwp2f-pain-apks-projects.vercel.app/'; // Change to your Vercel URL

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
  
  // Load saved data if available
  if (currentUser) {
    loadSavedData();
  }
}

// Check if user is logged in
function checkAuthStatus() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    try {
      currentUser = JSON.parse(user);
      showResumeForm();
    } catch (e) {
      console.error('Error parsing user data:', e);
      logout();
    }
  } else {
    redirectToAuth();
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
    hardSkills: document.getElementById('hardSkills').value.split(',').map(skill => skill.trim()),
    softSkills: document.getElementById('softSkills').value.split(',').map(skill => skill.trim()),
    projects: document.getElementById('projects').value,
    blog: document.getElementById('blog').value,
    templateType: document.getElementById('template')?.value || 'professional'
  };

  try {
    showLoading(true);
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
    if (!token) throw new Error('Not authenticated');
    
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
    
    // Save form data to localStorage
    saveFormData(formData);
    
    updatePreview(currentResume);
    return result;
  } catch (error) {
    console.error('Resume generation error:', error);
    throw error;
  }
}

// Save form data to localStorage
function saveFormData(formData) {
  Object.keys(formData).forEach(key => {
    if (typeof formData[key] === 'string') {
      localStorage.setItem(key, formData[key]);
    } else if (Array.isArray(formData[key])) {
      localStorage.setItem(key, formData[key].join(', '));
    }
  });
}

// Load saved data from localStorage
function loadSavedData() {
  const fields = ['name', 'email', 'phone', 'linkedin', 'github', 'summary', 
                 'experience', 'education', 'hardSkills', 'softSkills', 'projects', 'blog'];
  
  fields.forEach(field => {
    const value = localStorage.getItem(field);
    const element = document.getElementById(field);
    if (element && value) {
      element.value = value;
    }
  });
}

// Update preview section
function updatePreview(resumeData) {
  if (!resumeData) return;

  const setContent = (id, content) => {
    const element = document.getElementById(id);
    if (element) element.textContent = content || '';
  };

  setContent('p-name', resumeData.personalInfo?.name);
  setContent('p-summary', resumeData.professionalSummary);
  setContent('p-education', Array.isArray(resumeData.education) ? resumeData.education.join('\n') : '');
  setContent('p-experience', Array.isArray(resumeData.workExperience) ? resumeData.workExperience.join('\n') : '');
  setContent('p-hardSkills', Array.isArray(resumeData.technicalSkills) ? resumeData.technicalSkills.join(', ') : '');
  setContent('p-softSkills', Array.isArray(resumeData.softSkills) ? resumeData.softSkills.join(', ') : '');
  setContent('p-projects', Array.isArray(resumeData.projects) ? resumeData.projects.join('\n') : '');

  const links = [];
  if (resumeData.github) links.push(`<a href="${resumeData.github}" target="_blank">GitHub</a>`);
  if (resumeData.blog) links.push(`<a href="${resumeData.blog}" target="_blank">Portfolio</a>`);
  
  const linksElement = document.getElementById('p-links');
  if (linksElement) linksElement.innerHTML = links.join(' | ');
}

// Download PDF
function downloadPDF() {
  if (!currentResume) {
    alert('Please generate a resume first');
    return;
  }

  const element = document.getElementById('preview');
  if (!element) {
    alert('Preview section not found');
    return;
  }

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
    loader.style.display = isLoading ? 'flex' : 'none';
  }
}

// Show resume form
function showResumeForm() {
  const loginSection = document.getElementById('loginSection');
  const resumeSection = document.getElementById('resumeSection');
  
  if (loginSection) loginSection.style.display = 'none';
  if (resumeSection) resumeSection.style.display = 'block';
}

// Redirect to auth page
function redirectToAuth() {
  if (!window.location.pathname.includes('auth.html')) {
    window.location.href = 'auth.html';
  }
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentUser = null;
  redirectToAuth();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp); 