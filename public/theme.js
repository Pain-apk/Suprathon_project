// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
  const toggleThemeBtn = document.getElementById('toggle-theme');
  
  // Check if button exists (prevent errors)
  if (!toggleThemeBtn) {
    console.warn('Theme toggle button not found!');
    return;
  }

  // Theme toggle functionality
  toggleThemeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', 
      document.body.classList.contains('dark') ? 'dark' : 'light'
    );
  });

  // Initialize theme from storage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  }
});