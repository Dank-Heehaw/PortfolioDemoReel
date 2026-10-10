import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// GSAP motion layer — intro loader, nav menu, page reveals, fullpage home scroll.

gsap.registerPlugin(ScrollTrigger);

const refreshScroll = () => ScrollTrigger.refresh();
window.addEventListener("resize", refreshScroll, { passive: true });
window.addEventListener("orientationchange", refreshScroll, { passive: true });

export function clearScrollTriggers() {
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

// --- Home hero line reveals ---

function revealLines(container, selector, { delay = 0, stagger = 0.08 } = {}) {
  const lines = container.querySelectorAll(selector);
  if (!lines.length) return;
  gsap.fromTo(
    lines,
    { yPercent: 110 },
    {
      yPercent: 0,
      duration: 0.9,
      delay,
      stagger,
      ease: "power4.out",
      overwrite: "auto",
    }
  );
}

export function prepareHero(root = document) {
  const hero = root.querySelector(".site-hero");
  if (!hero) return;

  const lines = hero.querySelectorAll(".reveal-line__inner");
  if (!lines.length) return;

  hero.classList.remove("is-revealed");
  gsap.set(lines, { yPercent: 110 });
}

export function revealHero(root = document, { delay = 0 } = {}) {
  const hero = root.querySelector(".site-hero");
  if (!hero) return;

  const lines = hero.querySelectorAll(".reveal-line__inner");
  if (!lines.length) return;

  gsap.killTweensOf(lines);
  hero.classList.remove("is-revealed");
  gsap.set(lines, { yPercent: 110 });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set(lines, { yPercent: 0 });
    hero.classList.add("is-revealed");
    return;
  }

  gsap.to(lines, {
    yPercent: 0,
    duration: 0.95,
    delay,
    stagger: 0.12,
    ease: "power4.out",
    overwrite: "auto",
    onComplete: () => {
      gsap.set(lines, { yPercent: 0 });
      hero.classList.add("is-revealed");
    },
  });
}

// --- Nav menu open/close timeline (shared state across route changes) ---

let menuOpen = false;
let menuTl = null;
let menuClosing = false;
let closeOrigin = null;
let handoffWaiters = [];
let closeWaiters = [];

/** Delay so page reveal peaks as the menu panel clears. */
export const MENU_REVEAL_DELAY = 0.32;

/** Slightly longer handoff when exiting the Work drill-down into /work. */
export const WORK_REVEAL_DELAY = 0.42;

function notifyMenuHandoff() {
  const waiters = handoffWaiters.splice(0, handoffWaiters.length);
  waiters.forEach((resolve) => resolve());
}

function notifyMenuClosed() {
  menuClosing = false;
  closeOrigin = null;
  notifyMenuHandoff();
  const waiters = closeWaiters.splice(0, closeWaiters.length);
  waiters.forEach((resolve) => resolve());
}

/**
 * Closes the menu. Resolves at handoff (safe to swap page under the covering panel)
 * so content can load in sync with the panel exit.
 */
export function closeSiteMenu({ origin = null, fromWorkPanel = false } = {}) {
  if (!menuOpen && !menuClosing) return Promise.resolve();

  return new Promise((resolve) => {
    handoffWaiters.push(resolve);
    if (menuOpen) {
      document.querySelector("[data-menu]")?.dispatchEvent(
        new CustomEvent("close", { detail: { origin, fromWorkPanel } })
      );
    }
  });
}

