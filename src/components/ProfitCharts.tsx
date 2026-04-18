'use client';
import { CalcResult } from '@/lib/calculator';
import { YEAR_LABELS } from '@/lib/defaults';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend, LineController, BarController
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, LineController, BarController);

interface Props { result: CalcResult; }

export default function ProfitCharts({ result }: Props) {
  const y = result.years;
  const ebitda = y.map(v => v.ebitda / 10000);
  const netProfit = y.map(v => v.net_profit / 10000);
  const cumBeds = y.map(v => v.cumulative_beds);
  const activeBeds = y.map(v => v.active_paying);

  const profitData = {
    labels: YEAR_LABELS,
    datasets: [
      {
        label: 'EBITDA',
        data: ebitda,
        backgroundColor: ebitda.map(v => v >= 0 ? 'rgba(13,159,110,0.7)' : 'rgba(220,38,38,0.5)'),
        borderRadius: 6,
      },
      {
        label: '净利润',
        data: netProfit,
        type: 'line' as const,
        borderColor: '#374151',
        borderWidth: 2,
        pointRadius: 5,
        pointBackgroundColor: '#374151',
        fill: false,
      },
    ],
  };

  const bedsData = {
    labels: YEAR_LABELS,
    datasets: [
      {
        label: '累计部署',
        data: cumBeds,
        backgroundColor: 'rgba(26,115,232,0.2)',
        borderColor: '#1A73E8',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: '活跃付费',
        data: activeBeds,
        type: 'line' as const,
        borderColor: '#0D9F6E',
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#0D9F6E',
        fill: false,
      },
    ],
  };

  const breakEvenYear = ebitda.findIndex(v => v > 0);

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 my-5">
      <h2 className="text-[22px] font-bold text-gray-800 mb-1">
        盈利路径 — EBITDA {breakEvenYear >= 0 ? `Year ${breakEvenYear + 1}` : '未'}转正
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm text-gray-500 font-semibold mb-3.5">EBITDA与净利润（万元）</h3>
          <Chart type="bar" data={profitData} options={{
            responsive: true,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 14 } } },
            scales: { y: { title: { display: true, text: '万元' }, grid: { color: '#F0F0F0' } }, x: { grid: { display: false } } },
          }} />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm text-gray-500 font-semibold mb-3.5">累计部署 vs 活跃付费床位</h3>
          <Chart type="bar" data={bedsData} options={{
            responsive: true,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 14 } } },
            scales: { y: { title: { display: true, text: '床位' }, grid: { color: '#F0F0F0' } }, x: { grid: { display: false } } },
          }} />
        </div>
      </div>
    </section>
  );
}
