"use client";

import Image from 'next/image';
import React, { useState, useMemo } from 'react';
import Navbar from "@/app/components/Home/TrevaHero/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import CallbackForm from "@/app/components/Home/Callback/CallbackForm";
import Link from "next/link";
import { Article } from "@/lib/pulse.types";
import { toAbsUrl } from "@/lib/pulse-api";
import "./pulse.css";
import { ReadMoreOverlay } from "../ReadMoreOverlay";
import { ButtonText } from '@/app/components/ButtonText';

const AUTHOR_IMAGE_FALLBACK = 'https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg';

type PulseProps = {
  locale: string;
  articles: Article[];
  leftArticles: Article[];
  centerArticle: Article | null;
  rightArticles: Article[];
  weekArticles: Article[];
  categories: { id: string; name: string; slug: string }[];
};

const Pulse = ({ locale, articles, leftArticles, centerArticle, rightArticles, weekArticles, categories }: PulseProps) => {
  const scrollToAllArticles = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const target = document.getElementById("all-articles");
    if (!target) return;

    window.history.replaceState(null, "", "#all-articles");

    const navHeightValue = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--treva-nav-height");
    const navHeight = Number.parseFloat(navHeightValue) || 64;
    const offset = navHeight + 24;

    window.scrollTo({
      top: Math.max(target.getBoundingClientRect().top + window.scrollY - offset, 0),
      behavior: "smooth",
    });
  };

  return (
    <main className="page-wrapper" data-locale={locale}>
      <Navbar locale={locale} variant="solid" />
      <PulseHeaderSection
        locale={locale}
        leftArticles={leftArticles}
        centerArticle={centerArticle}
        rightArticles={rightArticles}
        onScrollToAllArticles={scrollToAllArticles}
      />
      <PulseNewsSection locale={locale} articles={articles} weekArticles={weekArticles} categories={categories} />
      <PulseKeywordsSection />
      <div className="pulse-callback-wrap">
        <CallbackForm />
      </div>
      <HomeFooter locale={locale} />
    </main>
  );
};

