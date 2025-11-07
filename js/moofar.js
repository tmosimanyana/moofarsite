// -------------------- MOBILE MENU --------------------
function toggleMenu() {
  const nav = document.querySelector('nav ul');
  const btn = document.querySelector('.menu-btn');
  const expanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', !expanded);
  nav.classList.toggle('open');
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  const nav = document.querySelector('nav ul');
  const menuBtn = document.querySelector('.menu-btn');
  if (nav && nav.classList.contains('open') && !nav.contains(e.target) && !menuBtn.contains(e.target)) {
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded','false');
  }
});

// -------------------- SCROLL ANIMATIONS --------------------
function animateOnScroll() {
  const elements = document.querySelectorAll('[data-animate]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.2 });
  elements.forEach(el => observer.observe(el));
}

// -------------------- PARALLAX HERO --------------------
function initParallax() {
  const hero = document.querySelector('.hero-section');
  if (!hero) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    hero.style.backgroundPosition = `center ${scrolled * 0.5}px`;
  });
}

// -------------------- INIT --------------------
document.addEventListener('DOMContentLoaded', () => {
  animateOnScroll();
  initParallax();
});

