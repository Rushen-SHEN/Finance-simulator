import Slide from '../Slide';
import styles from '../roadshow.module.css';

export default function WhyNowSlide() {
  return (
    <Slide
      id="s04-technology"
      title="机遇之窗：技术发展和政策支持推动谵妄预警"
      eyebrow="Why Now"
      subtitle="现在值得做，不是因为概念更热，而是因为前驱信号研究、边缘部署能力、数据合规框架和北京产业政策正在同时成熟。"
      chips={[
        { label: '技术条件具备', variant: 'fact' },
        { label: '政策窗口存在', variant: 'fact' },
      ]}
    >
      <div className={styles.splitHero}>
        {/* ── Left: Statement + KPI strip ── */}
        <div className={styles.statement}>
          <span className={`${styles.tag} ${styles.tagFact}`}>Opportunity Window</span>
          <p className={styles.statementQuote}>
            谵妄前并非毫无线索，关键在于能否把多源信号变成 ICU 可执行的连续提示。
          </p>
          <p style={{ margin: 0, maxWidth: '46ch', color: '#9db0c9', lineHeight: 1.7, fontSize: '0.9375rem' }}>
            多模态研究显示，HRV、睡眠、临床变量和行为特征可以在发作前提供风险线索；边缘 AI 让这些信号可以在院内、本地、低功耗地被处理<span className={styles.citeInline}>[10][11][12][13]</span>。
          </p>
          <div className={styles.kpiStrip}>
            <div className={styles.kpi}>
              <div className={styles.kpiValue}>4-48h<span className={styles.citeInline}>[10-13]</span></div>
              <div className={styles.kpiLabel}>预警窗口</div>
              <div className={styles.kpiNote}>多篇研究支持发作前存在可识别信号。</div>
            </div>
            <div className={styles.kpi}>
              <div className={styles.kpiValue}>本地推理</div>
              <div className={styles.kpiLabel}>数据不出院</div>
              <div className={styles.kpiNote}>适合 ICU 敏感医疗数据场景。</div>
            </div>
            <div className={styles.kpi}>
              <div className={styles.kpiValue}>15-20W<span className={styles.citeInline}>[19][20]</span></div>
              <div className={styles.kpiLabel}>边缘功耗</div>
              <div className={styles.kpiNote}>支持床旁部署与持续运行。</div>
            </div>
            <div className={styles.kpi}>
              <div className={styles.kpiValue}>¥1.13 万亿<span className={styles.citeInline}>[32]</span></div>
              <div className={styles.kpiLabel}>北京医药健康产业</div>
              <div className={styles.kpiNote}>产业化与试点环境有政策支撑。</div>
            </div>
          </div>
        </div>

        {/* ── Right: Foundation panels ── */}
        <div className={styles.stack}>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>研究基础</div>
            <h3>多模态研究与 HRV / 睡眠研究已把"提前识别"从猜想推进到可研究命题。</h3>
            <p className={styles.subtitle}>
              Mount Sinai 多模态研究、Mayo Clinic HRV 研究、PRE-DELIRIC 与睡眠研究共同为连续预警提供外部依据<span className={styles.citeInline}>[10][11][12][13]</span>。
            </p>
          </div>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>工程基础</div>
            <h3>边缘 AI 硬件和可解释性工具已足以支撑 ICU 床旁原型。</h3>
            <p className={styles.subtitle}>
              Jetson Orin Nano Super、昇腾 Atlas 200 DK 与 SHAP 等工具，让本地推理、低功耗部署和解释输出具备可行性<span className={styles.citeInline}>[19][20][21]</span>。
            </p>
          </div>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>合规基础</div>
            <h3>PIPL、DSL、CSL 与 NMPA 网络安全审查要求已明确<span className={styles.citeInline}>[22-25]</span>。</h3>
            <p className={styles.subtitle}>
              这意味着产品可以从第一天就围绕&quot;最小化采集、数据不出院、可审计&quot;来设计。
            </p>
          </div>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>政策基础</div>
            <h3>北京医药健康产业、首台套与创新器械政策，为试点与产业化提供了现实土壤<span className={styles.citeInline}>[32][33]</span>。</h3>
            <p className={styles.subtitle}>
              这使北京既是临床试点城市，也是产业落地城市。
            </p>
          </div>
        </div>
      </div>

      <div className={styles.sourceBox}>
        <strong>本页引用：</strong><span className={styles.sourceLine}>[10][11][12][13][19][20][21][22][23][24][25][32][33]</span>
      </div>
    </Slide>
  );
}
