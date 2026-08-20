"use client";

import { useState } from "react";
import Link from "next/link";
import { toAbsUrl, type ApiAuthor } from "@/lib/pulse-api";

type Locale = "az" | "en" | "ru";

/** Başlanğıcda göstərilən kart sayı. Hər klikdə bu qədər artır/azalır. */
const STEP = 6;

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
 *
 * Siyahı hamısı birdən açılmır: hər "Daha çox" 6 kart əlavə edir, "Daha az"
 * isə 6 kart geri yığır. Ona görə də iki düymə eyni anda görünə bilər —
 * tək düymə olsaydı, yarı açıq vəziyyətdə hansısa istiqamət əlçatmaz qalardı.
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
  const [count, setCount] = useState(STEP);

  const visible = authors.slice(0, count);
  const canShowMore = count < authors.length;
  const canShowLess = count > STEP;

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

      {(canShowMore || canShowLess) && (
        <div className="about-team__more-actions">
          {canShowMore && (
            <button
              type="button"
              className="about-team__more"
              /* `authors.length`-ə kəsilmir: 20 müəllifdə say 18→20 olsaydı,
                 "Daha az" 20−6=14 verib sətirləri 6-lıq addımdan çıxarardı.
                 Say həmişə 6-nın qatı qalır, artıq hissəni `slice` kəsir. */
              onClick={() => setCount((c) => c + STEP)}
            >
              {labels[activeLocale].more}
            </button>
          )}
          {canShowLess && (
            <button
              type="button"
              className="about-team__more"
              onClick={() => setCount((c) => Math.max(c - STEP, STEP))}
            >
              {labels[activeLocale].less}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
