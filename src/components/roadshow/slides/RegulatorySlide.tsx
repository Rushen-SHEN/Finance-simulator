import Slide from '../Slide';
import styles from '../roadshow.module.css';

export default function RegulatorySlide() {
  return (
    <Slide
      id="s11-regulatory"
      title="法规路径"
      eyebrow="Regulatory Path"
      subtitle="NMPA 决策支持软件既有三类也有二类，为了更早上市且部署后收集更多真实世界临床数据用于三类的申报审批上市，上市路径分两步走。"
      chips={[
        { label: '分类逻辑清晰', variant: 'fact' },
        { label: '获批时间线为目标', variant: 'plan' },
      ]}
    >
      <div className={styles.regGrid}>
        {/* ── Left: Classification + Innovation ── */}
        <div className={styles.stack}>
          <div className={styles.gridCols2}>
            <div className={styles.panel}>
              <div className={styles.panelTitle}>V1.0 | 二类路径</div>
              <h3>21-04-02.2 计算机辅助诊断 / 分析软件<span className={styles.citeInline}>[26][28]</span></h3>
              <p className={styles.subtitle}>
                输出谵妄风险分层参考值，不直接给出诊断或治疗建议，医师保留最终决策权。
              </p>
            </div>
            <div className={styles.panel}>
              <div className={styles.panelTitle}>V2.0 | 三类路径</div>
              <h3>21-04-02.1 计算机辅助诊断 / 分析软件<span className={styles.citeInline}>[26][28]</span></h3>
              <p className={styles.subtitle}>
                自动识别+诊断建议，增加连续评分、可解释性报告与干预建议，进入更高监管等级。
              </p>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>二类路径成立的核心原因</div>
            <h3>不输出诊断建议、CAM-ICU 复评不可绕过、最终决策由临床完成。</h3>
            <p className={styles.subtitle}>
              这三点构成了辅助监测定位，也降低了一开始就进入高监管路径的整体风险。
            </p>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>创新器械通道</div>
            <h3>创新审评具备讨论空间，但前提是前瞻性验证与专利进展同步到位<span className={styles.citeInline}>[29]</span>。</h3>
            <p className={styles.subtitle}>
              因此当前更重要的是先把样本验证、QARA 执行和注册前沟通跑通。
            </p>
          </div>
        </div>

        {/* ── Right: Timeline + Clinical Evaluation ── */}
        <div className={styles.stack}>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>注册时间线</div>
            <h3>先二类辅助监测，再三类升级，是项目整体去风险的主路径<span className={styles.citeInline}>[25][28][29]</span>。</h3>
            <div className={styles.timeline}>
              <div className={styles.timeNode}>
                <strong>M3-M6</strong>
                <span>分类界定预沟通，确认二类路径。</span>
              </div>
              <div className={styles.timeNode}>
                <strong>M8-M13</strong>
                <span>二类临床评价，文献评价 + 小样本验证。</span>
              </div>
              <div className={styles.timeNode}>
                <strong>M8-M12</strong>
                <span>注册检验与材料准备。</span>
              </div>
              <div className={styles.timeNode}>
                <strong>M14-M17</strong>
                <span>二类获批目标窗口。</span>
              </div>
              <div className={styles.timeNode}>
                <strong>M16-M21</strong>
                <span>三类临床试验。</span>
              </div>
              <div className={styles.timeNode}>
                <strong>M22-M24</strong>
                <span>三类注册申报。</span>
              </div>
              <div className={styles.timeNode}>
                <strong>M28-M31</strong>
                <span>三类获批目标窗口。</span>
              </div>
            </div>
          </div>

          <div className={styles.miniTable}>
            <div className={`${styles.tableRow} ${styles.tableRowHeader}`}>
              <span>临床评价路径</span><span>样本量</span><span>时间</span>
            </div>
            <div className={styles.tableRow}>
              <strong>文献评价 + 小样本验证</strong>
              <span>n=50-80<span className={styles.citeInline}>[25][28]</span></span>
              <span className={`${styles.tag} ${styles.tagPlan}`}>3-5 月</span>
            </div>
            <div className={styles.tableRow}>
              <strong>最小样本量谈判</strong>
              <span>n=100-150<span className={styles.citeInline}>[25][28]</span></span>
              <span className={`${styles.tag} ${styles.tagPlan}`}>5-6 月</span>
            </div>
            <div className={styles.tableRow}>
              <strong>常规临床试验</strong>
              <span>n≥310<span className={styles.citeInline}>[25][28]</span></span>
              <span className={`${styles.tag} ${styles.tagFact}`}>保底路径</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sourceBox}>
        <strong>本页引用：</strong><span className={styles.sourceLine}>[25][26][27][28][29]</span>
      </div>
    </Slide>
  );
}
