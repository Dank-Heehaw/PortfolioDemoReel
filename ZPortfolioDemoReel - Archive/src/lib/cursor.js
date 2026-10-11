import gsap from "gsap";
export { bindExternalTips } from "../components/ExternalSiteTip.js";

/**
 * Pointer UI helpers.
 * - bindJournalLinkPreview: cover thumbnail that follows the pointer on journal
 *   "Also in journal" rows, MORE WORK rows, and work-page project titles
 *   (`[data-journal-preview-link][data-preview-image]`)
 * - bindCursor: desktop ring cursor (no white plus — expands + orange tint on hover)
 */

const JOURNAL_PREVIEW_OFFSET_X = 18;
const JOURNAL_PREVIEW_OFFSET_Y = 14;

function prefersReduce() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Pointer-follow cover preview for "Also in journal" links. */
export function bindJournalLinkPreview(root = document) {
  const preview = document.createElement("figure");
  preview.className = "archive-article__link-preview";
  preview.setAttribute("aria-hidden", "true");
  preview.innerHTML = '<img src="" alt="" loading="eager" decoding="async" />';
  const image = preview.querySelector("img");
  document.body.appendChild(preview);

  let activeLink = null;
  let open = false;
  let gen = 0;
  let hasPointerPosition = false;
  let pointerX = 0;
  let pointerY = 0;
  const PREVIEW_REST_SCALE = 0.84;
  const previewMotionProps = "scale,opacity,autoAlpha,visibility,borderRadius";

  gsap.set(preview, {
    autoAlpha: 0,
    scale: PREVIEW_REST_SCALE,
    transformOrigin: "0% 0%",
  });

  const moveX = prefersReduce()
    ? null
    : gsap.quickTo(preview, "x", { duration: 0.45, ease: "power3.out" });
  const moveY = prefersReduce()
    ? null
    : gsap.quickTo(preview, "y", { duration: 0.45, ease: "power3.out" });

  const relatedLinkFrom = (target) => target?.closest?.("[data-journal-preview-link]") ?? null;

  const placePreview = (x, y) => {
    const targetX = x + JOURNAL_PREVIEW_OFFSET_X;
    const targetY = y + JOURNAL_PREVIEW_OFFSET_Y;
    if (prefersReduce()) {
      gsap.set(preview, { x: targetX, y: targetY });
      return;
    }
    moveX(targetX);
    moveY(targetY);
  };

  const follow = (x, y) => {
    pointerX = x;
    pointerY = y;
    hasPointerPosition = true;
    placePreview(x, y);
  };

  const playIn = () => {
    if (open) return;
    open = true;
    const id = ++gen;
    gsap.killTweensOf(preview, previewMotionProps);

    if (prefersReduce()) {
      gsap.set(preview, { autoAlpha: 1, scale: 1 });
      return;
    }

    gsap.fromTo(
      preview,
      { autoAlpha: 0, scale: 0.22, borderRadius: "50%" },
      {
        autoAlpha: 1,
        scale: 1,
        borderRadius: "1.15rem",
        duration: 0.58,
        ease: "back.out(1.35)",
        overwrite: "auto",
      }
    );
  };

  const playOut = () => {
    if (!open) return;
    open = false;
    const id = ++gen;
    gsap.killTweensOf(preview, previewMotionProps);

    if (prefersReduce()) {
      gsap.set(preview, { autoAlpha: 0, scale: 1 });
      return;
    }

    gsap.to(preview, {
      autoAlpha: 0,
      scale: 0.22,
      borderRadius: "50%",
      duration: 0.32,
      ease: "power3.in",
      overwrite: "auto",
      onComplete: () => {
        if (id !== gen) return;
        gsap.set(preview, { scale: PREVIEW_REST_SCALE, borderRadius: "1.15rem" });
      },
    });
  };

  const showForLink = (link, x, y) => {
    if (!link || !image) return;
    const src = link.getAttribute("data-preview-image");
    if (!src) return;
    if (image.getAttribute("src") !== src) {
      image.setAttribute("src", src);
    }
    follow(x, y);
    playIn();
  };

  const showAtLink = (link) => {
    const rect = link.getBoundingClientRect();
    showForLink(link, rect.right, rect.top + rect.height * 0.35);
  };

  const hide = () => {
    activeLink = null;
    playOut();
  };

  const onPointerMove = (event) => {
    follow(event.clientX, event.clientY);
    if (activeLink) showForLink(activeLink, pointerX, pointerY);
  };

  const onPointerOver = (event) => {
    const link = relatedLinkFrom(event.target);
    if (!link || link.contains(event.relatedTarget)) return;
    activeLink = link;
    if (hasPointerPosition) showForLink(link, pointerX, pointerY);
    else showAtLink(link);
  };

  const onPointerOut = (event) => {
    const link = relatedLinkFrom(event.target);
    if (!link || link.contains(event.relatedTarget)) return;
    hide();
  };

  const onFocusIn = (event) => {
    const link = relatedLinkFrom(event.target);
    if (!link || event.target !== link) return;
    activeLink = link;
    if (hasPointerPosition) showForLink(link, pointerX, pointerY);
    else showAtLink(link);
  };

  const onFocusOut = (event) => {
    const link = relatedLinkFrom(event.target);
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
    gsap.killTweensOf(preview);
    preview.remove();
  };
}

/**
 * Custom ring cursor for fine pointers.
 * Resting state = small ink ring (no plus). Hover = larger ring + optional orange cross.
 * Skipped on touch / reduced-motion.
 */
export function bindCursor() {
  if (window.matchMedia("(pointer: coarse)").matches) return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const root = document.createElement("div");
  root.className = "site-cursor";
  root.innerHTML = '<span class="site-cursor__ring" aria-hidden="true"></span>';
  document.body.appendChild(root);
  document.documentElement.classList.add("has-custom-cursor");

  const move = (event) => {
    root.style.left = `${event.clientX}px`;
    root.style.top = `${event.clientY}px`;
  };

  const onOver = (event) => {
    const hit = event.target.closest(
      "a, button, [data-menu-toggle], [data-menu-close], [data-nav], [data-menu-work], [data-work-cat]"
    );
    root.classList.toggle("is-hover", Boolean(hit));
  };

  const onDown = () => root.classList.add("is-down");
  const onUp = () => root.classList.remove("is-down");

  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("mouseover", onOver, { passive: true });
  window.addEventListener("mousedown", onDown);
  window.addEventListener("mouseup", onUp);

  return () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("mouseover", onOver);
    window.removeEventListener("mousedown", onDown);
    window.removeEventListener("mouseup", onUp);
    document.documentElement.classList.remove("has-custom-cursor");
    root.remove();
  };
}
