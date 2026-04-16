import React from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { useFinanceStore } from '../store/useFinanceStore';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

const chartColors = {
  housing: '#3ca7ff',
  food: '#ff7e5f',
  transport: '#feb47b',
  entertainment: '#a18cd1',
  health: '#00f2fe',
  shopping: '#f6d365',
  income: '#5eead4'
};

export const CategoryChart: React.FC = () => {
  const { transactions, activeMemberId, members } = useFinanceStore();
  const activeMember = members.find(m => m.id === activeMemberId);
  const isAdmin = activeMember?.role === 'father' || activeMember?.role === 'mother';

  const filtered = isAdmin 
    ? transactions 
    : transactions.filter(tx => tx.memberId === activeMemberId);

  const categories = ['housing', 'food', 'transport', 'entertainment', 'health', 'shopping'];
  const data = categories.map(cat => {
    return filtered
      .filter(tx => tx.category === cat && tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
  });

  const activeLabels = categories.filter((_, i) => data[i] > 0);
  const activeData = data.filter(d => d > 0);

  if (activeData.length === 0) {
    return (
      <div className="empty-chart">
        <p className="subtitle">No expenses recorded yet</p>
      </div>
    );
  }

  const chartData = {
    labels: activeLabels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
    datasets: [{
      data: activeData,
      backgroundColor: activeLabels.map(l => (chartColors as any)[l]),
      borderWidth: 0,
      hoverOffset: 25,
      borderRadius: 12,
      spacing: 10
    }]
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(5, 5, 12, 0.98)',
        titleFont: { family: 'Poppins', size: 15, weight: 'bold' as const },
        bodyFont: { family: 'Inter', size: 14 },
        padding: 18,
        cornerRadius: 20,
        displayColors: true,
        boxPadding: 8,
        borderColor: 'rgba(130, 87, 255, 0.3)',
        borderWidth: 1
      }
    },
    animation: {
      animateScale: true as const,
      animateRotate: true as const,
      duration: 1800,
      easing: 'easeOutExpo' as const
    }
  };

  return <Doughnut data={chartData} options={options} />;
};

export const WealthChart: React.FC = () => {
  const { balance, userProfile, expenses } = useFinanceStore();

  const months = ['Now', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
  const potentialSavings = Math.max(0, userProfile.salary - expenses);
  const data = months.map((_, i) => balance + (potentialSavings * i));

  const chartData = {
    labels: months,
    datasets: [{
      label: 'Wealth Projection',
      data: data,
      borderColor: '#8257ff',
      borderWidth: 5,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#00d2ff',
      pointBorderWidth: 4,
      pointRadius: 6,
      pointHoverRadius: 10,
      backgroundColor: (context: any) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 240);
        gradient.addColorStop(0, 'rgba(130, 87, 255, 0.4)');
        gradient.addColorStop(0.5, 'rgba(0, 210, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 210, 255, 0)');
        return gradient;
      },
      fill: true,
      tension: 0.4
    }]
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 20, bottom: 10 } },
    scales: {
      y: { 
        display: false,
        grid: { display: false }
      },
      x: { 
        grid: { display: false },
        ticks: { 
          color: 'rgba(255,255,255,0.5)',
          font: { family: 'Poppins', size: 12, weight: 'bold' as const }
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(5, 5, 12, 0.98)',
        titleFont: { family: 'Poppins', size: 14, weight: 'bold' as const },
        bodyFont: { family: 'Inter', size: 14, weight: 'bold' },
        padding: 15,
        cornerRadius: 15,
        borderColor: 'rgba(0, 210, 255, 0.3)',
        borderWidth: 1
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  };

  return <Line data={chartData} options={options} />;
};
