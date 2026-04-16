import React from 'react';
import { Utensils, Home, Car, Film, HeartPulse, ShoppingBag } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { formatCurrency } from '../utils/formatters';
import GlassCard from '../components/GlassCard';

const categoryIcons: Record<string, any> = {
  food: Utensils, housing: Home, transport: Car,
  entertainment: Film, health: HeartPulse, shopping: ShoppingBag
};

const Budget: React.FC = () => {
  const { transactions, activeMemberId, members } = useFinanceStore();
  const activeMember = members.find(m => m.id === activeMemberId);
  const isAdmin = activeMember?.role === 'father' || activeMember?.role === 'mother';

  const filtered = isAdmin
    ? transactions
    : transactions.filter(tx => tx.memberId === activeMemberId);

  const targets: Record<string, number> = isAdmin
    ? { food: 6000, housing: 30000, transport: 8000, entertainment: 5000, health: 4000, shopping: 7000 }
    : { food: 1000, transport: 500, entertainment: 2000, shopping: 1500 };

  const categories = Object.keys(targets);
  const totalBudget  = Object.values(targets).reduce((a, b) => a + b, 0);
  const totalSpent   = categories.reduce((sum, cat) => {
    return sum + filtered.filter(tx => tx.category === cat && tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
  }, 0);
  const overallPct = Math.min(100, Math.round((totalSpent / totalBudget) * 100));

  return (
    <section id="budget" className="screen active-screen">
      <header>
        <div>
          <h1>Budget Tracker</h1>
          <p className="subtitle">Monitor your monthly spending limits</p>
        </div>
      </header>

      {/* Summary Card */}
      <GlassCard style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}><span>Monthly Overview</span></div>
            <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Spent</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: overallPct > 90 ? 'var(--c-danger)' : 'var(--text-bright)' }}>{formatCurrency(totalSpent)}</div>
              </div>
              <div style={{ width: 1, background: 'var(--border-light)' }} />
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Budget</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-bright)' }}>{formatCurrency(totalBudget)}</div>
              </div>
              <div style={{ width: 1, background: 'var(--border-light)' }} />
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Remaining</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--c-good)' }}>{formatCurrency(Math.max(0, totalBudget - totalSpent))}</div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: overallPct > 90 ? 'var(--c-danger)' : overallPct > 70 ? 'var(--c-warning)' : 'var(--c-good)' }}>{overallPct}%</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Used</div>
          </div>
        </div>
        <div className="progress-bar">
          <div className={`progress-fill ${overallPct > 90 ? 'danger' : overallPct > 70 ? 'warning' : 'good'}`} style={{ width: `${overallPct}%` }} />
        </div>
      </GlassCard>

      {/* Category List */}
      <div className="budget-list" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '24px',
        width: '100%'
      }}>
        {categories.map(cat => {
          const spent   = filtered.filter(tx => tx.category === cat && tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
          const target  = targets[cat];
          const pct     = Math.min(100, Math.round((spent / target) * 100));
          const status  = pct > 90 ? 'danger' : pct > 70 ? 'warning' : 'good';
          const Icon    = categoryIcons[cat];

          return (
            <GlassCard key={cat} className="budget-item shimmer-card">
              <div className="budget-header">
                <div className="budget-title">
                  <div className={`card-icon ${cat === 'food' ? 'blue' : cat === 'housing' ? 'purple' : 'green'}`} style={{ width: 36, height: 36, borderRadius: 10 }}>
                    <Icon size={18} />
                  </div>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </div>
                <div className="budget-amounts">
                  <span>{formatCurrency(spent)}</span>
                  {' / '}
                  {formatCurrency(target)}
                </div>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${status}`} style={{ width: `${pct}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <p className="budget-status">{pct}% used</p>
                <p className="budget-status" style={{ color: status === 'good' ? 'var(--c-good)' : status === 'warning' ? 'var(--c-warning)' : 'var(--c-danger)' }}>
                  {status === 'danger' ? '⚠ Over limit' : status === 'warning' ? '⚡ Nearing limit' : '✓ On track'}
                </p>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
};

export default Budget;