export function bindSiteNav(root = document) {
  const nav = root.querySelector(".site-nav");
  const navBackdrop = nav?.querySelector("[data-nav-backdrop]");
  const menu = root.querySelector("[data-menu]");
  const toggles = root.querySelectorAll("[data-menu-toggle]");
  const mark = nav?.querySelector(".site-nav__mark");
  const markDefault = mark?.querySelector(".site-nav__mark-img--default");
  const markHover = mark?.querySelector(".site-nav__mark-img--hover");
  const markMenu = mark?.querySelector(".site-nav__mark-img--menu");
  if (!nav || !menu || !navBackdrop) return () => {};

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rows = gsap.utils.toArray(".nav-menu__row", menu);
  const icons = gsap.utils.toArray(".nav-menu__icon", menu);
  const lineInners = gsap.utils.toArray(".reveal-line__inner", menu);
  const markTargets = [markDefault, markHover, markMenu].filter(Boolean);
  let workTl = null;

  const setNavHeight = () => {
    const height = nav.offsetHeight || 0;
    document.documentElement.style.setProperty("--nav-height", `${height}px`);
  };
  setNavHeight();

  const resetRowText = () => {
    gsap.set(lineInners, { yPercent: 110 });
  };

  const clearRowMotion = () => {
    rows.forEach((row) => row.classList.remove("is-selecting"));
    gsap.set(rows, {
      clearProps: "flexGrow,flexBasis,flexShrink,minHeight,maxHeight,height,y,yPercent,autoAlpha,opacity,visibility",
    });
  };

  const resetClosedVisuals = () => {
    clearRowMotion();
    setMarkVisuals(false);
    if (reduce) return;
    resetRowText();
    gsap.set(icons, { scale: 0.6, y: -12, autoAlpha: 0 });
    gsap.set(navBackdrop, { yPercent: -100 });
    gsap.set(menu, { yPercent: 100 });
  };

  const setMarkVisuals = (open) => {
    if (!markDefault || !markMenu) return;
    gsap.set(markDefault, { autoAlpha: open ? 0 : 1, scale: 1, rotation: 0 });
    gsap.set(markMenu, { autoAlpha: open ? 1 : 0, scale: 1, rotation: 0 });
    if (markHover) gsap.set(markHover, { autoAlpha: 0 });
  };

  const setMarkHover = (active) => {
    if (!markHover || menuOpen || reduce) return;
    gsap.to(markHover, {
      autoAlpha: active ? 1 : 0,
      duration: 0.28,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const animateMarkOpen = (tl, at = 0.22) => {
    if (!markDefault || !markMenu || reduce) return;
    gsap.set(markMenu, { scale: 1.1, rotation: 10 });
    tl.to(
      markDefault,
      { autoAlpha: 0, scale: 0.9, rotation: -10, duration: 0.38, ease: "power2.in" },
      at
    ).to(
      markMenu,
      { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.48, ease: "power2.out" },
      at + 0.04
    );
  };

  const animateMarkClose = (tl, at = 0) => {
    if (!markDefault || !markMenu || reduce) return;
    gsap.set(markDefault, { scale: 0.9, rotation: -10 });
    tl.to(
      markMenu,
      { autoAlpha: 0, scale: 1.1, rotation: 10, duration: 0.34, ease: "power2.in" },
      at
    ).to(
      markDefault,
      { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.44, ease: "power2.out" },
      at + 0.04
    );
  };

  const stopMenuAnimation = () => {
    if (menuTl) {
      menuTl.kill();
      menuTl = null;
    }
    if (workTl) {
      workTl.kill();
      workTl = null;
    }
    gsap.killTweensOf([menu, navBackdrop, ...rows, ...icons, ...lineInners, ...markTargets]);
  };

  gsap.set(menu, { yPercent: 100, autoAlpha: 1 });
  gsap.set(navBackdrop, { yPercent: -100 });
  setMarkVisuals(false);
  if (markHover) gsap.set(markHover, { autoAlpha: 0 });
  if (!reduce) {
    gsap.set(rows, { autoAlpha: 1, y: 0 });
    resetRowText();
    gsap.set(icons, { scale: 0.6, y: -12, autoAlpha: 0 });
  }

  const setExpanded = (open) => {
    toggles.forEach((btn) => {
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "Close" : "Menu";
    });
  };

  const panelDuration = 0.85;
  const panelEase = "power4.inOut";
  const textDuration = 0.85;
  const textEase = "power4.out";
  const textStart = 0.48;
  const rowStagger = 0.1;
  const lineStagger = 0.08;

  const finishOpen = () => {
    menuTl = null;
  };

  const finishClose = () => {
    menu.hidden = true;
    resetClosedVisuals();
    menuTl = null;
    notifyMenuClosed();
    if (mark?.matches(":hover") || mark === document.activeElement) {
      setMarkHover(true);
    }
  };

  const slidePanelOut = (tl, at) => {
    tl.to(
      navBackdrop,
      {
        yPercent: -100,
        duration: panelDuration,
        ease: panelEase,
        onStart: notifyMenuHandoff,
      },
      at
    ).to(menu, { yPercent: 100, duration: panelDuration, ease: panelEase }, at);
  };

  const animateOpen = () => {
    if (reduce) {
      gsap.set(navBackdrop, { yPercent: 0 });
      gsap.set(menu, { yPercent: 0 });
      gsap.set(icons, { autoAlpha: 1, scale: 1, y: 0 });
      gsap.set(lineInners, { yPercent: 0 });
      setMarkVisuals(true);
      finishOpen();
      return null;
    }

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: finishOpen,
    });

    tl.to(navBackdrop, { yPercent: 0, duration: panelDuration, ease: panelEase }, 0).to(
      menu,
      { yPercent: 0, duration: panelDuration, ease: panelEase },
      0
    );

    animateMarkOpen(tl);

    rows.forEach((row, index) => {
      const rowText = gsap.utils.toArray(".reveal-line__inner", row);
      const rowIcon = row.querySelector(".nav-menu__icon");
      const start = textStart + index * rowStagger;

      tl.to(rowText, { yPercent: 0, duration: textDuration, stagger: lineStagger, ease: textEase }, start);

      if (rowIcon) {
        tl.to(
          rowIcon,
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.55, ease: "back.out(1.4)" },
          start + 0.12
        );
      }
    });

    return tl;
  };

  const animateCloseGeneric = () => {
    const tl = gsap.timeline({
      defaults: { ease: "power3.in" },
      onComplete: finishClose,
    });

    animateMarkClose(tl);

    [...rows].reverse().forEach((row, index) => {
      const rowText = gsap.utils.toArray(".reveal-line__inner", row).reverse();
      const rowIcon = row.querySelector(".nav-menu__icon");
      const start = index * 0.08;

      tl.to(rowText, { yPercent: 110, duration: textDuration, stagger: lineStagger, ease: "power4.in" }, start);

      if (rowIcon) {
        tl.to(rowIcon, { autoAlpha: 0, scale: 0.6, y: -12, duration: 0.45 }, start);
      }
    });

    const panelStart = Math.max(0.42, rows.length * 0.08 + 0.28);
    slidePanelOut(tl, panelStart);
    return tl;
  };

  /** Exit focused on the clicked row — it “opens”, neighbors collapse outward. */
  const animateCloseFrom = (origin) => {
    const selected = rows.includes(origin) ? origin : null;
    if (!selected) return animateCloseGeneric();

    const selectedIndex = rows.indexOf(selected);
    const selectedText = gsap.utils.toArray(".reveal-line__inner", selected);
    const selectedIcon = selected.querySelector(".nav-menu__icon");
    const selectedLabel = selected.querySelector(".nav-menu__label-inner");

    const neighbors = rows
      .map((row, index) => ({ row, dist: Math.abs(index - selectedIndex) }))
      .filter(({ row }) => row !== selected)
      .sort((a, b) => a.dist - b.dist);

    selected.classList.add("is-selecting");

    const tl = gsap.timeline({
      defaults: { ease: "power3.in" },
      onComplete: finishClose,
    });

    animateMarkClose(tl);

    // Open / claim the clicked option
    tl.to(selected, { flexGrow: 1.35, duration: 0.55, ease: "power3.out" }, 0);
    if (selectedLabel) {
      const originX = selected.classList.contains("nav-menu__row--left") ? "0% 50%" : "100% 50%";
      tl.fromTo(
        selectedLabel,
        { scale: 1 },
        { scale: 1.04, duration: 0.45, ease: "power3.out", transformOrigin: originX },
        0
      );
    }
    if (selectedIcon) {
      tl.to(selectedIcon, { scale: 1.15, duration: 0.45, ease: "back.out(1.6)" }, 0.05);
    }

    // Neighbors collapse away from the selection
    neighbors.forEach(({ row }, index) => {
      const rowText = gsap.utils.toArray(".reveal-line__inner", row).reverse();
      const rowIcon = row.querySelector(".nav-menu__icon");
      const start = 0.06 + index * 0.07;

      tl.to(
        row,
        {
          flexGrow: 0.001,
          flexBasis: 0,
          minHeight: 0,
          autoAlpha: 0,
          duration: 0.5,
          ease: "power3.inOut",
        },
        start
      );
      tl.to(rowText, { yPercent: 110, duration: 0.55, stagger: 0.04, ease: "power4.in" }, start);
      if (rowIcon) {
        tl.to(rowIcon, { autoAlpha: 0, scale: 0.5, y: -10, duration: 0.35 }, start);
      }
    });

    // Selected option exits, then panel hands off to the new page underneath
    const selectExit = 0.48;
    tl.to(selectedText, { yPercent: -110, duration: 0.55, stagger: 0.05, ease: "power4.in" }, selectExit);
    if (selectedIcon) {
      tl.to(selectedIcon, { autoAlpha: 0, scale: 1.3, y: -20, duration: 0.4 }, selectExit);
    }
    if (selectedLabel) {
      tl.to(selectedLabel, { scale: 1, duration: 0.35, ease: "power2.in" }, selectExit);
    }

    slidePanelOut(tl, selectExit + 0.22);
    return tl;
  };

  const animateClose = (origin, { fromWorkPanel = false } = {}) => {
    if (reduce) {
      gsap.set(navBackdrop, { yPercent: -100 });
      gsap.set(menu, { yPercent: 100 });
      setMarkVisuals(false);
      notifyMenuHandoff();
      finishClose();
      return null;
    }

    if (fromWorkPanel && workPanelOpen) return animateCloseFromWorkAll();
    return origin && rows.includes(origin) ? animateCloseFrom(origin) : animateCloseGeneric();
  };

  /** Work drill-down → full /work page: panel content lifts out, then the menu hands off. */
  const animateCloseFromWorkAll = () => {
    if (!workPanel || !workRow) return animateCloseGeneric();

    setCardTransitions(false);
    workRow.classList.add("is-selecting");

    const selectedText = gsap.utils.toArray(".reveal-line__inner", workRow);
    const selectedIcon = workRow.querySelector(".nav-menu__icon");
    const selectedLabel = workRow.querySelector(".nav-menu__label-inner");

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        resetWorkLayout();
        finishClose();
      },
    });

    animateMarkClose(tl);

    if (workCats.length) {
      tl.to(
        workCats,
        { y: -36, autoAlpha: 0, stagger: 0.045, duration: 0.48, ease: "power3.in" },
        0
      );
    }

    if (workCards.length) {
      tl.to(
        workCards,
        { y: -52, autoAlpha: 0, stagger: 0.05, duration: 0.52, ease: "power3.in" },
        0.04
      );
    }

    if (workCta) {
      tl.to(workCta, { y: -20, autoAlpha: 0, duration: 0.38, ease: "power3.in" }, 0.06);
    }

    tl.to(
      workPanel,
      { flexGrow: 0, flexBasis: 0, minHeight: 0, duration: 0.58, ease: "power3.inOut" },
      0.1
    );

    const rowExit = 0.34;
    tl.to(selectedText, { yPercent: -110, duration: 0.55, stagger: 0.05, ease: "power4.in" }, rowExit);
    if (selectedIcon) {
      tl.to(selectedIcon, { autoAlpha: 0, scale: 1.2, y: -18, duration: 0.42 }, rowExit);
    }
    if (selectedLabel) {
      tl.to(selectedLabel, { scale: 1, duration: 0.32, ease: "power2.in" }, rowExit);
    }

    slidePanelOut(tl, rowExit + 0.24);
    return tl;
  };

  // Work drill-down state (declared before setOpen so reopen can reset it safely)
  const workRow = menu.querySelector("[data-menu-work]");
  const workPanel = menu.querySelector("[data-menu-work-panel]");
  const workCats = gsap.utils.toArray("[data-work-cat]", menu);
  const workCards = gsap.utils.toArray("[data-work-card]", menu);
  const workCta = workPanel?.querySelector(".nav-menu__work-cta");
  const workBits = [...workCats, ...workCards, workCta].filter(Boolean);
  let workPanelOpen = false;

  const workIndex = workRow ? rows.indexOf(workRow) : -1;
  const aboveRows = workIndex > 0 ? rows.slice(0, workIndex) : [];
  const belowRows = workIndex >= 0 ? rows.slice(workIndex + 1) : [];

  const setCardTransitions = (enabled) => {
    workCards.forEach((card) => {
      card.style.transition = enabled ? "" : "none";
    });
  };

  const setOffscreenRows = (hidden) => {
    [...aboveRows, ...belowRows].forEach((row) => {
      if (hidden) row.setAttribute("aria-hidden", "true");
      else row.removeAttribute("aria-hidden");
    });
  };

  const applyWorkOpenState = (open) => {
    workPanelOpen = open;
    menu.dataset.menuPanel = open ? "work" : "primary";
    menu.classList.toggle("is-work-open", open);
    document.body.classList.toggle("is-menu-work", open);
    workRow?.classList.toggle("is-selecting", open);
    workRow?.setAttribute("aria-expanded", String(open));
    setOffscreenRows(open);
  };

  const resetWorkLayout = () => {
    applyWorkOpenState(false);
    workRow?.classList.remove("is-selecting");
    setCardTransitions(true);
    if (workPanel) {
      workPanel.hidden = true;
      gsap.set(workPanel, { clearProps: "all" });
    }
    gsap.set(rows, {
      clearProps: "flexGrow,flexBasis,flexShrink,minHeight,maxHeight,height,y,yPercent,autoAlpha,opacity,visibility",
    });
    if (workBits.length) gsap.set(workBits, { clearProps: "all" });
  };

  const snapCloseWorkPanel = () => {
    if (workTl) {
      workTl.kill();
      workTl = null;
    }
    gsap.killTweensOf([workPanel, workRow, ...aboveRows, ...belowRows, ...workBits].filter(Boolean));
    resetWorkLayout();
  };

  const syncActiveCardAlign = (id = "") => {
    const body = workPanel?.querySelector(".nav-menu__work-body");
    const activeCat = workCats.find((btn) => btn.dataset.workCat === id);
    const activeCard = workCards.find((card) => card.dataset.workCard === id);
    if (!body || !activeCat || !activeCard || reduce) return;

    const bodyRect = body.getBoundingClientRect();
    const catRect = activeCat.getBoundingClientRect();
    const cardRect = activeCard.getBoundingClientRect();
    const targetY =
      catRect.top - bodyRect.top + catRect.height * 0.5 - (cardRect.top - bodyRect.top + cardRect.height * 0.5);

    gsap.to(activeCard, {
      marginTop: targetY,
      duration: 0.55,
      ease: "power3.out",
      overwrite: "auto",
    });

    workCards.forEach((card) => {
      if (card === activeCard) return;
      gsap.to(card, { marginTop: 0, duration: 0.45, ease: "power3.out", overwrite: "auto" });
    });
  };

  const setOpen = (open, { origin = null, fromWorkPanel = false } = {}) => {
    // Already at (or heading to) this state — ignore duplicate requests.
    if (menuOpen === open) return;

    const wasAnimating = Boolean(menuTl);
    if (fromWorkPanel) {
      if (workTl) {
        workTl.kill();
        workTl = null;
      }
    } else if (workPanelOpen || workTl) {
      snapCloseWorkPanel();
    }
    stopMenuAnimation();

    menuOpen = open;
    menuClosing = !open;
    closeOrigin = open ? null : origin;
    setExpanded(open);
    document.body.classList.toggle("is-menu-open", open);

    if (open) {
      menuClosing = false;
      closeOrigin = null;
      menu.hidden = false;
      if (markHover) gsap.set(markHover, { autoAlpha: 0 });
      if (!reduce && !wasAnimating) {
        resetClosedVisuals();
      } else {
        clearRowMotion();
      }
      menuTl = animateOpen();
    } else {
      menuTl = animateClose(origin, { fromWorkPanel });
    }
  };

  /**
   * Split the primary list around Work: Home exits up, later rows exit down,
   * Work slides into Home's slot, and categories scroll up into the gap.
   */
  const openWorkPanel = () => {
    if (!workPanel || !workRow) return;

    if (workTl && workTl.reversed()) {
      applyWorkOpenState(true);
      workPanel.hidden = false;
      workTl.play();
      return;
    }

    if (workPanelOpen) return;

    const workHeight = workRow.offsetHeight;
    const menuHeight = menu.offsetHeight;

    applyWorkOpenState(true);
    workPanel.hidden = false;
    setCardTransitions(false);
    gsap.set(workPanel, { autoAlpha: 1, overflow: "hidden" });

    if (reduce) {
      gsap.set(aboveRows, { flexGrow: 0.001, flexBasis: 0, minHeight: 0, autoAlpha: 0, y: -menuHeight });
      gsap.set(belowRows, { flexGrow: 0.001, flexBasis: 0, minHeight: 0, autoAlpha: 0, y: menuHeight });
      gsap.set(workRow, {
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: `${workHeight}px`,
        height: workHeight,
        minHeight: workHeight,
        maxHeight: workHeight,
      });
      gsap.set(workPanel, { flexGrow: 1, flexShrink: 1, flexBasis: "0%", minHeight: 0, autoAlpha: 1 });
      gsap.set(workBits, { y: 0, autoAlpha: 1 });
      setCardTransitions(true);
      return;
    }

    if (workTl) {
      workTl.kill();
      workTl = null;
    }

    workTl = gsap.timeline({
      defaults: { ease: "power3.inOut", overwrite: "auto" },
      onComplete: () => setCardTransitions(true),
      onReverseComplete: () => {
        resetWorkLayout();
        workTl = null;
      },
    });

    workTl.to(
      workRow,
      {
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: `${workHeight}px`,
        height: workHeight,
        minHeight: workHeight,
        maxHeight: workHeight,
        duration: 0.72,
      },
      0
    );

    if (aboveRows.length) {
      workTl.to(
        aboveRows,
        {
          flexGrow: 0.001,
          flexBasis: 0,
          minHeight: 0,
          y: -menuHeight,
          autoAlpha: 0,
          duration: 0.72,
          ease: "power3.inOut",
        },
        0
      );
    }

    if (belowRows.length) {
      workTl.to(
        belowRows,
        {
          flexGrow: 0.001,
          flexBasis: 0,
          minHeight: 0,
          y: menuHeight,
          autoAlpha: 0,
          duration: 0.72,
          stagger: 0.05,
          ease: "power3.inOut",
        },
        0.04
      );
    }

    workTl.fromTo(
      workPanel,
      { flexGrow: 0, flexShrink: 1, flexBasis: "0%", minHeight: 0 },
      { flexGrow: 1, flexShrink: 1, flexBasis: "0%", minHeight: 0, duration: 0.72 },
      0.05
    );

    if (workCats.length) {
      gsap.set(workCats, { autoAlpha: 1 });
      workTl.fromTo(
        workCats,
        { y: 96, autoAlpha: 1 },
        { y: 0, autoAlpha: 1, stagger: 0.07, duration: 0.65, ease: "power3.out" },
        0.18
      );
    }

    if (workCards.length) {
      workTl.fromTo(
        workCards,
        { y: 120 },
        { y: 0, stagger: 0.08, duration: 0.75, ease: "power3.out" },
        0.22
      );
    }

    if (workCta) {
      workTl.fromTo(
        workCta,
        { y: 40, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" },
        0.38
      );
    }

    if (workCats.length) {
      const activeCat = workCats.find((btn) => btn.classList.contains("is-active"));
      if (activeCat) {
        workTl.call(() => syncActiveCardAlign(activeCat.dataset.workCat || ""), null, 0.72);
      }
    }
  };

  /** Return from Work drill-down to the primary route list. */
  const closeWorkPanel = () => {
    if (!workPanel || !workRow) return;
    if (workTl?.reversed()) return;

    if (workTl && workTl.progress() > 0) {
      setCardTransitions(false);
      workTl.reverse();
      return;
    }

    if (workPanelOpen) resetWorkLayout();
  };

  /** Highlight a work category and swap the featured 3D card on the right. */
  const setWorkCategory = (id = "") => {
    workCats.forEach((btn) => {
      const on = btn.dataset.workCat === id;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", String(on));
    });
    workCards.forEach((card) => {
      card.classList.toggle("is-active", card.dataset.workCard === id);
    });
    syncActiveCardAlign(id);
  };

  const closeMenu = (origin = null, { fromWorkPanel = false } = {}) => {
    setOpen(false, { origin, fromWorkPanel });
  };
  const toggleMenu = () => {
    if (menuOpen && workPanelOpen) {
      closeWorkPanel();
      return;
    }
    setOpen(!menuOpen);
  };

  const onClick = (event) => {
    if (event.target.closest("[data-menu-toggle]")) {
      event.preventDefault();
      toggleMenu();
      return;
    }

    // Work row → split the list; click again to collapse
    const workTrigger = event.target.closest("[data-menu-work]");
    if (workTrigger && !workTrigger.closest("[data-menu-work-panel]")) {
      event.preventDefault();
      if (workPanelOpen && !(workTl && workTl.reversed())) closeWorkPanel();
      else openWorkPanel();
      return;
    }

    if (event.target.closest("[data-menu-work-back]")) {
      event.preventDefault();
      closeWorkPanel();
      return;
    }

    const workCat = event.target.closest("[data-work-cat]");
    if (workCat) {
      event.preventDefault();
      setWorkCategory(workCat.dataset.workCat || "");
      return;
    }

    const workAll = event.target.closest("[data-menu-work-all]");
    if (workAll) {
      event.preventDefault();
      if (workPanelOpen) closeMenu(workRow, { fromWorkPanel: true });
      else closeMenu(workRow);
      return;
    }

    const row = event.target.closest("[data-menu-close]");
    if (row) {
      event.preventDefault();
      closeMenu(row.closest(".nav-menu__row") || row);
    }
  };

  const onKey = (event) => {
    if (event.key === "Escape" && menuOpen) {
      if (workPanelOpen) closeWorkPanel();
      else closeMenu();
    }
  };

  const onMenuCloseEvent = (event) => {
    const detail = event.detail || {};
    closeMenu(detail.origin ?? closeOrigin ?? null, {
      fromWorkPanel: Boolean(detail.fromWorkPanel),
    });
  };

  const onWorkResize = () => {
    if (!workPanelOpen) return;
    const activeCat = workCats.find((btn) => btn.classList.contains("is-active"));
    if (activeCat) syncActiveCardAlign(activeCat.dataset.workCat || "");
  };

  const onResize = () => {
    setNavHeight();
    onWorkResize();
  };
  window.addEventListener("resize", onResize, { passive: true });

  const onMarkEnter = () => setMarkHover(true);
  const onMarkLeave = () => setMarkHover(false);

  mark?.addEventListener("mouseenter", onMarkEnter);
  mark?.addEventListener("mouseleave", onMarkLeave);
  mark?.addEventListener("focus", onMarkEnter);
  mark?.addEventListener("blur", onMarkLeave);

  root.addEventListener("click", onClick);
  menu.addEventListener("close", onMenuCloseEvent);
  window.addEventListener("keydown", onKey);

  return () => {
    mark?.removeEventListener("mouseenter", onMarkEnter);
    mark?.removeEventListener("mouseleave", onMarkLeave);
    mark?.removeEventListener("focus", onMarkEnter);
    mark?.removeEventListener("blur", onMarkLeave);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("keydown", onKey);
    root.removeEventListener("click", onClick);
    menu.removeEventListener("close", onMenuCloseEvent);
    if (workPanelOpen || workTl) snapCloseWorkPanel();
    stopMenuAnimation();
    document.body.classList.remove("is-menu-open", "is-menu-work");
    menu.classList.remove("is-work-open");
    menuOpen = false;
    menu.hidden = true;
    notifyMenuClosed();
  };
}

