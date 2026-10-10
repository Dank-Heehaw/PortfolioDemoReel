import gsap from "gsap";

// Pointer-follow "External site" pill — liquid orange seed morphs into yellow label.

/** Resting pill nudge (px) — left edge anchored at cursor; pill grows to the right. */
export const EXTERNAL_TIP_REST_X = 14;

export const EXTERNAL_SITE_TIP_LABEL = "External site";

export const EXTERNAL_SITE_TIP_CLASSES = {
  floater: "archive-card__external-floater",
  seed: "archive-card__external-seed",
  tip: "archive-card__external-tip",
  label: "archive-card__external-tip-label",
};

export const EXTERNAL_SITE_TIP_MARKUP = `<span class="${EXTERNAL_SITE_TIP_CLASSES.seed}"></span><span class="${EXTERNAL_SITE_TIP_CLASSES.tip}"><span class="${EXTERNAL_SITE_TIP_CLASSES.label}">${EXTERNAL_SITE_TIP_LABEL}</span></span>`;

const LIQUID_BLOB = 22;
const GOO_FILTER_ID = "cursor-liquid-goo";
const TIP_YELLOW = "#ffe600";
const TIP_INK = "#0a0a0a";
const TIP_ORANGE = "#ef6223";
const REST_RADIUS = "999px";

function prefersReduce() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function placeAtCursor(el, x, y) {
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
}

function blobScales(el, blob = LIQUID_BLOB) {
  const width = Math.max(el.offsetWidth, 1);
  const height = Math.max(el.offsetHeight, 1);
  return { scaleX: blob / width, scaleY: blob / height };
}

function ensureGooFilter() {
  if (document.getElementById(GOO_FILTER_ID)) return;
  const wrap = document.createElement("div");
  wrap.className = "cursor-liquid-svg";
  wrap.setAttribute("aria-hidden", "true");
  wrap.innerHTML = `<svg width="0" height="0">
    <filter id="${GOO_FILTER_ID}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur"/>
      <feColorMatrix in="blur" mode="matrix"
        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo"/>
      <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
    </filter>
  </svg>`;
  document.body.appendChild(wrap);
}

function setGoo(el, on) {
  el.classList.toggle("is-liquid", Boolean(on));
}

function externalLinkFrom(target) {
  return target?.closest?.(".archive-card--external .archive-card__link") ?? null;
}

