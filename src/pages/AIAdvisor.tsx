import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Bolt,
  HeartPulse,
  PieChart,
  PiggyBank,
  CheckCircle,
  Lightbulb,
  Target,
  Send
} from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { getAIResponse } from '../services/aiService';
import GlassCard from '../components/GlassCard';

interface Message {
  text: string;
  isAi: boolean;
  time: string;
}

const AIAdvisor: React.FC = () => {
  const { userProfile, balance, healthScore, aiCredits, useAiCredit } = useFinanceStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "👋 Hi! I'm **Finley**, your AI financial advisor. I've analyzed your family's financial data and I'm ready to help.",
      isAi: true,
      time: 'Now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;
    const newMsg = { text, isAi: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    const result = await getAIResponse(text, userProfile, balance, healthScore, aiCredits);
    if (result.success) useAiCredit();

    setIsTyping(false);
    setMessages(prev => [...prev, {
      text: result.text,
      isAi: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = result.text.replace(/[*#_-]/g, '').replace(/https?:\/\/\S+/g, '');
      const speech = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices();
      const indVoice = voices.find(v => v.lang.includes('IN') || v.name.includes('India'));
      if (indVoice) speech.voice = indVoice;
      speech.rate = 1.0;
      speech.pitch = 1.1;
      window.speechSynthesis.speak(speech);
    }
  };

  const quickActions = [
    { label: 'Improve Health Score', icon: HeartPulse, prompt: 'How can I improve my health score?' },
    { label: 'Spending Breakdown', icon: PieChart, prompt: 'What are my biggest spending categories?' },
    { label: 'Savings Goal', icon: PiggyBank, prompt: 'How much should I save each month?' },
    { label: 'Monthly Check-in', icon: CheckCircle, prompt: 'Am I on track for the month?' },
    { label: 'Expense Tips', icon: Lightbulb, prompt: 'Give me 3 tips to reduce expenses' },
    { label: 'Budget Analysis', icon: Target, prompt: 'Analyze my budget performance' },
  ];

  const formatMessage = (text: string) =>
    text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part);

  return (
    <section id="ai-advisor" className="screen active-screen">
      <header>
        <div>
          <h1>AI Financial Advisor</h1>
          <p className="subtitle">Powered by Finley — your family finance coach</p>
        </div>
      </header>

      <div className="ai-advisor-layout">
        {/* Quick Actions Panel */}
        <div>
          <GlassCard>
            <div className="section-title" style={{ marginBottom: 16 }}>
              <span>Quick Questions</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {quickActions.map(action => (
                <button
                  key={action.label}
                  className="quick-chip"
                  style={{ justifyContent: 'flex-start', borderRadius: 12, padding: '10px 14px' }}
                  onClick={() => handleSend(action.prompt)}
                >
                  <action.icon size={16} /> {action.label}
                </button>
              ))}
            </div>

            {/* Credits info */}
            <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(245,158,11,0.06)', borderRadius: 12, border: '1px solid rgba(245,158,11,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>AI Credits</span>
                <span className="credits-badge shimmering-credits">
                  <Bolt size={12} /> {aiCredits} left
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Chat Panel */}
        <GlassCard className="chat-card">
          <div className="chat-header">
            <div className="ai-avatar"><Bot size={22} /></div>
            <div>
              <span className="chat-name">Finley</span>
              <span className="chat-tagline">AI Finance Coach</span>
            </div>
            <div style={{
              marginLeft: 'auto',
              width: 8, height: 8,
              borderRadius: '50%',
              background: 'var(--c-good)',
              boxShadow: '0 0 6px var(--c-good)'
            }} />
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.isAi ? 'ai' : 'user'}`}>
                {msg.isAi && <div className="ai-avatar" style={{ width: 30, height: 30, borderRadius: 9, fontSize: '0.7rem' }}><Bot size={14} /></div>}
                <div className="msg-bubble">
                  {formatMessage(msg.text)}
                </div>
                {!msg.isAi && <div className="msg-avatar">You</div>}
              </div>
            ))}
            {isTyping && (
              <div className="message ai">
                <div className="ai-avatar" style={{ width: 30, height: 30, borderRadius: 9 }}><Bot size={14} /></div>
                <div className="msg-bubble" style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '12px 16px' }}>
                  {[0, 150, 300].map(delay => (
                    <span key={delay} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--c-indigo)',
                      animation: 'bounce 1.2s infinite',
                      animationDelay: `${delay}ms`
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-input-row">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask Finley about your finances..."
              onKeyPress={e => e.key === 'Enter' && handleSend(input)}
            />
            <button
              className="primary-btn"
              style={{ padding: '10px 18px', borderRadius: 12, flexShrink: 0 }}
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isTyping}
            >
              <Send size={16} />
            </button>
          </div>
        </GlassCard>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </section>
  );
};

export default AIAdvisor;
