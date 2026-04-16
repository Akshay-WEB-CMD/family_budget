import React from 'react';
import type { LucideIcon } from 'lucide-react';
import GlassCard from './GlassCard';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorClass?: 'blue' | 'purple' | 'green' | 'gold';
  adminOnly?: boolean;
  childOnly?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  trend,
  colorClass = 'blue',
  adminOnly,
  childOnly,
}) => {
  return (
    <GlassCard
      className={`stat-card shimmer-card ${colorClass} ${adminOnly ? 'admin-only' : ''} ${childOnly ? 'child-only' : ''}`}
    >
      <div className={`card-icon ${colorClass}`}>
        <Icon size={22} />
      </div>
      <div className="card-info">
        <span className="stat-label">{label}</span>
        <h2>{value}</h2>
        {trend && (
          <span className={`card-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
            {trend.value} <span className="trend-context">this month</span>
          </span>
        )}
      </div>
    </GlassCard>
  );
};

export default StatCard;
