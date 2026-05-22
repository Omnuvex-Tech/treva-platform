"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    gsap?: any;
    ScrollTrigger?: any;
    ScrollSmoother?: any;
  }
}

type SmoothScrollRootProps = {
  children: ReactNode;
};

export function SmoothScrollRoot({ children }: SmoothScrollRootProps) {
  const baseReady = useRef(false);
  const smootherReady = useRef(false);
  const pathname = usePathname();

  const shouldSmooth = () => {
    if (typeof window === "undefined") return false;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const noSmooth = window.location.pathname.includes("/treva-live");
    return !isMobile && !noSmooth;
  };

  const initBase = () => {
    if (baseReady.current) return;
    if (typeof window === "undefined") return;
    if (!window.gsap || !window.ScrollTrigger) return;

    const { gsap, ScrollTrigger } = window;
    if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    gsap.to("body", { autoAlpha: 1, duration: 0.3 });
    baseReady.current = true;
  };

  const ensureSmoother = () => {
    if (typeof window === "undefined") return;
    if (!window.ScrollSmoother) return;

    const { ScrollSmoother } = window;
    const existing = ScrollSmoother.get?.();

    if (!shouldSmooth()) {
      existing?.kill?.();
      smootherReady.current = false;
      return;
    }

    if (!existing && !smootherReady.current) {
      ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.6,
        effects: true,
      });
      smootherReady.current = true;
    }

    const smoother = ScrollSmoother.get?.();
    if (!smoother) return;

    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const target = document.querySelector(hash);
        if (target) smoother.scrollTo(target, true);
      }, 500);
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", () => {
        document.documentElement.classList.add("disable-smooth-scroll");
        setTimeout(() => document.documentElement.classList.remove("disable-smooth-scroll"), 100);
      });
    });
  };

  useEffect(() => {
    const onReady = () => {
      initBase();
      ensureSmoother();
    };

    if (window.gsap && window.ScrollTrigger) onReady();
    window.addEventListener("gsap-ready", onReady);
    return () => window.removeEventListener("gsap-ready", onReady);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    initBase();
    ensureSmoother();
    window.ScrollTrigger?.refresh?.();
    window.ScrollSmoother?.get?.()?.refresh?.();
  }, [pathname]);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.gsap && window.ScrollTrigger) window.dispatchEvent(new Event("gsap-ready"));
        }}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"
        strategy="afterInteractive"
        onLoad={() => window.dispatchEvent(new Event("gsap-ready"))}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollSmoother.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          setTimeout(() => {
            initBase();
            ensureSmoother();
          }, 100);
        }}
      />

      <div id="smooth-wrapper" className="smooth-wrapper">
        <div id="smooth-content">{children}</div>
      </div>
    </>
  );
}
