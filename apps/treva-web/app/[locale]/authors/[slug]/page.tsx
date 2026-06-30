import React from "react";
import Navbar from "@/app/components/Home/TrevaHero/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import CallbackForm from "@/app/components/Home/Callback/CallbackForm";
import Link from "next/link";
import { getAuthorBySlug, apiArticleToArticle, toAbsUrl } from "@/lib/pulse-api";
import { notFound } from "next/navigation";
import "@/app/components/Pulse/pulse.css";

type Props = {
  params: Promise<{
    locale: string;
    slug: string;
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

export default async function AuthorPage({ params }: Props) {
  const { locale, slug } = await params;

  let apiAuthor;
  try {
    apiAuthor = await getAuthorBySlug(slug);
  } catch {
    notFound();
  }

  const authorArticles = apiAuthor.articles.map(a => apiArticleToArticle(a, locale));
  const authorName = apiAuthor.name;
  const authorTitle = apiAuthor.title || "Ekspert / Müəllif";
  const authorImage = apiAuthor.avatar || "https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg";

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

  return (
    <div className="page-wrapper">
      <Navbar locale={locale} variant="solid" />

      <main className="main-wrapper" style={{ paddingTop: "calc(var(--treva-nav-height, 64px) + 64px)" }}>
        
        {/* Author Bio Banner */}
        <section className="section_author-banner" style={{ borderBottom: "1px solid rgba(23, 25, 28, 0.1)", paddingBottom: "3rem" }}>
          <div className="global-padding">
            <div className="container-large">
              <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
                <div style={{ width: "120px", height: "120px", borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(0,0,0,0.1)" }}>
                  <img src={authorImage} alt={authorName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div>
                  <h1 className="heading-style-h2-medium" style={{ margin: 0 }}>{authorName}</h1>
                  <p className="text-color-blue400" style={{ margin: "0.5rem 0 0 0", fontSize: "1.1rem" }}>{authorTitle}</p>
                  <p style={{ color: "rgba(23, 25, 28, 0.6)", marginTop: "0.5rem" }}>
                    TREVA real estate komandasının peşəkar üzvü. Daşınmaz əmlak bazarı üzrə ən son xəbərlər, təhlillər və məsləhətlər.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Author's Articles */}
        <section className="section_news" style={{ paddingTop: "3rem" }}>
          <div className="global-padding">
            <div className="container-large">
              <h2 className="heading-style-h3-small" style={{ marginBottom: "2rem" }}>Müəllifin bütün məqalələri</h2>
              <div className="news_middle-wrap">
                <div className="w-dyn-list">
                  <div role="list" className="news_middle-list w-dyn-items" style={{ borderRight: "1px solid rgba(23, 25, 28, 0.1)" }}>
                    {authorArticles.map((article) => (
                      <div key={article.slug} role="listitem" className="news_header-item w-dyn-item">
                        <Link href={`/${locale}/pulse/${article.slug}`} className="news_middle-link w-inline-block">
                          <div className="news_middle-img-wrap">
                              <div className="news_middle-img-holder">
                              {article.image ? <img src={toAbsUrl(article.image)} loading="lazy" alt={article.title} className="fullwidth-img" /> : <div className="fullwidth-img" style={{ background: "#f1f5f9" }} />}
                            </div>
                          </div>

                          <div className="news-header_middle-content-wrap">
                            <div className="news_middle-content">
                              <div className="news_specs-wrap">
                                <div className="news_category-label">
                                  <div>{article.category}</div>
                                </div>
                                <div>{article.date}</div>
                              </div>
                              <h2 className="news_middle-title no-animate">{article.title}</h2>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEO Keywords Section */}
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
      </main>

      <CallbackForm />
      <HomeFooter locale={locale} />
    </div>
  );
}
