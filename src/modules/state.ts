export interface Transaction {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
  type: 'expense' | 'income';
}

export interface UserProfile {
  salary: number;
  initialBalance: number;
}

export interface AppState {
  transactions: Transaction[];
  userProfile: UserProfile;
  selectedCategory: string;
  healthScore: number;
  balance: number;
  expenses: number;
}

export const state: AppState = {
  transactions: [],
  userProfile: {
    salary: 75000, // Default in INR
    initialBalance: 250000, 
  },
  selectedCategory: 'food',
  healthScore: 85,
  balance: 0,
  expenses: 0,
};

export const saveState = () => {
  localStorage.setItem('family_finance_state_v2', JSON.stringify(state));
};

export const loadState = () => {
  const saved = localStorage.getItem('family_finance_state_v2');
  if (saved) {
    const parsed = JSON.parse(saved);
    Object.assign(state, parsed);
  }
};

export const addTransaction = (tx: Omit<Transaction, 'id' | 'date'>) => {
  const newTx: Transaction = {
    ...tx,
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
  };
  state.transactions.push(newTx);
  saveState();
  return newTx;
};

export const deleteTransaction = (id: string) => {
  state.transactions = state.transactions.filter(tx => tx.id !== id);
  saveState();
};

export const updateProfile = (profile: Partial<UserProfile>) => {
  state.userProfile = { ...state.userProfile, ...profile };
  saveState();
};
