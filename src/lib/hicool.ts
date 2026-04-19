import { CalcResult, ModelInputs } from './calculator';
import { ChangeReport } from './changeTracker';
import { DOC_VERSIONS, ROADSHOW_DATA_POINTS } from './bp-reference';
import { extractRoadshowUpdates } from './docGenerator';

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

export const HICOOL_PROMPTS: Record<HicoolSectionKey, string> = {
  projectOverview: '请在300字内概括项目定位、临床痛点、核心价值、当前阶段与中期成长目标。',
  productFeatures: '请写清产品名称、应用领域、关键创新、技术特性，以及与人工量表、传统监护和竞品方案的差异。',
  marketCapability: '请围绕市场需求、市场空间、商业模式、产业化路径和已具备的市场资源，证明项目具备规模化落地能力。',
  teamIntro: '请突出核心团队优势、成员背景与职责匹配、协作关系稳定性，以及对注册、临床与商业化的支撑能力。',
  businessProgress: '请说明研发试验、注册推进、医院开拓、收入实现与渠道合作等最新进展，并体现执行力。',
  investmentHighlights: '请提炼3-5条投资亮点，聚焦临床价值、差异化技术、可验证商业模式、增长拐点与治理能力。',
};

export const HICOOL_CHANGE_GROUPS: Record<HicoolSectionKey, string[]> = {
  projectOverview: ['Revenue', 'Milestones'],
  productFeatures: ['BOM', 'Pricing', 'Channel'],
  marketCapability: ['Deployment', 'Growth', 'Renewal', 'Funding'],
  teamIntro: ['Milestones'],
  businessProgress: ['Revenue', 'Funding', 'Milestones', 'Deployment'],
  investmentHighlights: ['Revenue', 'Growth', 'Pricing', 'Funding'],
};

export const HICOOL_ROADSHOW_SLIDES: Record<HicoolSectionKey, string[]> = {
  projectOverview: ['s9', 's16', 's17'],
  productFeatures: ['s10'],
  marketCapability: ['s10', 's16', 's17'],
  teamIntro: [],
  businessProgress: ['s9', 's16', 's17'],
  investmentHighlights: ['s10', 's16', 's17'],
};

export interface HicoolAuditNote {
  summary: string;
  simulatorTimestamp: string;
  bpLabel: string;
  fpLabel: string;
  roadshowLabel: string;
  deltaItems: string[];
}

export interface HicoolDraft {
  sections: Record<HicoolSectionKey, string>;
  baselineModelSnapshot: ModelInputs;
  reviewedForChangeKey: Partial<Record<HicoolSectionKey, string>>;
  submissionVersion: string;
  isSubmissionVersion: boolean;
  lastSavedAt: number;
  templateVersion?: string;
}

const KEY = 'aria-hicool-draft-v1';
export const HICOOL_TEMPLATE_VERSION = '2026-04-19-award-v1';

const w = (v: number) => `${Math.round(v / 10000).toLocaleString('en-US')}万`;
const pct = (v: number) => `${(v * 100).toFixed(0)}%`;
const yi = (v: number) => `${(v / 100000000).toFixed(2)}亿元`;

