import { state, Transaction } from './state';
import { formatCurrency } from './formatters';

const categoryKeywords: Record<string, string[]> = {
  food: ['lunch', 'dinner', 'breakfast', 'cafe', 'coffee', 'restaurant', 'pizza', 'burger', 'grocery', 'groceries', 'snack', 'meal', 'food', 'eat', 'sushi', 'takeout', 'swiggy', 'zomato'],
  housing: ['rent', 'mortgage', 'electricity', 'water', 'gas', 'internet', 'wifi', 'repair', 'plumber', 'furniture', 'home', 'bescom', 'eb bill'],
  transport: ['gas', 'uber', 'lyft', 'taxi', 'bus', 'train', 'metro', 'parking', 'car', 'fuel', 'toll', 'flight', 'petrol', 'diesel', 'ola'],
  entertainment: ['netflix', 'spotify', 'movie', 'cinema', 'game', 'play', 'concert', 'ticket', 'show', 'subscription', 'streaming', 'pvr', 'hotstar'],
  health: ['doctor', 'hospital', 'pharmacy', 'medicine', 'gym', 'fitness', 'dentist', 'medical', 'health', 'therapy', 'apollo'],
  shopping: ['amazon', 'clothes', 'shoes', 'mall', 'online', 'order', 'purchase', 'buy', 'shop', 'fashion', 'flipkart', 'myntra'],
};

export function predictCategory(note: string): string | null {
  const lower = note.toLowerCase();
  let bestMatch: string | null = null;
  let bestScore = 0;
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = cat;
    }
  }
  return bestScore > 0 ? bestMatch : null;
}

export interface PredictedBill {
  name: string;
  amount: number;
  dueDate: string;
  icon: string;
  category: string;
  confidence: number;
}

export function getPredictedBills(): PredictedBill[] {
  // Simulating logic based on state history could go here
  return [
    { name: 'Rent', amount: 25000, dueDate: 'May 1', icon: 'fa-house', category: 'housing', confidence: 99 },
    { name: 'Electricity (BESCOM)', amount: 1200, dueDate: 'May 5', icon: 'fa-bolt', category: 'housing', confidence: 92 },
    { name: 'Car Loan EMI', amount: 12450, dueDate: 'May 10', icon: 'fa-car', category: 'transport', confidence: 99 },
    { name: 'Internet (Airtel)', amount: 999, dueDate: 'May 15', icon: 'fa-wifi', category: 'housing', confidence: 98 },
  ];
}

export function getAIResponse(message: string): string {
  const lower = message.toLowerCase();
  const totalSpent = state.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const categories = ['food', 'housing', 'transport', 'entertainment', 'health', 'shopping'];
  const catTotals = categories.map(cat => ({
    name: cat,
    total: state.transactions.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0)
  })).sort((a, b) => b.total - a.total);
  
  const topCat = catTotals[0];
  const savingsRate = Math.round(((state.userProfile.salary - totalSpent) / (state.userProfile.salary || 1)) * 100);

  if (lower.includes('health')) {
    return `💡 **Finley's Insight:** Your current health score is **${state.healthScore}/100**. \n\nWith a salary of **${formatCurrency(state.userProfile.salary)}**, you are saving roughly **${savingsRate}%**. Try reducing your **${topCat.name}** spend to boost this score!`;
  }
  if (lower.includes('spending') || lower.includes('breakdown')) {
    let msg = `📊 **Spending Breakdown:**\n\n`;
    catTotals.forEach(c => { if(c.total > 0) msg += `• ${c.name}: ${formatCurrency(c.total)}\n`; });
    return msg || "You haven't recorded any expenses yet!";
  }
  if (lower.includes('hello') || lower.includes('hi')) {
    return `👋 Namaste! I'm Finley. Balance is **${formatCurrency(state.balance)}** and your Health Score is **${state.healthScore}**. How can I help with your family finances today?`;
  }
  return `I'm Finley, your AI advisor. Ask me about your health score, spending habits, or savings goals in ₹!`;
}

export function formatAIMessage(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').split('\n').join('<br>');
}
