import Slide from '../Slide';
import styles from '../roadshow.module.css';

export default function TeamSlide() {
  return (
    <Slide
      id="s12-team"
      title="团队介绍"
      eyebrow="Team"
      subtitle={"团队结构强调\u201c核心决策内建 + 执行网络协同\u201d，其中法规与质量战略能力是项目推进的关键支点。"}
      chips={[
        { label: '法规能力突出', variant: 'fact' },
        { label: '执行团队持续补强', variant: 'plan' },
      ]}
    >
      <div className={styles.teamGrid}>
        {/* ── Left: Core team ── */}
        <div className={styles.stack}>
          <div className={styles.person}>
            <div className={styles.role}>质量法规战略顾问</div>
            <h3>沈如申</h3>
            <p>
              长期从事医疗器械质量与法规管理工作，具备 SaMD、AI 医疗软件、创新器械与复杂注册路径的实战经验，为项目提供法规、质量和临床评价策略支持。
            </p>
            <div className={styles.pillRow}>
              <span className={styles.pill}>SaMD 注册策略</span>
              <span className={styles.pill}>创新器械路径</span>
              <span className={styles.pill}>质量体系与审评沟通</span>
            </div>
          </div>

          <div className={styles.gridCols2}>
            <div className={styles.person}>
              <div className={styles.role}>工程系统负责人</div>
              <h3>张海涛</h3>
              <p>负责多传感器系统集成、CDMO / CMO 技术协同、HIS 接口与系统稳定性建设。</p>
            </div>
            <div className={styles.person}>
              <div className={styles.role}>临床落地负责人</div>
              <h3>李庆同</h3>
              <p>负责医院现场部署、安装培训、客户成功与临床场景反馈闭环。</p>
            </div>
          </div>
        </div>

        {/* ── Right: Team gaps + External network ── */}
        <div className={styles.stack}>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>团队补强重点</div>
            <h3>QARA 负责人、临床顾问与 AI 算法工程师是下一阶段最关键的组织补位。</h3>
            <p className={styles.subtitle}>
              其中 QARA 到岗时间直接影响 NMPA 预沟通、注册检验和临床评价节奏。
            </p>
          </div>

          <div className={styles.miniTable}>
            <div className={`${styles.tableRow} ${styles.tableRowHeader}`}>
              <span>岗位</span><span>定位</span><span>状态</span>
            </div>
            <div className={styles.tableRow}>
              <strong>QARA 负责人</strong>
              <span>注册执行与体系维护</span>
              <span className={`${styles.tag} ${styles.tagPlan}`}>M3 到岗</span>
            </div>
            <div className={styles.tableRow}>
              <strong>临床顾问</strong>
              <span>方案审核与学术推广</span>
              <span className={`${styles.tag} ${styles.tagPlan}`}>M6 补强</span>
            </div>
            <div className={styles.tableRow}>
              <strong>AI 算法工程师</strong>
              <span>边缘 AI 算法训练与测试</span>
              <span className={`${styles.tag} ${styles.tagPlan}`}>M6 补强</span>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>外部执行网络</div>
            <h3>ISO13485 认证 CDMO / CMO、CRO 与临床顾问网络，使项目能以轻量团队推进早期器械开发。</h3>
            <p className={styles.subtitle}>
              这要求项目管理和关键里程碑控制足够严格，但也有利于减少前期固定成本。
            </p>
          </div>
        </div>
      </div>

      <div className={styles.sourceBox}>
        <strong>来源：</strong><span className={styles.sourceLine}>项目团队履历资料</span>
      </div>
    </Slide>
  );
}
