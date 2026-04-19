import { CalcResult, ModelInputs } from '@/lib/calculator';
import Slide from '../Slide';
import styles from '../roadshow.module.css';

interface GlossarySlideProps {
  model: ModelInputs;
  result: CalcResult;
}

// ── Helpers ──────────────────────────────────────────────────
const fmtWan = (v: number) => `¥${Math.round(v / 10000).toLocaleString()}万`;
const fmtYi = (v: number) => `¥${(v / 100000000).toFixed(1)}亿`;
const pct = (v: number) => `${(v * 100).toFixed(0)}%`;

interface GlossaryEntry {
  abbr: string;
  full: string;
  desc: string;
  /** Live value from simulator — undefined if purely definitional */
  live?: string;
}

export default function GlossarySlide({ model, result }: GlossarySlideProps) {
  const g = model.global;
  const f = model.funding;
  const y = result.years;

  // Y5 data for key metrics
  const y5 = y[4];
  // Find first EBITDA-positive year
  const ebitdaPosYear = y.findIndex((yr) => yr.ebitda > 0) + 1;
  // ARR ≈ SaaS recurring revenue (direct + baxter) at Y5
  const arrY5 = y5.saas_direct + y5.saas_baxter;
  // Penetration = cumulative beds at Y10 / SAM beds
  // SAM in 万元, each bed ≈ price_saas_c3/year, approximate bed capacity
  const somY10 = y[9].cumulative_beds;
  // COGS rate at Y5
  const cogsRateY5 = y5.total_revenue > 0 ? y5.cogs / y5.total_revenue : 0;
  // ROI (C3 3-year basis)
  const c3AnnualCost = g.price_hw_c3 / 3 + g.price_saas_c3;
  const c3ROI = g.value_anchor_c3 > 0 ? Math.round((g.value_anchor_c3 / c3AnnualCost - 1) * 100) : 0;

  const entries: [GlossaryEntry, GlossaryEntry][] = [
    [
      {
        abbr: 'ARR',
        full: 'Annual Recurring Revenue',
        desc: '年度经常性收入，SaaS订阅模式下按年计算的可预期收入',
        live: `Y5 ${fmtWan(arrY5)}`,
      },
      {
        abbr: 'EBITDA',
        full: 'Earnings Before Interest, Taxes, Depreciation & Amortization',
        desc: '息税折旧摊销前利润',
        live: ebitdaPosYear > 0 ? `Y${ebitdaPosYear} 转正 → Y5 ${fmtWan(y5.ebitda)}` : '尚未转正',
      },
    ],
    [
      {
        abbr: 'SOM',
        full: 'Serviceable Obtainable Market',
        desc: '可获得服务市场，实际可触达的市场规模',
        live: `Y10 ${somY10.toLocaleString()} 床`,
      },
      {
        abbr: 'SAM',
        full: 'Serviceable Available Market',
        desc: '可服务市场，产品理论可覆盖的市场总量',
        live: `${fmtYi(g.sam_midpoint * 10000)}`,
      },
    ],
    [
      {
        abbr: 'SaaS',
        full: 'Software as a Service',
        desc: '软件即服务，按订阅周期收费的云/端软件模式',
        live: `C2 ${fmtWan(g.price_saas_c2)}/年 · C3 ${fmtWan(g.price_saas_c3)}/年`,
      },
      {
        abbr: 'BOM',
        full: 'Bill of Materials',
        desc: '物料清单，硬件产品的原材料与零部件成本',
        live: `C2 ${fmtWan(result.bom_c2)} · C3 ${fmtWan(result.bom_c3)}`,
      },
    ],
    [
      {
        abbr: 'COGS',
        full: 'Cost of Goods Sold',
        desc: '销货成本，直接用于生产产品的费用总和',
        live: `Y5 ${pct(cogsRateY5)} of Rev`,
      },
      {
        abbr: 'OpEx',
        full: 'Operating Expenses',
        desc: '运营支出，研发/销售/管理等日常经营开支',
        live: `Y5 ${fmtWan(y5.opex)}`,
      },
    ],
    [
      {
        abbr: 'P&L',
        full: 'Profit & Loss Statement',
        desc: '损益表，记录收入与支出的财务报表',
        live: `Y5 净利润 ${fmtWan(y5.net_profit)}`,
      },
      {
        abbr: 'CDMO',
        full: 'Contract Development & Manufacturing Organization',
        desc: '合同研发与生产组织',
        live: `NRE ${fmtWan(model.opex.cdmo_nre.reduce((a, b) => a + b, 0))} 累计`,
      },
    ],
    [
      {
        abbr: 'CRO',
        full: 'Contract Research Organization',
        desc: '合同研究组织，承接临床试验外包',
        live: `${fmtWan(model.opex.cro.reduce((a, b) => a + b, 0))} 累计`,
      },
      {
        abbr: 'NRE',
        full: 'Non-Recurring Engineering',
        desc: '一次性工程费用，首次开模/认证等不重复成本',
        live: `${fmtWan(model.opex.cdmo_nre.reduce((a, b) => a + b, 0))}`,
      },
    ],
    [
      {
        abbr: 'NMPA',
        full: '国家药品监督管理局',
        desc: '中国医疗器械注册审批的主管部门',
      },
      {
        abbr: 'C2/C3',
        full: '二类/三类医疗器械',
        desc: '按风险等级分类，C2由省局审批，C3由NMPA审批',
        live: `C2 ${fmtWan(g.price_hw_c2)} · C3 ${fmtWan(g.price_hw_c3)}`,
      },
    ],
    [
      {
        abbr: '谵妄',
        full: 'Delirium',
        desc: 'ICU常见急性脑功能障碍，表现为意识模糊、注意力涣散，发生率60-80%',
      },
      {
        abbr: '边缘AI',
        full: 'Edge AI',
        desc: '在设备端本地运行的AI推理，无需上传云端，满足医疗数据隐私与实时性要求',
        live: `计算模块 ${fmtWan(g.bom_edge_compute)}/台`,
      },
    ],
    [
      {
        abbr: 'ROI',
        full: 'Return on Investment',
        desc: '投资回报率，此处指医院采购ARIA的经济效益',
        live: `C3 三年 ${c3ROI}%`,
      },
      {
        abbr: 'Pre-A / Series A',
        full: '融资轮次',
        desc: 'Pre-A为天使轮后首次机构融资，Series A为首轮正式风险投资',
        live: `种子 ${fmtWan(f.seed_max)} · Pre-A ${fmtWan(f.preA_max)} · A轮 ${fmtWan(f.seriesA_max)}`,
      },
    ],
    [
      {
        abbr: '续约率',
        full: 'Renewal Rate',
        desc: 'SaaS客户年度续费比例，直接影响ARR存量和LTV',
        live: pct(g.rr_base),
      },
      {
        abbr: '穿透率',
        full: 'Penetration',
        desc: 'SOM占SAM比例，反映市场渗透深度',
        live: `Y10 ${(somY10 > 0 && g.sam_midpoint > 0)
          ? pct(y[9].total_revenue / (g.sam_midpoint * 10000))
          : '—'}`,
      },
    ],
  ];

  return (
    <Slide
      id="s17-glossary"
      title="术语表"
      eyebrow="Glossary"
      subtitle="数值实时来自模拟器参数，调整参数后自动更新。"
      chips={[{ label: '实时联动', variant: 'projected' }]}
    >
      <div className={styles.glossaryGrid}>
        {entries.map(([left, right], i) => (
          <div key={i} className={styles.glossaryRow}>
            <GlossaryCard entry={left} />
            <GlossaryCard entry={right} />
          </div>
        ))}
      </div>
    </Slide>
  );
}

function GlossaryCard({ entry }: { entry: GlossaryEntry }) {
  return (
    <div className={styles.glossaryCard}>
      <div className={styles.glossaryHead}>
        <span className={styles.glossaryAbbr}>{entry.abbr}</span>
        <span className={styles.glossaryFull}>{entry.full}</span>
      </div>
      <p className={styles.glossaryDesc}>{entry.desc}</p>
      {entry.live && (
        <div className={styles.glossaryLive}>
          <span className={styles.glossaryLiveIcon}>◉</span>
          {entry.live}
        </div>
      )}
    </div>
  );
}
