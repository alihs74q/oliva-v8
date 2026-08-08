import { useEffect, useState } from 'react';
import type { Subcategory } from '../data/subcategories';
import { subcategoryData } from '../data/subcategories';

type MenuSnapshot = { sections?: Array<{ id: string; subcategories: Subcategory[] }> };

export function usePublishedContent() {
  const [menu, setMenu] = useState<Record<string, Subcategory[]>>(subcategoryData);
  const [releaseId, setReleaseId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/content/active')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const snapshot = data?.release?.snapshot as { 'menu:sections'?: MenuSnapshot } | undefined;
        const sections = snapshot?.['menu:sections']?.sections;
        if (!cancelled && sections?.length) {
          setMenu(Object.fromEntries(sections.map((section) => [section.id, section.subcategories])));
          setReleaseId(data.release.id);
        }
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  return { menu, releaseId };
}