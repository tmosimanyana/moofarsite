// moofar.js - Main JavaScript functionality

// Mobile menu toggle
function toggleMenu() {
  const nav = document.querySelector('nav');
  const menuBtn = document.querySelector('.menu-btn');
  
  if (nav && menuBtn) {
    nav.classList.toggle('active');
    const isExpanded = nav.classList.contains('active');
    menuBtn.setAttribute('aria-expanded', isExpanded);
  }
}

// Scroll animations for elements with data-animate
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-animate]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  animatedElements.forEach(el => observer.observe(el));
}

// Parallax effect for hero sections
function initParallax() {
  const hero = document.getElementById('hero');
  const aboutParallax = document.getElementById('about-parallax');
  
  const applyParallax = (section) => {
    if (!section) return;
    
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = section.querySelectorAll('.hill, .cloud, .sun');
      
      parallaxElements.forEach(el => {
        const speed = el.classList.contains('back') ? 0.3 :
                     el.classList.contains('mid') ? 0.5 :
                     el.classList.contains('front') ? 0.7 :
                     el.classList.contains('cloud') ? 0.2 : 0.4;
        
        const yPos = -(scrolled * speed);
        el.style.transform = `translateY(${yPos}px)`;
      });
    });
  };
  
  if (hero) applyParallax(hero);
  if (aboutParallax) applyParallax(aboutParallax);
}

// Form submission handling (for Netlify forms)
function initFormHandling() {
  const form = document.getElementById('contact-form');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
      }
    });
  }
}

// Initialize all functionality when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initParallax();
  initFormHandling();
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  const nav = document.querySelector('nav');
  const menuBtn = document.querySelector('.menu-btn');
  
  if (nav && menuBtn && nav.classList.contains('active')) {
    if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
      nav.classList.remove('active');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  }
});

