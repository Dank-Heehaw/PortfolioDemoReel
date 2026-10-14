/**
 * Archive board: category filters and the lightbox.
 * The gallery is a fixed layout, not a draggable field.
 * Category changes ease outgoing tiles out, then ease the next set in.
 */
import gsap from "gsap";

export function revealArchive(panel, { delay = 0 } = {}) {
  if (!panel) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = panel.querySelectorAll("[data-archive-reveal]");

  if (reduce) {
    gsap.set(items, { autoAlpha: 1, y: 0 });
    return;
  }

  if (items.length) {
    gsap.fromTo(
      items,
      { autoAlpha: 0, y: 28 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        delay,
        ease: "power4.out",
        overwrite: "auto",
      }
    );
  }
}

export function bindArchivePage(root = document) {
  const page = root.querySelector(".site-page--past");
  if (!page) return () => {};

  const filters = gsap.utils.toArray("[data-archive-filter]", page);
  const cards = gsap.utils.toArray("[data-archive-card]", page);
  const empty = page.querySelector("[data-archive-empty]");
  const viewer = page.querySelector("[data-archive-viewer]");
  const rail = viewer?.querySelector("[data-viewer-rail]");
  const slides = gsap.utils.toArray("[data-viewer-slide]", page);
  const viewerTitle = viewer?.querySelector("[data-viewer-title]");
  const viewerMeta = viewer?.querySelector("[data-viewer-meta]");
  const viewerCloseBtns = gsap.utils.toArray("[data-viewer-close]", page);
  const prevBtns = gsap.utils.toArray("[data-archive-prev]", page);
  const nextBtns = gsap.utils.toArray("[data-archive-next]", page);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cleanups = [];

  if (!cards.length) return () => {};

  const mosaic = page.querySelector("[data-archive-mosaic]");
  let categoryFilter = "all";
  let activeIndex = 0;
  let viewerOpen = false;
  let scrollLock = false;
  let disposed = false;
  let filterTl = null;

  const cardMatches = (card, filter = categoryFilter) =>
    filter === "all" || card.dataset.category === filter;
  const visibleCards = () => cards.filter((card) => cardMatches(card));

  const clearCardMotion = (list) => {
    if (!list.length) return;
    gsap.set(list, { clearProps: "transform,transformOrigin,opacity,visibility" });
  };

  const layoutPieces = () => {
    let index = 0;
    const shown = [];
    const concealed = [];
    cards.forEach((card) => {
      const on = cardMatches(card);
      card.hidden = !on;
      if (on) {
        index += 1;
        shown.push(card);
      } else {
        concealed.push(card);
      }
    });
    clearCardMotion(shown);
    clearCardMotion(concealed);
    if (empty) empty.hidden = index > 0;
    layoutSlides();
  };

  const visibleSlides = () => slides.filter((slide) => !slide.hidden);

  const layoutSlides = () => {
    slides.forEach((slide) => {
      slide.hidden = categoryFilter !== "all" && slide.dataset.category !== categoryFilter;
    });
  };

  const markActive = () => {
    const visible = visibleSlides();
    slides.forEach((slide) => slide.classList.remove("is-active"));
    visible[activeIndex]?.classList.add("is-active");
  };

  const updateViewer = (card) => {
    if (!card || !viewer) return;
    const title = card.dataset.title || "";
    const medium = card.dataset.medium || card.dataset.category || "";
    if (viewerTitle) viewerTitle.textContent = title;
    if (viewerMeta) viewerMeta.textContent = medium;
    markActive();
  };

  const scrollToActive = (behavior = "smooth") => {
    const slide = visibleSlides()[activeIndex];
    if (!slide) return;
    scrollLock = true;
    slide.scrollIntoView({ inline: "center", block: "nearest", behavior });
    window.setTimeout(() => {
      scrollLock = false;
    }, behavior === "smooth" ? 420 : 40);
  };

  const openViewer = (index = activeIndex) => {
    if (!viewer) return;
    const visible = visibleCards();
    if (!visible.length) return;

    activeIndex = ((index % visible.length) + visible.length) % visible.length;
    const wasOpen = viewerOpen;
    updateViewer(visible[activeIndex]);
    viewerOpen = true;
    viewer.hidden = false;
    document.body.classList.add("is-archive-viewer");
    if (!wasOpen) {
      if (!reduce) {
        gsap.fromTo(viewer, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power2.out" });
      } else {
        gsap.set(viewer, { autoAlpha: 1 });
      }
    }
    requestAnimationFrame(() => scrollToActive(wasOpen && !reduce ? "smooth" : "auto"));
  };

  const closeViewer = () => {
    if (!viewer || !viewerOpen) return;
    viewerOpen = false;
    document.body.classList.remove("is-archive-viewer");
    const finish = () => {
      viewer.hidden = true;
    };
    if (!reduce) {
      gsap.to(viewer, { autoAlpha: 0, duration: 0.28, ease: "power2.in", onComplete: finish });
    } else {
      gsap.set(viewer, { autoAlpha: 0 });
      finish();
    }
  };

  const openViewerFromSlug = (slug = "") => {
    const idx = visibleCards().findIndex((card) => card.dataset.slug === slug);
    if (idx >= 0) openViewer(idx);
  };

  const applyCategoryFilter = (filter) => {
    const next = filter || "all";
    if (next === categoryFilter) return;

    if (filterTl) {
      filterTl.kill();
      filterTl = null;
      gsap.killTweensOf(cards);
      mosaic?.classList.remove("is-swapping");
      layoutPieces();
    }

    const leaving = cards.filter((card) => !card.hidden && !cardMatches(card, next));
    const staying = cards.filter((card) => !card.hidden && cardMatches(card, next));
    const entering = cards.filter((card) => card.hidden && cardMatches(card, next));
    const incoming = staying.concat(entering);

    categoryFilter = next;
    filters.forEach((btn) => {
      const on = btn.dataset.archiveFilter === categoryFilter;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", String(on));
    });
    activeIndex = 0;
    layoutSlides();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      layoutPieces();
      return;
    }

    const tl = gsap.timeline({
      paused: true,
      onComplete: () => {
        filterTl = null;
        mosaic?.classList.remove("is-swapping");
        clearCardMotion(cards.filter((card) => !card.hidden));
      },
    });
    filterTl = tl;
    mosaic?.classList.add("is-swapping");

    if (leaving.length) {
      tl.to(leaving, {
        autoAlpha: 0,
        y: 16,
        duration: 0.38,
        ease: "power2.in",
        stagger: { amount: 0.24, from: "start" },
        overwrite: "auto",
      });
    }

    tl.call(() => {
      if (disposed) return;

      if (staying.length) gsap.set(staying, { autoAlpha: 0, y: 20 });
      entering.forEach((card) => {
        gsap.set(card, { autoAlpha: 0, y: 20 });
        card.hidden = false;
      });
      leaving.forEach((card) => {
        card.hidden = true;
      });
      clearCardMotion(leaving);
      if (empty) empty.hidden = incoming.length > 0;
      if (!incoming.length) return;

      tl.to(incoming, {
        autoAlpha: 1,
        y: 0,
        duration: 0.52,
        ease: "power3.out",
        stagger: { amount: 0.32, from: "start" },
        overwrite: "auto",
      });
    });

    tl.play();
  };

  const syncFromScroll = () => {
    if (!viewerOpen || scrollLock || !rail) return;
    const railBox = rail.getBoundingClientRect();
    const center = railBox.left + railBox.width / 2;
    const visible = visibleSlides();
    let best = 0;
    let bestDist = Infinity;
    visible.forEach((slide, index) => {
      const box = slide.getBoundingClientRect();
      const dist = Math.abs(box.left + box.width / 2 - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = index;
      }
    });
    if (best === activeIndex) return;
    activeIndex = best;
    updateViewer(visibleCards()[best]);
  };

  let scrollTimer = 0;
  if (rail) {
    const onScroll = () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(syncFromScroll, 70);
    };
    rail.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => {
      window.clearTimeout(scrollTimer);
      rail.removeEventListener("scroll", onScroll);
    });
  }

  slides.forEach((slide) => {
    const onClick = () => {
      if (!viewerOpen || slide.hidden) return;
      const index = visibleSlides().indexOf(slide);
      if (index >= 0) openViewer(index);
    };
    slide.addEventListener("click", onClick);
    cleanups.push(() => slide.removeEventListener("click", onClick));
  });

  cards.forEach((card) => {
    const onClick = () => openViewerFromSlug(card.dataset.slug || "");
    card.addEventListener("click", onClick);
    cleanups.push(() => card.removeEventListener("click", onClick));
  });

  filters.forEach((btn) => {
    const onClick = () => applyCategoryFilter(btn.dataset.archiveFilter || "all");
    btn.addEventListener("click", onClick);
    cleanups.push(() => btn.removeEventListener("click", onClick));
  });

  prevBtns.forEach((btn) => {
    const onPrev = () => viewerOpen && openViewer(activeIndex - 1);
    btn.addEventListener("click", onPrev);
    cleanups.push(() => btn.removeEventListener("click", onPrev));
  });

  nextBtns.forEach((btn) => {
    const onNext = () => viewerOpen && openViewer(activeIndex + 1);
    btn.addEventListener("click", onNext);
    cleanups.push(() => btn.removeEventListener("click", onNext));
  });

  viewerCloseBtns.forEach((btn) => {
    btn.addEventListener("click", closeViewer);
    cleanups.push(() => btn.removeEventListener("click", closeViewer));
  });

  const onMenuToggle = (event) => {
    if (!viewerOpen || !event.target.closest("[data-menu-toggle]")) return;
    event.preventDefault();
    event.stopPropagation();
    closeViewer();
  };
  document.addEventListener("click", onMenuToggle, true);
  cleanups.push(() => document.removeEventListener("click", onMenuToggle, true));

  const onKey = (event) => {
    if (event.key === "Escape" && viewerOpen) {
      event.preventDefault();
      closeViewer();
      return;
    }
    if (!viewerOpen) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      openViewer(activeIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      openViewer(activeIndex + 1);
    }
  };

  window.addEventListener("keydown", onKey);
  cleanups.push(() => window.removeEventListener("keydown", onKey));

  layoutPieces();

  return () => {
    disposed = true;
    if (filterTl) {
      filterTl.kill();
      filterTl = null;
    }
    gsap.killTweensOf(cards);
    clearCardMotion(cards);
    mosaic?.classList.remove("is-swapping");
    document.body.classList.remove("is-archive-viewer");
    if (viewer) gsap.killTweensOf(viewer);
    cleanups.forEach((fn) => fn());
  };
}
