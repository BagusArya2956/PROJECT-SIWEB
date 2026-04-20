"use client";

import { useEffect } from "react";

export function ScrollReveal() {
  useEffect(() => {
    document.body.classList.add("reveal-ready");

    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal-on-scroll")
    );

    if (!("IntersectionObserver" in window)) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return () => {
        document.body.classList.remove("reveal-ready");
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          const repeat = element.dataset.revealRepeat === "true";

          if (entry.isIntersecting) {
            element.classList.add("is-visible");

            if (!repeat) {
              observer.unobserve(element);
            }
          } else if (repeat) {
            element.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      document.body.classList.remove("reveal-ready");
    };
  }, []);

  return null;
}
