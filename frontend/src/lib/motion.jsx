import { useEffect, useState } from "react";

// Small animation helpers. All respect the "reduce motion" OS setting; the
// CSS in index.css also shortens animations for those users.

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

// Counts from 0 up to `target` (ease-out), e.g. for the match score.
export function useCountUp(target, duration = 1100) {
  const [value, setValue] = useState(prefersReducedMotion() ? target : 0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target);
      return undefined;
    }

    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

// Fades in every element marked data-reveal the first time it scrolls into
// view. Optional data-reveal-delay="120" staggers items (ms). Call once per page.
export function useRevealOnScroll() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));
    const show = (el) => {
      el.style.animationDelay = `${el.dataset.revealDelay || 0}ms`;
      el.classList.add("animate-fade-up");
    };

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      elements.forEach(show);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// Inline style for staggered entrance animations: stagger(2) -> 160ms delay.
export function stagger(index, step = 80, base = 0) {
  return { animationDelay: `${base + index * step}ms` };
}
