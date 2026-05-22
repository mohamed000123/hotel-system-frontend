'use client';

import { useEffect } from 'react';

/**
 * Sync ARIA state on native form controls via the DOM.
 * Microsoft Edge Tools (axe) flags JSX expressions on aria-* attributes.
 */
export function useAriaFieldState(
  element: HTMLElement | null,
  options: { invalid: boolean; describedById?: string },
): void {
  const { invalid, describedById } = options;

  useEffect(() => {
    if (!element) return;
    const el = element;

    if (invalid) {
      el.setAttribute('aria-invalid', 'true');
    } else {
      el.removeAttribute('aria-invalid');
    }

    if (describedById) {
      el.setAttribute('aria-describedby', describedById);
    } else {
      el.removeAttribute('aria-describedby');
    }
  }, [element, invalid, describedById]);
}
