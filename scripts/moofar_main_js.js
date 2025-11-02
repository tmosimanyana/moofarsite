/**
 * Moofar Pty Ltd - Main JavaScript
 * Handles menu toggle and dynamic year display
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  
  // Initialize dynamic year in footer
  initializeYear();
  
  // Initialize menu toggle functionality
  initializeMenu();
  
});

/**
 * Sets the current year in the footer
 */
function initializeYear() {
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

/**
 * Initializes mobile menu toggle functionality
 */
function initializeMenu() {
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.querySelector('nav');
  
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function() {
      nav.classList.toggle('open');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      const isClickInsideNav = nav.contains(event.target);
      const isClickOnMenuBtn = menuBtn.contains(event.target);
      
      if (!isClickInsideNav && !isClickOnMenuBtn && nav.classList.contains('open')) {
        nav.classList.remove('open');
      }
    });
    
    // Close menu when pressing Escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
      }
    });
  }
}

// Make toggleMenu available globally for any inline onclick handlers (backwards compatibility)
window.toggleMenu = function() {
  const nav = document.querySelector('nav');
  if (nav) {
    nav.classList.toggle('open');
  }
};