// --- Inner-page & journal article reveal sequences ---

export function revealPanel(panel, { delay = 0 } = {}) {
  if (!panel) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    ScrollTrigger.refresh();
    return;
  }

  panel.querySelectorAll("[data-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 40 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      }
    );
  });

  panel.querySelectorAll("[data-reveal-stagger]").forEach((group) => {
    const kids = group.children;
    if (!kids.length) return;
    gsap.fromTo(
      kids,
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        delay,
        stagger: 0.06,
        ease: "power3.out",
        scrollTrigger: {
          trigger: group,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      }
    );
  });

  panel.querySelectorAll(".reveal-line__inner").forEach((line) => {
    gsap.fromTo(
      line,
      { yPercent: 110 },
      {
        yPercent: 0,
        duration: 0.85,
        delay,
        ease: "power4.out",
        scrollTrigger: {
          trigger: line.closest("[data-reveal]") || line,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      }
    );
  });

  ScrollTrigger.refresh();
}

/**
 * Journal post motion: hero title/lede entrance, body block reveals, subtle title parallax.
 * ScrollTriggers are cleared by clearScrollTriggers() on soft nav.
 */
export function revealJournalArticle(panel, { delay = 0 } = {}) {
  if (!panel) return;

  const article = panel.querySelector(".archive-article--editorial");
  if (!article) {
    revealPanel(panel, { delay });
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealPanel(panel, { delay });
    return;
  }

  const hero = article.querySelector(".archive-article__hero");
  const media = article.querySelector(".archive-article__hero-media");
  const mast = article.querySelector(".archive-article__hero-copy");
  const title = article.querySelector(".archive-article__title");
  const body = article.querySelector(".archive-article__body");

  // 1 — Hero title / lede entrance (load-triggered)
  const heroBits = [];
  if (mast) {
    [
      ".archive-article__eyebrow",
      ".archive-article__topics",
      ".archive-article__title",
      ".archive-article__title-rule",
      ".archive-article__title-rest",
      ".archive-article__dek",
    ].forEach((sel) => {
      const el = mast.querySelector(sel);
      if (el) heroBits.push(el);
    });
  }

  if (media) {
    gsap.fromTo(
      media,
      { autoAlpha: 0, scale: 1.035 },
      {
        autoAlpha: 1,
        scale: 1,
        duration: 1.05,
        delay,
        ease: "power3.out",
        overwrite: "auto",
      }
    );
  }

  if (heroBits.length) {
    gsap.fromTo(
      heroBits,
      { autoAlpha: 0, y: 36 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.85,
        delay: delay + (media ? 0.12 : 0),
        stagger: 0.07,
        ease: "power4.out",
        overwrite: "auto",
      }
    );
  }

  // 2 — Body blocks fade / slide in on scroll
  if (body) {
    const blocks = gsap.utils.toArray(
      body.querySelectorAll(
        ":scope > p, :scope > h2, :scope > h3, :scope > ul, :scope > ol, :scope > blockquote, :scope > figure, :scope > .archive-article__split, :scope > .archive-article__lede, :scope > .archive-article__refs"
      )
    );

    if (blocks.length) {
      gsap.set(blocks, { autoAlpha: 0, y: 28 });
      ScrollTrigger.batch(blocks, {
        start: "top 88%",
        once: true,
        interval: 0.12,
        batchMax: 4,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.07,
            ease: "power3.out",
            overwrite: true,
          }),
      });
    }
  }

  // 3 — Subtle scroll-linked parallax on the hero title
  if (hero && title) {
    gsap.fromTo(
      title,
      { y: 0 },
      {
        y: 42,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.7,
        },
      }
    );
  }

  // Toolbar, gallery, related links still use the shared reveal system
  revealPanel(panel, { delay });
}

