'use client';

import {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
} from 'react';
import styles from './roadshow.module.css';

interface SlideContainerProps {
  children: ReactNode;
  /** Optional list of slide IDs for indicator dots and keyboard nav */
  slideIds?: string[];
}

export default function SlideContainer({ children, slideIds = [] }: SlideContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Observe which slide is currently in view
  useEffect(() => {
    const container = containerRef.current;
    if (!container || slideIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const idx = slideIds.indexOf(entry.target.id);
            if (idx >= 0) setActiveIndex(idx);
          }
        }
      },
      { root: container, threshold: 0.5 }
    );

    for (const id of slideIds) {
      const el = container.querySelector(`#${CSS.escape(id)}`);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [slideIds]);

  const scrollToSlide = useCallback(
    (index: number) => {
      const container = containerRef.current;
      if (!container || index < 0 || index >= slideIds.length) return;
      const target = container.querySelector(`#${CSS.escape(slideIds[index])}`);
      target?.scrollIntoView({ behavior: 'smooth' });
    },
    [slideIds]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (slideIds.length === 0) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        const next = Math.min(activeIndex + 1, slideIds.length - 1);
        scrollToSlide(next);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = Math.max(activeIndex - 1, 0);
        scrollToSlide(prev);
      } else if (e.key === 'Home') {
        e.preventDefault();
        scrollToSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        scrollToSlide(slideIds.length - 1);
      }
    },
    [activeIndex, slideIds, scrollToSlide]
  );

  return (
    <div
      ref={containerRef}
      className={styles.container}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Roadshow presentation"
    >
      {children}

      {slideIds.length > 1 && (
        <nav className={styles.indicators} aria-label="Slide navigation">
          {slideIds.map((id, i) => (
            <button
              key={id}
              className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
              onClick={() => scrollToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === activeIndex ? 'true' : undefined}
            />
          ))}
        </nav>
      )}
    </div>
  );
}
