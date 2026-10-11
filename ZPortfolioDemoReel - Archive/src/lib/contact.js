import gsap from "gsap";

export const CONTACT_EMAIL = "awk.sowdagar@outlook.com";

export function revealContact(panel, { delay = 0 } = {}) {
  if (!panel) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = panel.querySelectorAll("[data-contact-reveal]");
  if (!items.length) return;

  if (reduce) {
    gsap.set(items, { autoAlpha: 1, y: 0 });
    return;
  }

  gsap.fromTo(
    items,
    { autoAlpha: 0, y: 48 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 1,
      delay,
      stagger: 0.1,
      ease: "power4.out",
      overwrite: "auto",
    }
  );

  const display = panel.querySelector(".contact-stage__display");
  if (display) {
    gsap.fromTo(
      display,
      { scale: 0.96 },
      { scale: 1, duration: 1.15, delay, ease: "power3.out" }
    );
  }
}

export function bindContactPage(root = document) {
  const page = root.querySelector(".site-page--contact");
  if (!page) return () => {};

  const bg = page.querySelector("[data-contact-bg]");
  const stage = page.querySelector("[data-contact-tilt]");
  const flower = page.querySelector("[data-contact-drag]");
  const orbs = bg ? gsap.utils.toArray(".contact-bg__orb", bg) : [];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cleanups = [];

  let targetX = 0.5;
  let targetY = 0.5;
  let currentX = 0.5;
  let currentY = 0.5;
  let raf = 0;

  const onMove = (event) => {
    targetX = event.clientX / window.innerWidth;
    targetY = event.clientY / window.innerHeight;
  };

  const tick = () => {
    currentX += (targetX - currentX) * 0.055;
    currentY += (targetY - currentY) * 0.055;

    if (bg) {
      bg.style.setProperty("--contact-x", currentX.toFixed(4));
      bg.style.setProperty("--contact-y", currentY.toFixed(4));
    }

    orbs.forEach((orb, index) => {
      const ox = currentX + (index - 1) * 0.08;
      const oy = currentY + (index - 1) * 0.06;
      orb.style.transform = `translate3d(calc(${ox * 100}% - 50%), calc(${oy * 100}% - 50%), 0)`;
    });

    if (stage && !reduce) {
      const tiltY = (currentX - 0.5) * 10;
      const tiltX = (0.5 - currentY) * 8;
      stage.style.transform = `perspective(900px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
    }

    raf = requestAnimationFrame(tick);
  };

  if (!reduce && bg) {
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    cleanups.push(() => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      if (stage) stage.style.transform = "";
    });
  }

  if (flower) {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let baseX = 0;
    let baseY = 0;
    let pointerId = null;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const onPointerDown = (event) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      event.preventDefault();
      dragging = true;
      pointerId = event.pointerId;
      flower.classList.add("is-dragging");
      flower.setPointerCapture?.(event.pointerId);
      startX = event.clientX;
      startY = event.clientY;
      const transform = gsap.getProperty(flower, "x");
      const transformY = gsap.getProperty(flower, "y");
      baseX = Number(transform) || 0;
      baseY = Number(transformY) || 0;
      gsap.killTweensOf(flower);
    };

    const onPointerMove = (event) => {
      if (!dragging || event.pointerId !== pointerId) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      const nextX = clamp(baseX + dx, -120, 120);
      const nextY = clamp(baseY + dy, -80, 80);
      gsap.set(flower, { x: nextX, y: nextY, rotation: nextX * 0.15 });
    };

    const onPointerUp = (event) => {
      if (!dragging || event.pointerId !== pointerId) return;
      dragging = false;
      pointerId = null;
      flower.classList.remove("is-dragging");
      try {
        flower.releasePointerCapture?.(event.pointerId);
      } catch {
        // ignore
      }
      gsap.to(flower, {
        x: 0,
        y: 0,
        rotation: 0,
        duration: reduce ? 0 : 0.7,
        ease: "elastic.out(1, 0.55)",
      });
    };

    flower.addEventListener("pointerdown", onPointerDown);
    flower.addEventListener("pointermove", onPointerMove);
    flower.addEventListener("pointerup", onPointerUp);
    flower.addEventListener("pointercancel", onPointerUp);
    cleanups.push(() => {
      flower.removeEventListener("pointerdown", onPointerDown);
      flower.removeEventListener("pointermove", onPointerMove);
      flower.removeEventListener("pointerup", onPointerUp);
      flower.removeEventListener("pointercancel", onPointerUp);
      gsap.killTweensOf(flower);
      gsap.set(flower, { clearProps: "x,y,rotation" });
    });
  }

  page.querySelectorAll(".contact-stage__link, .contact-stage__btn").forEach((link) => {
    if (reduce) return;

    const onEnter = () => gsap.to(link, { y: -2, duration: 0.25, ease: "power2.out" });
    const onLeave = () => gsap.to(link, { y: 0, duration: 0.3, ease: "power2.out" });

    link.addEventListener("mouseenter", onEnter);
    link.addEventListener("mouseleave", onLeave);
    cleanups.push(() => {
      link.removeEventListener("mouseenter", onEnter);
      link.removeEventListener("mouseleave", onLeave);
    });
  });

  return () => {
    cleanups.forEach((fn) => fn());
    gsap.killTweensOf(page.querySelectorAll(".contact-stage__link, .contact-stage__btn, [data-contact-drag]"));
  };
}
