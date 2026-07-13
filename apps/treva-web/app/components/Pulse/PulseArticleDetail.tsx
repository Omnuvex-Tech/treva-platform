"use client";

import { ButtonText } from '@/app/components/ButtonText';
/* eslint-disable @next/next/no-img-element, react/no-unknown-property */

import React, { useEffect, useState, FormEvent } from "react";
import Navbar from "@/app/components/Home/TrevaHero/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import CallbackForm from "@/app/components/Home/Callback/CallbackForm";
import { Article } from "@/lib/pulse.types";
import { BlockRenderer } from "./BlockRenderer";
import { toAbsUrl } from "@/lib/pulse-api";
import "./pulse-article.css";

type PulseArticleDetailProps = {
  locale: string;
  article: Article;
  sidebarArticles?: Article[];
  relatedArticles?: Article[];
};

function ArticleBanner() {
  const items = Array.from({ length: 10 }, (_, index) => index);

  return (
    <a href="#" className="article_banner w-inline-block">
      {[0, 1].map((block) => (
        <div key={block} className="article_banner-block">
          {items.slice(0, 5).map((item) => (
            <div key={`${block}-${item}`} className="article_banner-item">
              <div>Why Global Investors Are Looking to the Region</div>
            </div>
          ))}
        </div>
      ))}
    </a>
  );
}