/** Body-mounted floater so GSAP transforms can't trap the pill. Returns unbind fn. */
export function bindExternalTips(root = document) {
  ensureGooFilter();

  const floater = document.createElement("div");
  floater.className = EXTERNAL_SITE_TIP_CLASSES.floater;
  floater.setAttribute("aria-hidden", "true");
  floater.innerHTML = EXTERNAL_SITE_TIP_MARKUP;
  document.body.appendChild(floater);

  const seed = floater.querySelector(`.${EXTERNAL_SITE_TIP_CLASSES.seed}`);
  const tip = floater.querySelector(`.${EXTERNAL_SITE_TIP_CLASSES.tip}`);
  const label = floater.querySelector(`.${EXTERNAL_SITE_TIP_CLASSES.label}`);

  let open = false;
  let gen = 0;

  gsap.set(floater, { autoAlpha: 0 });
  gsap.set(tip, {
    x: EXTERNAL_TIP_REST_X,
    yPercent: -50,
    transformOrigin: "0% 50%",
    backgroundColor: TIP_YELLOW,
    color: TIP_INK,
    borderRadius: REST_RADIUS,
  });
  gsap.set(seed, {
    scale: 0,
    xPercent: -50,
    yPercent: -50,
    transformOrigin: "50% 50%",
    backgroundColor: TIP_ORANGE,
  });
  gsap.set(label, { autoAlpha: 0 });

  const follow = (x, y) => placeAtCursor(floater, x, y);

  const showAt = (x, y) => {
    follow(x, y);
    if (open) return;
    open = true;
    const id = ++gen;
    const reduce = prefersReduce();

    gsap.killTweensOf([floater, tip, seed, label]);
    gsap.set(floater, { autoAlpha: 1 });

    if (reduce) {
      setGoo(floater, false);
      gsap.set(tip, {
        x: EXTERNAL_TIP_REST_X,
        yPercent: -50,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        borderRadius: REST_RADIUS,
        backgroundColor: TIP_YELLOW,
        color: TIP_INK,
        autoAlpha: 1,
      });
      gsap.set(seed, { scale: 0, autoAlpha: 0 });
      gsap.set(label, { autoAlpha: 1 });
      return;
    }

    const { scaleX, scaleY } = blobScales(tip);
    setGoo(floater, true);
    gsap.set(tip, {
      x: 0,
      yPercent: -50,
      scaleX,
      scaleY,
      rotation: -8,
      borderRadius: "50%",
      autoAlpha: 1,
      backgroundColor: TIP_ORANGE,
      color: TIP_ORANGE,
    });
    gsap.set(seed, {
      scale: 1,
      xPercent: -50,
      yPercent: -50,
      autoAlpha: 1,
      backgroundColor: TIP_ORANGE,
    });
    gsap.set(label, { autoAlpha: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        if (id !== gen) return;
        setGoo(floater, false);
      },
    });

    // Orange pop at cursor — hold full seed, slight overshoot, then dissolve as pill slides right.
    tl.to(seed, { scale: 1.18, duration: 0.14, ease: "back.out(2.4)" }, 0);
    tl.to(
      tip,
      {
        x: EXTERNAL_TIP_REST_X,
        scaleX: 1.06,
        scaleY: 0.94,
        rotation: 2,
        borderRadius: "999px",
        duration: 0.34,
        ease: "power3.out",
      },
      0
    );
    tl.to(seed, { scale: 1, autoAlpha: 1, duration: 0.12, ease: "power1.out" }, 0.1);
    tl.to(seed, { scale: 0, autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0.26);
    tl.add(() => {
      if (id !== gen) return;
      setGoo(floater, false);
    }, 0.3);
    tl.to(
      tip,
      {
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        borderRadius: REST_RADIUS,
        backgroundColor: TIP_YELLOW,
        color: TIP_INK,
        duration: 0.22,
        ease: "back.out(1.7)",
      },
      0.3
    );
    tl.to(label, { autoAlpha: 1, duration: 0.14, ease: "power1.out" }, 0.32);
  };

  const hide = () => {
    if (!open) return;
    open = false;
    const id = ++gen;
    const reduce = prefersReduce();

    gsap.killTweensOf([floater, tip, seed, label]);

    if (reduce) {
      setGoo(floater, false);
      gsap.set(floater, { autoAlpha: 0 });
      gsap.set(label, { autoAlpha: 0 });
      gsap.set(seed, { scale: 0, autoAlpha: 0 });
      return;
    }

    const { scaleX, scaleY } = blobScales(tip);
    setGoo(floater, true);

    const tl = gsap.timeline({
      onComplete: () => {
        if (id !== gen) return;
        setGoo(floater, false);
        gsap.set(floater, { autoAlpha: 0 });
      },
    });

    tl.to(label, { autoAlpha: 0, duration: 0.08, ease: "power1.in" }, 0);
    tl.to(
      tip,
      {
        backgroundColor: TIP_ORANGE,
        color: TIP_ORANGE,
        duration: 0.1,
        ease: "power1.in",
      },
      0
    );
    // Orange pop back at cursor before pill collapses inward.
    tl.to(
      seed,
      {
        scale: 1.2,
        xPercent: -50,
        yPercent: -50,
        autoAlpha: 1,
        backgroundColor: TIP_ORANGE,
        duration: 0.18,
        ease: "back.out(2.2)",
      },
      0.02
    );
    tl.to(
      tip,
      {
        x: 0,
        yPercent: -50,
        scaleX,
        scaleY,
        rotation: -6,
        borderRadius: "50%",
        duration: 0.28,
        ease: "power3.in",
      },
      0.08
    );
    tl.to(seed, { scale: 0, autoAlpha: 0, duration: 0.14, ease: "power2.in" }, 0.3);
  };

  const onPointerMove = (event) => {
    follow(event.clientX, event.clientY);
    const link = externalLinkFrom(event.target);
    if (!link) {
      hide();
      return;
    }
    showAt(event.clientX, event.clientY);
  };

  const onPointerOver = (event) => {
    const link = externalLinkFrom(event.target);
    if (!link || link.contains(event.relatedTarget)) return;
    showAt(event.clientX, event.clientY);
  };

  const onPointerOut = (event) => {
    const link = externalLinkFrom(event.target);
    if (!link || link.contains(event.relatedTarget)) return;
    hide();
  };

  const onFocusIn = (event) => {
    const link = externalLinkFrom(event.target);
    if (!link || event.target !== link) return;
    const rect = link.getBoundingClientRect();
    showAt(rect.left + rect.width / 2, rect.top + 12);
  };

  const onFocusOut = (event) => {
    const link = externalLinkFrom(event.target);
    if (!link || link.contains(event.relatedTarget)) return;
    hide();
  };

  root.addEventListener("pointermove", onPointerMove, { passive: true });
  root.addEventListener("pointerover", onPointerOver, { passive: true });
  root.addEventListener("pointerout", onPointerOut, { passive: true });
  root.addEventListener("focusin", onFocusIn);
  root.addEventListener("focusout", onFocusOut);

  return () => {
    gen += 1;
    root.removeEventListener("pointermove", onPointerMove);
    root.removeEventListener("pointerover", onPointerOver);
    root.removeEventListener("pointerout", onPointerOut);
    root.removeEventListener("focusin", onFocusIn);
    root.removeEventListener("focusout", onFocusOut);
    gsap.killTweensOf([floater, tip, seed, label]);
    floater.remove();
    document.querySelector(".cursor-liquid-svg")?.remove();
  };
}
