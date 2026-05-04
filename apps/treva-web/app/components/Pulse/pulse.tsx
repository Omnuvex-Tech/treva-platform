import Navbar from "@/app/components/Navbar/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import "./pulse.css";

type PulseProps = {
  locale: string;
};

type Article = {
  title: string;
  href: string;
  category: string;
  date: string;
  author?: string;
  image: string;
  authorImage?: string;
};

const articles: Article[] = [
  {
    title: "Bakıda Daşınmaz Əmlakda Satış Uğurunu Nə Müəyyən Edir?",
    href: "pulse/bakida-dasinmaz-emlak-satis-ugurunu-ne-mueyyen-edir.html",
    category: "Bloq",
    date: "17.04.2026",
    author: "Cavid Axundov",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e23b2e65222dfa1568b506_javid cover.webp",
    authorImage:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69b1127e23e0494e172f15d1_freepik__keep-everything-exactly-the-same-in-the-image-the-__62478.webp",
  },
  {
    title: "Bakıda İnvestisiya Üçün Ən Uğurlu Layihələr Hansılardır?",
    href: "pulse/bakida-investisiya-ucun-en-ugurlu-layiheler-hansilardir.html",
    category: "Bloq",
    date: "10.04.2026",
    author: "Nəzrin Kərimli",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69d8fa41ad243257771d2882_Nezrin Kerimli cover (1) (1).webp",
    authorImage:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69d8f643447acae0af6ad0cd_Nezrin Kərimli (1).webp",
  },
  {
    title: "İnvestisiya üçün niyə məhz Sea Breeze?",
    href: "pulse/investisiya-ucun-niye-mehz-sea-breeze.html",
    category: "Bloq",
    date: "06.04.2026",
    author: "Türkan Mamedova",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69d387faabd8941c551800fa_turkan cover (1).webp",
    authorImage:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69d39344f03dd689a3df5f48_Turkan Mamedova (1)d.webp",
  },
  {
    title:
      "Satışdan Sonrakı Şəffaflıq: Müştəri Məmnuniyyəti Şirkətin Nüfuzunu Necə Müəyyən Edir?",
    href: "pulse/satisdan-sonraki-seffafliq.html",
    category: "Bloq",
    date: "19.03.2026",
    author: "Səbinə Muxtarova",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69bbea28ae4fb211e7614275_cover sebine.webp",
    authorImage:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69bbd13d1d6e953bdfa53e4f_Sebine.webp",
  },
  {
    title: "Bakı Daşınmaz Əmlak Bazarı: İnvestisiya İmkanları və Off-plan Trendi",
    href: "pulse/baki-dasinmaz-emlak-bazari.html",
    category: "Bloq",
    date: "13.03.2026",
    author: "Batula Mohubbi",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69b419b1ccd29af57469cce0_batula cover.webp",
    authorImage:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69b40fd1699b4c83ff918f97_batula.webp",
  },
  {
    title: "Uğurlu İnvestisiya İmkanı: Marina Village-də Xanımlar üçün 8 Mart Kampaniyası",
    href: "pulse/ugurlu-investisiya-imkani.html",
    category: "Kampaniya",
    date: "06.03.2026",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69aad644a4043868699c2dc8_GÜCLÜ TEKLİF AZ.webp",
  },
  {
    title: "Daşınmaz əmlak almaq istəyən insanlar ilk növbədə nə ilə maraqlanırlar?",
    href: "pulse/dasinmaz-emlak-almaq-isteyen-insanlar-ilk-novbede-ne-ile-maraqlanirlar.html",
    category: "Bloq",
    date: "04.03.2026",
    author: "İlhamə Paşazadə",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69b0356bc47fd3803791ac60_Gemini_Generated_Image_tcieq9tcieq9tcie.webp",
    authorImage:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69a7d6a31b4102cd82150c58_1x1 size qadin (1).webp",
  },
  {
    title: "Treva Real Estate Daşkənddə keçirilən “Dvizhenie” beynəlxalq forumunda iştirak etdi",
    href: "pulse/treva-real-estate-daskendde.html",
    category: "Tədbir",
    date: "24.02.2026",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/699da3a67e74e27a7ab28be0_2 (1).webp",
  },
  {
    title: "Arabian Ranches Sea Breeze-də investisiya edib Dohaya səyahət qazanmaq mümkündürmü?",
    href: "pulse/arabian-ranches-sea-breeze-de-investisiya.html",
    category: "Kampaniya",
    date: "17.02.2026",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69941644ea2d8a06b09eefc2_arabian 16x9 az.webp",
  },
  {
    title: "Daşınmaz əmlak bazarında brokerlərlə işləmək niyə daha aktualdır?",
    href: "pulse/dasinmaz-emlak-bazarinda-brokerlerle-islemek.html",
    category: "Bloq",
    date: "10.02.2026",
    author: "Tərlan Kərimov",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/698b3024d7c6aebd7f7d6138_freepik_medium_shot_of_an_azerbaijani_real_estate_broker_i_96816.webp",
    authorImage:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6989c5263e93fc7d31871a9e_IMAGE.jpeg",
  },
  {
    title: "Sizə uyğun mənzil növü hansıdır?",
    href: "pulse/size-uygun-menzil-novu-hansidir.html",
    category: "Bloq",
    date: "02.02.2026",
    author: "Həcər Nağıyeva",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6985f7a8016aab013f18eb73_Narmin_sazmani_upscale_upscales (1) (1) (1) (1) (1) (1).png",
    authorImage:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69b4284aff4b24810b7251ff_hecer.webp",
  },
  {
    title: "Dəniz mənzərəli townhouse nədir və niyə Sea Breeze-də bu qədər seçilir?",
    href: "pulse/deniz-menzereli-townhouse-nedir.html",
    category: "Bloq",
    date: "22.01.2026",
    author: "Fərid Əlipənahov",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6989e187812b56c36e0e41d1_farid.png",
    authorImage:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6971fdc542706589755deb51_profil photo.webp",
  },
  {
    title: "Yeni ilin sehri Arabian Ranches-də başlayır",
    href: "pulse/the-magic-of-the-new-year-begins-at-arabian-ranches.html",
    category: "Kampaniya",
    date: "01.12.2025",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/693fdfb9f77b1667a95f0007_arabian.avif",
  },
  {
    title: "Panorama by ELIE SAAB — Dubayda eksklüziv launch tədbiri",
    href: "pulse/exclusive-launch-event-in-dubai.html",
    category: "Tədbir",
    date: "18.11.2025",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/695e5cb0a51c55b235b51fbf_Panorama 007.webp",
  },
  {
    title: "Broker X — Azərbaycanda daşınmaz əmlak brokerləri üçün yeni platformanın təqdimatı",
    href: "pulse/a-new-platform-for-real-estate-brokers-in-azerbaijan.html",
    category: "Tədbir",
    date: "24.10.2025",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/694902ab712ca619de7d1ffe_DSC0343611.png",
  },
  {
    title: "Marina Village-də sahilyanı həyat və 10.000 AZN dəyərində xüsusi təklif",
    href: "pulse/marina-village-de-sahilyani-heyat-ve-10000-azn-deyerinde-xususi-teklif.html",
    category: "Kampaniya",
    date: "15.09.2025",
    image:
      "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/695e616d5b02837fd07709da_trevaaa.jpg",
  },
];

