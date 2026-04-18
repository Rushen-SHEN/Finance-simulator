'use client';
import { CalcResult } from '@/lib/calculator';
import { YEAR_LABELS } from '@/lib/defaults';
import { Bar, Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend, LineController, BarController
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, LineController, BarController);

interface Props { result: CalcResult; }

export default function RevenueCharts({ result }: Props) {
  const y = result.years;
  const hw = y.map(v => v.hw_revenue / 10000);
  const upg = y.map(v => v.upgrade_revenue / 10000);
  const saas = y.map(v => v.saas_revenue / 10000);
  const total = y.map(v => v.total_revenue / 10000);

  const revenueData = {
    labels: YEAR_LABELS,
    datasets: [
      { label: '硬件', data: hw, backgroundColor: '#1A73E8', borderRadius: 6, stack: 's' },
      { label: '升级', data: upg, backgroundColor: '#D97706', borderRadius: 6, stack: 's' },
      { label: 'SaaS', data: saas, backgroundColor: '#7C3AED', borderRadius: 6, stack: 's' },
      { label: '总收入', data: total, type: 'line' as const, borderColor: '#374151', borderDash: [5, 5], borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#374151', fill: false },
    ],
  };

  const structData = {
    labels: YEAR_LABELS,
    datasets: [
      { label: '硬件%', data: y.map(v => v.total_revenue > 0 ? v.hw_revenue / v.total_revenue * 100 : 0), backgroundColor: '#93C5FD', borderRadius: 6, stack: 's' },
      { label: '升级%', data: y.map(v => v.total_revenue > 0 ? v.upgrade_revenue / v.total_revenue * 100 : 0), backgroundColor: '#FCD34D', borderRadius: 6, stack: 's' },
      { label: 'SaaS%', data: y.map(v => v.total_revenue > 0 ? v.saas_revenue / v.total_revenue * 100 : 0), backgroundColor: '#C4B5FD', borderRadius: 6, stack: 's' },
    ],
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 my-5">
      <h2 className="text-[22px] font-bold text-gray-800 mb-6">收入增长与结构演变</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ChartBox title="收入构成（万元）">
          <Chart type="bar" data={revenueData} options={barOpts('万元')} />
        </ChartBox>
        <ChartBox title="收入结构占比">
          <Bar data={structData} options={{ ...barOpts('%'), scales: { ...barOpts('%').scales, y: { ...barOpts('%').scales!.y, max: 100 } } }} />
        </ChartBox>
      </div>
    </section>
  );
}

function ChartBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm text-gray-500 font-semibold mb-3.5">{title}</h3>
      {children}
    </div>
  );
}

function barOpts(yLabel: string) {
  return {
    responsive: true,
    plugins: { legend: { position: 'bottom' as const, labels: { boxWidth: 10, padding: 14 } } },
    scales: { y: { title: { display: true, text: yLabel }, grid: { color: '#F0F0F0' } }, x: { grid: { display: false } } },
  };
}
