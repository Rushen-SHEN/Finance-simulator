import Slide from '../Slide';
import styles from '../roadshow.module.css';

export default function FormFactorSlide() {
  return (
    <Slide
      id="s09-growth"
      title="产品形态与临床工作流"
      eyebrow="Form Factor &amp; Workflow"
      subtitle="产品不只是一个模型，而是一套 ICU 床旁可部署、可解释、可进入护理工作流的监测系统。"
      chips={[
        { label: '临床环节保留人工复核', variant: 'fact' },
        { label: '数据不出院', variant: 'fact' },
      ]}
    >
      <div className={styles.processLane}>
        {/* ── Left: Product form ── */}
        <div className={styles.lane}>
          <div className={styles.panelTitle}>产品形态</div>
          <div className={styles.laneStep}>
            <strong>非接触式床垫传感层</strong>
            <span>嵌入床垫或床旁形态，持续采集体征和体动信号。</span>
          </div>
          <div className={styles.laneStep}>
            <strong>本地边缘推理主机</strong>
            <span>运行轻量化模型与解释模块，支持 ICU 床旁部署。</span>
          </div>
          <div className={styles.laneStep}>
            <strong>本地摄像头与视频特征提取</strong>
            <span>只保留结构化行为特征，避免原始视频留存。</span>
          </div>
          <div className={styles.laneStep}>
            <strong>HIS / EMR 数据接口</strong>
            <span>通过标准化接口读取临床变量，补充患者背景信息。</span>
          </div>
          <div className={styles.laneStep}>
            <strong>ICU 看板与风险提示界面</strong>
            <span>呈现风险分层、驱动因素和复评优先级。</span>
          </div>
        </div>

        {/* ── Right: Workflow + Boundary ── */}
        <div className={styles.stack}>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>临床工作流</div>
            <div className={styles.flowGrid}>
              <div className={styles.flowStep}>
                <div className={styles.flowNum}>1</div>
                <strong>床旁连续采集</strong>
                <span>床垫、视频与 HIS 同步输入。</span>
              </div>
              <div className={styles.flowStep}>
                <div className={styles.flowNum}>2</div>
                <strong>院内边缘推理</strong>
                <span>原始数据不出院，仅在本地完成处理<span className={styles.citeInline}>[22-24]</span>。</span>
              </div>
              <div className={styles.flowStep}>
                <div className={styles.flowNum}>3</div>
                <strong>风险分层提示</strong>
                <span>每 15 分钟刷新低 / 中 / 高风险状态。</span>
              </div>
              <div className={styles.flowStep}>
                <div className={styles.flowNum}>4</div>
                <strong>人工复评</strong>
                <span>护士或医师基于提示执行 CAM-ICU 复评。</span>
              </div>
              <div className={styles.flowStep}>
                <div className={styles.flowNum}>5</div>
                <strong>临床干预</strong>
                <span>镇静管理、环境优化和早期活动由临床决定。</span>
              </div>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>核心边界</div>
            <h3>ARIA 提供的是辅助监测与风险提示，不替代 CAM-ICU，也不替代医生最终判断。</h3>
            <p className={styles.subtitle}>
              这种边界既符合 ICU 场景的使用逻辑，也与二类产品的注册策略保持一致<span className={styles.citeInline}>[25][28]</span>。
            </p>
          </div>
        </div>
      </div>

      <div className={styles.sourceBox}>
        <strong>本页引用：</strong><span className={styles.sourceLine}>[22][23][24][25][28]</span>
      </div>
    </Slide>
  );
}
