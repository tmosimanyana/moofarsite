/**
 * moofar-main.js
 * Modular, maintainable JavaScript for Moofar website
 */

/* ==================== CONFIGURATION ==================== */
const CONFIG = {
  selectors: {
    menuToggle: '#menuToggle',
    navLinks: '#primaryNav',
    navbar: '#navbar',
    contactForm: '#contactForm',
    submitBtn: '#submitBtn',
    skipLink: '.skip-link',
  },
  scrollThreshold: 80,
  animationDuration: 300,
};

/* ==================== UTILITIES ==================== */
const Utils = {
  /**
   * Safely query a DOM element
   */
  getElement(selector) {
    return document.querySelector(selector);
  },

  /**
   * Add event listener with error handling
   */
  addListener(element, event, handler, options = {}) {
    if (!element) return;
    element.addEventListener(event, handler, options);
  },

  /**
   * Debounce function for performance
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Request animation frame wrapper
   */
  rafThrottle(callback) {
    let ticking = false;
    return function(...args) {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          callback.apply(this, args);
          ticking = false;
        });
        ticking = true;
      }
    };
  },
};

/* ==================== NAVIGATION MODULE ==================== */
const NavigationModule = {
  init() {
    this.toggle = Utils.getElement(CONFIG.selectors.menuToggle);
    this.nav = Utils.getElement(CONFIG.selectors.navLinks);
    
    if (!this.toggle || !this.nav) return;

    this.bindEvents();
  },

  bindEvents() {
    // Toggle menu on button click
    Utils.addListener(this.toggle, 'click', () => this.toggleMenu());

    // Close menu when clicking outside
    Utils.addListener(document, 'click', (e) => this.handleOutsideClick(e));

    // Close menu on Escape key
    Utils.addListener(document, 'keydown', (e) => this.handleEscapeKey(e));

    // Close menu when clicking nav links (mobile)
    const navLinks = this.nav.querySelectorAll('a');
    navLinks.forEach(link => {
      Utils.addListener(link, 'click', () => {
        if (window.innerWidth <= 768) {
          this.setMenuState(false);
        }
      });
    });
  },

  toggleMenu() {
    const isExpanded = this.toggle.getAttribute('aria-expanded') === 'true';
    this.setMenuState(!isExpanded);
  },

  setMenuState(isOpen) {
    this.toggle.setAttribute('aria-expanded', String(isOpen));
    this.nav.classList.toggle('active', isOpen);
    
    // Manage focus
    if (isOpen) {
      // Focus first nav link
      const firstLink = this.nav.querySelector('a');
      if (firstLink) firstLink.focus();
    } else {
      // Return focus to toggle button
      this.toggle.focus();
    }

    // Prevent body scroll when menu is open on mobile
    if (window.innerWidth <= 768) {
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
  },

  handleOutsideClick(e) {
    if (!this.nav.classList.contains('active')) return;
    if (this.nav.contains(e.target) || this.toggle.contains(e.target)) return;
    this.setMenuState(false);
  },

  handleEscapeKey(e) {
    if (e.key === 'Escape' && this.nav.classList.contains('active')) {
      this.setMenuState(false);
    }
  },
};

/* ==================== SCROLL EFFECTS MODULE ==================== */
const ScrollEffectsModule = {
  init() {
    this.navbar = Utils.getElement(CONFIG.selectors.navbar);
    if (!this.navbar) return;

    this.handleScroll = Utils.rafThrottle(() => this.updateNavbar());
    Utils.addListener(window, 'scroll', this.handleScroll, { passive: true });
    
    // Initial check
    this.updateNavbar();
  },

  updateNavbar() {
    const scrolled = window.scrollY > CONFIG.scrollThreshold;
    this.navbar.classList.toggle('scrolled', scrolled);
  },
};

/* ==================== FORM HANDLER MODULE ==================== */
const FormHandlerModule = {
  init() {
    this.form = Utils.getElement(CONFIG.selectors.contactForm);
    if (!this.form) return;

    this.submitBtn = this.form.querySelector(CONFIG.selectors.submitBtn);
    this.fields = {
      name: this.form.querySelector('#name'),
      email: this.form.querySelector('#email'),
      phone: this.form.querySelector('#phone'),
      message: this.form.querySelector('#message'),
    };

    this.bindEvents();
  },

  bindEvents() {
    Utils.addListener(this.form, 'submit', (e) => this.handleSubmit(e));

    // Real-time validation
    Object.entries(this.fields).forEach(([key, field]) => {
      if (!field) return;
      Utils.addListener(field, 'blur', () => this.validateField(key, field));
      Utils.addListener(field, 'input', () => this.clearError(key));
    });
  },

  validateField(fieldName, field) {
    const errorDiv = document.querySelector(`#${fieldName}-error`);
    if (!errorDiv) return true;

    let errorMessage = '';

    // Check if required field is empty
    if (field.hasAttribute('required') && !field.value.trim()) {
      errorMessage = `${this.getFieldLabel(fieldName)} is required.`;
    }
    // Validate email format
    else if (fieldName === 'email' && field.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value.trim())) {
        errorMessage = 'Please enter a valid email address.';
      }
    }

    if (errorMessage) {
      this.showError(fieldName, errorMessage);
      field.setAttribute('aria-invalid', 'true');
      return false;
    }

    field.setAttribute('aria-invalid', 'false');
    return true;
  },

  validateAllFields() {
    let isValid = true;
    Object.entries(this.fields).forEach(([key, field]) => {
      if (field && field.hasAttribute('required')) {
        if (!this.validateField(key, field)) {
          isValid = false;
        }
      }
    });
    return isValid;
  },

  showError(fieldName, message) {
    const errorDiv = document.querySelector(`#${fieldName}-error`);
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
  },

  clearError(fieldName) {
    const errorDiv = document.querySelector(`#${fieldName}-error`);
    if (errorDiv) {
      errorDiv.textContent = '';
      errorDiv.style.display = 'none';
    }
  },

  getFieldLabel(fieldName) {
    const labels = {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      message: 'Message',
    };
    return labels[fieldName] || fieldName;
  },

  async handleSubmit(e) {
    e.preventDefault();

    // Validate all fields
    if (!this.validateAllFields()) {
      // Focus first invalid field
      const firstInvalid = this.form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Disable submit button
    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.dataset.originalText = this.submitBtn.textContent;
      this.submitBtn.textContent = 'Sending...';
      this.submitBtn.setAttribute('aria-busy', 'true');
    }

    // Collect form data
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData.entries());

    try {
      // Attempt to send via Netlify function
      const response = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        this.showSuccessMessage();
        this.form.reset();
      } else {
        throw new Error('Server returned an error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      this.showErrorMessage();
    } finally {
      this.resetSubmitButton();
    }
  },

  showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.textContent = '✓ Message sent successfully! We\'ll get back to you soon.';
    message.style.cssText = `
      background: #d4edda;
      color: #155724;
      padding: 1rem;
      border-radius: 0.25rem;
      margin-bottom: 1rem;
      border: 1px solid #c3e6cb;
    `;
    message.setAttribute('role', 'status');
    message.setAttribute('aria-live', 'polite');
    
    this.form.insertAdjacentElement('beforebegin', message);
    
    setTimeout(() => message.remove(), 5000);
  },

  showErrorMessage() {
    alert('Sorry, there was an error sending your message. Please try again or contact us directly via email.');
  },

  resetSubmitButton() {
    if (this.submitBtn) {
      this.submitBtn.disabled = false;
      this.submitBtn.textContent = this.submitBtn.dataset.originalText || 'Send Message';
      this.submitBtn.removeAttribute('aria-busy');
    }
  },
};

