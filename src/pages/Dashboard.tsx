import React from 'react';
import {
  Building2,
  Wallet,
  TrendingDown,
  Activity,
  Calendar,
  Plus,
  Utensils,
  Home,
  Car,
  Film,
  HeartPulse,
  ShoppingBag,
  Briefcase,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { formatCurrency } from '../utils/formatters';
import StatCard from '../components/StatCard';
import GlassCard from '../components/GlassCard';
import { CategoryChart } from '../components/Charts';

const categoryIcons: Record<string, any> = {
  food: Utensils,
  housing: Home,
  transport: Car,
  entertainment: Film,
  health: HeartPulse,
  shopping: ShoppingBag,
  income: Briefcase
};

const Dashboard: React.FC = () => {
  const {
    balance,
    expenses,
    healthScore,
    transactions,
    activeMemberId,
    members,
    userProfile,
    deleteTransaction
  } = useFinanceStore();

  const activeMember = members.find(m => m.id === activeMemberId);
  const isAdmin = activeMember?.role === 'father' || activeMember?.role === 'mother';

  const filteredTransactions = isAdmin
    ? transactions
    : transactions.filter(tx => tx.memberId === activeMemberId);

  const spendingLimit = activeMember?.spendingLimit || 0;
  const isOverLimit = !isAdmin && spendingLimit > 0 && expenses > spendingLimit;

  return (
    <section id="dashboard" className="screen active-screen">
      <header>
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">Your family's financial overview</p>
        </div>
      </header>

      {isOverLimit && (
        <div className="alert-card glass-card" style={{ marginBottom: 24 }}>
          <div className="alert-content">
            <div className="alert-icon"><AlertTriangle size={28} /></div>
            <div className="alert-text">
              <h3 className="danger-title">Spending Limit Exceeded</h3>
              <p>You've exceeded your monthly limit of {formatCurrency(spendingLimit)}.</p>
            </div>
          </div>
        </div>
      )}

      <div className="overview-cards">
        {isAdmin ? (
          <>
            <StatCard
              icon={Building2}
              label="Total Balance"
              value={formatCurrency(balance)}
              trend={{ value: '+2.4%', isPositive: true }}
              colorClass="blue"
            />
            <StatCard
              icon={TrendingDown}
              label="Total Expenses"
              value={formatCurrency(expenses)}
              trend={{ value: '+5.1%', isPositive: false }}
              colorClass="purple"
            />
            <StatCard
              icon={Activity}
              label="Health Score"
              value={`${healthScore} / 100`}
              trend={{ value: '+3 pts', isPositive: true }}
              colorClass="green"
            />
            <StatCard
              icon={Calendar}
              label="Predicted Bills"
              value={formatCurrency(userProfile.rent + userProfile.emi)}
              colorClass="gold"
            />
          </>
        ) : (
          <>
            <StatCard
              icon={Wallet}
              label="Available Allowance"
              value={formatCurrency(Math.max(0, spendingLimit - expenses))}
              colorClass="purple"
            />
            <StatCard
              icon={TrendingDown}
              label="My Spending"
              value={formatCurrency(expenses)}
              trend={{ value: `Limit: ${formatCurrency(spendingLimit)}`, isPositive: expenses < spendingLimit }}
              colorClass="blue"
            />
          </>
        )}
      </div>

      <div className="dashboard-grid">
        <GlassCard>
          <div className="section-title">
            <span>Category Spending</span>
          </div>
          <div style={{ height: 220 }}>
            <CategoryChart />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px', marginTop: 16 }}>
            {['housing', 'food', 'transport', 'entertainment', 'health', 'shopping'].map(cat => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: `var(--c-${cat})`
                }} />
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="section-title">
            <span>Recent Transactions</span>
            <button className="icon-btn"><Plus size={14} /> Add</button>
          </div>
          <div className="t-list">
            {filteredTransactions.slice(0, 6).map(tx => {
              const Icon = categoryIcons[tx.category] || Wallet;
              const txMember = members.find(m => m.id === tx.memberId);
              return (
                <div key={tx.id} className="t-item">
                  <div className={`t-icon bg-${tx.category}`}>
                    <Icon size={18} />
                  </div>
                  <div className="t-info">
                    <div className="t-category">{tx.note || tx.category}</div>
                    <div className="t-note" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span>{tx.date}</span>
                      {txMember && (
                        <span style={{ fontSize: '0.65rem', background: 'rgba(59,130,246,0.15)', color: 'var(--neon-blue)', padding: '2px 6px', borderRadius: 4, fontWeight: 600, textTransform: 'capitalize' }}>
                          By: {txMember.name} ({txMember.role})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="t-meta">
                    <span className={`t-amount ${tx.type}`}>
                      {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                  {isAdmin && (
                    <button className="delete-btn" onClick={() => deleteTransaction(tx.id)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}
            {filteredTransactions.length === 0 && (
              <div className="empty-state">
                <Wallet size={32} />
                <p style={{ marginTop: 8, fontSize: '0.82rem' }}>No recent transactions</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </section>
  );
};

export default Dashboard;
