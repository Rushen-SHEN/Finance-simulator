import { CalcResult, ModelInputs } from '@/lib/calculator';
import Slide from '../Slide';
import styles from '../roadshow.module.css';

interface MarketSlideProps {
  model: ModelInputs;
  result: CalcResult;
}

const fmtWan = (v: number) => `¥${Math.round(v / 10000).toLocaleString()} 万`;

export default function MarketSlide({ model, result }: MarketSlideProps) {
  const ebitdaYear = result.years.findIndex((y) => y.ebitda > 0);
  const ebitdaLabel = ebitdaYear >= 0 ? `Y${ebitdaYear + 1}` : '—';

  const y2Beds = result.years[1]?.cumulative_beds ?? 0;
  const bedsExpansion = [2, 3, 4]
    .map((i) => result.years[i]?.cumulative_beds ?? 0)
    .join(' → ');

  return (
    <Slide
      id="s06-market"
      title="市场机会"
      eyebrow="Market Opportunity"
      subtitle="ICU 谵妄管理是全球增长最快的重症子赛道之一。中国 15-25 万张 ICU 床位中，谵妄主动筛查覆盖率 <5%。"
      chips={[
        { label: 'TAM/SAM 已引用', variant: 'fact' },
        { label: 'SOM 为测算值', variant: 'projected' },
      ]}
    >
      <div className={styles.pricingGrid}>
        {/* ── Left: Metric cards + SOM panel ── */}
        <div className={styles.stack}>
          <div className={styles.metricGrid}>
            <div className={styles.metric}>
              <div className={styles.metricValue}>15–25 万</div>
              <div className={styles.metricLabel}>中国 ICU 床位数</div>
              <div className={styles.metricDetail}>
                卫健委配置标准 + 各省扩容趋势
              </div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricValue}>¥54–150 亿</div>
              <div className={styles.metricLabel}>TAM · 总可寻址市场</div>
              <div className={styles.metricDetail}>
                硬件+SaaS 全生命周期价值
              </div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricValue}>¥15–40 亿</div>
              <div className={styles.metricLabel}>SAM · 可服务市场</div>
              <div className={styles.metricDetail}>
                三甲医院 + 大型二甲 ICU
              </div>
            </div>
            <div className={styles.metric}>
              <div className={`${styles.metricValue} ${styles.metricHighlight}`}>
                {ebitdaLabel}
              </div>
              <div className={styles.metricLabel}>EBITDA 转正年</div>
              <div className={styles.metricDetail}>
                Best Case 模型测算口径
              </div>
            </div>
          </div>

          {/* SOM growth panel */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>获批后 SOM 增长</div>
            <p className="text-sm text-[#e9f1ff] leading-relaxed">
              Y2 首批装机{' '}
              <span className="text-[#55d5ff] font-bold">{y2Beds} 床</span>
              ，三类证获批后快速放量——Y3 → Y4 → Y5 累计{' '}
              <span className="text-[#55d5ff] font-bold">{bedsExpansion} 床</span>
              ，覆盖北京及一线城市核心 ICU。
            </p>
          </div>
        </div>

        {/* ── Right: Hospital list + Industry panel ── */}
        <div className={styles.stack}>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>北京优先落地场景</div>
            <div className={styles.hospitalList}>
              <HospitalRow name="安贞医院" beds={32} tier="三甲" />
              <HospitalRow name="天坛医院" beds={26} tier="三甲" />
              <HospitalRow name="北大第一医院" beds={20} tier="三甲" />
            </div>
            <p className="text-xs text-[#7590b2] mt-3 leading-relaxed">
              以上为优先接触的样板医院，实际合作进度取决于科室主任意愿与医院采购周期。
            </p>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>产业环境</div>
            <ul className="text-sm text-[#9db0c9] leading-relaxed list-none p-0 m-0 space-y-2">
              <li>
                <span className="text-[#3df0d1] font-semibold">政策利好：</span>
                国家卫健委 ICU 扩容目标、三类 AI 医疗器械绿色通道
              </li>
              <li>
                <span className="text-[#3df0d1] font-semibold">竞争空白：</span>
                国内尚无获证的 ICU 谵妄 AI 辅助系统
              </li>
              <li>
                <span className="text-[#3df0d1] font-semibold">需求刚性：</span>
                ICU 护士短缺 + DRG 控费双重驱动
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Source citations */}
      <div className={styles.sourceBox}>
        <strong>本页引用：</strong><span className={styles.sourceLine}>[30][31]</span>
        <span className={`${styles.sourceLine} ${styles.sourceNote}`}>SOM 增长曲线基于模型部署假设，非承诺数据。</span>
      </div>
    </Slide>
  );
}

// ── Sub-component ──
function HospitalRow({ name, beds, tier }: { name: string; beds: number; tier: string }) {
  return (
    <div className={styles.hospital}>
      <span className={styles.hospitalName}>{name}</span>
      <span className={styles.tier}>{tier}</span>
      <span className={styles.hospitalBeds}>{beds} 床 ICU</span>
    </div>
  );
}
