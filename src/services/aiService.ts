import type { Transaction, UserProfile } from '../store/useFinanceStore';

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
  return [
    { name: 'Rent', amount: 25000, dueDate: 'May 1', icon: 'Home', category: 'housing', confidence: 99 },
    { name: 'Electricity (BESCOM)', amount: 1200, dueDate: 'May 5', icon: 'Zap', category: 'housing', confidence: 92 },
    { name: 'Car Loan EMI', amount: 12450, dueDate: 'May 10', icon: 'Car', category: 'transport', confidence: 99 },
    { name: 'Internet (Airtel)', amount: 999, dueDate: 'May 15', icon: 'Wifi', category: 'housing', confidence: 98 },
  ];
}

export async function getAIResponse(
  message: string, 
  profile: UserProfile, 
  balance: number, 
  healthScore: number,
  aiCredits: number
): Promise<{ text: string, success: boolean }> {
  const { primaryApiKey, secondaryApiKey, salary, rent, emi, outings } = profile;
  
  if (aiCredits <= 0) {
    return { 
      text: "🛡️ **Finley's Alert:** You've reached your daily limit of 5 free AI advisor credits. Keep managing your budget effectively to unlock more insights in the future!",
      success: false 
    };
  }

  // --- Offline Quick Questions ---
  const lowerMsg = message.toLowerCase().trim();
  const fixedCosts = rent + emi;
  
  if (lowerMsg.includes('improve my health score')) {
    return { text: `📉 Based on your score of ${healthScore}/100, the quickest way to improve is trimming your discretionary outings (currently ₹${outings.toLocaleString('en-IN')}) and allocating it to savings.`, success: true };
  }
  if (lowerMsg.includes('biggest spending categories')) {
    return { text: `📊 Your largest committed expenses are housing (₹${rent.toLocaleString('en-IN')}) and EMIs (₹${emi.toLocaleString('en-IN')}), making up ${((fixedCosts/(salary||1))*100).toFixed(0)}% of your income.`, success: true };
  }
  if (lowerMsg.includes('much should i save')) {
    return { text: `🎯 Following the 50/30/20 rule on your ₹${(salary||0).toLocaleString('en-IN')} salary, you should automatically save at least **₹${((salary||0) * 0.2).toLocaleString('en-IN')}** every month.`, success: true };
  }
  if (lowerMsg.includes('am i on track')) {
    return { text: `⚡ With a balance of ₹${(balance||0).toLocaleString('en-IN')} and fixed monthly obligations of ₹${fixedCosts.toLocaleString('en-IN')}, you're currently ${balance >= fixedCosts * 3 ? 'excellently ' : ''}on track!`, success: true };
  }
  if (lowerMsg.includes('tips to reduce expenses')) {
    return { text: `1️⃣ Cut back on outings (trim ₹${Math.round(outings*0.2).toLocaleString('en-IN')}).\n2️⃣ Refinance to lower your ₹${emi.toLocaleString('en-IN')} EMI.\n3️⃣ Review unused subscriptions.`, success: true };
  }
  if (lowerMsg.includes('analyze my budget')) {
    return { text: `🔎 Health: ${healthScore}/100. Fixed costs consume ${((fixedCosts/(salary||1))*100).toFixed(1)}% of your income. ${ (fixedCosts/(salary||1)) > 0.5 ? '⚠️ Warning: Debt limit exceeded.' : '✅ Optimal range.'}`, success: true };
  }

  // --- Error on Non-Finance Questions ---
  const financeKeywords = ['budget', 'save', 'money', 'spend', 'finance', 'invest', 'stock', 'health', 'expense', 'cost', 'salary', 'rent', 'emi', 'outing', 'credit', 'bill', 'pay', 'debt', 'tax', 'loan', 'track', 'score', 'rupee', 'rs', 'balance', 'wealth', 'portfolio'];
  const isFinanceRelated = financeKeywords.some(kw => lowerMsg.includes(kw));
  
  if (!isFinanceRelated) {
    return {
      text: "⚠️ **Error:** I can only answer queries related to finance, budget, and family expenses. Please ask a financial question.",
      success: false
    };
  }

  if (!primaryApiKey && !secondaryApiKey) {
    return { 
      text: "⚠️ **Setup Error:** The AI service is currently unavailable. Please contact support.",
      success: false 
    };
  }

  const sysPrompt = `You are Finley, a strict and expert family financial advisor. 
The user's monthly salary is ₹${salary}, fixed rent is ₹${rent}, monthly EMI is ₹${emi}, and monthly outings budget is ₹${outings}. 
Their current balance is ₹${balance} and financial health score is ${healthScore}/100.
TARGET SAVINGS: ₹${salary - (rent + emi + outings)}

STRICT RULES:
1. ONLY discuss topics related to family budgeting, personal finance, saving strategies, and the data provided above.
2. If the user asks anything outside this scope (e.g., general knowledge, jokes, off-topic chat), strictly respond: "🛡️ Finley's Focus: I am specialized in your Family Budget and cannot answer non-financial questions."
3. Keep answers under 3 sentences. Be concise, expert-level, and highly actionable.
4. Always use Indian Rupee (₹) for currency.
5. Provide specific advice based on their salary and expenses.`;

  const payload = {
    contents: [
      { role: 'user', parts: [{ text: `${sysPrompt}\n\nUser Question: ${message}` }] }
    ]
  };

  const tryApiKey = async (key: string): Promise<string> => {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const data = await res.json();
    if (!data.candidates || data.candidates.length === 0) throw new Error("No candidates returned");
    return data.candidates[0].content.parts[0].text;
  };

  try {
    // Attempt Primary
    if (!primaryApiKey) throw new Error("No Primary Key");
    const response = await tryApiKey(primaryApiKey);
    return { text: response, success: true };
  } catch (err) {
    console.warn("Primary API failed, trying fallback...", err);
    try {
      // Attempt Secondary
      if (!secondaryApiKey) throw new Error("No Secondary Key");
      const response = await tryApiKey(secondaryApiKey);
      return { text: response, success: true };
    } catch (err2) {
      console.error("Both AI keys failed", err2);
      return { 
        text: "⚠️ **AI Offline:** Both primary and fallback AI keys failed to respond. Please check your keys in Financial Setup.",
        success: false 
      };
    }
  }
}
function convertSpokenNumbers(text: string) {
  let res = text.toLowerCase();
  res = res.replace(/fifty thousand/g, '50000');
  res = res.replace(/two thousand/g, '2000');
  res = res.replace(/ten thousand/g, '10000');
  res = res.replace(/one lakh/g, '100000');
  return res;
}

