import { state, addTransaction, deleteTransaction } from './state';
import { formatCurrency, formatCurrencyDetailed, formatDate } from './formatters';
import { predictCategory } from './ai';
import { showToast } from './ui';

export function handleAddExpense(onUpdate: () => void) {
  const catOptions = document.querySelectorAll('.cat-option');
  const amountInput = document.getElementById('expense-amount') as HTMLInputElement;
  const noteInput = document.getElementById('expense-note') as HTMLInputElement;
  const aiPill = document.getElementById('ai-suggest-pill');
  const aiText = document.getElementById('ai-suggest-text');
  const addBtn = document.getElementById('add-expense-btn');

  catOptions.forEach(cat => {
    cat.addEventListener('click', () => {
      catOptions.forEach(c => c.classList.remove('active'));
      cat.classList.add('active');
      state.selectedCategory = cat.getAttribute('data-cat') || 'food';
    });
  });

  noteInput?.addEventListener('input', () => {
    const prediction = predictCategory(noteInput.value);
    if (prediction && aiPill && aiText) {
      aiText.textContent = `Finley suggests: ${prediction.charAt(0).toUpperCase() + prediction.slice(1)}`;
      aiPill.style.display = 'flex';
      aiPill.onclick = () => {
        catOptions.forEach(c => c.classList.remove('active'));
        document.querySelector(`[data-cat="${prediction}"]`)?.classList.add('active');
        state.selectedCategory = prediction;
        aiPill.style.display = 'none';
      };
    } else if (aiPill) {
      aiPill.style.display = 'none';
    }
  });

  addBtn?.addEventListener('click', () => {
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) return;
    
    addTransaction({
      amount,
      category: state.selectedCategory,
      note: noteInput.value || state.selectedCategory,
      type: 'expense'
    });

    amountInput.value = '';
    noteInput.value = '';
    showToast('Expense added successfully!');
    onUpdate();
    
    // Switch to dashboard
    (document.querySelector('[data-target="dashboard"]') as HTMLElement)?.click();
  });
}

export function refreshTransactionList(onUpdate: () => void) {
  const list = document.getElementById('transaction-list');
  if (!list) return;
  list.innerHTML = '';
  
  const displayList = [...state.transactions].reverse().slice(0, 6);
  
  const icons: Record<string, string> = {
    food: 'fa-utensils', housing: 'fa-house', transport: 'fa-car',
    entertainment: 'fa-film', health: 'fa-heart-pulse', shopping: 'fa-bag-shopping', income: 'fa-briefcase',
  };

  displayList.forEach(tx => {
    const li = document.createElement('li');
    li.className = 'transaction-item';
    li.innerHTML = `
      <div class="t-info">
        <div class="t-icon bg-${tx.category}"><i class="fa-solid ${icons[tx.category] || 'fa-receipt'}"></i></div>
        <div>
          <span class="t-title">${tx.note || tx.category}</span>
          <span class="t-date">${formatDate(tx.date)}</span>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap: 15px;">
        <span class="t-amount ${tx.type === 'income' ? 'positive' : 'negative'}">
          ${tx.type === 'income' ? '+' : '-'}${formatCurrencyDetailed(tx.amount)}
        </span>
        <button class="delete-btn" data-id="${tx.id}" style="background:none; border:none; color: var(--text-muted); cursor:pointer; font-size: 0.8rem; opacity: 0; transition: opacity 0.2s;">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;

    li.addEventListener('mouseenter', () => (li.querySelector('.delete-btn') as HTMLElement).style.opacity = '1');
    li.addEventListener('mouseleave', () => (li.querySelector('.delete-btn') as HTMLElement).style.opacity = '0');

    li.querySelector('.delete-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTransaction(tx.id);
      showToast('Transaction removed');
      onUpdate();
    });

    list.appendChild(li);
  });
  
  if (displayList.length === 0) {
    list.innerHTML = `<div class="empty-state" style="text-align:center; padding: 40px; color: var(--text-muted);">
      <i class="fa-solid fa-receipt" style="font-size: 3rem; margin-bottom: 15px; display:block; opacity: 0.3;"></i>
      No transactions recorded for ₹ yet.
    </div>`;
  }
}
