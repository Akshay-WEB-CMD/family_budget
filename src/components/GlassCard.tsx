import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, style }) => {
  return (
    <div className={`glass-card ${className}`} onClick={onClick} style={style}>
      {children}
    </div>
  );
};

export default GlassCard;
