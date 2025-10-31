document.addEventListener('DOMContentLoaded', function () {
  // --------------------------
  // Hamburger Menu Toggle
  // --------------------------
  const navBtn = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');

  navBtn.addEventListener('click', function () {
    const expanded = navBtn.getAttribute('aria-expanded') === 'true';
    navBtn.setAttribute('aria-expanded', String(!expanded));
    nav.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open', !expanded); // optional CSS class for showing nav
  });

  // Keyboard support (Enter + Space)
  navBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navBtn.click();
    }
  });

  // --------------------------
  // Dark Mode Toggle
  // --------------------------
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  // Load previous preference or system preference
  let storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    body.classList.add('dark-mode');
    themeToggle.textContent = '🌞';
    themeToggle.setAttribute('aria-label', 'Toggle dark mode. Currently dark mode');
    themeToggle.setAttribute('aria-pressed', 'true');
  } else {
    body.classList.remove('dark-mode');
    themeToggle.textContent = '🌙';
    themeToggle.setAttribute('aria-label', 'Toggle dark mode. Currently light mode');
    themeToggle.setAttribute('aria-pressed', 'false');
  }

  // Toggle dark mode on click
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');

    // Update button text and accessibility
    themeToggle.textContent = isDark ? '🌞' : '🌙';
    themeToggle.setAttribute('aria-label', `Toggle dark mode. Currently ${isDark ? 'dark' : 'light'} mode`);
    themeToggle.setAttribute('aria-pressed', isDark);

    // Store preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // --------------------------
  // Dynamic Footer Year
  // --------------------------
  const yearElem = document.querySelector('.year');
  if (yearElem) {
    yearElem.textContent = new Date().getFullYear();
  }
});

