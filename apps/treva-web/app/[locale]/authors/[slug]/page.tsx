import React from "react";
import Navbar from "@/app/components/Home/TrevaHero/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import CallbackForm from "@/app/components/Home/Callback/CallbackForm";
import OtherArticlesSection from "./OtherArticlesSection";
import Link from "next/link";
import {
  getAuthorBySlug,
  apiArticleToArticle,
  toAbsUrl,
  getArticles,
  getPulseCategories,
  getLocalized,
} from "@/lib/pulse-api";
import { notFound } from "next/navigation";
import { FaLinkedin, FaArrowRightLong } from "react-icons/fa6";
import "@/app/components/Pulse/pulse.css";

type Props = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
  searchParams: Promise<{
    category?: string;
  }>;
};

export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:10011/api/v1"}/pulse/authors`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const result = await res.json();
    const authors = result.data ?? result;
    const locales = ["az", "en", "ru"];
    const params: { locale: string; slug: string }[] = [];
    for (const locale of locales) {
      for (const author of authors) {
        params.push({ locale, slug: author.slug });
      }
    }
    return params;
  } catch {
    return [];
  }
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const { category: activeCategory } = await searchParams;

  let apiAuthor;
  try {
    apiAuthor = await getAuthorBySlug(slug, locale);
  } catch {
    notFound();
  }

  const authorArticles = apiAuthor.articles.map(a => apiArticleToArticle(a, locale));
  const authorName = apiAuthor.name;
  const authorTitle = apiAuthor.title || "Ekspert / Müəllif";
  const authorImage = apiAuthor.avatar
    ? toAbsUrl(apiAuthor.avatar)
    : "/assets/webflow-placeholder.svg";
  const authorLinkedin = apiAuthor.linkedin;
  const authorDescription =
    apiAuthor.description ||
    "TREVA real estate komandasının peşəkar üzvü. Daşınmaz əmlak bazarı üzrə ən son xəbərlər, təhlillər və məsləhətlər.";

  const keywords = [
    authorName,
    "Treva broker",
    "Daşınmaz əmlak",
    "Bakı mənzil bazarı",
    "Sea Breeze evlər",
    "Real Estate Baku",
    "Əmlak investisiyası",
    "Müəllif məqalələri",
    "Treva Pulse"
  ];
  let allCategories: { id: string; name: string; slug: string }[] = [];
  let otherArticles: ReturnType<typeof apiArticleToArticle>[] = [];

  try {
    const [apiArticlesRes, categoriesRes] = await Promise.all([
      getArticles({ limit: 100 }),
      getPulseCategories(),
    ]);

    allCategories = categoriesRes.map((cat) => ({
      id: cat.id,
      name: getLocalized(cat.name, locale),
      slug: cat.slug,
    }));

    otherArticles = apiArticlesRes.data
      .map((a) => apiArticleToArticle(a, locale))
      .filter((a) => !authorArticles.some((aa) => aa.slug === a.slug));
  } catch {
    otherArticles = [];
  }
  return (
    <div className="page-wrapper" data-locale={locale}>
      <Navbar locale={locale} variant="solid" />

      <main className="main-wrapper">

        <section className="global-padding">
          <div className="container-large">
            <div className="author-page_wrap">

              {/* Left column — author info */}
              <div className="author-page_left-col">
                <div className="author-page_avatar">
                  <img src={authorImage} alt={String(authorName || "")} />
                </div>
                <h1 className="author-page_name">{String(authorName || "")}</h1>
                <p className="author-page_title">{String(authorTitle || "")}</p>
                <p className="author-page_desc">{String(authorDescription || "")}</p>
                {authorLinkedin && (
                  <a
                    href={authorLinkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="pulse-social-icon-link"
                    aria-label={`${String(authorName || "")} LinkedIn profili`}
                  >
                    <FaLinkedin size={22} aria-hidden="true" />
                  </a>
                )}
              </div>

              {/* Right column — latest articles */}
              <div className="author-page_right-col">
                <h2 className="author-page_articles-title">Son məqalələr</h2>
                <div className="author-page_articles-list">
                  {authorArticles.map((article) => (
                    <Link
                      key={article.slug}
                      href={`/${locale}/pulse/${article.slug}`}
                      className="author-page_article-item"
                    >
                      <div className="author-page_article-img">
                        {article.image ? (
                          <img src={toAbsUrl(article.image)} loading="lazy" alt={String(article.title || "")} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", background: "#f1f5f9" }} />
                        )}
                        <div className="author-page_img-overlay">
                          <div className="author-page_img-btn">Məqaləni oxu</div>
                        </div>
                      </div>

                      <div className="author-page_article-content">
                        <h3 className="author-page_article-title">{String(article.title || "")}</h3>
                        {article.excerpt && (
                          <p className="author-page_article-excerpt">{String(article.excerpt)}</p>
                        )}
                        <span className="author-page_article-cta">
                          Məqaləni oxu <FaArrowRightLong size={14} aria-hidden="true" />
                        </span>
                      </div>

                      <div className="author-page_article-meta">
                        <div className="news_category-label">
                          <div>{String(article.category || "")}</div>
                        </div>
                        <span className="author-page_article-date">{String(article.date || "")}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        <section className="global-padding">
          <div className="container-large">
            <OtherArticlesSection
              locale={locale}
              articles={otherArticles}
              categories={allCategories}
            />
          </div>
        </section>
        <section className="section_keywords author-keywords-section">
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
      </main>

      <CallbackForm />
      <HomeFooter locale={locale} />
    </div>
  );
}