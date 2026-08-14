"use client";

/**
 * CMS-in zəngin mətn redaktorundan gələn HTML-i render edir.
 *
 * Dəyər ya HTML-dir (Tiptap ilə redaktə olunub), ya da köhnə yazılardan
 * qalma düz mətndir — hər ikisi eyni şəkildə işləyir.
 *
 * `<p>` yox, `<div>` render edirik: Tiptap-ın çıxışı özü `<p>` ilə başlayır,
 * `<p>` içində `<p>` isə etibarsız HTML-dir və brauzer layout-u pozur.
 */

import React from "react";

interface Props {
  html: string;
  className?: string;
}

export default function RichText({ html, className }: Props) {
  if (!html) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
