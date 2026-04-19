import Slide from '../Slide';
import styles from '../roadshow.module.css';

export default function ProblemSlide() {
  return (
    <Slide
      id="s02-problem"
      title="ICU 谵妄：被忽视的重症挑战"
      eyebrow="Clinical Challenge"
      subtitle="问题并不稀少，真正的难点在于它高发、伤害重，而且在 ICU 的现有工作流中往往被过晚发现。"
      chips={[
        { label: '高频', variant: 'fact' },
        { label: '高痛', variant: 'fact' },
        { label: '现流程存在盲区', variant: 'fact' },
      ]}
    >
      <div className={styles.processLane}>
        {/* ── Left: Process lane ── */}
        <div className={styles.lane}>
          <div className={styles.panelTitle}>现有流程的结构性断点</div>
          <div className={styles.laneStep}>
            <strong>CAM-ICU 依赖人工量表，每 4-8 小时评估一次</strong>
            <span>患者状态在间断评估之间持续波动，关键窗口容易被错过。</span>
          </div>
          <div className={`${styles.laneStep} ${styles.laneStepBreak}`}>
            <strong>漏诊率约 40%<span className={styles.citeInline}>[3]</span></strong>
            <span>间断评估难以覆盖完整的临床表征时间窗。</span>
          </div>
          <div className={`${styles.laneStep} ${styles.laneStepBreak}`}>
            <strong>低活动型谵妄隐匿且更危险</strong>
            <span>嗜睡、淡漠等表现不易被肉眼快速识别，却承担更高死亡风险。</span>
          </div>
          <div className={`${styles.laneStep} ${styles.laneStepBreak}`}>
            <strong>中国 ICU 规范评估率仅约 30%<span className={styles.citeInline}>[6]</span></strong>
            <span>护理人力压力和数据基础设施不足，使常规评估难以稳定执行。</span>
          </div>
        </div>

        {/* ── Right: Metrics + Panel ── */}
        <div className={styles.stack}>
          <div className={styles.metricGrid}>
            <div className={styles.metric}>
              <div className={styles.metricValue}>60-80%<span className={styles.citeInline}>[1][2]</span></div>
              <div className={styles.metricLabel}>综合 ICU 发生率</div>
              <div className={styles.metricDetail}>机械通气患者可进一步升高。</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricValue}>56.8%<span className={styles.citeInline}>[6]</span></div>
              <div className={styles.metricLabel}>中国多中心发生率</div>
              <div className={styles.metricDetail}>23 家三甲医院、n=1,213。</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricValue}>30-45%<span className={styles.citeInline}>[5]</span></div>
              <div className={styles.metricLabel}>低活动型占比</div>
              <div className={styles.metricDetail}>识别难、后果重，是最关键的临床盲区。</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricValue}>30%<span className={styles.citeInline}>[6]</span></div>
              <div className={styles.metricLabel}>规范评估率</div>
              <div className={styles.metricDetail}>中国 ICU 场景执行率仍偏低。</div>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>为什么必须解决</div>
            <h3>如果问题高发、后果严重、且现行流程天然依赖间断人工观察，那么连续预警就不是"锦上添花"，而是流程补位。</h3>
            <p className={styles.subtitle}>ARIA 针对的不是一个模糊命题，而是 ICU 谵妄被发现得太晚这一具体且反复出现的痛点。</p>
          </div>
        </div>
      </div>

      <div className={styles.sourceBox}>
        <strong>本页引用：</strong><span className={styles.sourceLine}>[1][2][3][5][6]</span>
      </div>
    </Slide>
  );
}
