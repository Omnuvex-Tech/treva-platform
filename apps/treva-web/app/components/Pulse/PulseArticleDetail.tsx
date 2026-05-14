"use client";

/* eslint-disable @next/next/no-img-element, react/no-unknown-property */

import React from "react";
import Navbar from "@/app/components/Navbar/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import "./pulse-article.css";

type PulseArticleDetailProps = {
  locale: string;
};

type ArticleCard = {
  title: string;
  href: string;
  image: string;
  category: string;
  date: string;
  author?: string;
  authorImage?: string;
  srcSet?: string;
};

const articleSlug = "menzil-almaq-ucun-ilkin-odenis-ne-qeder-olmalidir";

const sidebarArticles: ArticleCard[] = [
  {
    title:
      "Panorama By Elie Saab-da 30/70 Kampaniyası: Aylıq Ödənişsiz Eksklüziv İnvestisiya",
    href: "panorama-by-elie-saab-da-30-70-kampaniyasi",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03349150df278a38351b4a_panorama%20aze.webp",
    category: "Kampaniya",
    date: "12.05.2026",
  },
  {
    title:
      "Reportage Heights-də 30/70 Kampaniyası: Aylıq Ödənişsiz Prestijli Həyat",
    href: "reportage-heights-de-30-70-kampaniyasi-ayliq-odenissiz-prestijli-heyat",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03347538e0bfa6ec214d61_reportage%20aze.webp",
    category: "Kampaniya",
    date: "12.05.2026",
  },
  {
    title:
      "Arabian Ranches-də 30/70 Kampaniyası: Aylıq Ödənişsiz Mənzil Sahibi Olun",
    href: "arabian-ranches-de-30-70-kampaniyasi",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03037f2071a1acdd345f50_arabian%2016x9.webp",
    category: "Kampaniya",
    date: "12.05.2026",
  },
  {
    title: "Bazarda niyə bəzi developerlər daha sürətli satır?",
    href: "bazarda-niye-bezi-developerler-daha-suretli-satir",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69f2106019e67e1ea891fccf_tural%20necefov%20coverr.webp",
    category: "Bloq",
    date: "29.04.2026",
  },
];

const featuredArticles: ArticleCard[] = [
  ...sidebarArticles.slice(0, 3),
  {
    title: "Mənzil almaq üçün ilkin ödəniş nə qədər olmalıdır?",
    href: articleSlug,
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69fd94d16c2f782bfe2b200b_emil%20blog%20cover.webp",
    category: "Bloq",
    date: "08.05.2026",
    author: "Emil Qurbanov",
    authorImage:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69fd8ce9412d4296bff1111a_Emil%20Qurbanov.webp",
  },
  {
    title: "Bazarda niyə bəzi developerlər daha sürətli satır?",
    href: "bazarda-niye-bezi-developerler-daha-suretli-satir",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69f2106019e67e1ea891fccf_tural%20necefov%20coverr.webp",
    category: "Bloq",
    date: "29.04.2026",
    author: "Tural Nəcəfov",
    authorImage:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69f20b608b4bce1864a0a1a0_Tural%20Necefov.webp",
  },
  {
    title: "Bakıda Mənzil Qiymətləri 2026: Sərfəli Layihələr",
    href: "bakida-menzil-qiymetleri-2026-serfeli-layiheler",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e9dc5d25a4d7cb27fafcbc_leyla%20cover.webp",
    category: "Bloq",
    date: "23.04.2026",
    author: "Leyla Bağırzadə",
    authorImage:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69eb87ce2666e56cda7df5f6_leyla-autor.webp",
    srcSet:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e9dc5d25a4d7cb27fafcbc_leyla%20cover-p-500.webp 500w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e9dc5d25a4d7cb27fafcbc_leyla%20cover-p-800.webp 800w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e9dc5d25a4d7cb27fafcbc_leyla%20cover-p-1080.webp 1080w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e9dc5d25a4d7cb27fafcbc_leyla%20cover-p-1600.webp 1600w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e9dc5d25a4d7cb27fafcbc_leyla%20cover.webp 2752w",
  },
];

