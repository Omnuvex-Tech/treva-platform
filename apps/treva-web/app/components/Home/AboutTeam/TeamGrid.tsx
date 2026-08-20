"use client";

import { useState } from "react";
import Link from "next/link";
import { toAbsUrl, type ApiAuthor } from "@/lib/pulse-api";

type Locale = "az" | "en" | "ru";

/** Başlanğıcda göstərilən kart sayı. */
const INITIAL_COUNT = 6;

const AUTHOR_IMAGE_FALLBACK = "/assets/webflow-placeholder.svg";

const labels: Record<Locale, { more: string; less: string }> = {
  az: { more: "Daha çox", less: "Daha az" },
  en: { more: "Show more", less: "Show less" },
  ru: { more: "Показать ещё", less: "Свернуть" },
};

/**
 * Komanda şəbəkəsi.
 *
 * Yalnız bu hissə client komponentidir — "Daha çox" düyməsi vəziyyət tələb
 * edir. Başlıq və təsvir server tərəfdə qalır.
 */
export default function TeamGrid({
  authors,
  locale,
}: {
  authors: ApiAuthor[];
  locale: string;
}) {
  const activeLocale: Locale =
    locale === "en" || locale === "ru" ? locale : "az";
  const [expanded, setExpanded] = useState(false);

  const hasMore = authors.length > INITIAL_COUNT;
  const visible = expanded ? authors : authors.slice(0, INITIAL_COUNT);

  return (
    <div className="about-team__right">
      <div className="about-team__grid">
        {visible.map((author) => (
          <Link
            key={author.id}
            href={`/${locale}/authors/${author.slug}`}
            className="about-team__card"
          >
            <img
              src={toAbsUrl(author.avatar || "") || AUTHOR_IMAGE_FALLBACK}
              alt={author.name}
              className="about-team__card-img"
            />
            <div className="about-team__card-info">
              <span className="about-team__member-name">{author.name}</span>
              <span className="about-team__member-role">{author.title || ""}</span>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          className="about-team__more"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? labels[activeLocale].less : labels[activeLocale].more}
        </button>
      )}
    </div>
  );
}
