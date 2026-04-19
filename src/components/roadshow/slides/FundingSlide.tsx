import { CalcResult, ModelInputs } from '@/lib/calculator';
import Slide from '../Slide';
import SOMCurve from '../SOMCurve';
import styles from '../roadshow.module.css';

interface FundingSlideProps {
  model: ModelInputs;
  result: CalcResult;
}

const fmtWan = (v: number) => `${Math.round(v / 10000).toLocaleString()} 万`;
const fmtWanY = (v: number) => `¥${Math.round(v / 10000).toLocaleString()} 万`;
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

export default function FundingSlide({ model, result }: FundingSlideProps) {
  const f = model.funding;
  const ebitdaYear = result.years.findIndex((y) => y.ebitda > 0);
  const ebitdaLabel = ebitdaYear >= 0 ? `Y${ebitdaYear + 1}` : '—';

  const beds = result.years.map((y) => y.cumulative_beds);
  const y5Rev = result.years[4]?.total_revenue ?? 0;

  const rounds: Array<{
    name: string;
    range: string;
    dilution: string;
    timing: string;
  }> = [
    {
      name: '种子轮',
      range: `¥${fmtWan(f.seed_min)}–${fmtWan(f.seed_max)}`,
      dilution: pct(f.seed_dilution),
      timing: 'Y1 Q1–Q2',
    },
    {
      name: 'Pre-A 轮',
      range: `¥${fmtWan(f.preA_min)}–${fmtWan(f.preA_max)}`,
      dilution: pct(f.preA_dilution),
      timing: 'Y2（视现金流）',
    },
    {
      name: 'A 轮',
      range: f.seriesA_max > 0
        ? `¥${fmtWan(f.seriesA_min)}–${fmtWan(f.seriesA_max)}`
        : '视需要启动',
      dilution: f.seriesA_max > 0 ? pct(f.seriesA_dilution) : '—',
      timing: 'Y3–Y4（可选）',
    },
  ];

  return (
    <Slide
      id="s14-funding"
      title="融资计划与 SOM 增长曲线"
      eyebrow="Funding & Growth"
      subtitle="轻量融资策略——种子轮即可覆盖至 EBITDA 转正；后续轮次仅在加速放量时选择性启动。"
      chips={[
        { label: '融资结构已定义', variant: 'plan' },
        { label: 'SOM 为模型测算', variant: 'projected' },
      ]}
    >
      <div className={styles.finGrid}>
        {/* ── Left: SOM Curve ── */}
        <div className={styles.stack}>
          <div className={styles.somCurvePanel}>
            <div className={styles.panelTitle}>SOM 装机增长曲线（累计床位数）</div>
            <SOMCurve beds={beds} />
            <p className={styles.somChartNote}>
              Y1–Y5 基于逐年部署计划（Best Case），Y6–Y10 基于增长率延展测算。
            </p>
          </div>
        </div>

        {/* ── Right: Funding table + Anchors ── */}
        <div className={styles.stack}>
          {/* Funding rounds table */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>融资轮次</div>
            <div className={styles.miniTable}>
              <div className={`${styles.tableRow} ${styles.tableRowHeader} ${styles.tableRow4}`}>
                <span>轮次</span>
                <span>金额</span>
                <span>稀释</span>
                <span>时间</span>
              </div>
              {rounds.map((r) => (
                <div key={r.name} className={`${styles.tableRow} ${styles.tableRow4}`}>
                  <strong>{r.name}</strong>
                  <span>{r.range}</span>
                  <span>{r.dilution}</span>
                  <span>{r.timing}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key financial anchors */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>关键财务锚点</div>
            <div className={styles.gridCols2}>
              <div className={styles.metric}>
                <div className={`${styles.metricValue} ${styles.metricHighlight}`}>
                  {ebitdaLabel}
                </div>
                <div className={styles.metricLabel}>EBITDA 转正</div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricValue}>{fmtWanY(y5Rev)}</div>
                <div className={styles.metricLabel}>Y5 总收入</div>
              </div>
            </div>
          </div>

          {/* Strategy note */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>融资策略说明</div>
            <p className="text-sm text-[#9db0c9] leading-relaxed">
              种子轮资金主要用于 CDMO 原型开发、二类注册、和早期临床部署。
              Best Case 下种子轮即可覆盖至 EBITDA 转正，Pre-A / A 轮仅在加速
              三类商业化或渠道全国复制时选择性启动。
            </p>
          </div>
        </div>
      </div>

      <div className={styles.sourceBox}>
        <strong>本页引用：</strong>
        <span className={styles.sourceLine}>
          融资金额与稀释比例为规划口径，实际以投资协议为准。
        </span>
        <span className={`${styles.sourceLine} ${styles.sourceNote}`}>
          SOM 曲线基于 Best Case 模型参数测算，非承诺数据。
        </span>
      </div>
    </Slide>
  );
}
