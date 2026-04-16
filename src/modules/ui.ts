import { state, saveState } from './state';
import { formatCurrency } from './formatters';
import { parseSetupVoiceCommand } from './ai';

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
  const cards = screen.querySelectorAll<HTMLElement>('.glass-card, .level-container, .budget-item, .badge-card, .setup-card, .stat-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px) scale(0.98)';
    card.style.filter = 'blur(10px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0) scale(1)';
      card.style.filter = 'blur(0)';
    }, i * 100);
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

export function updateBudgetUI() {
  const budgetList = document.querySelector('.budget-list');
  if (!budgetList) return;

  const activeMember = state.members.find(m => m.id === state.activeMemberId);
  const isAdmin = activeMember ? (activeMember.role === 'father' || activeMember.role === 'mother') : true;

  const filtered = isAdmin 
    ? state.transactions 
    : state.transactions.filter(tx => tx.memberId === state.activeMemberId);

  const categories = ['food', 'housing', 'transport', 'entertainment', 'health', 'shopping'];
  const targets: Record<string, number> = isAdmin ? {
    food: 6000, housing: 30000, transport: 8000, 
    entertainment: 5000, health: 4000, shopping: 7000
  } : {
    // Child's specific budget view
    food: 1000, transport: 500, entertainment: 2000, shopping: 1500
  };

  const icons: Record<string, string> = {
    food: 'fa-utensils', housing: 'fa-house', transport: 'fa-car',
    entertainment: 'fa-film', health: 'fa-heart-pulse', shopping: 'fa-bag-shopping'
  };

  budgetList.innerHTML = categories.filter(c => targets[c]).map(cat => {
    const spent = filtered.filter(tx => tx.category === cat).reduce((s, tx) => s + tx.amount, 0);
    const target = targets[cat];
    const percent = Math.min(100, Math.round((spent / target) * 100));
    const statusClass = percent > 90 ? 'danger' : percent > 70 ? 'warning' : 'good';
    
    return `
      <div class="glass-card budget-item">
        <div class="budget-header">
          <div class="budget-title"><div class="t-icon bg-${cat}"><i class="fa-solid ${icons[cat]}"></i></div> ${cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
          <div class="budget-amounts"><span>${formatCurrency(spent)}</span> / ${formatCurrency(target)}</div>
        </div>
        <div class="progress-bar"><div class="progress-fill ${statusClass}" style="width: ${percent}%"></div></div>
        <p class="budget-status">${percent}% of budget used</p>
      </div>
    `;
  }).join('');
}

export function initSimulator() {
  const slider = document.getElementById('savings-slider') as HTMLInputElement;
  const simVal = document.getElementById('slider-val');
  const simSavings = document.getElementById('sim-savings');

  if (!slider || !simVal || !simSavings) return;

  const update = () => {
    const val = parseInt(slider.value);
    simVal.textContent = `${val}% Decrease`;
    
    // Calculate potential yearly savings based on 20% of 
    // current food/ent spend being reduced
    const monthlySpend = state.expenses || 45000; 
    const potentialMonthly = (monthlySpend * (val / 100));
    const yearly = potentialMonthly * 12;
    
    simSavings.textContent = `+${formatCurrency(yearly)}`;
  };

  slider.addEventListener('input', update);
  update();
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

// Aurora Nebula Parallax
export function initAuroraParallax() {
  const orbs = document.querySelectorAll<HTMLElement>('.orb');
  const ambient = document.querySelector<HTMLElement>('.ambient-bg');
  
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5);
    const y = (e.clientY / window.innerHeight - 0.5);
    
    orbs.forEach((orb, i) => {
      // Different speeds for different layers
      const factor = (i + 1) * 25;
      orb.style.transform = `translate(${x * factor}px, ${y * factor}px) scale(${1 + (x * 0.05)})`;
    });

    if (ambient) {
      ambient.style.perspective = '1000px';
    }
  });
}

