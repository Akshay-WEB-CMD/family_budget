import React, { useState, useEffect } from 'react';
import { useFinanceStore } from './store/useFinanceStore';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import Budget from './pages/Budget';
import Insights from './pages/Insights';
import Simulator from './pages/Simulator';
import Achievements from './pages/Achievements';
import AIAdvisor from './pages/AIAdvisor';
import FinancialSetup from './pages/FinancialSetup';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const checkAndRefreshCredits = useFinanceStore(state => state.checkAndRefreshCredits);

  useEffect(() => {
    checkAndRefreshCredits();
  }, [checkAndRefreshCredits]);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard': return <Dashboard />;
      case 'add-expense': return <AddExpense />;
      case 'budget': return <Budget />;
      case 'insights': return <Insights />;
      case 'simulator': return <Simulator />;
      case 'gamification': return <Achievements />;
      case 'ai-advisor': return <AIAdvisor />;
      case 'setup': return <FinancialSetup />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout>
      <Sidebar activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
      <main className="content-area">
        {renderScreen()}
      </main>
    </Layout>
  );
};

export default App;
