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

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = contactForm.querySelector('button');
    if (button) {
      button.textContent = 'Message Sent';
      button.disabled = true;
    }
  });
}
