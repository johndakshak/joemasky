"use client";

import { useEffect } from "react";

/**
 * Progressive-enhancement scroll reveal.
 *
 * How it works:
 *  1. On mount, check that IntersectionObserver is available.
 *  2. Add .reveal-ready to <html>. CSS switches .reveal elements to their
 *     hidden initial state only once this class is present, so content is
 *     always visible when JS or IO is absent.
 *  3. Observe every .reveal element present now AND any that appear later
 *     (e.g. product cards that render after an async data fetch). A
 *     MutationObserver watches the document for new .reveal nodes being
 *     inserted and passes them to the IntersectionObserver immediately.
 *  4. Add .is-visible when an element enters the viewport; that CSS
 *     transition then fades/slides it in.
 *
 * Call once from a top-level layout or page component.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("IntersectionObserver" in window)) return;

    const root = document.documentElement;
    root.classList.add("reveal-ready");

    // IntersectionObserver — reveals elements when they enter the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            // Unobserve once revealed — no need to keep watching.
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );

    /**
     * Observe a single element. Skip elements that are already visible so
     * re-entrant calls (from the MutationObserver below) are idempotent.
     */
    function observeEl(el: Element) {
      if (!el.classList.contains("is-visible")) {
        io.observe(el);
      }
    }

    // Observe all .reveal elements already in the DOM at mount time.
    document.querySelectorAll(".reveal").forEach(observeEl);

    // MutationObserver — watches for new .reveal elements added after mount
    // (e.g. product cards that arrive after an async API fetch completes).
    const mo = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          // The added node itself might be .reveal.
          if (node.classList.contains("reveal")) {
            observeEl(node);
          }
          // Or it might contain .reveal descendants.
          node.querySelectorAll(".reveal").forEach(observeEl);
        });
      });
    });

    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);
}
