import { state } from './state';

declare const Chart: any;

let categoryChart: any = null;
let wealthChart: any = null;

// SYNCED WITH AURORA NEBULA DESIGN SYSTEM
const chartColors = {
  housing: '#3ca7ff',
  food: '#ff7e5f',
  transport: '#feb47b',
  entertainment: '#a18cd1',
  health: '#00f2fe',
  shopping: '#f6d365',
  income: '#5eead4'
};

export function updateCharts() {
  updateCategoryChart();
  updateWealthChart();
}

function updateCategoryChart() {
  const ctx = document.getElementById('categoryChart') as HTMLCanvasElement;
  if (!ctx) return;

  const activeMember = state.members.find(m => m.id === state.activeMemberId);
  const isAdmin = activeMember ? (activeMember.role === 'father' || activeMember.role === 'mother') : true;

  const filtered = isAdmin 
    ? state.transactions 
    : state.transactions.filter(tx => tx.memberId === state.activeMemberId);

  const categories = ['housing', 'food', 'transport', 'entertainment', 'health', 'shopping'];
  const data = categories.map(cat => {
    return filtered
      .filter(tx => tx.category === cat && tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
  });

  const activeLabels = categories.filter((_, i) => data[i] > 0);
  const activeData = data.filter(d => d > 0);

  if (activeData.length === 0) {
    if (categoryChart) categoryChart.destroy();
    categoryChart = null;
    return;
  }

  const chartData = {
    labels: activeLabels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
    datasets: [{
      data: activeData,
      backgroundColor: activeLabels.map(l => (chartColors as any)[l]),
      borderWidth: 0, // Borderless for cleaner glass look
      hoverOffset: 25,
      borderRadius: 12,
      spacing: 10
    }]
  };

  if (categoryChart) {
    categoryChart.data = chartData;
    categoryChart.update();
  } else {
    categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(5, 5, 12, 0.98)',
            titleFont: { family: 'Poppins', size: 15, weight: '700' },
            bodyFont: { family: 'Inter', size: 14 },
            padding: 18,
            cornerRadius: 20,
            displayColors: true,
            boxPadding: 8,
            borderColor: 'rgba(130, 87, 255, 0.3)',
            borderWidth: 1,
            shadowBlur: 20,
            shadowColor: 'rgba(0,0,0,0.5)'
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 1800,
          easing: 'easeOutExpo'
        }
      }
    });
  }
}

function updateWealthChart() {
  const ctx = document.getElementById('wealthChart') as HTMLCanvasElement;
  if (!ctx) return;

  const months = ['Now', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
  const potentialSavings = Math.max(0, state.userProfile.salary - state.expenses);
  const data = months.map((_, i) => state.balance + (potentialSavings * i));

  const chartCtx = ctx.getContext('2d');
  let gradient = null;
  if (chartCtx) {
    gradient = chartCtx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(130, 87, 255, 0.4)');
    gradient.addColorStop(0.5, 'rgba(0, 210, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 210, 255, 0)');
  }

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
      backgroundColor: gradient || 'rgba(130, 87, 255, 0.1)',
      fill: true,
      tension: 0.4,
      // Add Glow Effect
      shadowBlur: 20,
      shadowColor: 'rgba(130, 87, 255, 0.8)',
      shadowOffsetX: 0,
      shadowOffsetY: 0
    }]
  };

  if (wealthChart) {
    wealthChart.data = chartData;
    wealthChart.update();
  } else {
    wealthChart = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
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
              font: { family: 'Poppins', size: 12, weight: '600' }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(5, 5, 12, 0.98)',
            titleFont: { family: 'Poppins', size: 14, weight: '700' },
            bodyFont: { family: 'Inter', size: 14, weight: 'bold' },
            padding: 15,
            cornerRadius: 15,
            borderColor: 'rgba(0, 210, 255, 0.3)',
            borderWidth: 1
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }
}
