// Lightweight accessible hamburger toggle
document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');
  btn.addEventListener('click', function () {
    var expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    // Toggle an attribute on nav to control CSS in smaller screens
    nav.setAttribute('aria-expanded', String(!expanded));
  });
});


// === Dark Mode Toggle ===
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Load previous preference (if any)
if (localStorage.getItem('theme') === 'dark') {
  body.classList.add('dark-mode');
  themeToggle.textContent = '🌞';
} else if (localStorage.getItem('theme') === 'light') {
  body.classList.remove('dark-mode');
  themeToggle.textContent = '🌙';
}

// Toggle on click
themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  const isDark = body.classList.contains('dark-mode');
  themeToggle.textContent = isDark ? '🌞' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