function SliderEmptyState() {
  return (
    <div className="article_slider-wrap w-condition-invisible">
      <div className="swiper swiper-article w-dyn-list">
        <div
          role="list"
          className="swiper-wrapper swiper-wrapper-article w-dyn-items w-dyn-hide"
        />
        <div className="w-dyn-empty">
          <div>No items found.</div>
        </div>
      </div>
      <div className="article_slider-nav-block">
        <div className="swiper-article-pagination">
          <div className="swiper-pagination-bullet" />
          <div className="swiper-pagination-bullet-active" />
        </div>
        <div className="swiper-article-nav">
          <div className="swiper-testimonials-prev">
            <div className="icon is-test-arrow w-embed">
              <svg width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M9.78299 1.78543C9.96665 1.97554 9.96142 2.27853 9.77131 2.46219L4.71543 7.3466C4.52067 7.53475 4.52067 7.84688 4.71543 8.03503L9.77131 12.9194C9.96142 13.1031 9.96664 13.4061 9.78299 13.5962L8.6718 14.7464C8.48814 14.9365 8.18515 14.9417 7.99504 14.7581L1.03599 8.03503C0.841227 7.84688 0.841227 7.53475 1.03599 7.3466L7.99504 0.62356C8.18515 0.439901 8.48814 0.445128 8.6718 0.635234L9.78299 1.78543Z" fill="grey"/>
              </svg>
            </div>
          </div>
          <div className="swiper-testimonials-next">
            <div className="icon w-embed">
              <svg width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M0.592012 13.5954C0.408353 13.4053 0.41358 13.1023 0.603685 12.9187L5.65956 8.03426C5.85432 7.84611 5.85432 7.53398 5.65956 7.34583L0.603685 2.46142C0.413579 2.27776 0.408352 1.97477 0.59201 1.78466L1.7032 0.634465C1.88686 0.44436 2.18985 0.439133 2.37996 0.622791L9.33901 7.34583C9.53377 7.53398 9.53377 7.84611 9.33901 8.03426L2.37996 14.7573C2.18985 14.941 1.88686 14.9357 1.7032 14.7456L0.592012 13.5954Z" fill="grey"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ArticleHero: React.FC<{ article: Article }> = ({ article }) => (
  <>
    <div className="article_intro-wrap">
      <div className="news_specs-wrap">
        <div className="news_category-label">
          <div>{article.category}</div>
        </div>
        <div>{article.date}</div>
      </div>
      <h1 className="heading-style-h2-medium">{article.title}</h1>
    </div>

    <div className="article_cover-wrap img-reveal">
      {article.image ? (
        <img
          src={toAbsUrl(article.image)}
          loading="lazy"
          alt={article.title}
          className="fullwidth-img"
        />
      ) : (
        <div className="fullwidth-img" style={{ background: "#f1f5f9", minHeight: 200 }} />
      )}
      <div className="img-cover" />
    </div>
  </>
);

const ArticleSidebar: React.FC<{ locale: string; articles: Article[] }> = ({ locale, articles }) => {
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setSubStatus('loading');
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:10021';
      const res = await fetch(`${apiBase}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubStatus('success');
        setEmail('');
      } else {
        throw new Error('Failed');
      }
    } catch {
      setSubStatus('error');
      setTimeout(() => setSubStatus('idle'), 3000);
    }
  };

  return (
  <div className="article_sidebar">
    <div className="article_sidebar-featured">
      <div className="article_sidebar-top">
        <h3 className="heading-style-h3-small no-animate">Seçilmiş məqalələr</h3>
      </div>
      <div className="w-dyn-list">
        <div role="list" className="article_sidebar-list w-dyn-items">
          {articles.map((item) => (
            <div key={item.slug} role="listitem" className="w-dyn-item">
              <a href={`/${locale}/pulse/${item.slug}`} className="article_sidebar-link w-inline-block">
                <div className="article_sidebar-img">
                  {item.image ? <img src={toAbsUrl(item.image)} loading="lazy" alt="" className="fullwidth-img ease0-6" /> : <div className="fullwidth-img ease0-6" style={{ background: "#f1f5f9" }} />}
                </div>
                <div className="article_sidebar-content">
                  <h4 className="no-animate">{item.title}</h4>
                  <div className="news_specs-wrap">
                    <div className="news_category-label">
                      <div>{item.category}</div>
                    </div>
                    <div>{item.date}</div>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
      <div className="article_sidebar-cta">
        <a href={`/${locale}/pulse`} className="button w-inline-block">
          <ButtonText>Bütün məqalələr</ButtonText>
        </a>
      </div>
    </div>

    <div className="article_newsletter">
      <div className="article_sidebar-top">
        <h3 className="heading-style-h3-small no-animate">Xəbər bülletenimizə abunə olun</h3>
      </div>
      <div className="article_form-block w-form">
        {subStatus === 'success' ? (
          <div className="newsletter-success-inline">
            <div className="newsletter-success-icon">
              <svg className="newsletter-checkmark" viewBox="0 0 52 52">
                <circle className="newsletter-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="newsletter-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            <p className="newsletter-success-title">Abunəliyiniz uğurla qeydiyyatdan keçdi!</p>
            <p className="newsletter-success-text">TREVA ilə əlaqədə qaldığınız üçün təşəkkür edirik.</p>
            <button className="newsletter-success-btn" onClick={() => setSubStatus('idle')}>Yeni abunəlik</button>
          </div>
        ) : (
          <form className="article_form" onSubmit={handleSubscribe}>
            <input
              className="article_input-field w-input"
              placeholder="E-poçt ünvanı"
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className={`article_submit-btn w-button ${subStatus === 'loading' ? 'is-loading' : ''}`} disabled={subStatus === 'loading'}>
              {subStatus === 'loading' && <span className="article-spinner" />}
              <span>Abunə ol</span>
            </button>
          </form>
        )}
        {subStatus === 'error' && <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>Xəta baş verdi. Yenidən cəhd edin.</div>}
      </div>
    </div>
  </div>
  );
};

const RelatedArticlesSection: React.FC<{ locale: string; currentSlug: string; articles: Article[] }> = ({ locale, currentSlug, articles }) => (
  <section className="section_f-articles">
    <div className="global-padding padding-section-medium">
      <div className="container-large">
        <div className="f-articles_component">
          <div className="f-articles_intro">
            <div className="max-width-48rem">
              <h2 className="heading-style-h2-medium">PULSE-da hər həftə yeni məlumatları oxumağa davam edin</h2>
            </div>
            <div>(Məqalələrimiz)</div>
          </div>
          <div className="f-articles_wrap">
            <div className="f-articles_holder">
              <div className="w-dyn-list">
                <div role="list" className="f-articles_list w-dyn-items">
                  {articles.map((item) => (
                    <div key={item.slug} role="listitem" className="f-articles_item w-dyn-item">
                      <a href={`/${locale}/pulse/${item.slug}`} className={`f-articles_link w-inline-block${item.slug === currentSlug ? " w--current" : ""}`}>
                        <div className="f-articles_img-wrap">
                          <div className="news_middle-img-holder">
                            {item.image ? <img src={toAbsUrl(item.image)} loading="lazy" alt={item.title} className="fullwidth-img" /> : <div className="fullwidth-img" style={{ background: "#f1f5f9" }} />}
                          </div>
                          <div className="projects_overlay hide-tablet">
                            <div className="news_btn">
                              <div>Məqaləni oxu</div>
                            </div>
                          </div>
                        </div>
                        <div className="news-header_middle-content-wrap">
                          <div className="news_middle-content">
                            <div className="news_specs-wrap">
                              <div className="news_category-label">
                                <div>{item.category}</div>
                              </div>
                              <div>{item.date}</div>
                            </div>
                            <h2 className="f-articles_title no-animate">{item.title}</h2>
                          </div>
                          {item.author && (
                            <div className="news_author-wrap">
                              <div className="news_author-headshot">
                                <img src={toAbsUrl(item.authorImage || "") || "https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg"} loading="lazy" alt={item.author} className="fullwidth-img" />
                              </div>
                              <div>{item.author}</div>
                            </div>
                          )}
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const ArticleAuthorBlock: React.FC<{ locale: string; article: Article }> = ({ locale, article }) => (
  <div className="article-author-block">
    {article.author && (
      <a href={`/${locale}/authors/${article.author.toLowerCase().replace(/\s+/g, '-')}`} className="article_specs-author w-inline-block">
        <div className="article_author-avatar">
          <img src={toAbsUrl(article.authorImage || "")} loading="lazy" alt={article.author} className="fullwidth-img" />
        </div>
        <div className="article_author-content">
          <div className="text-color-blue400">{article.author}</div>
          <div className="text-size-small">{article.authorTitle || "Ekspert"}</div>
        </div>
      </a>
    )}
  </div>
);

const ArticleKeywordsBlock: React.FC<{ keywords?: { id: string; name: string; slug: string }[] }> = ({ keywords }) => {
  if (!keywords || keywords.length === 0) return null;
  return (
    <div className="article-keywords-block">
      <div className="article-keywords-label">
        Açar sözlər / Keywords
      </div>
      <div className="article-keywords-list">
        {keywords.map((kw) => (
          <span key={kw.id} className="article-keyword-tag">
            #{kw.name}
          </span>
        ))}
      </div>
    </div>
  );
};

const PulseArticleDetail: React.FC<PulseArticleDetailProps> = ({ locale, article, sidebarArticles = [], relatedArticles = [] }) => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="page-wrapper">
      <Navbar locale={locale} variant="solid" />
      <ArticleBanner />
      <style jsx global>{`
        .section_f-articles .f-articles_img-wrap { position: relative; overflow: hidden; cursor: pointer; }
        .section_f-articles .f-articles_img-wrap img { transition: transform 0.4s ease; }
        .section_f-articles .f-articles_img-wrap:hover img { transform: scale(1.05); }
        .section_f-articles .f-articles_img-wrap .projects_overlay {
          position: absolute; inset: 0; z-index: 2; display: flex !important; align-items: center; justify-content: center;
          background-color: rgba(23, 25, 28, 0.4); opacity: 0; transition: opacity 0.3s ease;
        }
        .section_f-articles .f-articles_img-wrap:hover .projects_overlay { opacity: 1 !important; }
        .section_f-articles .f-articles_img-wrap .news_btn {
          display: flex !important; align-items: center; justify-content: center; color: #ffffff !important;
          text-transform: uppercase; background-color: rgba(255, 255, 255, 0.3) !important;
          border: 1px solid rgba(255, 255, 255, 0.4) !important; border-radius: 2rem; padding: 0.5rem 1rem;
          font-size: 0.75rem; opacity: 0; transform: scale(0.8); transition: all 0.3s ease;
        }
        .section_f-articles .f-articles_img-wrap:hover .news_btn { opacity: 1 !important; transform: scale(1) !important; }
      `}</style>

      <main className="main-wrapper">
        <section className="section_article">
          <div className="global-padding padding-section-medium">
            <div className="container-large">
              <div className="article_component">
                <div className="article_wrap">
                  <div className="article_col">
                    <ArticleHero article={article} />

                    <div className="article_content-row">
                      {article.author && (
                        <div className="article_content-author">
                          <a href={`/${locale}/authors/${article.author.toLowerCase().replace(/\s+/g, '-')}`} className="article_specs-author w-inline-block">
                            <div className="article_author-avatar">
          <img src={toAbsUrl(article.authorImage || "")} loading="lazy" alt={article.author} className="fullwidth-img" />
                            </div>
                            <div className="article_author-content">
                              <div className="text-color-blue400">{article.author}</div>
                              <div className="text-size-small">{article.authorTitle || "Ekspert"}</div>
                            </div>
                          </a>
                        </div>
                      )}

                      <div className="article_content-main">
                        <div className="article_body">
                          <div>
                            <div className="article_richtext no-animate w-richtext">
                              {article.blocks && article.blocks.length > 0 ? (
                                <BlockRenderer blocks={article.blocks} />
                              ) : (
                                article.content
                              )}
                            </div>
                            <SliderEmptyState />
                          </div>
                        </div>

                        <ArticleKeywordsBlock keywords={article.keywords} />
                      </div>
                    </div>
                  </div>

                  <ArticleSidebar locale={locale} articles={sidebarArticles} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <RelatedArticlesSection locale={locale} currentSlug={article.slug} articles={relatedArticles} />
      </main>

      <CallbackForm />
      <HomeFooter locale={locale} />
    </div>
  );
};

export default PulseArticleDetail;
