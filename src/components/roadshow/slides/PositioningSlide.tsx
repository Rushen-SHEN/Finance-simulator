import Slide from '../Slide';
import styles from '../roadshow.module.css';

export default function PositioningSlide() {
  return (
    <Slide
      id="s07-competition"
      title="全球首发与国内首创"
      eyebrow="Positioning"
      subtitle="更准确的表达是：在公开注册数据库检索口径下，尚未发现与 ARIA 当前产品定义完全对应的已获批同类形态。"
      chips={[
        { label: '检索口径判断', variant: 'projected' },
        { label: '替代方案与潜在竞品存在', variant: 'fact' },
      ]}
    >
      <div className={styles.quadrantWrap}>
        {/* ── Left: Quadrant chart ── */}
        <div className={styles.quadrant}>
          <span className={`${styles.axisLabel} ${styles.axisYTop}`}>与谵妄场景贴合度较高</span>
          <span className={`${styles.axisLabel} ${styles.axisYBottom}`}>与谵妄场景贴合度较低</span>
          <span className={`${styles.axisLabel} ${styles.axisXLeft}`}>产品成熟度更低</span>
          <span className={`${styles.axisLabel} ${styles.axisXRight}`}>产品成熟度更高</span>

          <div className={styles.plot} style={{ left: '30%', top: '28%' }}>
            <div className={styles.plotDot} />
            <strong>ARIA</strong>
            <span>三模态 + 谵妄连续预警<br />原型开发中</span>
          </div>
          <div className={styles.plot} style={{ left: '76%', top: '72%' }}>
            <div className={`${styles.plotDot} ${styles.plotDotAlt}`} />
            <strong>Ceribell</strong>
            <span>EEG 单模态<br />已获批但非谵妄</span>
          </div>
          <div className={styles.plot} style={{ left: '74%', top: '58%' }}>
            <div className={`${styles.plotDot} ${styles.plotDotAlt}`} />
            <strong>EarlySense</strong>
            <span>床垫平台成熟<br />但不做谵妄</span>
          </div>
        </div>

        {/* ── Right: Analysis panels ── */}
        <div className={styles.stack}>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>当前可成立的说法</div>
            <h3>产品差异化来自&quot;非接触形态 + 多模态融合 + ICU 谵妄场景&quot;的组合。</h3>
            <p className={styles.subtitle}>
              这不是对所有竞争者的绝对否定，而是强调当前公开注册信息下，仍未看到完全同构的已获批产品。
            </p>
          </div>

          <div className={styles.miniTable}>
            <div className={`${styles.tableRow} ${styles.tableRowHeader}`}>
              <span>对象</span><span>当前判断</span><span>备注</span>
            </div>
            <div className={styles.tableRow}>
              <strong>EarlySense</strong><span>硬件平台成熟</span><span>缺少谵妄算法</span>
            </div>
            <div className={styles.tableRow}>
              <strong>Ceribell</strong><span>已产品化</span><span>核心场景为癫痫监测</span>
            </div>
            <div className={styles.tableRow}>
              <strong>迈瑞 / 联影等</strong><span>具备追入能力</span><span>市场验证后可能进入</span>
            </div>
            <div className={styles.tableRow}>
              <strong>ARIA</strong><span>场景定义更聚焦</span><span>需用数据与注册完成验证</span>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>最需要补强的部分</div>
            <h3>数据壁垒、专利壁垒和真实世界证据仍在建设中。</h3>
            <p className={styles.subtitle}>
              当前最有说服力的是产品定义与法规路径，下一步需要把它转化为可验证的证据链。
            </p>
          </div>
        </div>
      </div>

      <div className={styles.sourceBox}>
        <strong>说明：</strong><span className={styles.sourceLine}>本页判断基于公开注册数据库检索与企业公开资料整理，不单列正文文献引用。</span>
      </div>
    </Slide>
  );
}
