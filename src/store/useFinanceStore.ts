import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  spendingLimit?: number;
}

interface FinanceState {
  transactions: Transaction[];
  userProfile: UserProfile;
  members: FamilyMember[];
  activeMemberId: string;
  selectedCategory: string;
  healthScore: number;
  balance: number;
  expenses: number;
  aiCredits: number;
  lastCreditRefreshDate: string;
  theme: 'dark' | 'light' | 'oled';
  
  // Actions
  checkAndRefreshCredits: () => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
  deleteTransaction: (id: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  setActiveMember: (id: string) => void;
  setSelectedCategory: (cat: string) => void;
  setTheme: (theme: 'dark' | 'light' | 'oled') => void;
  useAiCredit: () => boolean;
  calculateOverallStats: () => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      userProfile: {
        salary: 75000,
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
      balance: 250000,
      expenses: 0,
      aiCredits: 10,
      lastCreditRefreshDate: new Date().toDateString(),
      theme: 'oled',

      addTransaction: (tx) => {
        const newTx: Transaction = {
          ...tx,
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
        };
        set((state) => ({
          transactions: [newTx, ...state.transactions],
        }));
        get().calculateOverallStats();
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        }));
        get().calculateOverallStats();
      },

      updateProfile: (profile) => {
        set((state) => ({
          userProfile: { ...state.userProfile, ...profile },
        }));
        get().calculateOverallStats();
      },

      setActiveMember: (id) => set({ activeMemberId: id }),
      
      setSelectedCategory: (cat) => set({ selectedCategory: cat }),
      
      setTheme: (theme) => set({ theme }),

      checkAndRefreshCredits: () => {
        const today = new Date().toDateString();
        if (get().lastCreditRefreshDate !== today) {
          set({ aiCredits: 10, lastCreditRefreshDate: today });
        }
      },

      useAiCredit: () => {
        const currentCredits = get().aiCredits;
        if (currentCredits > 0) {
          set({ aiCredits: currentCredits - 1 });
          return true;
        }
        return false;
      },

      calculateOverallStats: () => {
        const { transactions, userProfile, activeMemberId, members } = get();
        const activeMember = members.find(m => m.id === activeMemberId);
        const isAdmin = activeMember?.role === 'father' || activeMember?.role === 'mother';

        // Filter transactions for specific view
        const displayTransactions = isAdmin 
          ? transactions 
          : transactions.filter(tx => tx.memberId === activeMemberId);

        const totalExpenses = displayTransactions
          .filter(tx => tx.type === 'expense')
          .reduce((sum, tx) => sum + tx.amount, 0);

        const familyTotalExpenses = transactions
          .filter(tx => tx.type === 'expense')
          .reduce((sum, tx) => sum + tx.amount, 0);
        
        const familyTotalIncome = transactions
          .filter(tx => tx.type === 'income')
          .reduce((sum, tx) => sum + tx.amount, 0);

        const currentBalance = userProfile.initialBalance + familyTotalIncome - familyTotalExpenses;

        // Simple Health Score logic
        let score = 75;
        const monthlySalary = userProfile.salary || 1;
        const expenseRatio = totalExpenses / monthlySalary;
        if (expenseRatio < 0.3) score += 15;
        else if (expenseRatio < 0.6) score += 5;
        else score -= 15;
        if (transactions.length > 5) score += 5;

        set({
          balance: currentBalance,
          expenses: totalExpenses,
          healthScore: Math.min(100, Math.max(0, score))
        });
      }
    }),
    {
      name: 'family-finance-storage',
    }
  )
);