function articleHref(locale: string, href: string) {
  return `/${locale}/pulse/${href}`;
}

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
              <svg
                width="10"
                height="15"
                viewBox="0 0 10 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.78299 1.78543C9.96665 1.97554 9.96142 2.27853 9.77131 2.46219L4.71543 7.3466C4.52067 7.53475 4.52067 7.84688 4.71543 8.03503L9.77131 12.9194C9.96142 13.1031 9.96664 13.4061 9.78299 13.5962L8.6718 14.7464C8.48814 14.9365 8.18515 14.9417 7.99504 14.7581L1.03599 8.03503C0.841227 7.84688 0.841227 7.53475 1.03599 7.3466L7.99504 0.62356C8.18515 0.439901 8.48814 0.445128 8.6718 0.635234L9.78299 1.78543Z"
                  fill="grey"
                />
              </svg>
            </div>
          </div>
          <div className="swiper-testimonials-next">
            <div className="icon w-embed">
              <svg
                width="10"
                height="15"
                viewBox="0 0 10 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.592012 13.5954C0.408353 13.4053 0.41358 13.1023 0.603685 12.9187L5.65956 8.03426C5.85432 7.84611 5.85432 7.53398 5.65956 7.34583L0.603685 2.46142C0.413579 2.27776 0.408352 1.97477 0.59201 1.78466L1.7032 0.634465C1.88686 0.44436 2.18985 0.439133 2.37996 0.622791L9.33901 7.34583C9.53377 7.53398 9.53377 7.84611 9.33901 8.03426L2.37996 14.7573C2.18985 14.941 1.88686 14.9357 1.7032 14.7456L0.592012 13.5954Z"
                  fill="grey"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PulseArticleDetail: React.FC<PulseArticleDetailProps> = ({ locale }) => {
  return (
    <div className="page-wrapper">
      <Navbar locale={locale} />
      <ArticleBanner />
      <style jsx global>{`
        .section_f-articles .f-articles_img-wrap {
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .section_f-articles .f-articles_img-wrap img {
          transition: transform 0.4s ease;
        }

        .section_f-articles .f-articles_img-wrap:hover img {
          transform: scale(1.05);
        }

        .section_f-articles .f-articles_img-wrap .projects_overlay,
        .section_f-articles .f-articles_img-wrap .projects_overlay.hide-tablet {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex !important;
          align-items: center;
          justify-content: center;
          background-color: rgba(23, 25, 28, 0.4);
          opacity: 0;
          visibility: visible !important;
          transition: opacity 0.3s ease;
        }

        .section_f-articles .f-articles_img-wrap:hover .projects_overlay,
        .section_f-articles .f-articles_link:hover .projects_overlay {
          display: flex !important;
          opacity: 1 !important;
          visibility: visible !important;
        }

        .section_f-articles .f-articles_img-wrap .news_btn {
          display: flex !important;
          align-items: center;
          justify-content: center;
          color: #ffffff !important;
          white-space: nowrap;
          text-transform: uppercase;
          background-color: rgba(255, 255, 255, 0.3) !important;
          border: 1px solid rgba(255, 255, 255, 0.4) !important;
          border-radius: 2rem;
          padding: 0.5rem 1rem;
          font-size: 0.75rem;
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.3s ease;
        }

        .section_f-articles .f-articles_img-wrap:hover .news_btn,
        .section_f-articles .f-articles_link:hover .news_btn {
          display: flex !important;
          opacity: 1 !important;
          visibility: visible !important;
          transform: scale(1) !important;
        }

        .section_f-articles .f-articles_img-wrap .news_btn:hover {
          background-color: rgba(255, 255, 255, 0.5) !important;
        }
      `}</style>

      <main className="main-wrapper">
        <section className="section_article">
          <div className="global-padding padding-section-medium">
            <div className="container-large">
              <div className="article_component">
                <div className="article_wrap">
                  <div className="article_col">
                    <div className="article_intro-wrap">
                      <div className="news_specs-wrap">
                        <div className="news_category-label">
                          <div>Bloq</div>
                        </div>
                        <div>08.05.2026</div>
                      </div>
                      <h1 className="heading-style-h2-medium">
                        Mənzil almaq üçün ilkin ödəniş nə qədər olmalıdır?
                      </h1>
                    </div>

                    <div className="article_cover-wrap img-reveal">
                      <img
                        src="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69fd94d16c2f782bfe2b200b_emil%20blog%20cover.webp"
                        loading="lazy"
                        alt="Mənzil almaq üçün ilkin ödəniş nə qədər olmalıdır?"
                        className="fullwidth-img"
                      />
                      <div className="img-cover" />
                    </div>

                    <div className="article_body">
                      <div className="article_specs-sticky">
                        <div>
                          <div className="w-dyn-list">
                            <div role="list" className="w-dyn-items">
                              <div role="listitem" className="w-dyn-item">
                                <a
                                  href={`/${locale}/authors/emil-qurbanov`}
                                  className="article_specs-author w-inline-block"
                                >
                                  <div className="article_author-avatar">
                                    <img
                                      src="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69fd8ce9412d4296bff1111a_Emil%20Qurbanov.webp"
                                      loading="lazy"
                                      alt="Emil Qurbanov"
                                      className="fullwidth-img"
                                    />
                                  </div>
                                  <div className="article_author-content">
                                    <div className="text-color-blue400">
                                      Emil Qurbanov
                                    </div>
                                    <div className="text-size-small">
                                      Satış üzrə Menecer
                                    </div>
                                  </div>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          fs-copyclip-element="copy-this"
                          className="article_copy-text"
                        >
                          This is some text inside of a div block.
                        </div>
                      </div>

                      <div>
                        <div className="article_richtext no-animate w-richtext">
                          <p>
                            Hər kəsin büdcəsi fərqlidir, amma daşınmaz əmlak
                            bazarı daxilindəki tendensiyalar bizə müəyyən
                            rəqəmlər diktə edir. Adətən, ilkin ödəniş faizi
                            layihədən və ödəniş növündən (daxili kredit və ya
                            ipoteka) asılı olaraq dəyişir. Bakıda mənzil almaq
                            istəyirsinizsə, minimum 20-30% ilkin ödənişə hazır
                            olmalısınız. Bəzən kampaniyalar çərçivəsində ilkin
                            ödənişli mənzillər daha aşağı - 10% ilə də təklif
                            oluna bilir, lakin bu zaman aylıq ödənişlərin bir
                            qədər yüksək olacağını nəzərə almalısınız. İlkin
                            ödənişin miqdarı seçilən layihə, kredit növü və
                            ödəniş planına görə dəyişir. Daha aşağı ilkin ödəniş
                            aylıq ödənişlərin artmasına səbəb olur, yüksək ilkin
                            ödəniş isə ümumi maliyyə yükünü azaldır. <br />
                          </p>
                          <h2>
                            <strong>
                              Bakıda mənzil qiymətləri nə qədərdir və artım
                              gözlənilirmi?
                            </strong>
                          </h2>
                          <p>
                            Bəli, Bakıda mənzil qiymətləri artımı trendindədir.
                            Bunun əsas səbəbləri:
                          </p>
                          <ul role="list">
                            <li>Tikinti materiallarının bahalaşması</li>
                            <li>Torpaq sahələrinin azalması</li>
                            <li>İnfrastrukturun inkişafı</li>
                          </ul>
                          <p>
                            Tez-tez müraciət edib soruşurlar: &quot;Bakıda ev
                            qiymətləri artacaqmı?&quot; Səmimi deyəcəyəm,
                            daşınmaz əmlak qiymətləri yerində saymır. Xüsusilə
                            infrastrukturun inkişaf etdiyi ərazilərdə qiymət
                            artımı qaçılmazdır. Bakıda yeni tikili qiymətləri
                            hazırda tikinti materiallarının bahalaşması və
                            şəhərin mərkəzində boş torpaq sahələrinin azalması
                            səbəbindən yüksələn xətt üzrə gedir. Qiymət
                            aralıqları yerləşdiyi rayona görə dəyişir, amma mən
                            həmişə müştərilərimə deyirəm: &quot;Əgər büdcəniz
                            imkan verirsə, bu gün almaq sabah almaqdan daha
                            qazanclıdır&quot;.
                          </p>
                          <figure
                            style={{ maxWidth: "1672px" }}
                            className="w-richtext-align-fullwidth w-richtext-figure-type-image"
                          >
                            <div>
                              <img
                                alt=""
                                src="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69fd9716275a8625e0442bb4_emil%20blog%20img1.webp"
                                loading="lazy"
                              />
                            </div>
                          </figure>
                          <h3>
                            <strong>
                              İlkin ödənişlə mənzil almağın üstünlükləri
                            </strong>
                          </h3>
                          <ul role="list">
                            <li>Borc yükü azalır</li>
                            <li>Faiz xərcləri aşağı düşür</li>
                            <li>Maliyyə stressi minimum olur</li>
                            <li>Seçim imkanları artır</li>
                          </ul>
                          <p>İlkin ödəniş yalnız giriş deyil, strategiyadır.</p>
                          <h2>
                            <strong>
                              Bakıda investisiya üçün ən doğru seçim: Sea Breeze
                            </strong>
                          </h2>
                          <p>
                            Əgər məqsədiniz sadəcə yaşamaq deyil, həm də Bakıda
                            investisiya etməkdirsə, mənim bir nömrəli tövsiyəm
                            həmişə Sea Breeze layihəsidir. Sea Breeze
                            investisiya baxımından hazırda Azərbaycanın ən
                            cəlbedici nöqtəsidir. Niyə? Çünki burada daşınmaz
                            əmlak sadəcə divarlar deyil, həm də bir həyat
                            tərzidir.
                          </p>
                          <p>
                            Sea Breeze mənzilləri həm kirayə potensialı, həm də
                            dəyər artımı baxımından liderdir. Sea Breeze-də
                            qiymətlər layihənin prestijinə və təqdim etdiyi
                            imkanlara görə çox rəqabətqabiliyyətlidir. Sea
                            Breeze ərazisində mənzil alışı etdiyiniz zaman, siz
                            əslində hər keçən gün dəyəri artan bir aktivə sahib
                            olursunuz. Sea Breeze mənzil qiymətləri və Sea
                            Breeze-də yüksək gəlirli layihələr haqqında daha
                            detallı məlumatı biz, yəni TREVA real estate
                            komandası olaraq sizə təqdim edə bilərik.
                          </p>
                          <figure
                            style={{ maxWidth: "1672px" }}
                            className="w-richtext-align-fullwidth w-richtext-figure-type-image"
                          >
                            <div>
                              <img
                                alt=""
                                src="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69fd97350ec24e311b1a6ce1_emil%20blog%20img2.webp"
                                loading="lazy"
                              />
                            </div>
                          </figure>
                          <h2>
                            <strong>
                              Niyə mənzil almaq ilkin ödənişlə daha sərfəlidir?
                            </strong>
                          </h2>
                          <p>
                            Mənzil almaq ilkin ödənişlə həm psixoloji, həm də
                            maliyyə baxımından sizi rahatladır. Nə qədər çox
                            ilkin ödəniş etsəniz, gələcək borc yükünüz bir o
                            qədər az olar. Bakıda ən yaxşı layihələr üzrə seçim
                            edərkən, biz TREVA real estate olaraq sizə ən uyğun
                            ödəniş planını tapmağa kömək edirik. Real estate
                            dünyası mürəkkəb görünə bilər, amma doğru tərəfdaşla
                            hər şey sadədir.
                          </p>
                          <p>&nbsp;</p>
                          <p>
                            Sea Breeze-də mənzil almaq və ya ümumiyyətlə
                            daşınmaz əmlak satışı ilə bağlı hər hansı sualınız
                            yaranarsa, mən və komandamız sizə kömək etməyə
                            hazırıq. Unutmayın, ev almaq sadəcə alış-veriş
                            deyil, gələcəyə qoyulan ən böyük addımdır.
                          </p>
                          <h3>
                            <strong>
                              İlkin ödəniş minimum nə qədər ola bilər?
                            </strong>
                          </h3>
                          <p>
                            Adətən 20%, lakin kampaniyalarda 10%-ə qədər düşə
                            bilər.
                          </p>
                          <h3>
                            <strong>İlkin ödəniş az olsa nə baş verir?</strong>
                          </h3>
                          <p>
                            Aylıq ödəniş artır və ümumi kredit yükü yüksəlir.
                          </p>
                          <h3>
                            <strong>İpoteka ilə ilkin ödəniş fərqlidir?</strong>
                          </h3>
                          <p>
                            Bəli, ipoteka zamanı bank şərtlərinə görə dəyişir.
                          </p>
                          <h3>
                            <strong>İlkin ödəniş nə qədər optimaldır?</strong>
                          </h3>
                          <p>20–30% ən balanslı seçim hesab olunur.</p>
                          <p>‍</p>
                        </div>
                        <SliderEmptyState />
                      </div>
                    </div>
                  </div>

                  <div className="article_sidebar">
                    <div className="article_sidebar-featured">
                      <div className="article_sidebar-top">
                        <h3 className="heading-style-h3-small no-animate">
                          Seçilmiş məqalələr
                        </h3>
                      </div>
                      <div className="w-dyn-list">
                        <div
                          role="list"
                          className="article_sidebar-list w-dyn-items"
                        >
                          {sidebarArticles.map((item) => (
                            <div
                              key={item.href}
                              role="listitem"
                              className="w-dyn-item"
                            >
                              <a
                                href={articleHref(locale, item.href)}
                                className="article_sidebar-link w-inline-block"
                              >
                                <div className="article_sidebar-img">
                                  <img
                                    src={item.image}
                                    loading="lazy"
                                    alt=""
                                    className="fullwidth-img ease0-6"
                                  />
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
                        <a
                          data-wf--button--variant="blue"
                          href={`/${locale}/pulse`}
                          className="button w-inline-block"
                        >
                          <div className="svg-code" />
                          <div className="button-text-wrap">
                            <div className="button-text">Bütün məqalələr</div>
                            <div className="button-text">Bütün məqalələr</div>
                          </div>
                        </a>
                      </div>
                    </div>

                    <div className="article_newsletter">
                      <div className="article_sidebar-top">
                        <h3 className="heading-style-h3-small no-animate">
                          Xəbər bülletenimizə abunə olun
                        </h3>
                      </div>
                      <div className="article_form-block w-form">
                        <form
                          id="wf-form-Newsletter-Form"
                          name="wf-form-Newsletter-Form"
                          data-name="Newsletter Form"
                          method="get"
                          className="article_form"
                        >
                          <input
                            className="article_input-field w-input"
                            maxLength={256}
                            name="email"
                            data-name="Email"
                            placeholder="E-poçt ünvanı"
                            type="email"
                            id="email"
                            required
                          />
                          <input
                            type="submit"
                            data-wait="Please wait..."
                            className="article_submit-btn w-button"
                            value="Abunə ol"
                          />
                        </form>
                        <div className="cs_form-success w-form-done">
                          <div>Thank you! we received Your submission</div>
                        </div>
                        <div className="cs_error w-form-fail">
                          <div>Oops! Something went wrong</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section_f-articles">
          <div className="global-padding padding-section-medium">
            <div className="container-large">
              <div className="f-articles_component">
                <div className="f-articles_intro">
                  <div className="max-width-48rem">
                    <h2 className="heading-style-h2-medium">
                      PULSE-da hər həftə yeni məlumatları oxumağa davam edin
                    </h2>
                  </div>
                  <div>(Məqalələrimiz)</div>
                </div>
                <div className="f-articles_wrap">
                  <div
                    id="w-node-_9d442883-6aab-bc11-4ae2-d5040445203a-667a2348"
                    className="f-articles_holder"
                  >
                    <div className="w-dyn-list">
                      <div
                        fs-list-load="infinite"
                        fs-list-element="list"
                        role="list"
                        className="f-articles_list w-dyn-items"
                      >
                        {featuredArticles.map((item) => (
                          <div
                            key={item.href}
                            role="listitem"
                            className="f-articles_item w-dyn-item"
                          >
                            <a
                              href={articleHref(locale, item.href)}
                              aria-current={
                                item.href === articleSlug ? "page" : undefined
                              }
                              className={`f-articles_link w-inline-block${
                                item.href === articleSlug ? " w--current" : ""
                              }`}
                            >
                              <div className="f-articles_img-wrap">
                                <div className="news_middle-img-holder">
                                  <img
                                    src={item.image}
                                    loading="lazy"
                                    alt={item.title}
                                    sizes={item.srcSet ? "100vw" : undefined}
                                    srcSet={item.srcSet}
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
                                  <div className="news_specs-wrap">
                                    <div className="news_category-label">
                                      <div
                                        fs-list-fuzzy="20"
                                        fs-list-field="category"
                                        fs-list-operator="equal"
                                      >
                                        {item.category}
                                      </div>
                                    </div>
                                    <div>{item.date}</div>
                                  </div>
                                  <h2
                                    fs-list-field="title"
                                    fs-list-operator="equal"
                                    fs-list-fuzzy="20"
                                    className="f-articles_title no-animate"
                                  >
                                    {item.title}
                                  </h2>
                                </div>
                                <div
                                  className={`news_author-wrap${
                                    item.author ? "" : " w-condition-invisible"
                                  }`}
                                >
                                  <div
                                    className={`news_author-headshot${
                                      item.author
                                        ? ""
                                        : " w-condition-invisible"
                                    }`}
                                  >
                                    <img
                                      src={
                                        item.authorImage ??
                                        "https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg"
                                      }
                                      loading="lazy"
                                      alt={item.author ?? ""}
                                      className={`fullwidth-img${
                                        item.author ? "" : " w-dyn-bind-empty"
                                      }`}
                                    />
                                  </div>
                                  <div
                                    fs-list-operator="equal"
                                    fs-list-field="author"
                                    fs-list-fuzzy="20"
                                    className={
                                      item.author
                                        ? undefined
                                        : "w-dyn-bind-empty"
                                    }
                                  >
                                    {item.author}
                                  </div>
                                </div>
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
      </main>

      <HomeFooter locale={locale} />
    </div>
  );
};

export default PulseArticleDetail;
