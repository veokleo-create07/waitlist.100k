const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const form = document.querySelector('#waitlist-form');
const input = document.querySelector('#email');
const button = document.querySelector('#submit-button');
const title = document.querySelector('#waitlist-title');
const message = document.querySelector('#waitlist-message');
const status = document.querySelector('#form-status');

function closeMenu() {
  navLinks.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
}

menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!input.checkValidity()) {
    status.textContent = 'Please enter a valid email address.';
    status.className = 'form-status error';
    input.focus();
    return;
  }
  button.disabled = true;
  button.textContent = 'Joining…';
  status.textContent = '';
  window.setTimeout(() => {
    title.textContent = 'You’re on the list.';
    message.textContent = 'We’ll let you know when Clonao is ready.';
    input.remove();
    button.remove();
    status.textContent = 'Thanks for signing up.';
    status.className = 'form-status';
  }, 650);
});
