import Navbar from "@/app/components/Navbar/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import Link from "next/link";
import { ARTICLES, FEATURED_ARTICLE, WEEK_ARTICLE } from "@/lib/pulse-data";
import { Article } from "@/lib/pulse.types";
import "./pulse.css";

type PulseProps = {
  locale: string;
};

const Pulse = ({ locale }: PulseProps) => {
  return (
    <main className="page-wrapper" data-locale={locale}>
      <Navbar locale={locale} />
      <PulseHeaderSection locale={locale} />
      <PulseNewsSection locale={locale} />
      <HomeFooter locale={locale} />
    </main>
  );
};

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

  return (
    <div className="news_author-wrap hide-landscape">
      {authorImage && (
        <div className="news_author-headshot">
          <img src={authorImage} loading="lazy" alt={author} className="fullwidth-img" />
        </div>
      )}
      <div>{author}</div>
    </div>
  );
}

function NewsCard({ article, locale, variant = "middle" }: { article: Article; locale: string; variant?: "middle" | "left" | "week" }) {
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
          <div className={variant === "left" ? "news_leftcol-img-holder" : "news_middle-img-holder"}>
            <img src={article.image} loading="lazy" alt={article.title} className="fullwidth-img" />
          </div>

          <div className="projects_overlay hide-tablet">
            <div className="news_btn">
              <div>Məqaləni oxu</div>
            </div>
          </div>
        </div>

        <div className={variant === "left" ? "news_leftcol-content" : "news-header_middle-content-wrap"}>
          <div className="news_middle-content">
            <ArticleMeta category={article.category} date={article.date} />
            <h2 className={titleClass}>{article.title}</h2>
          </div>

          {variant !== "left" && <AuthorBlock author={article.author} authorImage={article.authorImage} />}
        </div>
      </Link>
    </div>
  );
}

function PulseHeaderSection({ locale }: { locale: string }) {
  const leftArticles = ARTICLES.slice(0, 2);
  const rightArticles = [FEATURED_ARTICLE, ...ARTICLES.slice(0, 3)];

  return (
    <section id="pulse" className="section_news-header">
      <div className="global-padding">
        <div className="container-large">
          <div className="news-header_component">
            <div className="news-header_rec">
              <h1 className="heading-style-h1-medium">
                <span className="heading-gap-h1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                Treva pulse
              </h1>
            </div>

            <div className="news-header_wrap">
              <div className="news-header_left-col">
                <div className="w-dyn-list">
                  <div role="list" className="news_header-list w-dyn-items">
                    {leftArticles.map((article) => (
                      <NewsCard key={article.slug} article={article} locale={locale} variant="left" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="news-header_middle-col">
                <div className="w-dyn-list">
                  <div role="list" className="news_header-list w-dyn-items">
                    <div role="listitem" className="news_header-item w-dyn-item">
                      <Link href={`/${locale}/pulse/${FEATURED_ARTICLE.slug}`} className="news-header_middle-link w-inline-block">
                        <div className="news-header_middle-img-wrap">
                          <div className="news_middle-img-holder">
                            <img
                              src={FEATURED_ARTICLE.image}
                              loading="lazy"
                              alt={FEATURED_ARTICLE.title}
                              className="fullwidth-img"
                            />
                          </div>

                          <div className="projects_overlay hide-tablet">
                            <div className="news_btn">
                              <div>Məqaləni oxu</div>
                            </div>
                          </div>
                        </div>

                        <div className="news-header_middle-content-wrap">
                          <div className="news_middle-content">
                            <ArticleMeta category={FEATURED_ARTICLE.category} date={FEATURED_ARTICLE.date} />
                            <h2 className="news-header_middle-title no-animate">{FEATURED_ARTICLE.title}</h2>
                          </div>

                          <AuthorBlock author={FEATURED_ARTICLE.author} authorImage={FEATURED_ARTICLE.authorImage} />
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="news-header_right-col hide-landscape">
                <div className="news_rightcol-list-wrap w-dyn-list">
                  <div role="list" className="news_rightcol-list w-dyn-items">
                    {rightArticles.map((article) => (
                      <div key={article.slug} role="listitem" className="news_rightcol-item w-dyn-item">
                        <Link href={`/${locale}/pulse/${article.slug}`} className="news_rightcol-link w-inline-block">
                          <div className="news_rightcol-content">
                            <h2 className="news_rightcol-title no-animate">{article.title}</h2>
                            <ArticleMeta category={article.category} date={article.date} />
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="news-header_right-cta-holder">
                  <a href="#all-articles" className="button w-inline-block">
                    <div className="button-text-wrap">
                      <div className="button-text">Bütün məqalələr</div>
                      <div className="button-text">Bütün məqalələr</div>
                    </div>
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

function PulseNewsSection({ locale }: { locale: string }) {
  return (
    <section className="section_news">
      <div className="global-padding">
        <div className="container-large">
          <div className="news_component">
            <div className="news_wrap">
              <div className="news_week-col self-start">
                <div className="news_week-title">
                  <div>Həftənin seçimi</div>
                </div>

                <div className="news-header_right-col">
                  <div className="news_rightcol-list-wrap w-dyn-list">
                    <div role="list" className="news_week-list w-dyn-items">
                      <NewsCard article={WEEK_ARTICLE} locale={locale} variant="week" />
                    </div>
                  </div>
                </div>
              </div>

              <div id="all-articles" className="news_middle-wrap">
                <div className="w-dyn-list">
                  <div role="list" className="news_middle-list w-dyn-items">
                    {ARTICLES.map((article) => (
                      <NewsCard key={article.slug} article={article} locale={locale} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="news_filters-col self-start">
                <div className="news_filters-holder w-form">
                  <form className="news_filters-form">
                    <div className="news_filters-search-wrap">
                      <input className="news_filters-search w-input" placeholder="Axtarış..." type="text" />
                    </div>

                    <div className="news_filters-block">
                      <div>Kateqoriyalar</div>

                      <div className="news_tags-list">
                        {["Bloq", "Kampaniya", "Tədbir", "Analizlər", "Xəbərlər"].map(
                          (category) => (
                            <label key={category} className="w-checkbox news_checkbox-field">
                              <input type="checkbox" className="hidden" value={category} />
                              <span className="news_checkbox-label w-form-label">{category}</span>
                            </label>
                          ),
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Pulse;