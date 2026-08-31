"use client";

import { useState } from "react";
import Link from "next/link";
import { toAbsUrl, type ApiAuthor } from "@/lib/pulse-api";

type Locale = "az" | "en" | "ru";

/** Başlanğıcda göstərilən kart sayı. Hər klikdə bu qədər artır. */
const STEP = 6;

const AUTHOR_IMAGE_FALLBACK = "/assets/webflow-placeholder.svg";

const labels: Record<Locale, string> = {
  az: "Daha çox",
  en: "Show more",
  ru: "Показать ещё",
};

/**
 * Komanda şəbəkəsi.
 *
 * Yalnız bu hissə client komponentidir — "Daha çox" düyməsi vəziyyət tələb
 * edir. Başlıq və təsvir server tərəfdə qalır.
 *
 * Siyahı hamısı birdən açılmır: hər "Daha çox" 6 kart əlavə edir, hamısı
 * göstəriləndə isə düymə itir. Geri yığmaq yoxdur — oxucunun artıq keçdiyi
 * siyahını qısaltmaq onun altındakı yeri sürüşdürür.
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

      {canShowMore && (
        <div className="about-team__more-actions">
          <button
            type="button"
            className="about-team__more"
            onClick={() => setCount((c) => c + STEP)}
          >
            {labels[activeLocale]}
          </button>
        </div>
      )}
    </div>
  );
}
