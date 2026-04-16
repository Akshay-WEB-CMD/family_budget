import React, { useEffect } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme } = useFinanceStore();

  useEffect(() => {
    // Apply theme to body
    if (theme === 'oled') {
      document.body.classList.add('oled-mode');
    } else {
      document.body.classList.remove('oled-mode');
    }
  }, [theme]);

  return (
    <div id="app">
      <div className="ambient-bg" />
      {children}
    </div>
  );
};

export default Layout;
