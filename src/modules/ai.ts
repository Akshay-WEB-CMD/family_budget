import { state } from './state';

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

export async function getAIResponse(message: string): Promise<string> {
  const { primaryApiKey, secondaryApiKey, salary, rent, emi, outings } = state.userProfile;
  
  // Credit check
  if (state.aiCredits <= 0) {
    return "🛡️ **Finley's Alert:** You've reached your daily limit of 5 free AI advisor credits. Keep managing your budget effectively to unlock more insights in the future!";
  }

  if (!primaryApiKey && !secondaryApiKey) {
    return "⚠️ **Setup Error:** The AI service is currently unavailable. Please contact support.";
  }

  const sysPrompt = `You are Finley, a strict family financial advisor. 
The user's monthly salary is ₹${salary}, rent is ₹${rent}, EMI is ₹${emi}, and monthly outings budget is ₹${outings}. 
Their current balance is ₹${state.balance} and health score is ${state.healthScore}/100.
RULES:
1. ONLY answer questions strictly related to family budget, finance, saving, and the provided numbers.
2. If the user asks a question that is NOT related to their finances or budgeting (e.g., sports, coding, general knowledge), strictly say: "🛡️ Finley's Focus: I am specialized in your Family Budget and cannot answer non-financial questions."
3. Keep answers under 3 sentences. Be concise, actionable, and friendly.
4. Always use INR (₹) for currency.`;

  const payload = {
    contents: [
      { role: 'user', parts: [{ text: `${sysPrompt}\n\nUser Question: ${message}` }] }
    ]
  };

  const tryApiKey = async (key: string): Promise<string> => {
    if (!key) throw new Error("Key is empty");
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const data = await res.json();
    if (!data.candidates || data.candidates.length === 0) throw new Error("No candidates returned");
    
    // Decrement credits on success
    state.aiCredits--;
    saveState();
    updateCreditsUI();
    
    return data.candidates[0].content.parts[0].text;
  };

  try {
    return await tryApiKey(primaryApiKey);
  } catch (err) {
    console.warn("Primary API failed, trying fallback...", err);
    try {
      return await tryApiKey(secondaryApiKey);
    } catch (fallbackErr) {
      console.error(fallbackErr);
      return "⚠️ **API Error:** Both API keys failed or are invalid. Please check your Financial Setup or API limits.";
    }
  }
}

function updateCreditsUI() {
  const creditsEl = document.getElementById('credits-display');
  if (creditsEl) {
    creditsEl.innerHTML = `<i class="fa-solid fa-bolt"></i> ${state.aiCredits}`;
  }
}

export async function parseSetupVoiceCommand(text: string): Promise<{salary?: number, rent?: number, emi?: number, outings?: number, balance?: number}> {
  const { primaryApiKey, secondaryApiKey } = state.userProfile;
  
  const sysPrompt = `You are a financial data extractor. The user will provide a sentence describing their income and commitments.
EXTRACT the following fields as numbers:
- salary
- rent
- emi
- outings
- balance

CRITICAL RULES:
1. Convert all word-based amounts (one lakh -> 100000, fifty thousand -> 50000, 20k -> 20000) to pure integers.
2. If a value is not mentioned, do NOT include it in the JSON.
3. Return ONLY a valid JSON object. No markdown, no extra text.
Example User: "My salary is 1 lakh, rent is 20,000 and emi is 5k"
Example Result: {"salary": 100000, "rent": 20000, "emi": 5000}`;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: `${sysPrompt}\n\nUser Sentence: "${text}"` }] }]
  };

  const tryApiKey = async (key: string): Promise<string> => {
    if (!key) throw new Error("Key is empty");
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  };

  try {
    const raw = await tryApiKey(primaryApiKey) || await tryApiKey(secondaryApiKey);
    // Cleanup any markdown code blocks if the AI accidentally includes them
    const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("Failed to parse setup voice command:", err);
    throw err;
  }
}

export function initAIAdvisor() {
  const userInput = document.getElementById('ai-chat-input') as HTMLInputElement;
  const sendBtn = document.getElementById('send-ai-btn');
  const chatMessages = document.getElementById('chat-messages');
  const quickChips = document.querySelectorAll('.quick-chip');

  if (!userInput || !chatMessages) return;

  const addMessage = (text: string, isAi: boolean) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isAi ? 'ai-message' : 'user-message'}`;
    msgDiv.innerHTML = `
      <div class="msg-bubble">
        <p>${formatAIMessage(text)}</p>
      </div>
      <span class="msg-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    `;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const showTyping = () => {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message typing-indicator';
    typingDiv.id = 'typing-bubble';
    typingDiv.innerHTML = `<div class="msg-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const hideTyping = () => {
    document.getElementById('typing-bubble')?.remove();
  };

  const playTTS = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    // Strip markdown formatting and emojis to sounds natural
    const cleanText = text.replace(/[*#_-]/g, '').replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const speech = new SpeechSynthesisUtterance(cleanText);
    speech.lang = 'en-IN'; 
    speech.rate = 1.0;
    speech.pitch = 1.0;
    
    window.speechSynthesis.speak(speech);
  };

  const handleSend = async () => {
    const text = userInput.value.trim();
    if (!text) return;
    addMessage(text, false);
    userInput.value = '';
    showTyping();

    try {
      const response = await getAIResponse(text);
      hideTyping();
      addMessage(response, true);
      playTTS(response);
    } catch (e) {
      hideTyping();
      addMessage("⚠️ System Error: Unable to reach AI services.", true);
    }
  };

  sendBtn?.addEventListener('click', handleSend);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (prompt) {
        userInput.value = prompt;
        handleSend();
      }
    });
  });
}

export function formatAIMessage(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').split('\n').join('<br>');
}
