import React, { useMemo } from 'react';
import {
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  XCircle,
  Flame,
  PiggyBank,
  ShieldAlert,
  Zap,
  TrendingDown,
  Target,
} from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { formatCurrency } from '../utils/formatters';
import GlassCard from '../components/GlassCard';
import { WealthChart } from '../components/Charts';

/* ─── Tip generator ─────────────────────────────── */
interface Tip {
  id: string;
  icon: React.ElementType;
  title: string;
  body: string;
  type: 'success' | 'warning' | 'info' | 'danger';
}

function generateTips(
  expenses: number,
  balance: number,
  healthScore: number,
  salary: number,
  rent: number,
  emi: number,
  transactions: any[],
): Tip[] {
  const tips: Tip[] = [];

  // ── Savings rate ──────────────────────────────────
  const savingsRate = salary > 0 ? ((salary - expenses) / salary) * 100 : 0;
  if (savingsRate >= 20) {
    tips.push({
      id: 'savings-good',
      icon: CheckCircle2,
      title: 'Great savings rate!',
      body: `You're saving ${savingsRate.toFixed(0)}% of your income — above the 20% benchmark. Keep it up!`,
      type: 'success',
    });
  } else if (savingsRate > 0) {
    tips.push({
      id: 'savings-low',
      icon: PiggyBank,
      title: 'Boost your savings rate',
      body: `You're saving ${savingsRate.toFixed(0)}% of income. Aim for 20% — even trimming ₹${formatCurrency((salary * 0.20 - (salary - expenses)))} from monthly spend gets you there.`,
      type: 'warning',
    });
  }

  // ── Fixed costs ratio ────────────────────────────
  const fixedCostRatio = salary > 0 ? ((rent + emi) / salary) * 100 : 0;
  if (fixedCostRatio > 50) {
    tips.push({
      id: 'fixed-high',
      icon: ShieldAlert,
      title: 'Fixed costs are high',
      body: `Rent + EMIs are ${fixedCostRatio.toFixed(0)}% of your salary. The 50/30/20 rule suggests keeping fixed costs ≤ 50%. Consider restructuring your EMIs.`,
      type: 'danger',
    });
  } else if (fixedCostRatio > 0) {
    tips.push({
      id: 'fixed-ok',
      icon: CheckCircle2,
      title: 'Fixed costs under control',
      body: `Your rent + EMIs are ${fixedCostRatio.toFixed(0)}% of income — within the healthy 50% limit.`,
      type: 'success',
    });
  }

  // ── Emergency fund ───────────────────────────────
  const monthsRunway = expenses > 0 ? balance / expenses : 0;
  if (monthsRunway < 3) {
    tips.push({
      id: 'emergency-low',
      icon: AlertTriangle,
      title: 'Build an emergency fund',
      body: `Your balance covers only ${monthsRunway.toFixed(1)} months of expenses. Financial advisors recommend 3–6 months. Target: ${formatCurrency(expenses * 3)}.`,
      type: 'danger',
    });
  } else if (monthsRunway < 6) {
    tips.push({
      id: 'emergency-partial',
      icon: Zap,
      title: 'Keep growing the emergency fund',
      body: `You have ${monthsRunway.toFixed(1)} months of runway — good start! Aim for ${formatCurrency(expenses * 6)} (6 months) for full financial security.`,
      type: 'warning',
    });
  } else {
    tips.push({
      id: 'emergency-good',
      icon: CheckCircle2,
      title: 'Emergency fund is healthy!',
      body: `You have ${monthsRunway.toFixed(1)} months of expenses covered. Your financial safety net is solid.`,
      type: 'success',
    });
  }

  // ── Spending trend ───────────────────────────────
  if (expenses > salary * 0.8 && salary > 0) {
    tips.push({
      id: 'overspend',
      icon: XCircle,
      title: 'Spending exceeds 80% of income',
      body: `This month you've spent ${formatCurrency(expenses)} — ${((expenses / salary) * 100).toFixed(0)}% of your salary. Identify discretionary categories to cut back on.`,
      type: 'danger',
    });
  }

  // ── Transaction habit ────────────────────────────
  if (transactions.length > 10) {
    tips.push({
      id: 'habit-good',
      icon: Flame,
      title: 'Consistent tracking habit!',
      body: `You've logged ${transactions.length} transactions. Regular tracking is proven to reduce overspending by up to 20%.`,
      type: 'success',
    });
  } else if (transactions.length < 3) {
    tips.push({
      id: 'habit-low',
      icon: Target,
      title: 'Track every rupee',
      body: `You have only ${transactions.length} transaction${transactions.length === 1 ? '' : 's'} logged. Consistent daily tracking helps identify hidden spending patterns.`,
      type: 'info',
    });
  }

  // ── Health score tip ────────────────────────────
  if (healthScore < 60) {
    tips.push({
      id: 'health-poor',
      icon: TrendingDown,
      title: 'Financial health needs attention',
      body: `Score: ${healthScore}/100. Focus on reducing non-essential spending and staying within your monthly budget targets.`,
      type: 'danger',
    });
  } else if (healthScore >= 85) {
    tips.push({
      id: 'health-great',
      icon: TrendingUp,
      title: 'Excellent financial health!',
      body: `Score: ${healthScore}/100. You're in the top tier. Consider deploying your surplus into SIPs or index funds for long-term wealth.`,
      type: 'success',
    });
  }

  return tips;
}