function buildLegacyDefaultHicoolSections(model: ModelInputs, result: CalcResult): Record<HicoolSectionKey, string> {
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

function areSectionsEqual(
  left: Record<HicoolSectionKey, string>,
  right: Record<HicoolSectionKey, string>,
) {
  return (Object.keys(HICOOL_TITLES) as HicoolSectionKey[]).every((key) => left[key] === right[key]);
}

export function buildDefaultHicoolSections(model: ModelInputs, result: CalcResult): Record<HicoolSectionKey, string> {
  const y = result.years;
  const y2 = y[1];
  const y5 = y[4];
  const y10 = y[9];
  const ebitdaYear = y.findIndex((yr) => yr.ebitda > 0) + 1;
  const roadshow = extractRoadshowUpdates(model, result);
  const seedRange = `${Math.round(model.funding.seed_min / 10000)}-${Math.round(model.funding.seed_max / 10000)}万`;
  const preARange = `${Math.round(model.funding.preA_min / 10000)}-${Math.round(model.funding.preA_max / 10000)}万`;

  return {
    projectOverview:
      `ARIA是面向ICU谵妄早筛与干预前移的医疗AI项目，通过床垫非接触传感、视频行为识别和HIS临床变量三模态融合，在医生完成正式诊断前持续输出高风险预警，帮助医院降低漏诊、缩短住院日并提升护理效率。按当前simulator与路演联动口径，项目Y5收入约${w(y5.total_revenue)}、Y10收入约${w(y10.total_revenue)}，Y${ebitdaYear > 0 ? ebitdaYear : 5}实现EBITDA转正，具备从科研试点走向规模化商业化的清晰路径。`,

    productFeatures:
      `产品名称为ARIA ICU Delirium Early Warning System，应用于重症医学、智慧病房与医院数字化监测场景。项目的核心创新不在于单一硬件，而在于“非接触床旁感知+视频行为理解+临床变量融合+边缘AI推理”形成的闭环：既能连续监测患者状态，又能在院内数据不出域的前提下实时输出可执行预警。与传统CAM-ICU人工量表相比，ARIA把间断筛查升级为全天候风险跟踪；与仅做生命体征采集的监护设备相比，ARIA直接聚焦谵妄这一高成本、高漏诊的明确临床痛点；与单模态竞品相比，ARIA更强调低活动型谵妄识别、可解释证据链和后续注册转化能力。当前联动定价与路演一致：C2硬件${w(model.global.price_hw_c2)}/床、C3硬件${w(model.global.price_hw_c3)}/床、升级服务${w(model.global.price_upgrade)}/床，C2新购ROI ${roadshow['roi-c2-new']}、C3新购ROI ${roadshow['roi-c3-new']}。`,

    marketCapability:
      `从需求端看，ICU谵妄具有高发生率、高漏诊率和高管理成本，医院对“可持续监测、可量化收益、可纳入临床流程”的工具存在真实采购动机。项目按simulator口径采用SAM中值${yi(model.global.sam_midpoint * 10000)}进行市场测算，当前Y10累计床位达到${y10.cumulative_beds.toLocaleString()}床，渗透率仍低，说明扩张空间充足。商业模式采用“硬件部署+SaaS订阅+合作经销商分成+授权里程碑付款”，其中续约率基线为${pct(model.scenario_overrides.neutral.rr_base)}，合作经销商条款与路演页一致，为硬件15%、SaaS 35%、授权金和里程碑合计500万。产业化路径明确分三步推进：先完成科研与二类产品落地，建立样板医院和支付证据；再以三类注册和升级服务提升单床价值；随后借助合作经销商加速区域复制。项目已经实现BP、Finance Plan和路演锚点由simulator统一驱动，既能支撑申报材料，也能支撑后续投融资尽调。`,

    teamIntro:
      `项目团队以“临床场景定义能力+多模态算法能力+医疗器械产业化能力”三位一体搭建，目标不是只做一个演示型AI产品，而是做成可以进入医院采购与监管体系的标准化医疗解决方案。核心负责人在分工上高度匹配：算法与系统负责人负责传感融合、边缘推理和数据闭环，产品与临床负责人负责ICU痛点拆解、试点方案设计与院内协同，商业与合作负责人负责样板医院拓展、合作经销商推进及融资节奏管理。团队关系稳定，职责边界清晰，关键节点由创始层直接协同，能显著降低试点、注册、商业化三条线脱节的风险。同时，项目通过外部顾问和产业协同补强质量法规、注册申报和供应链能力，保证从科研验证到商业放量的执行连续性。对于大赛评委而言，团队最大的可信度来自三点：懂临床、懂产品、懂如何把财务与里程碑讲成一条可审计的增长主线。`,

    businessProgress:
      `项目已从概念验证阶段推进到“产品、商业、财务三线联动”的可执行阶段。研发侧，ARIA已形成围绕ICU谵妄早筛的多模态产品定义，并完成以科研试点、算法迭代、注册节奏和商业部署联动的仿真框架，能够追踪从40床科研部署到后续规模装机的路径。市场侧，项目围绕样板医院、重点科室和合作经销商推进落地讨论，当前路演与simulator口径显示，Y2形成${y2.cumulative_beds}床累计部署基础，Y5达到${y5.cumulative_beds}床，说明项目具备从试点到放量的过渡能力。经营侧，项目已将BP、Finance Plan、Roadshow和HICOOL申报页统一到单一数据口径，Y5收入${w(y5.total_revenue)}、Y10收入${w(y10.total_revenue)}，种子轮${seedRange}、Pre-A ${preARange}的资金需求与里程碑绑定，可直接支撑投资人问答与赛事评审。整体判断是：项目已具备“能解释、能测算、能推进”的成熟度，下一步重点在于把临床证据、注册节点和渠道签约继续实化。`,

    investmentHighlights:
      `1. 痛点硬、价值大：项目切入ICU谵妄这一高漏诊高成本场景，医院端价值锚点明确。2. 技术壁垒真实：非接触感知、多模态融合与边缘AI组合，不易被单点方案复制。3. 商业模式清晰：硬件、SaaS、升级和渠道分成构成多层收入，Y5收入约${w(y5.total_revenue)}。4. 增长拐点明确：累计床位由Y2的${y2.cumulative_beds}床增长到Y10的${y10.cumulative_beds.toLocaleString()}床，Y${ebitdaYear > 0 ? ebitdaYear : 5}实现EBITDA转正。5. 审计能力强：BP ${DOC_VERSIONS.bp}、FP ${DOC_VERSIONS.fp}与路演锚点均由simulator统一驱动，适合高标准评审与尽调场景。`,
  };
}

export function normalizeHicoolDraft(
  draft: HicoolDraft,
  model: ModelInputs,
  result: CalcResult,
): HicoolDraft {
  if (draft.templateVersion === HICOOL_TEMPLATE_VERSION) {
    return draft;
  }

  const legacySections = buildLegacyDefaultHicoolSections(model, result);
  const nextDefaultSections = buildDefaultHicoolSections(model, result);
  const shouldUpgrade = areSectionsEqual(draft.sections, legacySections) ||
    Object.values(draft.sections).every((value) => !value.trim());

  return {
    ...draft,
    sections: shouldUpgrade ? nextDefaultSections : draft.sections,
    templateVersion: HICOOL_TEMPLATE_VERSION,
  };
}

export function buildHicoolAuditNotes(
  model: ModelInputs,
  result: CalcResult,
  changeReport: ChangeReport | null,
  nowTs: number,
): Record<HicoolSectionKey, HicoolAuditNote> {
  const liveUpdates = extractRoadshowUpdates(model, result);
  const changedGroups = new Set(changeReport?.changedGroups.map((group) => group.group) ?? []);
  const stamp = buildHicoolSourceStamp(nowTs);
  const notes = {} as Record<HicoolSectionKey, HicoolAuditNote>;

  for (const key of Object.keys(HICOOL_TITLES) as HicoolSectionKey[]) {
    const relatedSlides = HICOOL_ROADSHOW_SLIDES[key];
    const slidePoints = ROADSHOW_DATA_POINTS.filter((point) => relatedSlides.includes(point.slideId));
    const deltaItems = slidePoints
      .filter((point) => (liveUpdates[point.field] ?? '') !== point.bpValue)
      .slice(0, 3)
      .map((point) => `${point.slideId}/${point.label}: 基线 ${point.bpValue}；当前 ${liveUpdates[point.field] ?? '空值'}`);

    const needsReview = HICOOL_CHANGE_GROUPS[key].some((group) => changedGroups.has(group));
    const summary = needsReview
      ? '检测到影响本栏的参数变化，提交前需人工复核并确认叙事与数字锚点一致。'
      : '当前本栏未命中新增参数变更，可按现口径直接审阅与润色。';

    const roadshowLabel = relatedSlides.length === 0
      ? '路演稿暂无独立团队页锚点，本栏以总里程碑与整体叙事口径辅助校验。'
      : deltaItems.length === 0
        ? `关联路演页 ${relatedSlides.join(' / ')} 当前无显著偏差，和 simulator 口径一致。`
        : `关联路演页 ${relatedSlides.join(' / ')} 存在 ${deltaItems.length}/${slidePoints.length} 处已捕获偏差，请优先核对右侧列出的关键项。`;

    notes[key] = {
      summary,
      simulatorTimestamp: stamp.simulatorTimestamp,
      bpLabel: `${stamp.bpVersion} · ${stamp.bpFile}`,
      fpLabel: `${stamp.fpVersion} · ${stamp.fpFile}`,
      roadshowLabel,
      deltaItems,
    };
  }

  return notes;
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
