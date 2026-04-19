import Slide from '../Slide';
import styles from '../roadshow.module.css';

export default function CoverSlide() {
  return (
    <Slide
      id="s01-cover"
      title=""
      eyebrow="Project No. 2610865"
      chips={[
        { label: '临床问题已被证实', variant: 'fact' },
        { label: '当前阶段：原型开发', variant: 'plan' },
      ]}
    >
      <div className={styles.heroGrid}>
        {/* ── Left: Hero card ── */}
        <div className={styles.heroCard}>
          <span className={`${styles.tag} ${styles.tagFact}`}>ARIA</span>
          <h2>ICU谵妄智能监测系统</h2>
          <p>
            项目编号 <strong>2610865</strong>。ARIA 以<strong>非接触式床垫传感、本地视频行为分析、HIS 临床变量融合</strong>构建连续风险预警，目标是在 ICU 床旁更早识别高危患者，为人工复评和临床干预争取时间窗口。
          </p>
        </div>

        {/* ── Right: Metrics + Status ── */}
        <div className={styles.stack}>
          <div className={styles.metricGrid}>
            <div className={styles.metric}>
              <div className={styles.metricValue}>60-80%<span className={styles.citeInline}>[1][2]</span></div>
              <div className={styles.metricLabel}>ICU 谵妄发生率</div>
              <div className={styles.metricDetail}>综合 ICU 场景属于高发问题。</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricValue}>2-4x<span className={styles.citeInline}>[1][2]</span></div>
              <div className={styles.metricLabel}>死亡率上升</div>
              <div className={styles.metricDetail}>谵妄与不良临床结局显著相关。</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricValue}>15 min</div>
              <div className={styles.metricLabel}>风险提示节奏</div>
              <div className={styles.metricDetail}>连续输出低 / 中 / 高风险分层。</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricValue}>3 模态</div>
              <div className={styles.metricLabel}>数据融合</div>
              <div className={styles.metricDetail}>床垫传感 + 视频行为 + HIS 变量。</div>
            </div>
          </div>

          <div className={`${styles.panel} ${styles.statusCard}`}>
            <div className={styles.panelTitle}>项目状态</div>
            <div className={styles.statusLine}>
              <div className={styles.statusDot} />
              <div className={styles.statusCopy}>
                <strong>功能原型开发中</strong>
                <span>项目处于产品工程化早期，尚未进入获批或规模化销售阶段。</span>
              </div>
            </div>
            <div className={styles.statusLine}>
              <div className={styles.statusDot} />
              <div className={styles.statusCopy}>
                <strong>未申报专利</strong>
                <span>专利提交、试点落地与渠道合作均属于下一阶段重点工作。</span>
              </div>
            </div>
            <div className={styles.statusLine}>
              <div className={styles.statusDot} />
              <div className={styles.statusCopy}>
                <strong>无外部融资</strong>
                <span>当前由创始团队自筹推进，融资计划与财务预测见后续页面。</span>
              </div>
            </div>
            <div className={styles.statusLine}>
              <div className={styles.statusDot} />
              <div className={styles.statusCopy}>
                <strong>试点与渠道仍待验证</strong>
                <span>医院试点、Baxter 渠道与商业化节奏均以规划和测算口径呈现。</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sourceBox}>
        <strong>本页引用：</strong><span className={styles.sourceLine}>[1][2]</span>
      </div>
    </Slide>
  );
}