/* ─── Component ─────────────────────────────────── */
const Insights: React.FC = () => {
  const { healthScore, activeMemberId, members, expenses, balance, userProfile, transactions } = useFinanceStore();
  const activeMember = members.find(m => m.id === activeMemberId);
  const isAdmin = activeMember?.role === 'father' || activeMember?.role === 'mother';

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (healthScore / 100) * circumference;
  const scoreColor = healthScore >= 80 ? 'var(--c-good)' : healthScore >= 60 ? 'var(--c-warning)' : 'var(--c-danger)';

  const tips = useMemo(() =>
    generateTips(expenses, balance, healthScore, userProfile.salary, userProfile.rent, userProfile.emi, transactions),
    [expenses, balance, healthScore, userProfile, transactions]
  );

  const tipStyle: Record<string, { bg: string; border: string; icon: string }> = {
    success: { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.18)', icon: 'var(--c-good)' },
    warning: { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.18)', icon: 'var(--c-warning)' },
    danger:  { bg: 'rgba(239, 68, 68,0.06)', border: 'rgba(239,68,68,0.18)',  icon: 'var(--c-danger)' },
    info:    { bg: 'rgba(99,102,241,0.06)',  border: 'rgba(99,102,241,0.18)', icon: 'var(--c-indigo)' },
  };

  return (
    <section id="insights" className="screen active-screen">
      <header>
        <div>
          <h1>Smart Insights</h1>
          <p className="subtitle">Real-time analysis based on your actual financial data</p>
        </div>
      </header>

      {/* Health Score Card */}
      <GlassCard style={{ marginBottom: 28 }}>
        <div className="health-score-row">
          <div className="big-score-ring">
            <svg viewBox="0 0 100 100">
              <defs>
                <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r={radius} className="ring-bg" />
              <circle
                cx="50" cy="50" r={radius} className="ring-fill"
                style={{ strokeDasharray: circumference, strokeDashoffset: offset, stroke: 'url(#blue-gradient)' }}
              />
            </svg>
            <div className="ring-text">
              <span className="ring-number" style={{ color: scoreColor }}>{healthScore}</span>
              <span className="ring-label">/ 100</span>
            </div>
          </div>

          <div className="health-breakdown">
            <h3 style={{ marginBottom: 4 }}>Financial Health Score</h3>
            <p className="subtitle" style={{ marginBottom: 16 }}>Calculated from your live budget, savings rate & spending patterns</p>
            <div className="health-factors">
              {[
                { label: 'Budget Adherence', value: Math.max(0, 100 - Math.round((expenses / (userProfile.salary || 1)) * 100)), status: expenses < userProfile.salary * 0.8 ? 'good' : 'warning' },
                { label: 'Savings Rate',     value: Math.max(0, Math.round(((userProfile.salary - expenses) / (userProfile.salary || 1)) * 100)), status: userProfile.salary - expenses > userProfile.salary * 0.2 ? 'good' : 'warning' },
                { label: 'Debt Ratio',       value: Math.max(0, 100 - Math.round(((userProfile.rent + userProfile.emi) / (userProfile.salary || 1)) * 100)), status: (userProfile.rent + userProfile.emi) < userProfile.salary * 0.5 ? 'good' : 'warning' },
              ].map(f => (
                <div key={f.label} className="health-factor">
                  <span>{f.label}</span>
                  <div className="mini-bar">
                    <div className={`mini-fill ${f.status}`} style={{ width: `${Math.min(100, f.value)}%` }} />
                  </div>
                  <span className={`factor-score ${f.status}-text`}>{Math.min(100, f.value)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Wealth Projection */}
      {isAdmin && (
        <GlassCard style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart2 size={18} color="var(--c-blue)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem' }}>6-Month Wealth Projection</h3>
              <p className="subtitle">Based on your current savings rate</p>
            </div>
          </div>
          <div className="chart-wrapper"><WealthChart /></div>
        </GlassCard>
      )}

      {/* ─── Real-Time Financial Tips ─────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lightbulb size={14} />
            Real-Time Financial Tips
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', padding: '4px 10px', borderRadius: 20, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
          {tips.length} insights for you
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tips.map(tip => {
          const s = tipStyle[tip.type];
          const Icon = tip.icon;
          return (
            <div
              key={tip.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 16,
                padding: '16px 20px',
                borderRadius: 14,
                background: s.bg,
                border: `1px solid ${s.border}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px rgba(0,0,0,0.2)`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: s.bg, border: `1px solid ${s.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.icon,
              }}>
                <Icon size={19} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: 4 }}>
                  {tip.title}
                </div>
                <div style={{ fontSize: '0.80rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
                  {tip.body}
                </div>
              </div>
            </div>
          );
        })}

        {tips.length === 0 && (
          <div className="empty-state" style={{ padding: '40px 0' }}>
            <CheckCircle2 size={40} style={{ color: 'var(--c-good)', margin: '0 auto 12px' }} />
            <p>You're in great financial shape! No alerts right now.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Insights;
