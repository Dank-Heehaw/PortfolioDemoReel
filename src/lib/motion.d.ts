/** Types for the ported GSAP helpers in motion.js */

export const MENU_REVEAL_DELAY: number;
export const WORK_REVEAL_DELAY: number;

export function clearScrollTriggers(): void;
export function prepareHero(root?: Element | Document | null): void;
export function revealHero(
  root?: Element | Document | null,
  options?: { delay?: number }
): void;
export function closeSiteMenu(options?: {
  origin?: Element | null;
  fromWorkPanel?: boolean;
}): Promise<void>;
export function bindSiteNav(root?: Element | Document | null): () => void;
export function revealPanel(
  panel?: Element | Document | null,
  options?: { delay?: number }
): void;
export function revealJournalArticle(
  panel?: Element | Document | null,
  options?: { delay?: number }
): void;
export function bindFullpage(root?: Element | Document | null): () => void;
export function runIntro(options: {
  loader: Element | null;
  page: Element | null;
  onDone?: () => void;
}): void;
