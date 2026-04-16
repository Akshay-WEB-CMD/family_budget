import { state } from './state';

declare const Chart: any;

let categoryChart: any = null;
let wealthChart: any = null;

const chartColors = {
  housing: '#4facfe',
  food: '#ff7f50',
  transport: '#ff4757',
  entertainment: '#c471ed',
  health: '#1dd1a1',
  shopping: '#fdcb6e',
  income: '#00f2fe'
};

export function updateCharts() {
  updateCategoryChart();
  updateWealthChart();
}

function updateCategoryChart() {
  const ctx = document.getElementById('categoryChart') as HTMLCanvasElement;
  if (!ctx) return;

  const categories = ['housing', 'food', 'transport', 'entertainment', 'health', 'shopping'];
  const data = categories.map(cat => {
    return state.transactions
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

  if (categoryChart) {
    categoryChart.data.labels = activeLabels.map(l => l.charAt(0).toUpperCase() + l.slice(1));
    categoryChart.data.datasets[0].data = activeData;
    categoryChart.update();
  } else {
    categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: activeLabels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
        datasets: [{
          data: activeData,
          backgroundColor: activeLabels.map(l => (chartColors as any)[l]),
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        cutout: '75%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(3, 7, 18, 0.9)',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 12,
            cornerRadius: 12,
          }
        }
      }
    });
  }
}

function updateWealthChart() {
  const ctx = document.getElementById('wealthChart') as HTMLCanvasElement;
  if (!ctx) return;

  const months = ['Current', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
  
  // Dynamic monthly savings based on salary - expenses
  const averageMonthlyExpenses = state.expenses; 
  const potentialSavings = Math.max(0, state.userProfile.salary - averageMonthlyExpenses);
  
  const data = months.map((_, i) => state.balance + (potentialSavings * i));

  if (wealthChart) {
    wealthChart.data.datasets[0].data = data;
    wealthChart.update();
  } else {
    wealthChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Projected Wealth (₹)',
          data: data,
          borderColor: '#4facfe',
          backgroundColor: 'rgba(79, 172, 254, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { 
            display: false,
            grid: { display: false }
          },
          x: { 
            grid: { display: false },
            ticks: { color: 'rgba(255,255,255,0.5)' }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}
