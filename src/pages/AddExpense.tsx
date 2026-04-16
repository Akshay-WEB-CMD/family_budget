import React, { useState } from 'react';
import {
  Plus, Utensils, Home, Car, Film,
  HeartPulse, ShoppingBag, CheckCircle2, Mic
} from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { parseDailyExpenseVoiceCommand } from '../services/aiService';
import GlassCard from '../components/GlassCard';

const AddExpense: React.FC = () => {
  const { addTransaction, members, activeMemberId, userProfile } = useFinanceStore();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');
  const [memberId, setMemberId] = useState(activeMemberId);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [success, setSuccess] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceHint, setVoiceHint] = useState('');

  const categories = [
    { id: 'food',          label: 'Food',      icon: Utensils   },
    { id: 'housing',       label: 'Housing',   icon: Home       },
    { id: 'transport',     label: 'Transport', icon: Car        },
    { id: 'entertainment', label: 'Fun',       icon: Film       },
    { id: 'health',        label: 'Health',    icon: HeartPulse },
    { id: 'shopping',      label: 'Shopping',  icon: ShoppingBag},
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount))) return;
    addTransaction({ amount: parseFloat(amount), category, note, memberId, type: 'expense' });
    setAmount(''); setNote('');
    setVoiceHint('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleVoiceLog = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => { setIsRecording(true); setVoiceHint('Listening for expense...'); };
    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      try {
        const result = await parseDailyExpenseVoiceCommand(text);
        if (result.amount) setAmount(result.amount.toString());
        if (result.category) setCategory(result.category);
        if (result.note) setNote(result.note);
        setVoiceHint(`Heard: "${text}" - Extracted ₹${result.amount}`);
      } catch { setVoiceHint('Could not parse speech. Try again.'); }
      setIsRecording(false);
    };
    recognition.onerror = () => { setIsRecording(false); setVoiceHint('Microphone error.'); };
    recognition.start();
  };

  return (
    <section id="add-expense" className="screen active-screen">
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              Log Spending
              <button
                type="button"
                className={`inline-mic-btn ${isRecording ? 'pulse' : ''}`}
                onClick={handleVoiceLog}
                title="Speak to add an expense"
                style={{ padding: '6px 10px', borderRadius: 8, background: isRecording ? 'rgba(236,72,153,0.2)' : 'rgba(59,130,246,0.1)', cursor: 'pointer', border: 'none', color: isRecording ? 'var(--c-pink)' : 'var(--neon-blue)' }}
              >
                <Mic size={20} />
              </button>
            </h1>
            <p className="subtitle">
              Record transactions manually below, or tap the microphone to use Voice Fill.
              {voiceHint && <span style={{ marginLeft: 10, color: 'var(--c-cyan)' }}>({voiceHint})</span>}
            </p>
          </div>
        </div>
      </header>
      <div style={{ margin: '0 auto', width: '100%' }}>
        {/* Manual Form */}
        <GlassCard>
          <form onSubmit={handleSubmit}>
            {/* Amount */}
            <div className="amount-display" style={{ marginBottom: 22 }}>
              <span className="currency">₹</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
              />
            </div>

            {/* Category Grid */}
            <div className="form-group">
              <label>Category</label>
              <div className="category-grid">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.id}
                      className={`cat-option ${category === cat.id ? 'active' : ''}`}
                      onClick={() => setCategory(cat.id)}
                    >
                      <Icon size={20} />
                      <span>{cat.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Note */}
            <div className="form-group">
              <label>Note (optional)</label>
              <input
                type="text"
                className="text-input"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g., Lunch at City Centre Mall"
              />
            </div>

            {/* Member + Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label>Member</label>
                <select className="text-input" value={memberId} onChange={e => setMemberId(e.target.value)}>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" className="text-input" value={date} onChange={e => setDate(e.target.value)} />
              </div>
            </div>

            <button
              type="submit"
              className="primary-btn"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '14px' }}
            >
              {success ? <><CheckCircle2 size={18} /> Added!</> : <><Plus size={18} /> Record Transaction</>}
            </button>
          </form>
        </GlassCard>
      </div>
    </section>
  );
};

export default AddExpense;
