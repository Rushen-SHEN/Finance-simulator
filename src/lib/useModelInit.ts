'use client';

import { useState, useRef } from 'react';
import { ModelInputs } from '@/lib/calculator';
import { DEFAULT_MODEL } from '@/lib/defaults';
import { loadModel } from '@/lib/storage';

/**
 * Shared hook for model initialization from localStorage.
 * Replaces the duplicated `if (!initialized && typeof window !== 'undefined')` pattern
 * across page.tsx, bp-mapping/page.tsx, qa/page.tsx, and roadshow/page.tsx.
 *
 * @returns [model, setModel, initialized] tuple
 */
export function useModelInit(): [ModelInputs, React.Dispatch<React.SetStateAction<ModelInputs>>, boolean] {
  const [model, setModel] = useState<ModelInputs>(() => {
    if (typeof window === 'undefined') return structuredClone(DEFAULT_MODEL);
    return loadModel();
  });
  const initialized = useRef(typeof window !== 'undefined');

  return [model, setModel, initialized.current];
}