const featuredArticle: Article = {
  title: "Bakıda Mənzil Qiymətləri 2026: Sərfəli Layihələr",
  href: "pulse/bakida-menzil-qiymetleri-2026-serfeli-layiheler.html",
  category: "Bloq",
  date: "23.04.2026",
  author: "Leyla Bağırzadə",
  image:
    "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e9dc5d25a4d7cb27fafcbc_leyla cover.webp",
  authorImage:
    "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69eb87ce2666e56cda7df5f6_leyla-autor.webp",
};

const weekArticle: Article = {
  title: "2026 Vizyonu: TREVA və Azərbaycanın Daşınmaz Əmlak Bazarının Sistemli Transformasiyası",
  href: "pulse/2026-baxisi-treva-ve-azerbaycanin-dasinmaz-emlak-bazarinin-sistemli-transformasiyasi.html",
  category: "Bloq",
  date: "26.01.2026",
  image:
    "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/697773c2eeb67ee81daa27ef_Treva 02.webp",
};

const Pulse = ({ locale }: PulseProps) => {
  return (
    <main className="page-wrapper" data-locale={locale}>
      <Navbar locale={locale} />
      <PulseHeaderSection />
      <PulseNewsSection />
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

function NewsCard({ article, variant = "middle" }: { article: Article; variant?: "middle" | "left" | "week" }) {
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
      <a href={article.href} className={linkClass}>
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
      </a>
    </div>
  );
}

function PulseHeaderSection() {
  const leftArticles = articles.slice(0, 2);
  const rightArticles = [featuredArticle, ...articles.slice(0, 3)];

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
                      <NewsCard key={article.href} article={article} variant="left" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="news-header_middle-col">
                <div className="w-dyn-list">
                  <div role="list" className="news_header-list w-dyn-items">
                    <div role="listitem" className="news_header-item w-dyn-item">
                      <a href={featuredArticle.href} className="news-header_middle-link w-inline-block">
                        <div className="news-header_middle-img-wrap">
                          <div className="news_middle-img-holder">
                            <img
                              src={featuredArticle.image}
                              loading="lazy"
                              alt={featuredArticle.title}
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
                            <ArticleMeta category={featuredArticle.category} date={featuredArticle.date} />
                            <h2 className="news-header_middle-title no-animate">{featuredArticle.title}</h2>
                          </div>

                          <AuthorBlock author={featuredArticle.author} authorImage={featuredArticle.authorImage} />
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="news-header_right-col hide-landscape">
                <div className="news_rightcol-list-wrap w-dyn-list">
                  <div role="list" className="news_rightcol-list w-dyn-items">
                    {rightArticles.map((article) => (
                      <div key={article.href} role="listitem" className="news_rightcol-item w-dyn-item">
                        <a href={article.href} className="news_rightcol-link w-inline-block">
                          <div className="news_rightcol-content">
                            <h2 className="news_rightcol-title no-animate">{article.title}</h2>
                            <ArticleMeta category={article.category} date={article.date} />
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="news-header_right-cta-holder">
                  <a href="#all-articles" className="button w-inline-block">
                    <div className="svg-code">→</div>
                    <div className="button-text-wrap">
                      <div className="button-text">Bütün məqalələr</div>
                      <div className="button-text">Bütün məqalələr</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <div className="news-header_cover-wrap hide-landscape">
              <img
                src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/699710b04c3a2e5d52afddc3_Screenshot 2026-02-19 1522sa03.png"
                loading="lazy"
                alt=""
                className="fullwidth-img"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PulseNewsSection() {
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
                      <NewsCard article={weekArticle} variant="week" />
                    </div>
                  </div>
                </div>
              </div>

              <div id="all-articles" className="news_middle-wrap">
                <div className="w-dyn-list">
                  <div role="list" className="news_middle-list w-dyn-items">
                    {articles.map((article) => (
                      <NewsCard key={article.href} article={article} />
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
                        {["Bloq", "Kampaniya", "Tədbir", "Marketinq Kampaniyaları", "Gələcək Tədbirlər", "Analizlər", "Xəbərlər"].map(
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