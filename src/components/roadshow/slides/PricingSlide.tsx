import { CalcResult, ModelInputs } from '@/lib/calculator';
import Slide from '../Slide';
import styles from '../roadshow.module.css';

interface PricingSlideProps {
  model: ModelInputs;
  result: CalcResult;
}

// ── Helpers ──────────────────────────────────────────────────
const fmtWan = (v: number, suffix = '') =>
  `¥${(v / 10000).toFixed(1)} 万${suffix}`;

function computeROI(annualCost: number, anchor: number): number {
  return anchor > 0 ? Math.round((anchor / annualCost - 1) * 100) : 0;
}

// ── Component ────────────────────────────────────────────────
export default function PricingSlide({ model, result }: PricingSlideProps) {
  const g = model.global;

  // Annualized costs (3-year amortisation)
  const c2AnnualCost = g.price_hw_c2 / 3 + g.price_saas_c2;
  const c3AnnualCost = g.price_hw_c3 / 3 + g.price_saas_c3;
  const c3uAnnualCost = g.price_upgrade / 3 + g.price_saas_c3;
  const c3_5yrAnnualCost = g.price_hw_c3 / 5 + g.price_saas_c3_bulk;

  const c2ROI = computeROI(c2AnnualCost, g.value_anchor_c2);
  const c3ROI = computeROI(c3AnnualCost, g.value_anchor_c3);
  const c3uROI = computeROI(c3uAnnualCost, g.value_anchor_c3);
  const c3_5yrROI = computeROI(c3_5yrAnnualCost, g.value_anchor_c3);

  return (
    <Slide
      id="s10-pricing"
      title="商业模式"
      eyebrow="Business Model"
      subtitle="硬件建立装机，SaaS 形成递延收入，二类向三类升级提升单床价值；渠道合作提供放大器，但不是当前唯一依赖。"
      chips={[
        { label: '收入结构已定义', variant: 'fact' },
        { label: 'ROI 为测算口径', variant: 'projected' },
      ]}
    >
      <div className={styles.pricingGrid}>
        {/* ── Left column: Pricing + Summary Table ── */}
        <div className={styles.stack}>
          {/* Price cards */}
          <div className={styles.gridCols2}>
            <div className={styles.priceCard}>
              <div className={styles.panelTitle}>二类证 · 辅助监测版</div>
              <div className={styles.price}>
                {fmtWan(g.price_hw_c2, ' / 床')}
              </div>
              <p className={styles.priceLabel}>硬件一次性定价</p>
              <div className={styles.price}>
                {fmtWan(g.price_saas_c2, ' / 床 / 年')}
              </div>
              <p className={styles.priceLabel}>SaaS 订阅</p>
            </div>

            <div className={styles.priceCard}>
              <div className={styles.panelTitle}>三类证 · 预警诊断版</div>
              <div className={styles.price}>
                {fmtWan(g.price_hw_c3, ' / 床')}
              </div>
              <p className={styles.priceLabel}>硬件一次性定价</p>
              <div className={styles.price}>
                {fmtWan(g.price_saas_c3, ' / 床 / 年')}
              </div>
              <p className={styles.priceLabel}>
                SaaS 订阅；五年期可降至{' '}
                <span className="text-[#55d5ff]">
                  {fmtWan(g.price_saas_c3_bulk)}
                </span>{' '}
                / 年
              </p>
            </div>
          </div>

          {/* Channel info panel */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>合作经销商双渠道</div>
            <h3 className="text-sm font-semibold text-[#e9f1ff] mb-1">
              直销打样板医院，合作经销商用于放大装机与全国复制。
            </h3>
            <p className="text-xs text-[#9db0c9] leading-relaxed">
              渠道条款、授权金与分成比例目前均按规划口径呈现，实际仍取决于谈判结果。
            </p>
          </div>

          {/* Pricing summary table */}
          <div className={styles.miniTable}>
            <div className={`${styles.tableRow} ${styles.tableRowHeader}`}>
              <span>收入项</span>
              <span>二类</span>
              <span>三类 / 升级</span>
            </div>
            <div className={styles.tableRow}>
              <strong>硬件</strong>
              <span>{fmtWan(g.price_hw_c2)}</span>
              <span>{fmtWan(g.price_hw_c3)}</span>
            </div>
            <div className={styles.tableRow}>
              <strong>SaaS</strong>
              <span>{fmtWan(g.price_saas_c2, ' / 年')}</span>
              <span>{fmtWan(g.price_saas_c3, ' / 年')}</span>
            </div>
            <div className={styles.tableRow}>
              <strong>升级服务</strong>
              <span>—</span>
              <span>{fmtWan(g.price_upgrade, ' / 床')}</span>
            </div>
            <div className={styles.tableRow}>
              <strong>渠道合作</strong>
              <span>直销为主</span>
              <span>直销 + 合作经销商</span>
            </div>
          </div>
        </div>

        {/* ── Right column: ROI + Purchase Logic ── */}
        <div className={styles.stack}>
          {/* ROI panel */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>医院 ROI</div>
            <h3 className="text-sm font-semibold text-[#e9f1ff] mb-2">
              <strong>医院 ROI</strong>：三种主要采购路径下，医院 ROI
              均为正，差别在于价值兑现速度与证据强度
              <span className="text-[#7590b2] text-xs">[14][30][31]</span>。
            </h3>

            <div className={styles.roiCardGrid}>
              <ROICard
                name="二类新购（3 年期）"
                value={`+${c2ROI}%`}
                cost={`年化费用 ${fmtWan(c2AnnualCost, ' / 床')}`}
                anchor={`价值锚点 ${fmtWan(g.value_anchor_c2, ' / 床 / 年')}`}
              />
              <ROICard
                name="三类新购（3 年期）"
                value={`+${c3ROI}%`}
                cost={`年化费用 ${fmtWan(c3AnnualCost, ' / 床')}`}
                anchor={`价值锚点 ${fmtWan(g.value_anchor_c3, ' / 床 / 年')}`}
              />
              <ROICard
                name="三类升级（3 年期）"
                value={`+${c3uROI}%`}
                cost={`年化费用 ${fmtWan(c3uAnnualCost, ' / 床')}`}
                anchor={`价值锚点 ${fmtWan(g.value_anchor_c3, ' / 床 / 年')}`}
              />
            </div>

            <p className={styles.roiSummary}>
              补充情形：三类新购采用 5 年期 + SaaS 量折时，医院 ROI
              仍为正，对应约{' '}
              <span className="text-[#3df0d1] font-bold">+{c3_5yrROI}%</span>。
            </p>
          </div>

          {/* Purchase logic panel */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>采购逻辑</div>
            <h3 className="text-sm font-semibold text-[#e9f1ff] mb-1">
              当前更准确的表述不是&ldquo;支付闭环已形成&rdquo;，而是&ldquo;采购讨论已有可计算的价值锚点&rdquo;。
            </h3>
            <p className="text-xs text-[#9db0c9] leading-relaxed">
              价值锚点由成本下降、护理工时优化、DRG
              编码收益与住院日缩短等部分组成，其中后两项仍需真实世界数据支持。
            </p>
          </div>
        </div>
      </div>

      {/* Source citations */}
      <div className={styles.sourceBox}>
        <strong>本页引用：</strong>
        <span className={styles.sourceLine}>
          [14] Effectiveness of multicomponent nonpharmacological delirium
          interventions
        </span>
        <span className={styles.sourceLine}>
          [30] 中国重症医学学科发展报告（2024）；国家卫生健康委员会 ICU
          床位配置标准
        </span>
        <span className={styles.sourceLine}>
          [31] Royalty Rates for Licensing Intellectual Property
        </span>
        <span className={`${styles.sourceLine} ${styles.sourceNote}`}>
          ROI 与渠道条款为经营测算，详细逻辑见关键假设页。
        </span>
      </div>
    </Slide>
  );
}

// ── Sub-component ────────────────────────────────────────────
function ROICard({
  name,
  value,
  cost,
  anchor,
}: {
  name: string;
  value: string;
  cost: string;
  anchor: string;
}) {
  return (
    <div className={styles.roiCard}>
      <div className={styles.roiName}>{name}</div>
      <div className={styles.roiValue}>{value}</div>
      <div className={styles.roiMeta}>{cost}</div>
      <div className={styles.roiMeta}>{anchor}</div>
    </div>
  );
}
