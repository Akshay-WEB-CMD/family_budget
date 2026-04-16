import { state, saveState, Transaction } from './state';
import { formatCurrency, formatCurrencyDetailed } from './formatters';
import { updateCharts } from './charts';

// Toast Manager
export function showToast(message: string) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast?.classList.remove('show'), 3000);
}

// Navigation
export function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-links li');
  const screens = document.querySelectorAll('.screen');

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      screens.forEach(s => s.classList.remove('active-screen'));
      const targetId = link.getAttribute('data-target');
      if (targetId) {
        const target = document.getElementById(targetId);
        if (target) {
          target.classList.add('active-screen');
          animateScreenEntrance(target);
        }
      }
    });
  });

  const addTxShortcut = document.getElementById('add-tx-shortcut');
  addTxShortcut?.addEventListener('click', () => {
    (document.querySelector('[data-target="add-expense"]') as HTMLElement)?.click();
  });
}

function animateScreenEntrance(screen: HTMLElement) {
  const cards = screen.querySelectorAll<HTMLElement>('.glass-card, .level-container, .budget-item, .badge-card, .setup-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, i * 80);
  });
}

// CountUp Animation
export function initCountUp() {
  const elements = document.querySelectorAll<HTMLElement>('.count-up');
  elements.forEach(el => {
    const target = parseFloat(el.dataset.target || '0');
    animateValue(el, 0, target, 1500);
  });
}

function animateValue(el: HTMLElement, start: number, end: number, duration: number) {
  const range = end - start;
  const startTime = performance.now();
  const update = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + range * eased;
    el.textContent = formatCurrency(current);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// Aurora Parallax
export function initAuroraParallax() {
  const orbs = document.querySelectorAll<HTMLElement>('.orb');
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    orbs.forEach((orb, i) => {
      orb.style.transform = `translate(${x * (i+1)}px, ${y * (i+1)}px)`;
    });
  });
}

// Setup Manager
export function initSetupScreen(onUpdate: () => void) {
  const salaryInput = document.getElementById('setup-salary') as HTMLInputElement;
  const balanceInput = document.getElementById('setup-balance') as HTMLInputElement;
  const saveBtn = document.getElementById('save-setup-btn');

  // Fill current values
  if (salaryInput) salaryInput.value = state.userProfile.salary.toString();
  if (balanceInput) balanceInput.value = state.userProfile.initialBalance.toString();

  saveBtn?.addEventListener('click', () => {
    const salary = parseFloat(salaryInput.value);
    const balance = parseFloat(balanceInput.value);

    if (isNaN(salary) || isNaN(balance)) {
      showToast('Please enter valid numbers');
      return;
    }

    state.userProfile.salary = salary;
    state.userProfile.initialBalance = balance;
    saveState();
    showToast('Financial Profile Updated!');
    onUpdate();
    
    // Auto speed back to dashboard
    (document.querySelector('[data-target="dashboard"]') as HTMLElement)?.click();
  });
}
