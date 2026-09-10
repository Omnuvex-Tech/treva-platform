"use client";

import { Handshake } from "lucide-react";

type Props = { label: string };

/**
 * Hero "Consultation" pill. Rather than routing to `/contact`, it scrolls the
 * visitor down to the callback banner (`.hv2-s-callback`) on the same page —
 * the same target and 96px header offset the project page's CTA uses.
 */
export default function ConsultationCta({ label }: Props) {
  const scrollToCallback = () => {
    if (typeof window === "undefined") return;
    const target = document.querySelector(".hv2-s-callback");
    if (!target) return;
    window.scrollTo({
      top: Math.max(target.getBoundingClientRect().top + window.scrollY - 96, 0),
      behavior: "smooth",
    });
  };

  return (
    <button type="button" onClick={scrollToCallback} className="hv2-pill hv2-heroimg__cta">
      {label}
      <Handshake size={20} strokeWidth={1.6} />
    </button>
  );
}