// --- Home fullpage scroll (ScrollTrigger snap between panels) ---

export function bindFullpage(root = document) {
  const home = root.querySelector("[data-fullpage]");
  const site = root.classList?.contains("site") ? root : root.querySelector(".site");
  const mm = gsap.matchMedia();

  if (!home) return () => mm.revert();

  mm.add("(min-width: 900px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
    document.documentElement.classList.add("is-fullpage");
    site?.classList.add("is-fullpage");
    home.classList.add("is-fullpage");

    return () => {
      document.documentElement.classList.remove("is-fullpage");
      site?.classList.remove("is-fullpage");
      home.classList.remove("is-fullpage");
    };
  });

  return () => mm.revert();
}

const LOADER_TYPE_DESKTOP = "Portfolio Demo Reel";
const LOADER_TYPE_MOBILE = "PortfolioDemoReel";

function loaderTypeText() {
  return window.matchMedia("(max-width: 719px)").matches ? LOADER_TYPE_MOBILE : LOADER_TYPE_DESKTOP;
}

function typeText(timeline, element, text, { start = 0, duration = 2.1 } = {}) {
  if (!element || !text) return;

  const progress = { value: 0 };

  timeline.to(
    progress,
    {
      value: 1,
      duration,
      ease: "none",
      onUpdate: () => {
        const count = Math.round(progress.value * text.length);
        element.textContent = text.slice(0, count);
      },
    },
    start
  );
}

