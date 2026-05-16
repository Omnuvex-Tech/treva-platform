"use client";

import { useEffect, useRef } from "react";

const LOTTIE_SRC =
  "/cdn-assets/b0b1a6b1ee-6964a34eb3e93e5fd155045c_Dot-recording-light-red.json";
const LOTTIE_SCRIPT_ID = "lottie-web-cdn";
const LOTTIE_SCRIPT_SRC =
  "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js";

type LottieAnimation = { destroy: () => void };

type LottieGlobal = {
  loadAnimation: (options: {
    container: HTMLElement;
    renderer: string;
    loop: boolean;
    autoplay: boolean;
    path: string;
  }) => LottieAnimation;
};

function getLottie(): LottieGlobal | undefined {
  return (window as Window & { lottie?: LottieGlobal }).lottie;
}

export function FooterPulseLottie() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animation: LottieAnimation | undefined;
    let cancelled = false;

    const mountAnimation = () => {
      const lottie = getLottie();
      if (!lottie || cancelled) return;

      animation?.destroy();
      animation = lottie.loadAnimation({
        container,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: LOTTIE_SRC,
      });
    };

    const existingScript = document.getElementById(
      LOTTIE_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    const onReady = () => {
      if (!cancelled) mountAnimation();
    };

    if (getLottie()) {
      onReady();
    } else if (existingScript) {
      if (existingScript.dataset.loaded === "true" || getLottie()) {
        onReady();
      } else {
        existingScript.addEventListener("load", onReady, { once: true });
      }
    } else {
      const script = document.createElement("script");
      script.id = LOTTIE_SCRIPT_ID;
      script.src = LOTTIE_SCRIPT_SRC;
      script.async = true;
      script.onload = () => {
        script.dataset.loaded = "true";
        onReady();
      };
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
      animation?.destroy();
    };
  }, []);

  return (
    <div ref={containerRef} className="news_rec-lottie is-footer" aria-hidden="true" />
  );
}
