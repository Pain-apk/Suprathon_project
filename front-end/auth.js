const API_BASE_URL = 'https://your-vercel-app.vercel.app/api'; // Replace with your Vercel URL

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const loginFormDiv = document.getElementById('login-form');
const signupFormDiv = document.getElementById('signup-form');

// Toggle between login/signup forms
showSignup.addEventListener('click', (e) => {
  e.preventDefault();
  loginFormDiv.classList.remove('active');
  signupFormDiv.classList.add('active');
});

showLogin.addEventListener('click', (e) => {
  e.preventDefault();
  signupFormDiv.classList.add('active');
  loginFormDiv.classList.remove('active');
});

// Handle login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Redirect to resume builder
    window.location.href = 'index.html';
  } catch (error) {
    alert(error.message);
    console.error('Login error:', error);
  }
});

// Handle signup
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm').value;
  
  if (password !== confirmPassword) {
    alert("Passwords don't match!");
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Redirect to resume builder
    window.location.href = 'index.html';
  } catch (error) {
    alert(error.message);
    console.error('Registration error:', error);
  }
});

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (token) {
    window.location.href = 'index.html';
  }
});