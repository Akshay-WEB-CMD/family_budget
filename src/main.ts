import './style.css';
import { state, loadState, saveState } from './modules/state';
import { formatCurrency } from './modules/formatters';
import { updateCharts } from './modules/charts';
import { 
  initNavigation, 
  initCountUp, 
  initAuroraParallax, 
  initSetupScreen,
  updateBudgetUI,
  initSimulator,
  initProfileSwitcher,
  checkParentalControls,
  showToast
} from './modules/ui';
import { 
  initAIAdvisor, 
  getPredictedBills 
} from './modules/ai';
import { 
  handleAddExpense, 
  refreshTransactionList 
} from './modules/transactions';

// --- State & UI Sync ---
function syncStateToUI() {
  const activeMember = state.members.find(m => m.id === state.activeMemberId);
  const isAdmin = activeMember ? (activeMember.role === 'father' || activeMember.role === 'mother') : true;

  // Set Mode Class
  document.body.classList.remove('admin-mode', 'child-mode');
  document.body.classList.add(isAdmin ? 'admin-mode' : 'child-mode');

  // Filter transactions based on role
  const filteredTransactions = isAdmin 
    ? state.transactions 
    : state.transactions.filter(tx => tx.memberId === state.activeMemberId);

  const totalExpenses = filteredTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const totalIncome = filteredTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  state.expenses = totalExpenses;
  // Admin sees full family balance, child sees... themselves?
  // Let's keep state.balance as total family balance but hide it from children.
  const familyTotalExpenses = state.transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const familyTotalIncome = state.transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  state.balance = state.userProfile.initialBalance + familyTotalIncome - familyTotalExpenses;

  // Update Counters
  const balanceEl = document.querySelector('[data-target="250000"]') as HTMLElement;
  if (balanceEl) {
    balanceEl.textContent = formatCurrency(state.balance);
    balanceEl.dataset.target = state.balance.toString();
  }

  const expenseEl = document.querySelector('[data-target="45000"]') as HTMLElement;
  const expenseLabel = document.getElementById('expenses-label');
  if (expenseEl) {
    expenseEl.textContent = formatCurrency(state.expenses);
    expenseEl.dataset.target = state.expenses.toString();
  }
  if (expenseLabel) {
    expenseLabel.textContent = isAdmin ? 'Total Expenses' : 'My Spending';
  }

  // Child Allowance Detail
  if (!isAdmin && activeMember && activeMember.spendingLimit) {
    const allowanceEl = document.getElementById('child-allowance-remaining');
    const limitEl = document.getElementById('allowance-spending-limit');
    const remaining = Math.max(0, activeMember.spendingLimit - state.expenses);
    if (allowanceEl) allowanceEl.textContent = formatCurrency(remaining);
    if (limitEl) limitEl.textContent = `Limit: ${formatCurrency(activeMember.spendingLimit)}`;
  }

  // Update Bill Predictions
  if (isAdmin) updateBillPredictions();
  
  // Refresh Lists and Charts
  checkParentalControls();
  refreshTransactionList(syncStateToUI);
  updateCharts();
  updateBudgetUI();
  
  if (isAdmin) {
    calculateHealthScore();
    updateAchievements();
  }
  
  // Update AI Credits
  const creditsEl = document.getElementById('credits-display');
  if (creditsEl) {
    creditsEl.innerHTML = `<i class="fa-solid fa-bolt"></i> ${state.aiCredits}`;
  }

  saveState();
}

function updateBillPredictions() {
  const container = document.getElementById('bill-predictions');
  if (!container) return;

  const predictedBills = getPredictedBills();
  const total = predictedBills.reduce((sum, b) => sum + b.amount, 0);
  const totalEl = document.getElementById('predicted-total');
  
  if (totalEl) totalEl.textContent = formatCurrency(total);

  container.innerHTML = predictedBills.map(bill => `
    <div class="bill-pill">
      <div class="bill-icon bg-${bill.category}">
        <i class="fa-solid ${bill.icon}"></i>
      </div>
      <div class="bill-info">
        <span class="bill-name">${bill.name}</span>
        <span class="bill-due">Due ${bill.dueDate}</span>
      </div>
      <div class="bill-right">
        <span class="bill-amount">${formatCurrency(bill.amount)}</span>
        <span class="bill-confidence">${bill.confidence}% sure</span>
      </div>
    </div>
  `).join('');
}

function calculateHealthScore() {
  let score = 75;
  
  // Ratio based on actual salary
  const monthlySalary = state.userProfile.salary || 1;
  const expenseRatio = state.expenses / monthlySalary;
  
  if (expenseRatio < 0.3) score += 15;
  else if (expenseRatio < 0.6) score += 5;
  else score -= 15;

  // Consistency check (bonus if transactions > 3)
  if (state.transactions.length > 5) score += 5;

  state.healthScore = Math.min(100, Math.max(0, score));
  
  const healthEl = document.querySelector('.score-text') as HTMLElement;
  if (healthEl) healthEl.textContent = `${state.healthScore} / 100`;
  
  const ring = document.querySelector('.ring-fill') as HTMLElement;
  if (ring) {
    const offset = 264 - (264 * (state.healthScore / 100));
    ring.style.strokeDashoffset = offset.toString();
  }
}

function updateAchievements() {
  const badgeCards = document.querySelectorAll('.badge-card');
  if (badgeCards.length < 2) return;
  
  // Hot Streak (e.g., > 5 transactions)
  if (state.transactions.length >= 5) {
    badgeCards[0].classList.add('unlocked');
  }

  // Super Saver (e.g., spending less than 50% of salary)
  const salary = state.userProfile.salary || 1;
  if (state.expenses > 0 && state.expenses < salary * 0.5) {
    badgeCards[1].classList.add('unlocked');
  }
  
  // Update XP dynamically
  const xpCount = document.querySelector('.level-info p');
  if (xpCount) {
    const xp = Math.min(3000, 1000 + (state.transactions.length * 100));
    xpCount.textContent = `${xp} / 3,000 XP to Level 5`;
    const progress = document.querySelector('.progress-fill.xp') as HTMLElement;
    if (progress) progress.style.width = `${(xp / 3000) * 100}%`;
  }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  
  initNavigation();
  initAuroraParallax();
  
  initProfileSwitcher(() => {
    syncStateToUI();
  });
  
  // Setup feature initialization
  initSetupScreen(() => {
    syncStateToUI();
  });

  // Transaction feature initialization
  handleAddExpense(() => {
    syncStateToUI();
  });

  // AI features
  initAIAdvisor();

  // Simulator
  initSimulator();

  // Initial Sync
  syncStateToUI();
  initCountUp(); 

  // Theme Toggle (Deep Dark Mode)
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    document.body.classList.toggle('oled-mode');
    showToast('Elite Dark Mode Toggled');
  });
});
