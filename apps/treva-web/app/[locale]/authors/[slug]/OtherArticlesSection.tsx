'use client';

import React, { useState } from "react";
import Link from "next/link";
import { toAbsUrl } from "@/lib/pulse-api";
import "@/app/components/Pulse/pulse.css";

type ArticleLike = {
  slug: string;
  title?: string;
  category?: string;
  date?: string;
  image?: string;
  author?: string;
  authorImage?: string;
};

type CategoryLike = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  locale: string;
  articles: ArticleLike[];
  categories: CategoryLike[];
};

const OtherArticlesSection: React.FC<Props> = ({ locale, articles, categories }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? articles.filter((a) => a.category?.toLowerCase() === activeCategory.toLowerCase())
    : articles;

  return (
    <div className="other-articles">
      <h2 className="other-articles__title">Digər məqalələr</h2>

      <div className="other-articles__filters">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`other-articles__filter-btn ${
              activeCategory?.toLowerCase() === cat.name.toLowerCase() ? "is-active" : ""
            }`}
            onClick={() =>
              setActiveCategory((prev) =>
                prev?.toLowerCase() === cat.name.toLowerCase() ? null : cat.name
              )
            }
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="other-articles__grid">
        {filtered.map((article) => (
          <Link
            key={article.slug}
            href={`/${locale}/pulse/${article.slug}`}
            className="other-articles__card"
          >
            <div className="other-articles__img-wrap">
              {article.image ? (
                <img src={toAbsUrl(article.image)} loading="lazy" alt={article.title || ""} />
              ) : (
                <div className="other-articles__img-fallback" />
              )}
              <div className="other-articles__overlay">
                <span className="other-articles__overlay-btn">Məqaləni oxu</span>
              </div>
            </div>

            <div className="other-articles__content">
              <div className="other-articles__meta">
                <span className="other-articles__category">{article.category || ""}</span>
                <span className="other-articles__date">{article.date || ""}</span>
              </div>

              <h3 className="other-articles__card-title">{article.title || ""}</h3>

              {article.author && (
                <div className="other-articles__author">
                  <img
                    src={article.authorImage ? toAbsUrl(article.authorImage) : "/assets/webflow-placeholder.svg"}
                    alt={article.author}
                    className="other-articles__avatar"
                    loading="lazy"
                  />
                  <span className="other-articles__author-name">{article.author}</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OtherArticlesSection;