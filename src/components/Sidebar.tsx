import React, { useState } from 'react';
import { 
  Wallet, 
  LayoutDashboard, 
  PlusCircle, 
  Target, 
  Lightbulb, 
  Sliders, 
  Medal, 
  Bot, 
  UserCog,
  Lock,
  ChevronDown,
  Moon,
  Sun
} from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';

interface SidebarProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeScreen, setActiveScreen }) => {
  const { members, activeMemberId, setActiveMember, theme, setTheme } = useFinanceStore();
  const [showPinModal, setShowPinModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [pendingMemberId, setPendingMemberId] = useState('');
  const [pin, setPin] = useState('');

  const activeMember = members.find(m => m.id === activeMemberId);
  const isAdmin = activeMember?.role === 'father' || activeMember?.role === 'mother';

  const navItems = [
    { id: 'dashboard',   label: 'Dashboard',     icon: LayoutDashboard, adminOnly: false },
    { id: 'add-expense', label: 'Log Spending',   icon: PlusCircle,      adminOnly: false },
    { id: 'budget',      label: 'Budget',         icon: Target,          adminOnly: false },
    { id: 'insights',    label: 'Insights',       icon: Lightbulb,       adminOnly: false },
    { id: 'simulator',   label: 'Simulator',      icon: Sliders,         adminOnly: true  },
    { id: 'gamification',label: 'Achievements',   icon: Medal,           adminOnly: false },
    { id: 'ai-advisor',  label: 'AI Advisor',     icon: Bot,             adminOnly: false, badge: 'AI' },
    { id: 'setup',       label: 'Parental Admin', icon: UserCog,         adminOnly: true  },
  ];

  const handleProfileSwitch = (id: string) => {
    const member = members.find(m => m.id === id);
    if (member?.role === 'father' || member?.role === 'mother') {
      setPendingMemberId(id);
      setShowPinModal(true);
    } else {
      setActiveMember(id);
    }
  };

  const handlePinSubmit = () => {
    if (pin === 'admin123') {
      setActiveMember(pendingMemberId);
      setShowPinModal(false);
      setShowProfileMenu(false);
      setPin('');
    } else {
      alert('Incorrect PIN (Default: admin123)');
    }
  };

  const toggleTheme = () => setTheme(theme === 'oled' ? 'dark' : 'oled');

  return (
    <>
      <nav className="sidebar">
        <div className="logo-area">
          <div className="holographic-logo">
            <Wallet size={32} className="logo-icon-svg" />
          </div>
          <div className="logo-text">
            <span className="logo-main">FINANCE</span>
            <span className="logo-sub">MANAGER</span>
          </div>
        </div>
        
        <ul className="nav-links">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            const Icon = item.icon;
            return (
              <li 
                key={item.id}
                className={activeScreen === item.id ? 'active' : ''}
                onClick={() => setActiveScreen(item.id)}
              >
                <Icon size={22} />
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </li>
            );
          })}
        </ul>

        <div className="sidebar-footer">
          <div className="user-profile-premium">
            <label className="nav-label">Active Profile</label>
            <div 
              className={`profile-trigger ${showProfileMenu ? 'open' : ''}`}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="avatar-mini">{activeMember?.name[0]}</div>
              <div className="profile-info">
                <span className="p-name">{activeMember?.name}</span>
                <span className="p-role">{activeMember?.role}</span>
              </div>
              <ChevronDown size={14} className="chevron" />
            </div>

            {showProfileMenu && (
              <div className="profile-menu glass-card">
                {members.map(m => (
                  <div 
                    key={m.id} 
                    className={`menu-item ${activeMemberId === m.id ? 'active' : ''}`}
                    onClick={() => handleProfileSwitch(m.id)}
                  >
                    <div className="avatar-mini">{m.name[0]}</div>
                    <span>{m.name}</span>
                    {m.id !== activeMemberId && (m.role === 'father' || m.role === 'mother') && <Lock size={12} className="lock-icon" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="theme-switcher-wrapper">
             <button className={`theme-toggle-btn ${theme === 'oled' ? 'oled' : ''}`} onClick={toggleTheme}>
                {theme === 'oled' ? <Sun size={16} /> : <Moon size={16} />}
                <span>{theme === 'oled' ? 'Deep Dark' : 'Dark Mode'}</span>
             </button>
          </div>
        </div>
      </nav>

      {showPinModal && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="glass-card pin-card">
            <h3><Lock size={24} style={{ marginBottom: 8 }} /> Parent Access</h3>
            <p className="subtitle">Enter PIN to switch profile</p>
            <input 
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="text-input pin-input-field" 
              placeholder="Enter PIN"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handlePinSubmit()}
            />
            <div className="modal-actions">
              <button 
                onClick={() => setShowPinModal(false)}
                className="secondary-btn"
              >
                Cancel
              </button>
              <button 
                onClick={handlePinSubmit}
                className="primary-btn"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
