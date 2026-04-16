export interface Transaction {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
  type: 'expense' | 'income';
  memberId: string;
}

export interface UserProfile {
  salary: number;
  initialBalance: number;
  rent: number;
  emi: number;
  outings: number;
  primaryApiKey: string;
  secondaryApiKey: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: 'father' | 'mother' | 'child';
  spendingLimit?: number; // For children
}

export interface AppState {
  transactions: Transaction[];
  userProfile: UserProfile;
  members: FamilyMember[];
  activeMemberId: string;
  selectedCategory: string;
  healthScore: number;
  balance: number;
  expenses: number;
  aiCredits: number;
  theme: 'dark' | 'light' | 'oled';
}

export const state: AppState = {
  transactions: [],
  userProfile: {
    salary: 75000, // Default in INR
    initialBalance: 250000,
    rent: 20000,
    emi: 5000,
    outings: 4000,
    primaryApiKey: process.env.VITE_PRIMARY_API_KEY || '',
    secondaryApiKey: process.env.VITE_SECONDARY_API_KEY || ''
  },
  members: [
    { id: '1', name: 'Dad', role: 'father' },
    { id: '2', name: 'Mom', role: 'mother' },
    { id: '3', name: 'Kids', role: 'child', spendingLimit: 5000 }
  ],
  activeMemberId: '1',
  selectedCategory: 'food',
  healthScore: 85,
  balance: 0,
  expenses: 0,
  aiCredits: 5,
  theme: 'dark'
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
  
  // Refresh credits on page load (starts at 5)
  state.aiCredits = 5;
  saveState();
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
