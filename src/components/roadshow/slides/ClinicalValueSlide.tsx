import Slide from '../Slide';
import styles from '../roadshow.module.css';

export default function ClinicalValueSlide() {
  return (
    <Slide
      id="s08-traction"
      title="ARIA的核心临床价值"
      eyebrow="Clinical Value"
      subtitle={"核心价值不在\u201c模型给了一个分数\u201d，而在于预警能否驱动人工复评、非药物干预和 ICU 资源更精准配置。"}
      chips={[
        { label: '价值链清晰', variant: 'fact' },
        { label: '结局改善仍待验证', variant: 'projected' },
      ]}
    >
      <div className={styles.valueChain}>
        {/* ── Left: Value chain cards ── */}
        <div className={styles.stack}>
          <div className={styles.chainLine}>
            <div className={styles.chainCard}>
              <span className={`${styles.tag} ${styles.tagFact}`}>系统输出</span>
              <h3>高危预警</h3>
              <p>把值得优先关注的患者提前推到医护团队面前。</p>
            </div>
            <div className={styles.chainCard}>
              <span className={`${styles.tag} ${styles.tagFact}`}>临床执行</span>
              <h3>人工复评</h3>
              <p>护士 / 医师完成 CAM-ICU 复核，确认后进入干预路径。</p>
            </div>
            <div className={styles.chainCard}>
              <span className={`${styles.tag} ${styles.tagFact}`}>临床执行</span>
              <h3>非药物干预</h3>
              <p>环境优化、早期活动与镇静管理调整是关键动作<span className={styles.citeInline}>[14]</span>。</p>
            </div>
            <div className={styles.chainCard}>
              <span className={`${styles.tag} ${styles.tagProjected}`}>需试点验证</span>
              <h3>结局改善</h3>
              <p>最终体现在发生率下降、护理效率改善与住院日优化。</p>
            </div>
          </div>
        </div>

        {/* ── Right: Metrics + summary ── */}
        <div className={styles.stack}>
          <div className={styles.metricGrid}>
            <div className={styles.metric}>
              <div className={styles.metricValue}>≥75%</div>
              <div className={styles.metricLabel}>低活动型敏感性</div>
              <div className={styles.metricDetail}>是临床价值是否真正成立的关键门槛。</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricValue}>≥12h</div>
              <div className={styles.metricLabel}>预警提前量中位数</div>
              <div className={styles.metricDetail}>试点阶段希望验证的核心指标。</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricValue}>15-28%<span className={styles.citeInline}>[14]</span></div>
              <div className={styles.metricLabel}>发生率下降</div>
              <div className={styles.metricDetail}>基于干预有效性与执行转化率的测算。</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricValue}>60-70%</div>
              <div className={styles.metricLabel}>护理工时缩减</div>
              <div className={styles.metricDetail}>基于高危患者触发复评的流程测算。</div>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>最重要的一句话</div>
            <h3>
              ARIA 真正创造的，是&quot;更早发现谁需要被人工确认&quot;，而不是&quot;替代临床做结论&quot;<span className={styles.citeInline}>[10][11]</span>。
            </h3>
            <p className={styles.subtitle}>
              这让产品既有临床价值方向，也保持了足够清晰的风险边界。
            </p>
          </div>
        </div>
      </div>

      <div className={styles.sourceBox}>
        <strong>本页引用：</strong><span className={styles.sourceLine}>[10][11][14]</span>
      </div>
    </Slide>
  );
}
