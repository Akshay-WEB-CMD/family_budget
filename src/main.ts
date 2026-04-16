import './style.css';
import { state, loadState, saveState, Transaction } from './modules/state';
import { formatCurrency } from './modules/formatters';
import { updateCharts } from './modules/charts';
import { 
  initNavigation, 
  initCountUp, 
  initAuroraParallax, 
  initSetupScreen, 
  showToast 
} from './modules/ui';
import { 
  getAIResponse, 
  initAIAdvisor, 
  getPredictedBills 
} from './modules/ai';
import { 
  handleAddExpense, 
  refreshTransactionList 
} from './modules/transactions';

// --- State & UI Sync ---
function syncStateToUI() {
  const totalExpenses = state.transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const totalIncome = state.transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  state.expenses = totalExpenses;
  // Balance = Initial Balance (from setup) + Income - Expenses
  state.balance = state.userProfile.initialBalance + totalIncome - totalExpenses;

  // Update Counters
  const balanceEl = document.querySelector('[data-target="250000"]') as HTMLElement;
  if (balanceEl) {
    balanceEl.textContent = formatCurrency(state.balance);
    balanceEl.dataset.target = state.balance.toString();
  }

  const expenseEl = document.querySelector('[data-target="45000"]') as HTMLElement;
  if (expenseEl) {
    expenseEl.textContent = formatCurrency(state.expenses);
    expenseEl.dataset.target = state.expenses.toString();
  }

  // Update Bill Predictions
  updateBillPredictions();
  
  // Refresh Lists and Charts
  refreshTransactionList(syncStateToUI);
  updateCharts();
  calculateHealthScore();
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

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  
  initNavigation();
  initAuroraParallax();
  
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

  // Initial Sync
  syncStateToUI();
  initCountUp(); // Start animations after first sync
});
