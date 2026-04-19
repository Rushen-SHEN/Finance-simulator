import { CalcResult, ModelInputs } from '@/lib/calculator';
import Slide from '../Slide';
import styles from '../roadshow.module.css';

interface RevenueSlideProps {
  model: ModelInputs;
  result: CalcResult;
}

const fmtWan = (v: number) => `¥${Math.round(v / 10000).toLocaleString()} 万`;

const REV_YEARS = [1, 2, 3, 4] as const; // index into result.years (Y2–Y5)

function descForYear(i: number): string {
  switch (i) {
    case 1: return '二类首批商业化';
    case 2: return '渠道放量 + 续约';
    case 3: return '三类证放量 + 升级';
    case 4: return '规模化扩张';
    default: return '';
  }
}

export default function RevenueSlide({ model, result }: RevenueSlideProps) {
  const years = result.years;

  // Max beds for bar scaling
  const maxBeds = Math.max(...REV_YEARS.map((i) => years[i]?.cumulative_beds ?? 0), 1);

  // Revenue breakdown rows
  const breakdownRows: Array<{ label: string; key: (i: number) => number }> = [
    { label: '硬件直销', key: (i) => years[i]?.hw_direct ?? 0 },
    { label: '硬件渠道', key: (i) => years[i]?.hw_baxter ?? 0 },
    { label: '升级服务', key: (i) => years[i]?.upgrade_revenue ?? 0 },
    { label: 'SaaS 直销', key: (i) => years[i]?.saas_direct ?? 0 },
    { label: 'SaaS 渠道', key: (i) => years[i]?.saas_baxter ?? 0 },
    { label: '授权/里程碑', key: (i) => years[i]?.baxter_license ?? 0 },
  ];

  // Column indices for breakdown table: Y2, Y3, Y5 (indices 1, 2, 4)
  const tableCols = [1, 2, 4];

  return (
    <Slide
      id="s15-revenue"
      title="收入结构与盈利路径"
      eyebrow="Revenue Structure"
      subtitle="硬件驱动装机、SaaS 形成递延收入、三类升级提升单床 ARPU；渠道合作提供全国放量杠杆。"
      chips={[
        { label: '收入结构已定义', variant: 'fact' },
        { label: '测算口径 · Best Case', variant: 'projected' },
      ]}
    >
      <div className={styles.appendixGrid}>
        {/* ── Left: Revenue cards + Bed bar chart ── */}
        <div className={styles.stack}>
          {/* Revenue summary cards */}
          <div className={styles.gridCols4}>
            {REV_YEARS.map((i) => {
              const y = years[i];
              if (!y) return null;
              return (
                <div key={i} className={styles.metric}>
                  <div className={styles.metricValue}>{fmtWan(y.total_revenue)}</div>
                  <div className={styles.metricLabel}>Y{i + 1} 总收入</div>
                  <div className={styles.metricDetail}>{descForYear(i)}</div>
                </div>
              );
            })}
          </div>

          {/* Bed deployment bar chart */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>装机部署进度（累计床位数）</div>
            <div className={styles.stack} style={{ gap: '0.625rem' }}>
              {REV_YEARS.map((i) => {
                const y = years[i];
                if (!y) return null;
                const pct = Math.round((y.cumulative_beds / maxBeds) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#9db0c9]">Y{i + 1}</span>
                      <span className="text-[#55d5ff] font-semibold">{y.cumulative_beds} 床</span>
                    </div>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right: Revenue breakdown table ── */}
        <div className={styles.stack}>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>收入明细拆分</div>
            <div className={styles.wideTable}>
              {/* Header */}
              <div className={`${styles.tableRow} ${styles.tableRowHeader} ${styles.tableRow4}`}>
                <span>收入项</span>
                {tableCols.map((ci) => (
                  <span key={ci}>Y{ci + 1}</span>
                ))}
              </div>
              {/* Rows */}
              {breakdownRows.map((row) => (
                <div key={row.label} className={`${styles.tableRow} ${styles.tableRow4}`}>
                  <strong>{row.label}</strong>
                  {tableCols.map((ci) => {
                    const v = row.key(ci);
                    return (
                      <span key={ci}>
                        {v > 0 ? fmtWan(v) : '—'}
                      </span>
                    );
                  })}
                </div>
              ))}
              {/* Total row */}
              <div className={`${styles.tableRow} ${styles.tableRow4}`} style={{ borderTop: '1px solid rgba(130,188,255,0.25)' }}>
                <strong style={{ color: '#55d5ff' }}>合计</strong>
                {tableCols.map((ci) => (
                  <span key={ci} style={{ color: '#55d5ff', fontWeight: 700 }}>
                    {fmtWan(years[ci]?.total_revenue ?? 0)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className={styles.appendixNote}>
            上表数据源自 Best Case 模型（Aggressive Timeline + Neutral Scenario）测算结果。
            收入结构中"硬件渠道"仅含 ARIA 实际到手的经销商佣金，非终端售价。
            授权 / 里程碑为一次性收入项，不参与增长率推算。
          </p>
        </div>
      </div>

      <div className={styles.sourceBox}>
        <strong>本页引用：</strong><span className={styles.sourceLine}>BPcc §5.4·§9.3</span>
        <span className={`${styles.sourceLine} ${styles.sourceNote}`}>所有数字为模型输出值，非审计结果。</span>
      </div>
    </Slide>
  );
}
