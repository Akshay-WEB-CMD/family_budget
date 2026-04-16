import React from 'react';
import {
  PiggyBank,
  HandHelping,
  TrendingUp,
  Lock,
  Flame,
  LineChart,
  Medal
} from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import GlassCard from '../components/GlassCard';

const Achievements: React.FC = () => {
  const { transactions, expenses, userProfile } = useFinanceStore();

  const xp = Math.min(3000, 1000 + (transactions.length * 100));
  const level = 4;
  const nextLevelXp = 3000;

  const badges = [
    {
      id: 'hot-streak',
      title: 'Hot Streak',
      desc: 'Stayed under budget for 3 consecutive months.',
      emoji: '🔥',
      unlocked: transactions.length >= 5,
      color: 'var(--c-danger)',
    },
    {
      id: 'super-saver',
      title: 'Super Saver',
      desc: 'Saved over ₹50,000 in a single month.',
      emoji: '🏆',
      unlocked: expenses > 0 && expenses < (userProfile.salary * 0.5),
      color: 'var(--c-warning)',
    },
    {
      id: 'debt-free',
      title: 'Debt Free',
      desc: 'Pay off the remaining car loan balance.',
      emoji: '💎',
      unlocked: false,
      progress: 40,
    },
    {
      id: 'investment-guru',
      title: 'Investment Guru',
      desc: 'Contribute ₹5 Lakhs to investments.',
      emoji: '📈',
      unlocked: false,
      progress: 15,
    },
  ];

  return (
    <section id="gamification" className="screen active-screen">
      <header>
        <div>
          <h1>Achievements</h1>
          <p className="subtitle">Level up your financial habits</p>
        </div>
      </header>

      {/* Level Card */}
      <GlassCard style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'var(--grad-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(99,102,241,0.3)',
            flexShrink: 0
          }}>
            <Medal size={32} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: 2 }}>Financial Ninja</h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Level {level}</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill good" style={{ width: `${(xp / nextLevelXp) * 100}%` }} />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Badges */}
      <div className="section-title" style={{ marginBottom: 16 }}>
        <span>Your Badges</span>
      </div>
      <div className="achievements-grid">
        {badges.map(badge => (
          <GlassCard
            key={badge.id}
            className={`achievement-card shimmer-card ${badge.unlocked ? 'earned' : 'locked'}`}
          >
            <span className="badge-icon">{badge.emoji}</span>
            <h3>{badge.title}</h3>
            <p>{badge.desc}</p>

            {badge.unlocked ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--c-good)', fontWeight: 600 }}>
                ✓ Unlocked
              </div>
            ) : badge.progress !== undefined ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>Progress</span><span>{badge.progress}%</span>
                </div>
                <div className="xp-bar"><div className="xp-fill" style={{ width: `${badge.progress}%` }} /></div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <Lock size={12} /> Locked
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </section>
  );
};

export default Achievements;
