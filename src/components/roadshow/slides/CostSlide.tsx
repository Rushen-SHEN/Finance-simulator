import Slide from '../Slide';
import styles from '../roadshow.module.css';

export default function CostSlide() {
  return (
    <Slide
      id="s03-solution"
      title="ICU谵妄隐藏的成本"
      eyebrow="Clinical &amp; Economic Burden"
      subtitle="谵妄的成本并不只体现在一条诊断记录上，它会同时拖累死亡风险、住院时长、长期认知功能和护理资源配置。"
      chips={[
        { label: '临床负担明确', variant: 'fact' },
        { label: '部分费用为测算区间', variant: 'projected' },
      ]}
    >
      <div className={styles.gridCols2}>
        {/* ── Left column ── */}
        <div className={styles.stack}>
          <div className={styles.metricGrid}>
            <div className={styles.metric}>
              <div className={styles.metricValue}>2-4x<span className={styles.citeInline}>[2]</span></div>
              <div className={styles.metricLabel}>ICU 死亡率增加</div>
              <div className={styles.metricDetail}>谵妄与死亡风险显著相关。</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricValue}>5-10 天<span className={styles.citeInline}>[2]</span></div>
              <div className={styles.metricLabel}>住院时间延长</div>
              <div className={styles.metricDetail}>对 ICU 周转与床位效率形成持续压力。</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricValue}>40-60%<span className={styles.citeInline}>[9]</span></div>
              <div className={styles.metricLabel}>6 个月认知障碍</div>
              <div className={styles.metricDetail}>问题会延续到出院后阶段。</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricValue}>¥3-8 万</div>
              <div className={styles.metricLabel}>单例额外费用</div>
              <div className={styles.metricDetail}>为项目测算区间，计算逻辑见关键假设页。</div>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>低活动型的隐形成本</div>
            <h3>低活动型谵妄不是&quot;症状轻&quot;，而是&quot;更难被看到&quot;。</h3>
            <p className={styles.subtitle}>
              这类患者往往不表现为明显躁动，识别率仅 30-40%，却可能承担 25-35% 的 ICU 死亡率<span className={styles.citeInline}>[4]</span>。
            </p>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className={styles.stack}>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>成本如何扩散</div>
            <div className={styles.chainLine}>
              <div className={styles.chainCard}>
                <h3>患者结局</h3>
                <p>死亡风险、长期认知障碍与康复难度提升。</p>
              </div>
              <div className={styles.chainCard}>
                <h3>医院运营</h3>
                <p>住院时间延长，床位与护理资源被持续占用。</p>
              </div>
              <div className={styles.chainCard}>
                <h3>支付与成本</h3>
                <p>额外费用、结算归类方式与住院日变化共同影响经济性。</p>
              </div>
              <div className={styles.chainCard}>
                <h3>护理负荷</h3>
                <p>全员、间断、重复量表评估耗费大量人工时间。</p>
              </div>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>判断重点</div>
            <h3>一个被低估的问题，往往也是流程创新最先能够产生价值的位置。</h3>
            <p className={styles.subtitle}>
              如果系统能够把高危患者更早推到临床面前，它影响的就不只是模型精度，而是 ICU 的整体工作方式。
            </p>
          </div>
        </div>
      </div>

      <div className={styles.sourceBox}>
        <strong>本页引用：</strong><span className={styles.sourceLine}>[2][4][9]</span>
      </div>
    </Slide>
  );
}