function PulseKeywordsSection() {
  const keywords = [
    "Daşınmaz əmlak", "Baku real estate", "Sea Breeze mənzillər",
    "Kreditlə evlər", "İpoteka", "Bakıda yeni tikililər",
    "Lux mənzillər", "Əmlak agentliyi", "Treva Pulse",
    "İnvestisiya", "Dubayda evlər", "Tərəfdaş broker",
    "Daşınmaz əmlak satışı", "Bakı mənzil qiymətləri"
  ];
  return (
    <section className="section_keywords">
      <div className="global-padding">
        <div className="container-large">
          <div className="keywords_component">
            <h3 className="keywords_title">Açar sözlər / Keywords</h3>
            <div className="keywords_list">
              {keywords.map((kw, i) => (
                <span key={i} className="keyword_tag">#{kw}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArticleMeta({ category, date }: Pick<Article, "category" | "date">) {
  return (
    <div className="news_specs-wrap">
      <div className="news_category-label">
        <div>{category}</div>
      </div>
      <div>{date}</div>
    </div>
  );
}

function AuthorBlock({ author, authorImage }: Pick<Article, "author" | "authorImage">) {
  if (!author) return null;

  const authorImageSrc = toAbsUrl(authorImage || "") || AUTHOR_IMAGE_FALLBACK;

  return (
    <div className="news_author-wrap hide-landscape">
      <div className="news_author-headshot">
        <img
          src={authorImageSrc}
          alt={author}
          className="fullwidth-img"
          loading="lazy"
          onError={(event) => {
            const target = event.currentTarget;
            target.onerror = null;
            target.src = AUTHOR_IMAGE_FALLBACK;
          }}
        />
      </div>
      <div>{author}</div>
    </div>
  );
}

function NewsCard({
  article,
  locale,
  variant = "middle",
  priority = false,
}: {
  article: Article;
  locale: string;
  variant?: "middle" | "left" | "week";
  priority?: boolean;
}) {
  const isWeek = variant === "week";
  const linkClass =
    variant === "left"
      ? "news_leftcol-link w-inline-block"
      : isWeek
        ? "news_week-link w-inline-block"
        : "news_middle-link w-inline-block";

  const imgWrapClass =
    variant === "left" ? "news_leftcol-img-wrap" : isWeek ? "news_week-img-wrap" : "news_middle-img-wrap";

  const titleClass =
    variant === "left" || isWeek ? "news_leftcol-title no-animate" : "news_middle-title no-animate";

  return (
    <div role="listitem" className={`news_header-item w-dyn-item ${isWeek ? "is-week-card" : ""}`}>
      <Link href={`/${locale}/pulse/${article.slug}`} className={linkClass}>
        <div className={imgWrapClass}>
          <div className={variant === "left" ? "news_leftcol-img-holder" : isWeek ? "news_week-img-holder" : "news_middle-img-holder"}>
            {article.image ? (
              <Image
                src={toAbsUrl(article.image)}
                alt={article.title}
                className="fullwidth-img"
                fill
                priority={priority}
                sizes={variant === "left" ? "(max-width: 991px) 100vw, 26vw" : isWeek ? "(max-width: 991px) 100vw, 110px" : "(max-width: 767px) 100vw, (max-width: 991px) 50vw, 33vw"}
              />
            ) : (
              <div className="fullwidth-img" style={{ background: "#f1f5f9" }} />
            )}
          </div>
          {!isWeek && (
            <>
              <ReadMoreOverlay />
              <div className="img-cover"></div>
            </>
          )}
        </div>

        <div className={isWeek ? "news_week-content-wrap" : variant === "left" ? "news_leftcol-content" : "news-header_middle-content-wrap"}>
          <div className="news_middle-content">
            <ArticleMeta category={article.category} date={article.date} />
            <h2 className={titleClass}>{article.title}</h2>
          </div>
          {variant !== "left" && !isWeek && <AuthorBlock author={article.author} authorImage={article.authorImage} />}
        </div>
      </Link>
    </div>
  );
}

function PulseHeaderSection({
  locale,
  leftArticles,
  centerArticle,
  rightArticles,
  onScrollToAllArticles,
}: {
  locale: string;
  leftArticles: Article[];
  centerArticle: Article | null;
  rightArticles: Article[];
  onScrollToAllArticles: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const visibleRightArticles = rightArticles.slice(0, 4);

  return (
    <section id="pulse" className="section_news-header">
      <div className="global-padding">
        <div className="container-large">
          <div className="news-header_component">
            <div className="news-header_rec">
              <h1 className="heading-style-h1-medium">
                Treva pulse
              </h1>
            </div>

            <div className="news-header_wrap">
              <div className="news-header_left-col">
                <div className="w-dyn-list">
                  <div role="list" className="news_header-list w-dyn-items">
                    {leftArticles.map((article, index) => (
                      <NewsCard
                        key={article.slug}
                        article={article}
                        locale={locale}
                        variant="left"
                        priority={index === 0}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="news-header_middle-col">
                <div className="w-dyn-list">
                  <div role="list" className="news_header-list w-dyn-items">
                    {centerArticle && (
                      <div role="listitem" className="news_header-item w-dyn-item">
                        <Link href={`/${locale}/pulse/${centerArticle.slug}`} className="news-header_middle-link w-inline-block">
                          <div className="news-header_middle-img-wrap">
                            <div className="news_middle-img-holder">
                              {centerArticle.image ? (
                                <Image
                                  src={toAbsUrl(centerArticle.image)}
                                  alt={centerArticle.title}
                                  className="fullwidth-img"
                                  fill
                                  priority
                                  sizes="(max-width: 991px) 100vw, 48vw"
                                />
                              ) : (
                                <div className="fullwidth-img" style={{ background: "#f1f5f9" }} />
                              )}
                            </div>
                            <ReadMoreOverlay />
                            <div className="img-cover"></div>
                          </div>

                          <div className="news-header_middle-content-wrap">
                            <div className="news_middle-content">
                              <ArticleMeta category={centerArticle.category} date={centerArticle.date} />
                              <h2 className="news-header_middle-title no-animate">{centerArticle.title}</h2>
                            </div>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="news-header_right-col hide-landscape">
                <div className="news_rightcol-list-wrap w-dyn-list">
                  <div role="list" className="news_rightcol-list w-dyn-items">
                    {visibleRightArticles.map((article) => (
                      <div key={article.slug} role="listitem" className="news_rightcol-item w-dyn-item">
                        <Link href={`/${locale}/pulse/${article.slug}`} className="news_rightcol-link w-inline-block">
                          <div className="news_rightcol-link-content">
                            <h2 className="news_rightcol-title no-animate">{article.title}</h2>
                            <ArticleMeta category={article.category} date={article.date} />
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="news-header_right-cta-holder">
                  <a href="#all-articles" onClick={onScrollToAllArticles} className="button w-inline-block">
                    <ButtonText>Bütün məqalələr</ButtonText>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PulseNewsSection({ locale, articles: initialArticles, weekArticles, categories }: { locale: string; articles: Article[]; weekArticles: Article[]; categories: { id: string; name: string; slug: string }[] }) {
  const [visibleCount, setVisibleCount] = useState(6);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  const weekSlugs = useMemo(() => new Set(weekArticles.map((a) => a.slug)), [weekArticles]);

  const gridArticles = useMemo(() => {
    let result = initialArticles;

    if (searchQuery.trim()) {
      const term = searchQuery.trim().toLowerCase();
      result = result.filter(a => (a._searchable || '').includes(term));
    }

    if (selectedSlugs.length > 0) {
      result = result.filter(a => {
        const catLower = (a.category || '').toLowerCase();
        return selectedSlugs.some(slug => {
          const cat = categories.find(c => c.slug === slug);
          return cat && cat.name.toLowerCase() === catLower;
        });
      });
    }

    return result.filter(a => !weekSlugs.has(a.slug));
  }, [initialArticles, searchQuery, selectedSlugs, weekSlugs, categories]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setVisibleCount(6);
  };

  const toggleCategory = (slug: string) => {
    setSelectedSlugs(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
    setVisibleCount(6);
  };

  const clearFilters = () => {
    setSelectedSlugs([]);
    setSearchQuery('');
    setVisibleCount(6);
  };

  const handleViewMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  return (
    <section className="section_news">
      <div className="global-padding">
        <div className="container-large">
          <div className="news_component">
            <div className="news_wrap">
              
              {/* 1. ÜST HİSSƏ: Kampaniya Baneri */}
              <div className="news_top-full-banner-container">
                <div className="news_top-full-banner">
                  <Image
                    src="/images/pulse/treva-flag.png" 
                    alt="Reportage Heights 30/70 Kampaniyası" 
                    className="fullwidth-img"
                    fill
                    sizes="100vw"
                  />
                </div>
              </div>

              {/* 2. SOL SÜTUN: Həftənin seçimi */}
              <div className="news_week-col">
                <div className="news_week-title">
                  <div>HƏFTƏNİN SEÇİMİ</div>
                </div>

                <div className="w-dyn-list">
                  <div role="list" className="news_week-list w-dyn-items">
                    {weekArticles.map((w) => (
                      <NewsCard key={w.slug} article={w} locale={locale} variant="week" />
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. SAĞ SÜTUN: Axtarış və Kateqoriyalar */}
              <div className="news_filters-col">
                <div className="news_filters-holder w-form">
                  <form className="news_filters-form" onSubmit={e => e.preventDefault()}>
                    <div className="news_filters-search-wrap">
                      <input
                        className="news_filters-search w-input"
                        placeholder="Axtarış..."
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                    </div>

                    <div className="news_filters-block">
                      <div>Kateqoriyalar</div>

                      <div className="news_tags-list">
                        <button
                          type="button"
                          onClick={clearFilters}
                          style={{
                            padding: "3px 11px", borderRadius: 20, fontSize: 11, fontWeight: 400,
                            border: "none", cursor: "pointer",
                            background: selectedSlugs.length === 0 && !searchQuery ? "#4C525E" : "#ededed",
                            color: selectedSlugs.length === 0 && !searchQuery ? "#fff" : "#17191c",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Hamısı
                        </button>
                        {categories.map((category) => {
                          const isActive = selectedSlugs.includes(category.slug);
                          return (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => toggleCategory(category.slug)}
                              style={{
                                padding: "3px 11px", borderRadius: 20, fontSize: 11, fontWeight: 400,
                                border: "none", cursor: "pointer",
                                background: isActive ? "#4C525E" : "#ededed",
                                color: isActive ? "#fff" : "#17191c",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              {category.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* 4. ALT HİSSƏ: Bütün Məqalələr */}
              <div id="all-articles" className="news_middle-wrap">
                <div className="w-dyn-list">
                  <div role="list" className="news_middle-list w-dyn-items">
                    {gridArticles.length === 0 ? (
                      <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
                        Nəticə tapılmadı
                      </div>
                    ) : (
                      gridArticles.slice(0, visibleCount).map((article) => (
                        <NewsCard key={article.slug} article={article} locale={locale} />
                      ))
                    )}
                  </div>
                </div>

                {visibleCount < gridArticles.length && (
                  <div className="news_view-more-container">
                    <button onClick={handleViewMore} className="button is-view-more">
                      <ButtonText>Daha çox göstər</ButtonText>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Pulse;
