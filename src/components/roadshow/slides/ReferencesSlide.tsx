import Slide from '../Slide';
import styles from '../roadshow.module.css';

export default function ReferencesSlide() {
  return (
    <Slide
      id="s16-appendix"
      title="参考文献"
      eyebrow="References"
      subtitle="编号与正文引用保持一致。"
    >
      <div className={styles.refColumns}>
        <div className={styles.panel}>
          <div className={styles.refList}>
            <div className={styles.refEntry}><strong>[1]</strong> Ely EW, et al. JAMA. 2004;291(14):1753-1762.</div>
            <div className={styles.refEntry}><strong>[2]</strong> Salluh JIF, et al. BMJ. 2015;350:h2538.</div>
            <div className={styles.refEntry}><strong>[3]</strong> van Eijk MMJ, et al. Crit Care Med. 2009;37(6):1881-1885.</div>
            <div className={styles.refEntry}><strong>[4]</strong> Meagher DJ, et al. J Psychosom Res. 2011;71(6):395-403.</div>
            <div className={styles.refEntry}><strong>[5]</strong> Krewulak KD, et al. Crit Care Med. 2018;46(12):2029-2035.</div>
            <div className={styles.refEntry}><strong>[6]</strong> 张晓丽, 王小亭, 刘大为, 等. 中华内科杂志. 2020;59(11):887-893.</div>
            <div className={styles.refEntry}><strong>[7]</strong> Baxter International Inc. Baxter completes acquisition of Hill-Rom. 2021.</div>
            <div className={styles.refEntry}><strong>[8]</strong> Ely EW, et al. Intensive Care Med. 2001;27(12):1892-1900.</div>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.refList}>
            <div className={styles.refEntry}><strong>[9]</strong> Pandharipande PP, et al. N Engl J Med. 2013;369(14):1306-1316.</div>
            <div className={styles.refEntry}><strong>[10]</strong> Bhagwat N, et al. Nature Medicine. 2024;30(3):741-750.</div>
            <div className={styles.refEntry}><strong>[11]</strong> Oh ST, et al. Crit Care Med. 2021;49(8):e758-e767.</div>
            <div className={styles.refEntry}><strong>[12]</strong> Wassenaar A, et al. Intensive Care Med. 2015;41(6):1048-1056.</div>
            <div className={styles.refEntry}><strong>[13]</strong> Kamdar BB, et al. J Intensive Care Med. 2012;27(2):97-111.</div>
            <div className={styles.refEntry}><strong>[14]</strong> Hshieh TT, et al. JAMA Intern Med. 2015;175(4):512-520.</div>
            <div className={styles.refEntry}><strong>[15]</strong> Zaal IJ, et al. J Crit Care. 2019;50:75-79.</div>
            <div className={styles.refEntry}><strong>[16]</strong> Akansel N, Kaymakçi Ş. J Clin Nurs. 2008;17(12):1581-1590.</div>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.refList}>
            <div className={styles.refEntry}><strong>[17]</strong> Kanda T, et al. Sensors. 2023;23(7):3512.</div>
            <div className={styles.refEntry}><strong>[18]</strong> de Jong L, et al. J Am Med Inform Assoc. 2023;30(5):876-884.</div>
            <div className={styles.refEntry}><strong>[19]</strong> NVIDIA Corporation. Jetson Orin Nano Super Developer Kit. 2025.</div>
            <div className={styles.refEntry}><strong>[20]</strong> Huawei Technologies. Atlas 200 DK AI Developer Kit. 2024.</div>
            <div className={styles.refEntry}><strong>[21]</strong> Lundberg SM, Lee SI. NeurIPS. 2017.</div>
            <div className={styles.refEntry}><strong>[22]</strong> 中华人民共和国个人信息保护法. 2021.</div>
            <div className={styles.refEntry}><strong>[23]</strong> 中华人民共和国数据安全法. 2021.</div>
            <div className={styles.refEntry}><strong>[24]</strong> 中华人民共和国网络安全法. 2017.</div>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.refList}>
            <div className={styles.refEntry}><strong>[25]</strong> 国家药品监督管理局. 人工智能医疗器械注册审查指导原则. 2019；网络安全注册审查指导原则. 2022.</div>
            <div className={styles.refEntry}><strong>[26]</strong> 国家药品监督管理局. 医疗器械分类目录（2017版，2022修订）.</div>
            <div className={styles.refEntry}><strong>[27]</strong> 国家药品监督管理局. 医疗器械分类规则. 2015.</div>
            <div className={styles.refEntry}><strong>[28]</strong> 国家药品监督管理局. 医疗器械软件注册审查指导原则（2022修订版）.</div>
            <div className={styles.refEntry}><strong>[29]</strong> 国家药品监督管理局. 创新医疗器械特别审查程序. 2018.</div>
            <div className={styles.refEntry}><strong>[30]</strong> 中华医学会重症医学分会. 中国重症医学学科发展报告（2024）；国家卫健委 ICU 床位配置标准.</div>
            <div className={styles.refEntry}><strong>[31]</strong> Licensing Executives Society. Royalty Rates for Licensing Intellectual Property. 2024.</div>
            <div className={styles.refEntry}><strong>[32]</strong> 北京市统计局. 北京医药健康产业发展统计报告（2025）.</div>
            <div className={styles.refEntry}><strong>[33]</strong> 北京市药品监督管理局. 医疗器械产业提质升级行动计划（2024-2026年）.</div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