export async function parseSetupVoiceCommand(text: string, _1: string, _2: string): Promise<Partial<any>> {
  const processed = convertSpokenNumbers(text);
  const result: any = {};
  
  const matchNum = (keyword: string) => {
    const regex = new RegExp(`(?:${keyword})[^0-9]*?(\\d+)`, 'i');
    const m = processed.match(regex);
    return m ? parseInt(m[1], 10) : undefined;
  };

  const salary = matchNum('salary|income');
  if (salary) result.salary = salary;
  
  const rent = matchNum('rent|housing');
  if (rent) result.rent = rent;

  const emi = matchNum('emi|loan');
  if (emi) result.emi = emi;

  const outings = matchNum('outing|outings|entertainment|party');
  if (outings) result.outings = outings;

  const balance = matchNum('balance|savings|account');
  if (balance) result.balance = balance;

  return result;
}

export async function parseDailyExpenseVoiceCommand(text: string, _1?: string, _2?: string): Promise<{amount: number, category: string, note: string}> {
  const processed = convertSpokenNumbers(text);
  
  let amount = 0;
  const numMatch = processed.match(/(\d+)/);
  if (numMatch) amount = parseInt(numMatch[1], 10);
  
  let category = 'shopping'; // default
  if (processed.match(/food|lunch|dinner|breakfast|snack|restaurant/i)) category = 'food';
  else if (processed.match(/housing|rent|bill|electricity/i)) category = 'housing';
  else if (processed.match(/transport|gas|petrol|uber|cab|bus|train/i)) category = 'transport';
  else if (processed.match(/entertainment|movie|game|fun/i)) category = 'entertainment';
  else if (processed.match(/health|doctor|medicine|pharmacy/i)) category = 'health';

  return {
    amount,
    category,
    note: text
  };
}
