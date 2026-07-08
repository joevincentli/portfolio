const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const revealItems = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealItems.forEach((item) => observer.observe(item));

const counters = document.querySelectorAll('.stat-value');
const countersObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = Number(el.getAttribute('data-target'));
      let count = 0;
      const duration = 1200;
      const stepTime = 20;
      const steps = Math.ceil(duration / stepTime);
      const increment = target / steps;

      const timer = setInterval(() => {
        count += increment;
        if (count >= target) {
          el.textContent = `${target}+`;
          clearInterval(timer);
        } else {
          el.textContent = `${Math.floor(count)}+`;
        }
      }, stepTime);

      obs.unobserve(el);
    });
  },
  { threshold: 0.7 }
);

counters.forEach((counter) => countersObserver.observe(counter));

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const form = document.querySelector('.contact-form');
const statusMessage = form?.querySelector('.form-status');

function sanitizeValue(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setStatus(type, message) {
  if (!statusMessage) return;

  statusMessage.textContent = message;
  statusMessage.className = `form-status ${type === 'success' ? 'is-success' : type === 'error' ? 'is-error' : 'is-loading'}`;
  statusMessage.setAttribute('aria-hidden', 'false');
}

function clearStatus() {
  if (!statusMessage) return;

  statusMessage.textContent = '';
  statusMessage.className = 'form-status';
  statusMessage.setAttribute('aria-hidden', 'true');
}

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const buttonText = submitButton?.querySelector('.button-text');
    const formData = new FormData(form);

    const name = sanitizeValue(formData.get('name'));
    const email = sanitizeValue(formData.get('email'));
    const project = sanitizeValue(formData.get('project'));
    const message = sanitizeValue(formData.get('message'));

    if (!name || !email || !message) {
      setStatus('error', 'Please provide your name, email, and message.');
      return;
    }

    if (!isValidEmail(email)) {
      setStatus('error', 'Please enter a valid email address.');
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.classList.add('is-loading');
    }

    if (buttonText) {
      buttonText.textContent = 'Sending...';
    }

    setStatus('loading', 'Sending your inquiry...');

    try {
      const response = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          subject: 'New Portfolio Inquiry',
          company: '',
          projectType: project,
          budget: '',
          timeline: '',
          message
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Unable to send your inquiry. Please try again later.');
      }

      setStatus('success', '✓ Thank you! Your inquiry has been sent successfully. I\'ll respond within 24 hours.');
      form.reset();
    } catch (error) {
      setStatus('error', error.message || 'Unable to send your inquiry. Please try again later.');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.classList.remove('is-loading');
      }

      if (buttonText) {
        buttonText.textContent = 'Send Message';
      }
    }
  });
}


