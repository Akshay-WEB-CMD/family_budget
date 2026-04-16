import React, { useState } from 'react';
import {
  Building2,
  Mic,
  Save,
  Wallet,
  Home,
  CreditCard,
  Film,
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  PiggyBank,
  TrendingUp,
} from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { parseSetupVoiceCommand } from '../services/aiService';
import GlassCard from '../components/GlassCard';

const FinancialSetup: React.FC = () => {
  const { userProfile, updateProfile, members } = useFinanceStore();
  const [profile, setProfile] = useState(userProfile);
  const [isRecording, setIsRecording] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [voiceHint, setVoiceHint] = useState('');
  const [saved, setSaved] = useState(false);

  const targetSavings = profile.salary - (profile.rent + profile.emi + profile.outings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const startVoiceInput = (field?: string) => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => {
      setIsRecording(true);
      setActiveField(field || 'all');
      setVoiceHint(field ? `Listening for ${field}...` : 'Listening for financial details...');
    };
    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setVoiceHint(`Heard: "${text}"`);
      try {
        const extracted = await parseSetupVoiceCommand(text, profile.primaryApiKey, profile.secondaryApiKey);
        if (field) {
          const val = extracted[field as keyof typeof extracted] || Object.values(extracted)[0];
          if (typeof val === 'number') setProfile(p => ({ ...p, [field]: val }));
        } else {
          if (extracted.salary) setProfile(p => ({ ...p, salary: extracted.salary! }));
          if (extracted.rent) setProfile(p => ({ ...p, rent: extracted.rent! }));
          if (extracted.emi) setProfile(p => ({ ...p, emi: extracted.emi! }));
          if (extracted.outings) setProfile(p => ({ ...p, outings: extracted.outings! }));
        }
        setVoiceHint('Updated successfully!');
      } catch {
        setVoiceHint('Could not parse voice input.');
      }
      setIsRecording(false);
      setActiveField(null);
    };
    recognition.onerror = () => {
      setIsRecording(false);
      setActiveField(null);
      setVoiceHint('Microphone error.');
    };
    recognition.start();
  };

  const MicBtn = ({ field }: { field: string }) => (
    <button
      type="button"
      className={`inline-mic-btn ${activeField === field && isRecording ? 'pulse' : ''}`}
      onClick={() => startVoiceInput(field)}
      title={`Set ${field} via voice`}
    >
      <Mic size={13} />
    </button>
  );

  return (
    <section id="setup" className="screen active-screen">
      <header>
        <div>
          <h1>Parental Admin</h1>
          <p className="subtitle">Configure your family's financial baseline and AI settings</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <ShieldCheck size={16} color="var(--c-good)" />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--c-good)' }}>Admin Access</span>
        </div>
      </header>

      <div className="setup-layout">
        {/* Main Config Form */}
        <GlassCard>
          {/* Voice Setup Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: 'rgba(99,102,241,0.06)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.15)', marginBottom: 24 }}>
            <button
              type="button"
              onClick={() => startVoiceInput()}
              style={{
                width: 48, height: 48, borderRadius: 12,
                background: activeField === 'all' ? 'linear-gradient(135deg,#ef4444,#f43f5e)' : 'var(--primary-gradient)',
                border: 'none', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px rgba(99,102,241,0.3)',
                flexShrink: 0
              }}
            >
              <Mic size={22} />
            </button>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-bright)', marginBottom: 2 }}>AI Voice Setup</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {voiceHint || 'Say: "My salary is 75,000 and rent is 20,000"'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSave}>
            {/* Income & Balance */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 6 }}>
              <div className="form-group">
                <label>
                  <div className="label-text"><Building2 size={14} /> Monthly Salary <MicBtn field="salary" /></div>
                </label>
                <input type="number" className="text-input"
                  value={profile.salary}
                  onChange={e => setProfile(p => ({ ...p, salary: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="form-group">
                <label>
                  <div className="label-text"><Wallet size={14} /> Initial Balance <MicBtn field="balance" /></div>
                </label>
                <input type="number" className="text-input"
                  value={profile.initialBalance}
                  onChange={e => setProfile(p => ({ ...p, initialBalance: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* Fixed Costs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 6 }}>
              <div className="form-group">
                <label>
                  <div className="label-text"><Home size={14} /> Rent / Home EMI <MicBtn field="rent" /></div>
                </label>
                <input type="number" className="text-input"
                  value={profile.rent}
                  onChange={e => setProfile(p => ({ ...p, rent: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="form-group">
                <label>
                  <div className="label-text"><CreditCard size={14} /> Other EMI / Debt <MicBtn field="emi" /></div>
                </label>
                <input type="number" className="text-input"
                  value={profile.emi}
                  onChange={e => setProfile(p => ({ ...p, emi: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <div className="label-text"><Film size={14} /> Monthly Outings / Leisure <MicBtn field="outings" /></div>
              </label>
              <input type="number" className="text-input"
                value={profile.outings}
                onChange={e => setProfile(p => ({ ...p, outings: parseInt(e.target.value) || 0 }))}
              />
            </div>

            {/* Calculated Savings */}
            <div className="target-savings-pill">
              <span>Calculated Monthly Savings</span>
              <strong style={{ color: targetSavings >= 0 ? 'var(--c-good)' : 'var(--c-danger)' }}>
                ₹{targetSavings.toLocaleString('en-IN')}
              </strong>
            </div>



            <button type="submit" className="primary-btn" style={{ width: '100%', justifyContent: 'center' }}>
              <Save size={16} />
              {saved ? 'Saved!' : 'Save Configuration'}
            </button>
          </form>
        </GlassCard>

        {/* Info Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Family Members */}
          <GlassCard>
            <div className="section-title" style={{ marginBottom: 16 }}>
              <span><Users size={14} style={{ display: 'inline', marginRight: 6 }} />Family Members</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {members.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
                  <div className={`member-avatar ${m.role !== 'child' ? 'admin' : ''}`}>
                    {m.name[0]}
                  </div>
                  <div>
                    <div className="member-name">{m.name}</div>
                    <div className="member-role">{m.role}</div>
                  </div>
                  {m.spendingLimit && (
                    <div style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--c-warning)', fontWeight: 700 }}>
                      Limit: ₹{m.spendingLimit.toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Tips card */}
          <GlassCard style={{ marginTop: 24 }}>
            <div className="section-title" style={{ marginBottom: 16 }}><span>Real-Time Configuration Insights</span></div>
            <div className="setup-tips">
              <ul>
                {((profile.rent + profile.emi) / (profile.salary || 1) * 100) > 50 ? (
                  <li>
                    <AlertTriangle size={16} color="var(--c-warning)" style={{flexShrink:0, marginTop:2}} />
                    <span><strong>High Fixed Costs:</strong> Your fixed costs are {((profile.rent + profile.emi) / (profile.salary || 1) * 100).toFixed(0)}% of income (recommended &lt; 50%). Consider restructuring debt.</span>
                  </li>
                ) : (
                  <li>
                    <CheckCircle2 size={16} color="var(--c-good)" style={{flexShrink:0, marginTop:2}} />
                    <span><strong>Healthy Fixed Costs:</strong> Fixed costs are {((profile.rent + profile.emi) / (profile.salary || 1) * 100).toFixed(0)}% of income, well within the 50% limit.</span>
                  </li>
                )}

                {profile.initialBalance < profile.salary * 3 ? (
                  <li>
                    <PiggyBank size={16} color="var(--c-blue)" style={{flexShrink:0, marginTop:2}} />
                    <span><strong>Emergency Fund:</strong> Your balance is less than 3x salary. Aim for at least ₹{(profile.salary * 3).toLocaleString('en-IN')} as a safety net.</span>
                  </li>
                ) : (
                  <li>
                    <CheckCircle2 size={16} color="var(--c-good)" style={{flexShrink:0, marginTop:2}} />
                    <span><strong>Solid Emergency Fund:</strong> You have {((profile.initialBalance / (profile.salary || 1))).toFixed(1)} months of runway saved!</span>
                  </li>
                )}

                {profile.outings > profile.salary * 0.15 ? (
                  <li>
                    <AlertTriangle size={16} color="var(--c-warning)" style={{flexShrink:0, marginTop:2}} />
                    <span><strong>Leisure Spend:</strong> Outings are {((profile.outings / (profile.salary || 1)) * 100).toFixed(0)}% of your salary. Trimming this will accelerate wealth building.</span>
                  </li>
                ) : (
                  <li>
                    <TrendingUp size={16} color="var(--c-purple)" style={{flexShrink:0, marginTop:2}} />
                    <span><strong>Leisure Spend:</strong> Discretionary allocation is optimal, giving you great room for investments.</span>
                  </li>
                )}
              </ul>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
};

export default FinancialSetup;
