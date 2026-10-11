/**
 * Archive page interactions.
 *
 * - Category filters (ART / 3D / Graphics / UX)
 * - Grid mode: CSS masonry with natural image proportions
 * - Fill mode: canvas field you pan on X and scroll on Z
 * - Sliding pill on the Grid/Fill switch + lightbox viewer
 */
import gsap from "gsap";

export function revealArchive(panel, { delay = 0 } = {}) {
  if (!panel) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = panel.querySelectorAll("[data-archive-reveal]");
  const cards = panel.querySelectorAll("[data-archive-card]");

  // Keep cards painted. Nested autoAlpha on the grid + cards can stick at
  // visibility:hidden when a later overwrite kills the reveal tween.
  if (cards.length) gsap.set(cards, { autoAlpha: 1, clearProps: "visibility" });

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
        stagger: 0.07,
        ease: "power4.out",
        overwrite: "auto",
      }
    );
  }

  if (cards.length) {
    gsap.fromTo(
      cards,
      { y: 18 },
      {
        y: 0,
        duration: 0.65,
        delay: delay + 0.15,
        stagger: 0.035,
        ease: "power3.out",
        overwrite: "auto",
      }
    );
  }
}

export function bindArchivePage(root = document) {
  const page = root.querySelector(".site-page--past");
  if (!page) return () => {};

  const masonry = page.querySelector("[data-archive-masonry]");
  const field = page.querySelector("[data-archive-field]");
  const fieldCanvas = page.querySelector("[data-archive-field-canvas]");
  const filters = gsap.utils.toArray("[data-archive-filter]", page);
  const modeBtns = gsap.utils.toArray("[data-archive-mode]", page);
  const cards = gsap.utils.toArray("[data-archive-card]", masonry);
  const viewer = page.querySelector("[data-archive-viewer]");
  const viewerPhoto = viewer?.querySelector("[data-viewer-photo]");
  const viewerTitle = viewer?.querySelector("[data-viewer-title]");
  const viewerMeta = viewer?.querySelector("[data-viewer-meta]");
  const viewerIndex = viewer?.querySelector("[data-viewer-index]");
  const viewerCount = viewer?.querySelector("[data-viewer-count]");
  const viewerCloseBtns = gsap.utils.toArray("[data-viewer-close]", page);
  const prevBtns = gsap.utils.toArray("[data-archive-prev]", page);
  const nextBtns = gsap.utils.toArray("[data-archive-next]", page);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cleanups = [];

  if (!cards.length) {
    return () => {};
  }

  gsap.set(cards, { autoAlpha: 1, clearProps: "visibility" });

  let categoryFilter = "all";
  let activeMode = "grid";
  let activeIndex = 0;
  let viewerOpen = false;
  let filterTween = null;
  let rafId = 0;
  let fieldItems = [];
  let offsetX = 0;
  let offsetZ = 0;
  let dragStartDistance = 0;
  let draggingField = false;
  let fieldPointer = { id: null, x: 0, y: 0 };
  let fieldReady = false;
  let fieldBounds = { width: 1, height: 1, dpr: 1 };
  let fieldHitSlug = "";
  let fieldGeneration = 0;
  const MODE_STORAGE_KEY = "archive:mode";
  const FIELD_WORLD_WIDTH = 2600;
  const FIELD_WORLD_Y = 560;

  const cardMatches = (card) => categoryFilter === "all" || card.dataset.category === categoryFilter;
  const visibleCards = () => cards.filter((card) => cardMatches(card));
  const canUseField = () => window.innerWidth >= 720 && field && fieldCanvas;

  const syncPager = () => {
    const visible = visibleCards();
    const indexText = String(Math.min(activeIndex + 1, Math.max(visible.length, 1))).padStart(2, "0");
    const countText = String(Math.max(visible.length, 1)).padStart(2, "0");
    if (viewerIndex) viewerIndex.textContent = indexText;
    if (viewerCount) viewerCount.textContent = countText;
  };

  const setCardHidden = (card, hidden) => {
    card.toggleAttribute("hidden", hidden);
    card.classList.toggle("is-filtered-out", hidden);
  };

  const applyVisibilityInstant = () => {
    cards.forEach((card) => {
      setCardHidden(card, !cardMatches(card));
    });
    activeIndex = Math.min(activeIndex, Math.max(visibleCards().length - 1, 0));
    syncPager();
    syncFieldItems();
    if (viewerOpen) updateViewer(visibleCards()[activeIndex]);
  };

  const applyVisibility = ({ animate = true } = {}) => {
    if (reduce || !animate) {
      applyVisibilityInstant();
      return;
    }

    filterTween?.kill();

    const nextVisible = cards.filter((card) => cardMatches(card));
    const hiding = cards.filter((card) => !cardMatches(card) && !card.hasAttribute("hidden"));
    const showing = cards.filter((card) => cardMatches(card) && card.hasAttribute("hidden"));

    if (!hiding.length && !showing.length) {
      syncPager();
      syncFieldItems();
      return;
    }

    filterTween = gsap.timeline({
      defaults: { ease: "power2.inOut", overwrite: "auto" },
      onComplete: () => {
        activeIndex = Math.min(activeIndex, Math.max(visibleCards().length - 1, 0));
        syncPager();
        syncFieldItems();
        if (viewerOpen) updateViewer(visibleCards()[activeIndex]);
      },
    });

    if (hiding.length) {
      filterTween.to(hiding, {
        autoAlpha: 0,
        y: -8,
        duration: 0.22,
        stagger: 0.015,
        onComplete: () => {
          hiding.forEach((card) => setCardHidden(card, true));
          gsap.set(hiding, { clearProps: "transform" });
        },
      });
    }

    if (showing.length) {
      showing.forEach((card) => {
        setCardHidden(card, false);
        gsap.set(card, { autoAlpha: 0, y: 14 });
      });
      filterTween.to(
        showing,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.38,
          stagger: 0.03,
          ease: "power3.out",
        },
        hiding.length ? ">-0.05" : 0
      );
    }

    if (!hiding.length && showing.length) {
      filterTween.add(() => {
        activeIndex = Math.min(activeIndex, Math.max(nextVisible.length - 1, 0));
        syncPager();
        syncFieldItems();
      });
    }
  };

  const cardImageSrc = (card) =>
    card?.querySelector("img")?.currentSrc ||
    card?.querySelector("img")?.src ||
    card?.dataset.src ||
    "";

  const updateViewer = (card) => {
    if (!card || !viewer) return;
    const src = cardImageSrc(card);
    const title = card.dataset.title || "";
    const medium = card.dataset.medium || card.dataset.category || "";
    if (viewerPhoto) {
      viewerPhoto.alt = title;
      viewerPhoto.src = src;
    }
    if (viewerTitle) viewerTitle.textContent = title;
    if (viewerMeta) {
      viewerMeta.textContent = [medium, card.dataset.year].filter(Boolean).join(" · ");
    }
  };

  const openViewer = (index = activeIndex) => {
    if (!viewer) return;
    const visible = visibleCards();
    if (!visible.length) return;

    activeIndex = ((index % visible.length) + visible.length) % visible.length;
    const card = visible[activeIndex];
    updateViewer(card);
    viewerOpen = true;
    viewer.hidden = false;
    document.body.classList.add("is-archive-viewer");
    if (!reduce) {
      gsap.fromTo(viewer, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power2.out" });
    } else {
      gsap.set(viewer, { autoAlpha: 1 });
    }
    syncPager();
  };

  const resizeField = () => {
    if (!fieldCanvas || !field) return;
    const rect = field.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    fieldBounds = {
      width: Math.max(1, Math.round(rect.width)),
      height: Math.max(1, Math.round(rect.height)),
      dpr,
    };
    fieldCanvas.width = Math.round(fieldBounds.width * dpr);
    fieldCanvas.height = Math.round(fieldBounds.height * dpr);
  };

  const readFieldMode = () => {
    try {
      const saved = sessionStorage.getItem(MODE_STORAGE_KEY);
      if (saved === "field" || saved === "grid") return saved;
    } catch {
      // session storage unavailable
    }
    return "grid";
  };

  const writeFieldMode = (mode) => {
    try {
      sessionStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch {
      // storage unavailable
    }
  };

  const resetFieldItemTransforms = () => {
    fieldItems = fieldItems.map((item) => ({
      ...item,
      rect: null,
    }));
  };

  const ensureFieldImages = () => {
    fieldItems.forEach((item) => {
      if (item.image) return;
      const image = new Image();
      image.decoding = "async";
      image.loading = "eager";
      image.src = item.src;
      item.image = image;
    });
  };

  function syncFieldItems() {
    const visible = visibleCards();
    const previousBySlug = new Map(fieldItems.map((item) => [item.slug, item]));
    fieldGeneration += 1;
    fieldItems = visible.map((card, index) => {
      const slug = card.dataset.slug || "";
      const carry = previousBySlug.get(slug);
      if (carry) {
        carry.idx = index;
        carry.generation = fieldGeneration;
        return carry;
      }
      const src = cardImageSrc(card);
      return {
        slug,
        idx: index,
        src,
        title: card.dataset.title || "",
        medium: card.dataset.medium || "",
        year: card.dataset.year || "",
        ratio: 0.76 + Math.random() * 0.64,
        baseW: 120 + Math.random() * 84,
        x: Math.random() * FIELD_WORLD_WIDTH - FIELD_WORLD_WIDTH * 0.5,
        y: Math.random() * FIELD_WORLD_Y - FIELD_WORLD_Y * 0.5,
        z: Math.random(),
        phase: Math.random() * Math.PI * 2,
        image: null,
        rect: null,
        generation: fieldGeneration,
      };
    });
    ensureFieldImages();
  }

  const renderField = (time = 0) => {
    if (!fieldCanvas || !field || activeMode !== "field") return;
    const ctx = fieldCanvas.getContext("2d");
    if (!ctx) return;

    const { width, height, dpr } = fieldBounds;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(5,5,5,0.72)";
    ctx.fillRect(0, 0, width, height);

    if (!fieldItems.length) {
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.font = '600 14px "Neue Haas Grotesk Display Pro", sans-serif';
      ctx.fillText("No studies in this category.", 20, 32);
      rafId = window.requestAnimationFrame(renderField);
      return;
    }

    const centerX = width * 0.5;
    const centerY = height * 0.52;
    const wrapX = gsap.utils.wrap(-FIELD_WORLD_WIDTH * 0.5, FIELD_WORLD_WIDTH * 0.5);
    const wrapZ = gsap.utils.wrap(0, 1);
    fieldHitSlug = "";
    const pointerX = fieldPointer.x;
    const pointerY = fieldPointer.y;

    const drawables = fieldItems
      .map((item) => {
        const depth = wrapZ(item.z + offsetZ * 0.00042);
        const xWorld = wrapX(item.x + offsetX);
        const drift = Math.sin(time * 0.00042 + item.phase) * (14 + depth * 18);
        const scale = 0.38 + depth * 1.08;
        const projectedX = centerX + xWorld * (0.29 + depth * 0.85);
        const projectedY = centerY + (item.y + drift) * (0.22 + depth * 0.52);
        const widthPx = item.baseW * scale;
        const heightPx = (item.baseW / item.ratio) * scale;
        const left = projectedX - widthPx * 0.5;
        const top = projectedY - heightPx * 0.5;
        return {
          item,
          depth,
          scale,
          alpha: 0.24 + depth * 0.76,
          left,
          top,
          width: widthPx,
          height: heightPx,
        };
      })
      .sort((a, b) => a.scale - b.scale);

    drawables.forEach((d) => {
      d.item.rect = d;
      if (
        pointerX >= d.left &&
        pointerX <= d.left + d.width &&
        pointerY >= d.top &&
        pointerY <= d.top + d.height
      ) {
        fieldHitSlug = d.item.slug;
      }

      const image = d.item.image;
      ctx.save();
      ctx.globalAlpha = d.alpha;
      if (image?.complete && image.naturalWidth > 0) {
        ctx.drawImage(image, d.left, d.top, d.width, d.height);
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillRect(d.left, d.top, d.width, d.height);
      }
      ctx.strokeStyle = "rgba(255,255,255,0.24)";
      ctx.lineWidth = 1;
      ctx.strokeRect(d.left, d.top, d.width, d.height);
      ctx.restore();
    });

    if (fieldHitSlug) {
      const hit = fieldItems.find((item) => item.slug === fieldHitSlug);
      const r = hit?.rect;
      if (r) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.78)";
        ctx.lineWidth = 2;
        ctx.strokeRect(r.left - 2, r.top - 2, r.width + 4, r.height + 4);
        ctx.restore();
      }
    }

    rafId = window.requestAnimationFrame(renderField);
  };

  const stopFieldRender = () => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const startFieldRender = () => {
    if (!canUseField()) return;
    if (!fieldReady) {
      resizeField();
      syncFieldItems();
      fieldReady = true;
    }
    stopFieldRender();
    rafId = window.requestAnimationFrame(renderField);
  };

  const modePill = page.querySelector("[data-archive-mode-pill]");

  /** Slide the white pill under the active Grid / Fill button. */
  const syncModePill = () => {
    if (!modePill || !modeBtns.length) return;
    const active = modeBtns.find((btn) => btn.classList.contains("is-active")) || modeBtns[0];
    if (!active) return;
    // offsetLeft/Width are relative to the switch track — no extra padding math needed
    modePill.style.width = `${active.offsetWidth}px`;
    modePill.style.transform = `translateX(${active.offsetLeft}px)`;
  };

  const setMode = (mode, { persist = true } = {}) => {
    const nextMode = mode === "field" && canUseField() ? "field" : "grid";
    activeMode = nextMode;
    page.dataset.archiveMode = nextMode;
    modeBtns.forEach((btn) => {
      const on = (btn.dataset.archiveMode || "grid") === nextMode;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", String(on));
    });
    syncModePill();
    if (masonry) {
      // Crossfade between masonry and field so the Grid/Fill switch feels smooth
      if (!reduce) {
        gsap.to(masonry, {
          autoAlpha: nextMode === "grid" ? 1 : 0,
          duration: 0.4,
          ease: "power2.out",
          onComplete: () => {
            masonry.hidden = nextMode !== "grid";
          },
        });
      } else {
        masonry.hidden = nextMode !== "grid";
      }
      masonry.classList.toggle("is-active", nextMode === "grid");
    }
    if (field) {
      if (nextMode === "field") field.hidden = false;
      if (!reduce) {
        gsap.fromTo(
          field,
          { autoAlpha: nextMode === "field" ? 0 : 1 },
          {
            autoAlpha: nextMode === "field" ? 1 : 0,
            duration: 0.45,
            ease: "power2.out",
            onComplete: () => {
              if (nextMode !== "field") field.hidden = true;
            },
          }
        );
      } else {
        field.hidden = nextMode !== "field";
      }
      field.classList.toggle("is-active", nextMode === "field");
    }
    if (nextMode === "field") startFieldRender();
    else stopFieldRender();
    if (persist) writeFieldMode(nextMode);
  };

  const syncModeAvailability = () => {
    const fieldAvailable = canUseField();
    modeBtns.forEach((btn) => {
      const mode = btn.dataset.archiveMode || "grid";
      const disabled = mode === "field" && !fieldAvailable;
      btn.disabled = disabled;
      btn.classList.toggle("is-disabled", disabled);
    });
  };

  const openViewerFromSlug = (slug = "") => {
    const visible = visibleCards();
    const idx = visible.findIndex((card) => card.dataset.slug === slug);
    if (idx >= 0) openViewer(idx);
  };

  const closeViewer = () => {
    if (!viewer || !viewerOpen) return;
    viewerOpen = false;
    document.body.classList.remove("is-archive-viewer");
    const finish = () => {
      viewer.hidden = true;
    };
    if (!reduce) {
      gsap.to(viewer, {
        autoAlpha: 0,
        duration: 0.28,
        ease: "power2.in",
        onComplete: finish,
      });
    } else {
      gsap.set(viewer, { autoAlpha: 0 });
      finish();
    }
  };

  const onPrev = () => {
    if (!viewerOpen) return;
    openViewer(activeIndex - 1);
  };

  const onNext = () => {
    if (!viewerOpen) return;
    openViewer(activeIndex + 1);
  };

  const applyCategoryFilter = (filter) => {
    categoryFilter = filter || "all";
    filters.forEach((btn) => {
      const on = btn.dataset.archiveFilter === categoryFilter;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", String(on));
    });
    applyVisibility();
  };

  filters.forEach((btn) => {
    const onClick = () => applyCategoryFilter(btn.dataset.archiveFilter || "all");
    btn.addEventListener("click", onClick);
    cleanups.push(() => btn.removeEventListener("click", onClick));
  });

  modeBtns.forEach((btn) => {
    const onClick = () => setMode(btn.dataset.archiveMode || "grid");
    btn.addEventListener("click", onClick);
    cleanups.push(() => btn.removeEventListener("click", onClick));
  });

  cards.forEach((card) => {
    const onClick = () => {
      const visible = visibleCards();
      const next = visible.findIndex((c) => c.dataset.slug === card.dataset.slug);
      if (next < 0) return;
      openViewer(next);
    };

    const onEnter = () => {
      if (reduce || card.hasAttribute("hidden")) return;
      gsap.to(card, { y: -3, duration: 0.35, ease: "power2.out", overwrite: "auto" });
    };

    const onLeave = () => {
      if (reduce || card.hasAttribute("hidden")) return;
      gsap.to(card, { y: 0, duration: 0.4, ease: "power2.out", overwrite: "auto" });
    };

    card.addEventListener("click", onClick);
    card.addEventListener("mouseenter", onEnter);
    card.addEventListener("mouseleave", onLeave);
    cleanups.push(() => {
      card.removeEventListener("click", onClick);
      card.removeEventListener("mouseenter", onEnter);
      card.removeEventListener("mouseleave", onLeave);
    });
  });

  prevBtns.forEach((btn) => {
    btn.addEventListener("click", onPrev);
    cleanups.push(() => btn.removeEventListener("click", onPrev));
  });
  nextBtns.forEach((btn) => {
    btn.addEventListener("click", onNext);
    cleanups.push(() => btn.removeEventListener("click", onNext));
  });

  viewerCloseBtns.forEach((btn) => {
    btn.addEventListener("click", closeViewer);
    cleanups.push(() => btn.removeEventListener("click", closeViewer));
  });

  const onFieldPointerDown = (event) => {
    if (activeMode !== "field" || !fieldCanvas) return;
    draggingField = true;
    dragStartDistance = 0;
    fieldPointer.id = event.pointerId;
    fieldPointer.x = event.offsetX;
    fieldPointer.y = event.offsetY;
    fieldCanvas.setPointerCapture(event.pointerId);
  };

  const onFieldPointerMove = (event) => {
    if (!fieldCanvas) return;
    const prevX = fieldPointer.x;
    const prevY = fieldPointer.y;
    if (event.target === fieldCanvas) {
      fieldPointer.x = event.offsetX;
      fieldPointer.y = event.offsetY;
    }
    if (!draggingField || fieldPointer.id !== event.pointerId) return;
    const dx = event.movementX || event.offsetX - prevX;
    const dy = event.movementY || event.offsetY - prevY;
    dragStartDistance += Math.abs(dx) + Math.abs(dy);
    offsetX += dx * 2.2;
    offsetZ += dy * 4.4;
    fieldPointer.x = event.offsetX;
    fieldPointer.y = event.offsetY;
  };

  const onFieldPointerUp = (event) => {
    if (!fieldCanvas || fieldPointer.id !== event.pointerId) return;
    if (fieldCanvas.hasPointerCapture(event.pointerId)) {
      fieldCanvas.releasePointerCapture(event.pointerId);
    }
    draggingField = false;
    fieldPointer.id = null;
    if (dragStartDistance <= 8 && fieldHitSlug) {
      openViewerFromSlug(fieldHitSlug);
    }
  };

  const onFieldWheel = (event) => {
    if (activeMode !== "field") return;
    event.preventDefault();
    offsetX += event.deltaX * 0.88;
    offsetZ += event.deltaY * 1.04;
  };

  const onResize = () => {
    syncModeAvailability();
    syncModePill();
    if (activeMode === "field") {
      if (!canUseField()) {
        setMode("grid");
      } else {
        resizeField();
        resetFieldItemTransforms();
      }
    }
  };

  if (fieldCanvas) {
    fieldCanvas.addEventListener("pointerdown", onFieldPointerDown);
    fieldCanvas.addEventListener("pointermove", onFieldPointerMove);
    fieldCanvas.addEventListener("pointerup", onFieldPointerUp);
    fieldCanvas.addEventListener("pointercancel", onFieldPointerUp);
    fieldCanvas.addEventListener("wheel", onFieldWheel, { passive: false });
    cleanups.push(() => {
      fieldCanvas.removeEventListener("pointerdown", onFieldPointerDown);
      fieldCanvas.removeEventListener("pointermove", onFieldPointerMove);
      fieldCanvas.removeEventListener("pointerup", onFieldPointerUp);
      fieldCanvas.removeEventListener("pointercancel", onFieldPointerUp);
      fieldCanvas.removeEventListener("wheel", onFieldWheel);
    });
  }

  window.addEventListener("resize", onResize);
  cleanups.push(() => window.removeEventListener("resize", onResize));

  const onKey = (event) => {
    if (event.key === "Escape" && viewerOpen) {
      event.preventDefault();
      closeViewer();
      return;
    }
    if (!viewerOpen) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      onNext();
    }
  };
  window.addEventListener("keydown", onKey);
  cleanups.push(() => window.removeEventListener("keydown", onKey));

  syncFieldItems();
  syncModeAvailability();
  applyCategoryFilter("all");
  applyVisibility({ animate: false });
  setMode(readFieldMode(), { persist: false });
  // Measure pill after layout paints so Grid/Fill indicator starts in the right place
  requestAnimationFrame(syncModePill);

  return () => {
    filterTween?.kill();
    stopFieldRender();
    cleanups.forEach((fn) => fn());
    document.body.classList.remove("is-archive-viewer");
    gsap.killTweensOf([viewer, ...cards]);
  };
}
