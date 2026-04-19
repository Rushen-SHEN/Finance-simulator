import Slide from '../Slide';
import styles from '../roadshow.module.css';

export default function MilestonesSlide() {
  return (
    <Slide
      id="s13-milestones"
      title="项目阶段里程碑"
      eyebrow="Milestones"
      subtitle="项目分为 5 个阶段推进，从原型验证、注册申报到商业化放量，关键节点均以月度里程碑和交付物管理。"
      chips={[
        { label: '阶段规划', variant: 'plan' },
        { label: '关键 KPI 驱动推进', variant: 'target' },
      ]}
    >
      <div className={styles.appendixNote} style={{ marginBottom: '0.75rem' }}>
        时间口径：<strong>M</strong> 为 month（月）的缩写；<strong>M1</strong> 为启动种子轮融资的月份，后续节点按月顺延。
      </div>

      <div className={styles.gridCols5}>
        {/* Phase 0 */}
        <div className={styles.phaseCard}>
          <div className={styles.phaseYear}>2026</div>
          <div className={styles.phaseHead}>
            <div className={styles.phaseKicker}>Phase 0</div>
            <div className={styles.phaseTitle}>发现与验证</div>
            <div className={styles.phaseRange}>M1-M6</div>
          </div>
          <div className={styles.phaseList}>
            <div>• CDMO 签约与样机开发</div>
            <div>• 三模态集成与数据采集</div>
            <div>• 2 家医院 40 床科研部署</div>
          </div>
          <div className={styles.phaseDeliverable}>
            <strong>关键交付</strong>
            原型验收 + 数据采集通过
          </div>
        </div>

        {/* Phase 1 */}
        <div className={styles.phaseCard}>
          <div className={styles.phaseYear}>2027</div>
          <div className={styles.phaseHead}>
            <div className={styles.phaseKicker}>Phase 1</div>
            <div className={styles.phaseTitle}>研发与注册</div>
            <div className={styles.phaseRange}>M7-M15</div>
          </div>
          <div className={styles.phaseList}>
            <div>• 算法训练与测试</div>
            <div>• 注册检验与二类临床评价</div>
            <div>• QARA 体系落地</div>
          </div>
          <div className={styles.phaseDeliverable}>
            <strong>关键交付</strong>
            二类医疗器械注册证目标获批
          </div>
        </div>

        {/* Phase 2 */}
        <div className={styles.phaseCard}>
          <div className={styles.phaseYear}>2027-2028</div>
          <div className={styles.phaseHead}>
            <div className={styles.phaseKicker}>Phase 2</div>
            <div className={styles.phaseTitle}>首轮商业化</div>
            <div className={styles.phaseRange}>M16-M27</div>
          </div>
          <div className={styles.phaseList}>
            <div>• 二类版本装机部署</div>
            <div>• 直销 + 合作经销商双渠道</div>
            <div>• 三类注册前准备</div>
          </div>
          <div className={styles.phaseDeliverable}>
            <strong>关键交付</strong>
            首轮商业床位部署与渠道打样
          </div>
        </div>

        {/* Phase 3 */}
        <div className={styles.phaseCard}>
          <div className={styles.phaseYear}>2028-2029</div>
          <div className={styles.phaseHead}>
            <div className={styles.phaseKicker}>Phase 3</div>
            <div className={styles.phaseTitle}>三类升级与扩张</div>
            <div className={styles.phaseRange}>M25-M36</div>
          </div>
          <div className={styles.phaseList}>
            <div>• 三类临床试验与申报</div>
            <div>• C2 向 C3 升级</div>
            <div>• 渠道里程碑兑现</div>
          </div>
          <div className={styles.phaseDeliverable}>
            <strong>关键交付</strong>
            三类注册证目标获批
          </div>
        </div>

        {/* Phase 4 */}
        <div className={styles.phaseCard}>
          <div className={styles.phaseYear}>2029-2031</div>
          <div className={styles.phaseHead}>
            <div className={styles.phaseKicker}>Phase 4</div>
            <div className={styles.phaseTitle}>规模化增长</div>
            <div className={styles.phaseRange}>M37-M60</div>
          </div>
          <div className={styles.phaseList}>
            <div>• 重点城市复制</div>
            <div>• 经销商放量与产线配套</div>
            <div>• EBITDA 持续为正</div>
          </div>
          <div className={styles.phaseDeliverable}>
            <strong>关键交付</strong>
            累计商业床位 520-780 张
          </div>
        </div>
      </div>

      <div className={styles.panel} style={{ marginTop: '0.75rem' }}>
        <div className={styles.panelTitle}>Go / No-Go</div>
        <h3>M6 原型集成、M12 算法门槛、M15 二类获批、M21 三类临床报告，是决定项目能否按原路径推进的四个关键门槛。</h3>
        <p className={styles.subtitle}>
          任何一个关键门槛未达标，都需要触发降级方案、补充验证或调整预期用途。
        </p>
      </div>

      <div className={styles.sourceBox}>
        <strong>说明：</strong><span className={styles.sourceLine}>本页为项目阶段规划与里程碑管理页，不新增外部文献引用。</span>
      </div>
    </Slide>
  );
}
