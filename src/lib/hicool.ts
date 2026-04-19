import { CalcResult, ModelInputs } from './calculator';
import { DOC_VERSIONS } from './bp-reference';

export type HicoolSectionKey =
  | 'projectOverview'
  | 'productFeatures'
  | 'marketCapability'
  | 'teamIntro'
  | 'businessProgress'
  | 'investmentHighlights';

export const HICOOL_LIMITS: Record<HicoolSectionKey, number> = {
  projectOverview: 300,
  productFeatures: 800,
  marketCapability: 800,
  teamIntro: 800,
  businessProgress: 800,
  investmentHighlights: 500,
};

export const HICOOL_TITLES: Record<HicoolSectionKey, string> = {
  projectOverview: '项目概况（300字以内）',
  productFeatures: '产品/服务特点（800字以内）',
  marketCapability: '项目市场化能力（800字以内）',
  teamIntro: '团队介绍（800字以内）',
  businessProgress: '业务进展（800字以内）',
  investmentHighlights: '投资亮点（500字以内）',
};

export interface HicoolDraft {
  sections: Record<HicoolSectionKey, string>;
  baselineModelSnapshot: ModelInputs;
  reviewedForChangeKey: Partial<Record<HicoolSectionKey, string>>;
  submissionVersion: string;
  isSubmissionVersion: boolean;
  lastSavedAt: number;
}

const KEY = 'aria-hicool-draft-v1';

const w = (v: number) => `${Math.round(v / 10000).toLocaleString('en-US')}万`;
const pct = (v: number) => `${(v * 100).toFixed(0)}%`;

export function buildDefaultHicoolSections(model: ModelInputs, result: CalcResult): Record<HicoolSectionKey, string> {
  const y = result.years;
  const y5 = y[4];
  const y10 = y[9];
  const ebitdaYear = y.findIndex((yr) => yr.ebitda > 0) + 1;

  return {
    projectOverview:
      `ARIA 是面向 ICU 谵妄风险预警的医疗 AI 项目，采用“床垫非接触传感+视频行为+HIS临床变量”三模态融合架构，目标在临床诊断前提供连续风险提示。` +
      `基于当前 simulator（neutral 情景+best timeline）测算，Y5 收入约 ${w(y5.total_revenue)}、Y10 收入约 ${w(y10.total_revenue)}，EBITDA在 Y${ebitdaYear > 0 ? ebitdaYear : 4} 转正，具备“先验证、后放量”的可执行路径。`,

    productFeatures:
      `产品名称：ARIA ICU Delirium Early Warning System。应用领域：重症医学、智慧病房、医院数字化监测。` +
      `核心创新有三点：一是非接触式床旁连续监测，降低护理操作负担；二是多模态融合提升低活动型谵妄检出能力；三是边缘AI本地推理，满足医疗数据隐私与实时性要求。` +
      `与传统 CAM-ICU 人工量表相比，ARIA 由“间断评估”升级为“连续预警”；与单一硬件监测方案相比，ARIA 在可解释性与临床变量融合上更完整；与通用 ICU 监护设备相比，ARIA 聚焦谵妄风险这一高临床价值场景。` +
      `当前定价体系已与 simulator 联动：C2 硬件 ${w(model.global.price_hw_c2)} /床，C3 硬件 ${w(model.global.price_hw_c3)} /床，SaaS 按年度订阅。`,

    marketCapability:
      `市场需求方面，ICU 谵妄具有高发生率、高漏诊率和高成本负担，医院端对“早预警+可落地”的工具有明确需求。` +
      `市场空间方面，项目采用 SAM 中值 ${Math.round(model.global.sam_midpoint / 10000)}亿 口径进行动态测算，当前模型下 Y10 累计床位 ${y10.cumulative_beds.toLocaleString()}，仍处可扩展区间。` +
      `商业模式为“硬件一次性部署+SaaS 续费+渠道分成”，续约率参数当前为 ${pct(model.scenario_overrides.neutral.rr_base)}，可在参数面板下调/上调并同步影响现金流。` +
      `产业化路径为“二类证先行商业化→三类证放量→区域复制”，并通过渠道合作放大装机效率。项目已具备 simulator 驱动的 BP/FP/roadshow 一体化数据治理能力，支持投融资沟通中的快速版本迭代。`,

    teamIntro:
      `团队结构采取“核心创始团队+质量法规顾问+外部产业协同”模式。核心团队覆盖产品、算法、临床落地和商业化推进，分工与岗位职责清晰，能支持从原型验证到注册与放量的全过程。` +
      `成员背景与分工匹配体现在：技术负责人聚焦多模态算法与系统架构；临床/产品负责人聚焦 ICU 场景需求和试点落地；商业侧聚焦渠道拓展、医院合作和融资节奏。` +
      `团队关系稳定性体现在目标一致、协同链路短、决策效率高；同时通过外部顾问机制补齐法规与产业资源，降低关键节点不确定性。` +
      `在大赛申报维度，团队具备“技术可解释+商业可执行+数据可审计”的综合能力。`,

    businessProgress:
      `当前业务进展可分三条线：` +
      `1）研发线：核心模型与财务/里程碑联动引擎已形成稳定版本，支持参数化推演与审计；` +
      `2）市场线：围绕 ICU 场景推进医院端需求验证与渠道合作讨论；` +
      `3）经营线：已实现 BP、Finance Plan、Roadshow 与 simulator 的统一口径管理。` +
      `从模型输出看，Y1-Y3处于投入验证期，Y4后进入盈利区间，Y5 收入 ${w(y5.total_revenue)}、Y10 收入 ${w(y10.total_revenue)}；种子轮与 Pre-A 资金需求在参数面板中可追踪并可回溯。` +
      `整体上，项目已从“概念阐述”进入“可量化执行”的阶段，具备继续推进到下一轮路演评审的基础。`,

    investmentHighlights:
      `1）高价值临床痛点：谵妄管理需求真实且持续，项目切入点清晰。` +
      `2）技术路线差异化：非接触监测+多模态融合+边缘AI，兼顾效果与合规。` +
      `3）商业模型可验证：硬件+SaaS+渠道分成，参数可调、结果可回放。` +
      `4）数据治理能力强：BP/FP/路演口径由 simulator 单一真值驱动，适合 AI 批量评审场景。` +
      `5）里程碑可执行：当前模型在 Y${ebitdaYear > 0 ? ebitdaYear : 4} 达到 EBITDA 转正，具备明确的融资与放量路径。`,
  };
}

export function loadHicoolDraft(): HicoolDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as HicoolDraft;
  } catch {
    return null;
  }
}

export function saveHicoolDraft(draft: HicoolDraft) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // ignore storage quota errors
  }
}

export function buildHicoolSourceStamp(nowTs: number) {
  return {
    bpVersion: DOC_VERSIONS.bp,
    fpVersion: DOC_VERSIONS.fp,
    bpFile: DOC_VERSIONS.bpFile,
    fpFile: DOC_VERSIONS.fpFile,
    simulatorTimestamp: new Date(nowTs).toLocaleString('zh-CN', { hour12: false }),
  };
}