// Setup Manager
export function initSetupScreen(onUpdate: () => void) {
  const smartInput = document.getElementById('setup-smart-input') as HTMLInputElement;
  const voiceBtn = document.getElementById('setup-voice-btn');
  const salaryInput = document.getElementById('setup-salary') as HTMLInputElement;
  const rentInput = document.getElementById('setup-rent') as HTMLInputElement;
  const emiInput = document.getElementById('setup-emi') as HTMLInputElement;
  const outingsInput = document.getElementById('setup-outings') as HTMLInputElement;
  const balanceInput = document.getElementById('setup-balance') as HTMLInputElement;
  const targetSavingsEl = document.getElementById('setup-target-savings');
  const saveBtn = document.getElementById('save-setup-btn');

  if (!smartInput || !targetSavingsEl) return;

  // Fill current preview values
  const refreshPreviews = () => {
    if (salaryInput) salaryInput.value = (state.userProfile.salary || 0).toString();
    if (rentInput) rentInput.value = (state.userProfile.rent || 0).toString();
    if (emiInput) emiInput.value = (state.userProfile.emi || 0).toString();
    if (outingsInput) outingsInput.value = (state.userProfile.outings || 0).toString();
    if (balanceInput) balanceInput.value = (state.userProfile.initialBalance || 0).toString();
    calculateTargetSavings();
  };

  const calculateTargetSavings = () => {
    const sal = parseFloat(salaryInput?.value || '0') || 0;
    const r = parseFloat(rentInput?.value || '0') || 0;
    const e = parseFloat(emiInput?.value || '0') || 0;
    const o = parseFloat(outingsInput?.value || '0') || 0;
    if (targetSavingsEl) {
      targetSavingsEl.textContent = formatCurrency(sal - (r + e + o));
    }
  };

  refreshPreviews();

  const processInput = async (text: string) => {
    if (!text.trim()) return;
    showToast('Finley is extracting numbers...');
    
    try {
      const result = await parseSetupVoiceCommand(text);
      
      if (result.salary !== undefined) state.userProfile.salary = result.salary;
      if (result.rent !== undefined) state.userProfile.rent = result.rent;
      if (result.emi !== undefined) state.userProfile.emi = result.emi;
      if (result.outings !== undefined) state.userProfile.outings = result.outings;
      if (result.balance !== undefined) state.userProfile.initialBalance = result.balance;

      refreshPreviews();
      showToast('Profile updated by AI!');
      smartInput.value = '';
    } catch (err) {
      showToast('AI extraction failed. Please try again or type clearly.');
    }
  };

  smartInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') processInput(smartInput.value);
  });

  // Unified Voice Button
  voiceBtn?.addEventListener('click', () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice recognition not supported.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    const originalHtml = voiceBtn.innerHTML;
    voiceBtn.innerHTML = '<i class="fa-solid fa-microphone-lines fa-fade" style="color:var(--c-danger);"></i>';
    voiceBtn.classList.add('recording');

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      smartInput.value = transcript;
      processInput(transcript);
      voiceBtn.innerHTML = originalHtml;
      voiceBtn.classList.remove('recording');
    };

    recognition.onerror = () => {
      voiceBtn.innerHTML = originalHtml;
      voiceBtn.classList.remove('recording');
      showToast('Voice input failed.');
    };

    recognition.start();
  });

  saveBtn?.addEventListener('click', () => {
    saveState();
    showToast('Financial Profile Finalized!');
    onUpdate();
    (document.querySelector('[data-target="dashboard"]') as HTMLElement)?.click();
  });
}

// Profile Switcher & Parental Controls
export function initProfileSwitcher(onUpdate: () => void) {
  const profileSwitcher = document.getElementById('profile-switcher') as HTMLSelectElement;
  const expenseMember = document.getElementById('expense-member') as HTMLSelectElement;
  const pinModal = document.getElementById('pin-modal') as HTMLElement;
  const pinInput = document.getElementById('pin-input') as HTMLInputElement;
  const pinSubmit = document.getElementById('pin-submit');
  const pinCancel = document.getElementById('pin-cancel');
  
  let previousMemberId = state.activeMemberId;
  let pendingMemberId = state.activeMemberId;

  const performSwitch = (memberId: string) => {
    state.activeMemberId = memberId;
    previousMemberId = memberId;
    saveState();
    if (expenseMember) expenseMember.value = state.activeMemberId;
    showToast(`Switched profile to ${state.members.find(m => m.id === state.activeMemberId)?.name}`);
    onUpdate();
  };

  const closePinModal = () => {
    if(pinModal) pinModal.style.display = 'none';
    if(pinInput) pinInput.value = '';
  };

  if (profileSwitcher) {
    profileSwitcher.innerHTML = state.members.map(m => 
      `<option value="${m.id}" ${state.activeMemberId === m.id ? 'selected' : ''}>${m.name} (${m.role})</option>`
    ).join('');

    profileSwitcher.addEventListener('change', (e) => {
      pendingMemberId = (e.target as HTMLSelectElement).value;
      const targetMember = state.members.find(m => m.id === pendingMemberId);
      
      if (targetMember && (targetMember.role === 'father' || targetMember.role === 'mother')) {
        pinModal.style.display = 'flex';
        pinInput.focus();
      } else {
        performSwitch(pendingMemberId);
      }
    });
  }

  pinSubmit?.addEventListener('click', () => {
    if (pinInput.value === 'admin123') {
      closePinModal();
      performSwitch(pendingMemberId);
    } else {
      showToast('Incorrect PIN');
      profileSwitcher.value = previousMemberId;
    }
  });

  pinCancel?.addEventListener('click', () => {
    closePinModal();
    profileSwitcher.value = previousMemberId;
  });

  const updateExpenseMemberDropdown = () => {
    if (expenseMember) {
      const activeMember = state.members.find(m => m.id === state.activeMemberId);
      const isAdmin = activeMember ? (activeMember.role === 'father' || activeMember.role === 'mother') : true;
      
      const membersToShow = isAdmin ? state.members : state.members.filter(m => m.id === state.activeMemberId);
      
      expenseMember.innerHTML = membersToShow.map(m => 
        `<option value="${m.id}" ${state.activeMemberId === m.id ? 'selected' : ''}>${m.name}</option>`
      ).join('');
    }
  };

  updateExpenseMemberDropdown();
}

export function checkParentalControls() {
  const warningDiv = document.getElementById('parental-warning');
  const warningText = document.getElementById('parental-warning-text');
  if (!warningDiv || !warningText) return;

  const activeMember = state.members.find(m => m.id === state.activeMemberId);
  
  if (activeMember && activeMember.role === 'child' && activeMember.spendingLimit !== undefined) {
    const spent = state.transactions
      .filter(tx => tx.memberId === activeMember.id && tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    if (spent > activeMember.spendingLimit) {
      warningText.textContent = `${activeMember.name} has exceeded the monthly spending limit of ${formatCurrency(activeMember.spendingLimit)}. Current spend: ${formatCurrency(spent)}.`;
      warningDiv.style.display = 'block';
      return;
    }
  }
  
  warningDiv.style.display = 'none';
}
