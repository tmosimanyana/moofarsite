// moofar.js - parallax, scroll-triggered animations, forms (Netlify + function)
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rafThrottle(fn) {
    let running = false;
    return function (...args) {
      if (running) return;
      running = true;
      requestAnimationFrame(() => {
        fn.apply(this, args);
        running = false;
      });
    };
  }

  function updateParallax() {
    const offset = window.pageYOffset || document.documentElement.scrollTop;
    document.querySelectorAll('.parallax-layer').forEach(layer => {
      const speed = parseFloat(layer.dataset.speed) || 0.3;
      layer.style.transform = `translate3d(0, ${offset * speed}px, 0)`;
    });
  }

  function updateAboutSvg() {
    const svg = document.querySelector('#about-parallax .svg-wrapper svg');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = Math.min(Math.max((vh - rect.top) / (vh + rect.height), 0), 1);
    svg.style.transform = `translate3d(0, ${progress * 18}px, 0)`;
  }

  const animateEls = Array.from(document.querySelectorAll('[data-animate]'));
  function revealOnScroll() {
    const vh = window.innerHeight;
    animateEls.forEach(el => {
      if (el.classList.contains('in-view')) return;
      const rect = el.getBoundingClientRect();
      if (rect.top <= vh - 80) {
        el.classList.add('in-view');
      }
    });
  }

  function onScrollHandler() {
    if (!prefersReduced) {
      updateParallax();
      updateAboutSvg();
    }
    revealOnScroll();
  }

  const throttledScroll = rafThrottle(onScrollHandler);
  window.addEventListener('scroll', throttledScroll, { passive: true });
  window.addEventListener('resize', rafThrottle(onScrollHandler));

  document.addEventListener('DOMContentLoaded', () => {
    onScrollHandler();

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in-view');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.15 });

      document.querySelectorAll('[data-animate]').forEach(el => io.observe(el));
    } else {
      revealOnScroll();
    }

    // Quick homepage contact form
    const quickForm = document.getElementById('home-contact');
    if (quickForm) {
      quickForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thanks — we will contact you via the provided email.');
        quickForm.reset();
      });
    }

    // Contact form AJAX submit to Netlify Function
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Honeypot
        const botField = contactForm.querySelector('input[name="bot-field"]');
        if (botField && botField.value) {
          return;
        }

        const data = {
          name: contactForm.name.value.trim(),
          email: contactForm.email.value.trim(),
          message: contactForm.message.value.trim()
        };

        if (!data.name || !data.email || !data.message) {
          alert('Please fill all fields.');
          return;
        }

        try {
          const res = await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });

          if (!res.ok) {
            const error = await res.json().catch(()=>({}));
            console.error('Send error', error);
            alert('Sorry — something went wrong. Please try again later.');
            return;
          }

          // On success, navigate to success page (keeps Netlify Forms fallback for non-JS)
          window.location.href = '/success';
        } catch (err) {
          console.error(err);
          alert('Sorry — unable to send right now.');
        }
      });
    }

    // Menu toggle
    window.toggleMenu = function toggleMenu() {
      const btn = document.querySelector('.menu-btn');
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      document.body.classList.toggle('menu-open');
    };
  });
})();


