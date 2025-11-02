// Dynamic year
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  
  // Contact form handler
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      form.innerHTML = `<div class="thank-you-message fade-in" style="text-align:center; padding:2rem;">
        <h2>Thank You, ${name}!</h2>
        <p>We’ve received your message and will contact you at <strong>${email}</strong> soon.</p>
      </div>`;
    });
  }
});

// Mobile menu toggle
function toggleMenu() {
  const nav = document.querySelector('nav');
  if (nav) nav.classList.toggle('open');
}