/* ==================== ACCESSIBILITY MODULE ==================== */
const AccessibilityModule = {
  init() {
    this.initSkipLink();
    this.initFocusManagement();
  },

  initSkipLink() {
    const skipLink = Utils.getElement(CONFIG.selectors.skipLink);
    if (!skipLink) return;

    Utils.addListener(skipLink, 'click', (e) => {
      e.preventDefault();
      const targetId = skipLink.getAttribute('href');
      const target = document.querySelector(targetId);
      
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus();
        
        // Smooth scroll to target
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Remove tabindex after focus
        setTimeout(() => target.removeAttribute('tabindex'), 1000);
      }
    });
  },

  initFocusManagement() {
    // Highlight focus for keyboard users
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-nav');
    });
  },
};

/* ==================== PERFORMANCE MODULE ==================== */
const PerformanceModule = {
  init() {
    this.lazyLoadImages();
    this.prefetchLinks();
  },

  lazyLoadImages() {
    // Native lazy loading is already in HTML (loading="lazy")
    // This is a fallback for older browsers
    if ('IntersectionObserver' in window) {
      const images = document.querySelectorAll('img[loading="lazy"]');
      
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    }
  },

  prefetchLinks() {
    // Prefetch navigation links on hover for faster page loads
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
      Utils.addListener(link, 'mouseenter', () => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#')) {
          const prefetchLink = document.createElement('link');
          prefetchLink.rel = 'prefetch';
          prefetchLink.href = href;
          document.head.appendChild(prefetchLink);
        }
      }, { once: true });
    });
  },
};

/* ==================== INITIALIZATION ==================== */
const App = {
  init() {
    // Initialize all modules
    NavigationModule.init();
    ScrollEffectsModule.init();
    FormHandlerModule.init();
    AccessibilityModule.init();
    PerformanceModule.init();

    console.log('🌿 Moofar website initialized');
  },
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}