import React, { useState, useEffect } from 'react';
import { PiggyBank, TrendingUp } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { formatCurrency } from '../utils/formatters';
import GlassCard from '../components/GlassCard';

const Simulator: React.FC = () => {
  const { expenses } = useFinanceStore();
  const [sliderVal, setSliderVal] = useState(20);
  const [savings, setSavings] = useState(0);

  useEffect(() => {
    const monthlySpend = expenses || 45000;
    setSavings(monthlySpend * (sliderVal / 100) * 12);
  }, [sliderVal, expenses]);

  const yearlyBreakdown = [
    { label: 'Year 1', amount: savings },
    { label: 'Year 2', amount: savings * 2.08 },
    { label: 'Year 3', amount: savings * 3.24 },
  ];

  return (
    <section id="simulator" className="screen active-screen">
      <header>
        <div>
          <h1>What-If Simulator</h1>
          <p className="subtitle">See how small spending changes compound into big savings</p>
        </div>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: 24, 
        alignItems: 'start',
        width: '100%' 
      }}>
        {/* Slider Panel */}
        <GlassCard className="shimmer-card">
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>Reduce Discretionary Spending</h3>
            <p className="subtitle">Drag the slider to simulate your savings potential.</p>
          </div>

          {/* Slider */}
          <div className="slider-container">
            <div className="slider-labels">
              <span>0% reduction</span>
              <span id="slider-val" className="highlight-text">{sliderVal}% less spending</span>
              <span>50%</span>
            </div>
            <input
              type="range" min="0" max="50" value={sliderVal}
              onChange={e => setSliderVal(parseInt(e.target.value))}
              className="styled-slider"
            />
          </div>

          {/* Result */}
          <div style={{ textAlign: 'center', padding: '28px 0', borderTop: '1px solid var(--border-light)', marginTop: 8 }}>
            <p className="subtitle" style={{ marginBottom: 8 }}>If you cut spending by {sliderVal}%, you'll save</p>
            <div style={{
              fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em',
              background: 'var(--grad-primary)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}>
              {formatCurrency(savings)}
            </div>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--c-indigo)', marginTop: 8 }}>
              Per Year
            </p>
          </div>
        </GlassCard>

        {/* Projection Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Piggy Bank Visual */}
          <GlassCard style={{ textAlign: 'center', padding: '28px 24px' }}>
            <PiggyBank size={64} style={{ color: 'var(--c-purple)', opacity: 0.9, marginBottom: 12 }} />
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Small daily savings compound significantly over time with consistent habits.
            </p>
          </GlassCard>

          {/* Year-by-Year Breakdown */}
          <GlassCard>
            <div className="section-title" style={{ marginBottom: 16 }}>
              <span><TrendingUp size={13} style={{ display: 'inline', marginRight: 6 }} />Compounding Projection</span>
            </div>
            {yearlyBreakdown.map((item, i) => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0',
                borderBottom: i < yearlyBreakdown.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}</span>
                <span style={{
                  fontSize: '0.95rem', fontWeight: 700,
                  background: 'var(--grad-primary)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </section>
  );
};

export default Simulator;