function bindLoaderGrid(loader) {
  const grid = loader.querySelector(".loader__grid");
  if (!grid) return () => {};

  const canInteract =
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

  if (!canInteract) return () => {};

  let raf = 0;
  let x = 0.5;
  let y = 0.5;

  const flush = () => {
    raf = 0;
    grid.style.setProperty("--loader-x", `${(x * 100).toFixed(2)}%`);
    grid.style.setProperty("--loader-y", `${(y * 100).toFixed(2)}%`);
  };

  const onMove = (event) => {
    const rect = loader.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    if (!raf) raf = requestAnimationFrame(flush);
  };

  loader.classList.add("loader--grid-live");
  loader.addEventListener("pointermove", onMove, { passive: true });

  return () => {
    loader.classList.remove("loader--grid-live");
    loader.removeEventListener("pointermove", onMove);
    if (raf) cancelAnimationFrame(raf);
  };
}

// --- Intro loader sequence (progress bar → curtain → onDone callback) ---

export function runIntro({ loader, page, onDone }) {
  if (!loader || !page) return;

  const bar = loader.querySelector(".loader__bar");
  const countEl = loader.querySelector("[data-loader-count]");
  const typeEl = loader.querySelector("[data-loader-type]");
  const curtain = loader.querySelector(".loader__curtain");
  const reveals = loader.querySelectorAll(".loader__reveal");
  const lines = loader.querySelectorAll(".loader .reveal-line__inner");
  const unbindGrid = bindLoaderGrid(loader);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const counter = { value: 0 };
  let done = false;

  const finish = () => {
    if (done) return;
    done = true;
    unbindGrid();
    loader.setAttribute("aria-busy", "false");
    if (typeEl) typeEl.textContent = loaderTypeText();
    gsap.set(loader, { autoAlpha: 0, display: "none" });
    gsap.set(page, { autoAlpha: 1 });
    onDone?.();
  };

  // Skip matchMedia for intro — scoped contexts can revert and kill the
  // timeline mid-flight, leaving the loader stuck at the initial 0% markup.
  if (reduce) {
    finish();
    return;
  }

  gsap.set(loader, { yPercent: 0 });
  gsap.set(curtain, { scaleY: 0 });
  gsap.set(reveals, { opacity: 0, y: 12 });
  gsap.set(lines, { yPercent: 110 });
  gsap.set(bar, { scaleX: 0 });
  if (typeEl) typeEl.textContent = "";

  const tl = gsap.timeline({
    defaults: { ease: "power3.out", overwrite: "auto" },
    onComplete: finish,
  });

  tl.to(reveals, { opacity: 1, y: 0, duration: 0.55, stagger: 0.06 }, 0)
    .to(lines, { yPercent: 0, duration: 0.85, stagger: 0.08, ease: "power4.out" }, 0.08);

  typeText(tl, typeEl, loaderTypeText(), { start: 0.2, duration: 0.95 });

  tl.to(bar, { scaleX: 1, duration: 1.15, ease: "power2.inOut" }, 0.25)
    .to(
      counter,
      {
        value: 100,
        duration: 1.15,
        ease: "power2.inOut",
        onUpdate: () => {
          if (countEl) countEl.textContent = String(Math.round(counter.value)).padStart(2, "0");
        },
      },
      0.25
    )
    .to({}, { duration: 0.12 })
    .to(curtain, { scaleY: 1, duration: 0.55, ease: "power4.in" }, ">")
    .to(loader, { yPercent: -100, duration: 0.85, ease: "power4.inOut" }, "<0.08")
    .set(loader, { display: "none" });
}
