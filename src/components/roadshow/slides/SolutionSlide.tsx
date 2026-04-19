import Slide from '../Slide';
import styles from '../roadshow.module.css';

export default function SolutionSlide() {
  return (
    <Slide
      id="s05-clinical"
      title="ARIA 多模态谵妄智能监测的方案"
      eyebrow="Multimodal Solution"
      subtitle="ARIA 围绕 ICU 谵妄这一单一临床问题搭建三模态输入和边缘 AI 融合，不追求替代诊断，而追求更早、更连续、更可解释的提示能力。"
      chips={[
        { label: '产品形态已定义', variant: 'fact' },
        { label: '性能目标待验证', variant: 'target' },
      ]}
    >
      <div className={styles.archGrid}>
        {/* ── Left: Signal cards ── */}
        <div className={styles.stack}>
          <div className={styles.signalCard}>
            <strong>床垫传感系统</strong>
            <p>
              作为主数据源，连续采集 HRV、睡眠、呼吸、体动等信号，无需皮肤接触，适合 ICU 长时间监测<span className={styles.citeInline}>[11][12][17]</span>。
            </p>
            <div className={styles.featureList}>
              <div className={styles.featureItem}>HRV 时域与频域特征</div>
              <div className={styles.featureItem}>睡眠片段化与深睡占比</div>
              <div className={styles.featureItem}>呼吸不规则度与暂停指数</div>
              <div className={styles.featureItem}>体动模式与频率熵</div>
            </div>
          </div>
          <div className={styles.signalCard}>
            <strong>本地视频行为分析</strong>
            <p>用于识别躁动、凝视、淡漠等行为表现，原始视频在边缘侧处理后即时丢弃，仅保留结构化特征。</p>
          </div>
          <div className={styles.signalCard}>
            <strong>HIS 临床变量融合</strong>
            <p>
              通过 HL7 FHIR 接口获取 42 类临床变量<span className={styles.citeInline}>[18]</span>，使模型更贴近 ICU 真实工作流。
            </p>
          </div>
        </div>

        {/* ── Right: Fusion board ── */}
        <div className={styles.fusionBoard}>
          <div className={styles.fusionCenter}>
            <span className={`${styles.tag} ${styles.tagFact}`}>Bedside AI</span>
            <h3>三模态输入 → 后期融合 → 连续风险分层<span className={styles.citeInline}>[21]</span></h3>
            <p>每 15 分钟更新一次低 / 中 / 高风险分层，并输出风险驱动因素，辅助医护团队决定谁需要优先复评。</p>
            <div className={styles.pillRow}>
              <span className={styles.pill}>非接触式床旁采集</span>
              <span className={styles.pill}>LightGBM 后期融合</span>
              <span className={styles.pill}>SHAP 可解释输出</span>
            </div>
          </div>

          <div className={styles.miniTable}>
            <div className={`${styles.tableRow} ${styles.tableRowHeader}`}>
              <span>模态</span><span>核心作用</span><span>状态</span>
            </div>
            <div className={styles.tableRow}>
              <strong>床垫传感</strong><span>连续生理变化捕捉</span>
              <span className={`${styles.tag} ${styles.tagFact}`}>Fact</span>
            </div>
            <div className={styles.tableRow}>
              <strong>视频行为</strong><span>躁动 / 淡漠行为补充</span>
              <span className={`${styles.tag} ${styles.tagFact}`}>Fact</span>
            </div>
            <div className={styles.tableRow}>
              <strong>HIS 变量</strong><span>临床背景补全</span>
              <span className={`${styles.tag} ${styles.tagFact}`}>Fact</span>
            </div>
            <div className={styles.tableRow}>
              <strong>三模态融合</strong><span>提高低活动型识别机会</span>
              <span className={`${styles.tag} ${styles.tagTarget}`}>Target</span>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>设计目标</div>
            <h3>三模态融合 AUROC 目标为 0.82-0.85。</h3>
            <p className={styles.subtitle}>
              这是设计目标，不是实测结果；达不到门槛时，将按照 Go / No-Go 规则迭代或停项。
            </p>
          </div>
        </div>
      </div>

      <div className={styles.sourceBox}>
        <strong>本页引用：</strong><span className={styles.sourceLine}>[11][12][17][18][21]</span>
      </div>
    </Slide>
  );
}
