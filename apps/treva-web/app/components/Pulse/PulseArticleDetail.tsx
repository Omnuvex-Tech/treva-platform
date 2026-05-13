"use client";

import React, { useEffect } from "react";
import Script from "next/script";
import Navbar from "@/app/components/Navbar/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import "./pulse-article.css";

declare global {
  interface Window {
    gsap?: any;
    ScrollTrigger?: any;
    SplitText?: any;
  }
}

type PulseArticleDetailProps = {
  locale: string;
};

const PulseArticleDetail: React.FC<PulseArticleDetailProps> = ({ locale }) => {
  const initGSAP = () => {
    if (typeof window === "undefined") return;
    const { gsap, ScrollTrigger, SplitText } = window;
    if (!gsap || !ScrollTrigger || !SplitText) return;

    gsap.registerPlugin(ScrollTrigger, SplitText);

    // Initial state
    gsap.to("body", { autoAlpha: 1, duration: 0.3 });

    // Animate UP/DOWN/RIGHT/FADE
    const getAttr = (el: Element, name: string, fallback: number) => {
      return el.hasAttribute(name)
        ? parseFloat(el.getAttribute(name) ?? `${fallback}`)
        : fallback;
    };

    const animTypes = [
      { cls: ".animate-up", y: 40, x: 0 },
      { cls: ".animate-down", y: -40, x: 0 },
      { cls: ".animate-right", y: 0, x: -40 },
      { cls: ".animate-fade", y: 0, x: 0 },
    ];

    animTypes.forEach(({ cls, y, x }) => {
      document.querySelectorAll(cls).forEach((el: any) => {
        const duration = getAttr(el, "data-gsap-duration", 0.8);
        const delay = getAttr(el, "data-gsap-delay", 0.1);
        const animProps: any = {
          opacity: 0,
          duration,
          delay,
          ease: "power2.out",
        };
        if (y !== 0) animProps.y = y;
        if (x !== 0) animProps.x = x;

        if (el.classList.contains("animate-instant")) {
          gsap.from(el, animProps);
        } else {
          gsap.from(el, {
            ...animProps,
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          });
        }
      });
    });

    // Article Cover Parallax
    const coverWrapper = document.querySelector(".article_cover-img-wrap");
    const cover = document.querySelector(".article_cover-img");
    if (coverWrapper && cover) {
      gsap.set(cover, { opacity: 1, yPercent: 0 });
      gsap.timeline({
        scrollTrigger: {
          trigger: coverWrapper,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }).to(cover, {
        yPercent: 20,
        ease: "none",
      });
    }
  };

  useEffect(() => {
    const handleLoad = () => {
      // setTimeout(initGSAP, 200);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  return (
    <div className="page-wrapper">
      <Script
        src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          // if (window.gsap && window.ScrollTrigger && window.SplitText) {
          //   initGSAP();
          // }
        }}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          // if (window.gsap && window.ScrollTrigger && window.SplitText) {
          //   initGSAP();
          // }
        }}
      />
      <Script
        src="https://cdn.prod.website-files.com/gsap/3.15.0/SplitText.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          // if (window.gsap && window.ScrollTrigger && window.SplitText) {
          //   initGSAP();
          // }
        }}
      />
      <style jsx global>{`
        .section_article .container,
        .section_f-articles .container {
          max-width: 1440px !important;
          width: 100%;
          margin: 0 auto;
        }
        .article_specs-sticky {
          width: 12rem;
          flex: none;
        }
        .article_body {
          display: flex;
          gap: 3.5rem;
          align-items: flex-start;
        }
      `}</style>
      <Navbar locale={locale} />
      <div className="main-wrapper">
        <section className="section_article">
          <div className="padding-section-medium">
            <div className="container">
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
                      <div className="img-cover"></div>
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
                                    <div className="text-color-blue400">Emil Qurbanov</div>
                                    <div className="text-size-small">Satış üzrə Menecer</div>
                                  </div>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div fs-copyclip-element="copy-this" className="article_copy-text">
                          This is some text inside of a div block.
                        </div>
                      </div>
                      <div>
                        <div className="article_richtext no-animate w-richtext">
                          <p>
                            Hər kəsin büdcəsi fərqlidir, amma daşınmaz əmlak bazarı daxilindəki
                            tendensiyalar bizə müəyyən rəqəmlər diktə edir. Adətən, ilkin ödəniş
                            faizi layihədən və ödəniş növündən (daxili kredit və ya ipoteka)
                            asılı olaraq dəyişir. Bakıda mənzil almaq istəyirsinizsə, minimum
                            20-30% ilkin ödənişə hazır olmalısınız. Bəzən kampaniyalar
                            çərçivəsində ilkin ödənişli mənzillər daha aşağı - 10% ilə də təklif
                            oluna bilir, lakin bu zaman aylıq ödənişlərin bir qədər yüksək
                            olacağını nəzərə almalısınız. İlkin ödənişin miqdarı seçilən layihə,
                            kredit növü və ödəniş planına görə dəyişir. Daha aşağı ilkin ödəniş
                            aylıq ödənişlərin artmasına səbəb olur, yüksək ilkin ödəniş isə
                            ümumi maliyyə yükünü azaldır.{" "}
                          </p>
                          <h2>
                            <strong>
                              Bakıda mənzil qiymətləri nə qədərdir və artım gözlənilirmi?
                            </strong>
                          </h2>
                          <p>
                            Bəli, Bakıda mənzil qiymətləri artımı trendindədir. Bunun əsas
                            səbəbləri:
                          </p>
                          <ul role="list">
                            <li>Tikinti materiallarının bahalaşması</li>
                            <li>Torpaq sahələrinin azalması</li>
                            <li>İnfrastrukturun inkişafı</li>
                          </ul>
                          <p>
                            Tez-tez müraciət edib soruşurlar: &quot;Bakıda ev qiymətləri
                            artacaqmı?&quot; Səmimi deyəcəyəm, daşınmaz əmlak qiymətləri yerində
                            saymır. Xüsusilə infrastrukturun inkişaf etdiyi ərazilərdə qiymət
                            artımı qaçılmazdır. Bakıda yeni tikili qiymətləri hazırda tikinti
                            materiallarının bahalaşması və şəhərin mərkəzində boş torpaq
                            sahələrinin azalması səbəbindən yüksələn xətt üzrə gedir. Qiymət
                            aralıqları yerləşdiyi rayona görə dəyişir, amma mən həmişə
                            müştərilərimə deyirəm: &quot;Əgər büdcəniz imkan verirsə, bu gün
                            almaq sabah almaqdan daha qazanclıdır&quot;.
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
                            <strong>İlkin ödənişlə mənzil almağın üstünlükləri</strong>
                          </h3>
                          <ul role="list">
                            <li>Borc yükü azalır</li>
                            <li>Faiz xərcləri aşağı düşür</li>
                            <li>Maliyyə stressi minimum olur</li>
                            <li>Seçim imkanları artır</li>
                          </ul>
                          <p>İlkin ödəniş yalnız giriş deyil, strategiyadır.</p>
                          <h2>
                            <strong>Bakıda investisiya üçün ən doğru seçim: Sea Breeze</strong>
                          </h2>
                          <p>
                            Əgər məqsədiniz sadəcə yaşamaq deyil, həm də Bakıda investisiya
                            etməkdirsə, mənim bir nömrəli tövsiyəm həmişə Sea Breeze
                            layihəsidir. Sea Breeze investisiya baxımından hazırda Azərbaycanın
                            ən cəlbedici nöqtəsidir. Niyə? ├çünki burada daşınmaz əmlak sadəcə
                            divarlar deyil, həm də bir həyat tərzidir.
                          </p>
                          <p>
                            Sea Breeze mənzilləri həm kirayə potensialı, həm də dəyər artımı
                            bakımından liderdir. Sea Breeze-də qiymətlər layihənin prestijinə və
                            təqdim etdiyi imkanlara görə çox rəqabətqabiliyyətlidir. Sea Breeze
                            ərazisində mənzil alışı etdiyiniz zaman, siz əslində hər keçən gün
                            dəyəri artan bir aktivə sahib olursunuz. Sea Breeze mənzil qiymətləri
                            və Sea Breeze-də yüksək gəlirli layihələr haqqında daha detallı
                            məlumatı biz, yəni TREVA real estate komandası olaraq sizə təqdim
                            edə bilərik.
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
                            <strong>Niyə mənzil almaq ilkin ödənişlə daha sərfəlidir?</strong>
                          </h2>
                          <p>
                            Mənzil almaq ilkin ödənişlə həm psixoloji, həm də maliyyə baxımından
                            sizi rahatladır. Nə qədər çox ilkin ödəniş etsəniz, gələcək borc
                            yükünüz bir o qədər az olar. Bakıda ən yaxşı layihələr üzrə seçim
                            edərkən, biz TREVA real estate olaraq sizə ən uyğun ödəniş planını
                            tapmağa kömək edirik. Real estate dünyası mürəkkəb görünə bilər, amma
                            doğru tərəfdaşla hər şey sadədir.
                          </p>
                          <p>&nbsp;</p>
                          <p>
                            Sea Breeze-də mənzil almaq və ya ümumiyyətlə daşınmaz əmlak satışı
                            ilə bağlı hər hansı sualınız yaranarsa, mən və komandamız sizə kömək
                            etməyə hazırıq. Unutmayın, ev almaq sadəcə alış-veriş deyil, gələcəyə
                            qoyulan ən böyük addımdır.
                          </p>
                          <h3>
                            <strong>İlkin ödəniş minimum nə qədər ola bilər?</strong>
                          </h3>
                          <p>Adətən 20%, lakin kampaniyalarda 10%-ə qədər düşə bilər.</p>
                          <h3>
                            <strong>İlkin ödəniş az olsa nə baş verir?</strong>
                          </h3>
                          <p>Aylıq ödəniş artır və ümumi kredit yükü yüksəlir.</p>
                          <h3>
                            <strong>İpoteka ilə ilkin ödəniş fərqlidir?</strong>
                          </h3>
                          <p>Bəli, ipoteka zamanı bank şərtlərinə görə dəyişir.</p>
                          <h3>
                            <strong>İlkin ödəniş nə qədər optimaldır?</strong>
                          </h3>
                          <p>20–30% ən balanslı seçim hesab olunur.</p>
                        </div>
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
                        <div role="list" className="article_sidebar-list w-dyn-items">
                          {[
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
                              title: "Arabian Ranches-də 30/70 Kampaniyası: Aylıq Ödənişsiz Mənzil Sahibi Olun",
                              href: "arabian-ranches-de-30-70-kampaniyasi",
                              image: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03037f2071a1acdd345f50_arabian%2016x9.webp",
                              category: "Kampaniya",
                              date: "12.05.2026"
                            },
                            {
                              title: "Bazarda niyə bəzi developerlər daha sürətli satır?",
                              href: "bazarda-niye-bezi-developerler-daha-suretli-satir",
                              image: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69f2106019e67e1ea891fccf_tural%20necefov%20coverr.webp",
                              category: "Bloq",
                              date: "29.04.2026"
                            }
                          ].map((item, i) => (
                            <div key={i} role="listitem" className="w-dyn-item">
                              <a
                                href={`/${locale}/pulse/${item.href}`}
                                className="article_sidebar-link w-inline-block"
                              >
                                <div className="article_sidebar-img">
                                  <img
                                    src={item.image}
                                    loading="lazy"
                                    alt=""
                                    className="fullwidth-img ease0-6"
                                  />
                                  <div className="projects_overlay hide-tablet">
                                    <div className="news_btn is-small">
                                      <div>Məqaləni oxu</div>
                                    </div>
                                  </div>
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
                          <div className="svg-code">→</div>
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
                        <form id="wf-form-Newsletter-Form" className="article_form">
                          <input
                            className="article_input-field w-input"
                            placeholder="E-poçt ünvanı"
                            type="email"
                            id="email"
                            required
                          />
                          <input
                            type="submit"
                            className="article_submit-btn w-button"
                            value="Abunə ol"
                          />
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section_f-articles">
          <div className="container">
              <div className="f-articles_intro">
                <div className="max-width-48rem">
                  <h2>PULSE-da hər həftə yeni məlumatları oxumağa davam edin</h2>
                  <div className="text-size-small">(Məqalələrimiz)</div>
                </div>
              </div>
              <div className="f-articles_wrap">
                <div className="w-dyn-list">
                  <div role="list" className="f-articles_list w-dyn-items">
                    {[
                      {
                        title: "Panorama By Elie Saab-da 30/70 Kampaniyası: Aylıq Ödənişsiz Eksklüziv İnvestisiya",
                        href: "panorama-by-elie-saab-da-30-70-kampaniyasi",
                        image: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03349150df278a38351b4a_panorama%20aze.webp",
                        category: "Kampaniya",
                        date: "12.05.2026"
                      },
                      {
                        title: "Reportage Heights-də 30/70 Kampaniyası: Aylıq Ödənişsiz Prestijli Həyat",
                        href: "reportage-heights-de-30-70-kampaniyasi-ayliq-odenissiz-prestijli-heyat",
                        image: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03347538e0bfa6ec214d61_reportage%20aze.webp",
                        category: "Kampaniya",
                        date: "12.05.2026"
                      },
                      {
                        title: "Arabian Ranches-də 30/70 Kampaniyası: Aylıq Ödənişsiz Mənzil Sahibi Olun",
                        href: "arabian-ranches-de-30-70-kampaniyasi",
                        image: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03037f2071a1acdd345f50_arabian%2016x9.webp",
                        category: "Kampaniya",
                        date: "12.05.2026"
                      },
                      {
                        title: "Mənzil almaq üçün ilkin ödəniş nə qədər olmalıdır?",
                        href: "menzil-almaq-ucun-ilkin-odenis-ne-qeder-olmalidir",
                        image: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69fd94d16c2f782bfe2b200b_emil%20blog%20cover.webp",
                        category: "Bloq",
                        date: "08.05.2026",
                        author: "Emil Qurbanov",
                        authorImage: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69fdbb3400787a93557e84ca_emil%20qurbanov.webp"
                      },
                      {
                        title: "Bazarda niyə bəzi developerlər daha sürətli satır?",
                        href: "bazarda-niye-bezi-developerler-daha-suretli-satir",
                        image: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69f2106019e67e1ea891fccf_tural%20necefov%20coverr.webp",
                        category: "Bloq",
                        date: "29.04.2026",
                        author: "Tural Nəcəfov",
                        authorImage: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69fdbab1ec67610190ba3293_tural-necefov.webp"
                      },
                      {
                        title: "Bakıda Mənzil Qiymətləri 2026: Sərfəli Layihələr",
                        href: "pulse/bakida-menzil-qiymetleri-2026-serfeli-layiheler.html",
                        image: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e9dc5d25a4d7cb27fafcbc_leyla%20cover.webp",
                        category: "Bloq",
                        date: "23.04.2026",
                        author: "Leyla Bağırzadə",
                        authorImage: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69eb87ce2666e56cda7df5f6_leyla-autor.webp"
                      }
                    ].map((item, i) => (
                      <div key={i} role="listitem" className="f-articles_item w-dyn-item">
                        <a href={`/${locale}/pulse/${item.href}`} className="f-articles_link w-inline-block">
                          <div className="f-articles_img-wrap">
                            <img src={item.image} loading="lazy" alt="" className="fullwidth-img" />
                            <div className="projects_overlay hide-tablet">
                              <div className="news_btn">
                                <div>Məqaləni oxu</div>
                              </div>
                            </div>
                          </div>
                          <div className="f-articles_content">
                            <div className="news_specs-wrap">
                              <div className="news_category-label">
                                <div>{item.category}</div>
                              </div>
                              <div>{item.date}</div>
                            </div>
                            <h3 className="f-articles_title">{item.title}</h3>
                            {item.author && (
                              <div className="author_mini-wrap">
                                {item.authorImage && (
                                  <div className="author_mini-avatar">
                                    <img src={item.authorImage} alt={item.author} className="fullwidth-img" />
                                  </div>
                                )}
                                <div className="text-color-blue400 text-size-small">{item.author}</div>
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
        </section>
        <HomeFooter locale={locale} />
      </div>
    </div>
  );
};

export default PulseArticleDetail;
