import { ReactNode } from 'react';
import styles from './roadshow.module.css';

interface SlideProps {
  /** Unique slide identifier, used for scroll-snap and keyboard nav */
  id: string;
  /** Slide main title */
  title: string;
  /** Optional subtitle / description */
  subtitle?: string;
  /** English eyebrow label above the title */
  eyebrow?: string;
  /** Chip tags shown beside the header */
  chips?: Array<{ label: string; variant: 'fact' | 'projected' | 'plan' }>;
  /** Additional className on the slide root */
  className?: string;
  /** Slide body content */
  children: ReactNode;
}

const chipClass: Record<string, string> = {
  fact: styles.chipFact,
  projected: styles.chipProjected,
  plan: styles.chipPlan,
};

export default function Slide({
  id,
  title,
  subtitle,
  eyebrow,
  chips,
  className,
  children,
}: SlideProps) {
  return (
    <section id={id} className={`${styles.slide} ${className ?? ''}`}>
      <div className={styles.slideFrame}>
        <header className={`${styles.slideHeader} ${styles.fadeUp}`}>
          <div>
            {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {chips && chips.length > 0 && (
            <div className={styles.slideNote}>
              {chips.map((c) => (
                <span
                  key={c.label}
                  className={`${styles.chip} ${chipClass[c.variant] ?? ''}`}
                >
                  {c.label}
                </span>
              ))}
            </div>
          )}
        </header>
        <div className={styles.fadeUp}>{children}</div>
      </div>
    </section>
  );
}
