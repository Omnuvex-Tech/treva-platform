"use client";

import { useState } from "react";
import Image from "next/image";

type Props = { src: string; alt: string; fallback: string };

/**
 * Floor plan that falls back when its file is missing.
 *
 * The unit feed hands back URLs the API does not actually serve yet (the
 * `/uploads/demo/` set is seeded but the files were never shipped), and a
 * comparison card is mostly plan — two broken frames would be the whole screen.
 * The request still fires and still fails, so the missing files stay visible in
 * the network tab rather than being papered over.
 */
export default function PlanImage({ src, alt, fallback }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <Image
      src={failed || !src ? fallback : src}
      alt={alt}
      width={172}
      height={184}
      onError={() => setFailed(true)}
    />
  );
}
