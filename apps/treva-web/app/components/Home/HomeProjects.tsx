import React from 'react';
import Link from 'next/link';
import "./styles/home.css";

import { ButtonText } from '@/app/components/ButtonText';
// Reusable plus icon to avoid repetition
const PlusIcon = () => (
  <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17.6557 10.4994C17.6557 10.6575 17.5929 10.8092 17.4811 10.921C17.3692 11.0328 17.2176 11.0957 17.0594 11.0957H11.0964V17.0587C11.0964 17.2168 11.0336 17.3685 10.9217 17.4803C10.8099 17.5922 10.6582 17.655 10.5001 17.655C10.3419 17.655 10.1903 17.5922 10.0784 17.4803C9.96662 17.3685 9.90379 17.2168 9.90379 17.0587V11.0957H3.94078C3.78263 11.0957 3.63096 11.0328 3.51914 10.921C3.40731 10.8092 3.34448 10.6575 3.34448 10.4994C3.34448 10.3412 3.40731 10.1895 3.51914 10.0777C3.63096 9.96589 3.78263 9.90306 3.94078 9.90306H9.90379V3.94005C9.90379 3.7819 9.96662 3.63023 10.0784 3.5184C10.1903 3.40657 10.3419 3.34375 10.5001 3.34375C10.6582 3.34375 10.8099 3.40657 10.9217 3.5184C11.0336 3.63023 11.0964 3.7819 11.0964 3.94005V9.90306H17.0594C17.2176 9.90306 17.3692 9.96589 17.4811 10.0777C17.5929 10.1895 17.6557 10.3412 17.6557 10.4994Z"
      fill="white"
    />
  </svg>
);

export const HomeProjects = ({ locale }: { locale: string }) => {
  const baseHref = `/${locale}`;
  return (
    <section className="section_projects-prev home-projects-section">
      <div className="global-padding home-projects-padding padding-section-medium">
        <div className="container-large home-projects-container">
          <div className="projects-prev_component home-projects-component">
            {/* Intro section */}
            <div className="projects-prev_intro-wrap home-projects-intro-wrap">
              <div className="home-projects-label">(portfolio)</div>
              <div className="home-projects-title-wrap is-az">
                <h2 className="heading-style-h2-medium home-projects-title">
                  <span className="heading-gap-h1 home-projects-title-gap">     </span>
                  Bizə şəffaflıq, nəticə və peşəkar yanaşmamıza görə güvənirlər. TREVA ilə
                  əməkdaşlıq edən müştərilərimizin satış və tanınmada necə irəliləyiş qazandıqlarını
                  kəşf edin.
                </h2>
              </div>
            </div>

            {/* Projects list */}
            <div className="home-projects-list-shell w-dyn-list">
              <div role="list" className="projects-prev_wrap home-projects-list w-dyn-items">
                {/* Project 1: Panorama by Elie Saab */}
                <div role="listitem" className="projects-prev_item home-projects-card home-projects-card-panorama img-reveal w-dyn-item">
                  <div className="projects-prev_holder home-projects-card-holder">
                    <div className="projects-prev_img-wrap home-projects-card-image-wrap">
                      <img
                        src="/cdn-assets/7b1a1fd42a-69280b7104d977e586a79fc0_elie-saab-sekil-kesilmis.avif"
                        loading="lazy"
                        alt="Panorama by Elie Saab"
                        sizes="100vw"
                        srcSet="
                          /cdn-assets/44535644af-69280b7104d977e586a79fc0_elie-saab-sekil-kesilmis-p-500.avif 500w,
                          /cdn-assets/854a8ede29-69280b7104d977e586a79fc0_elie-saab-sekil-kesilmis-p-800.avif 800w,
                          /cdn-assets/be2dfe9f15-69280b7104d977e586a79fc0_elie-saab-sekil-kesilmis.avif 1306w
                        "
                        className="fullwidth-img home-projects-card-image ease0-6"
                      />
                    </div>
                    <Link
                      aria-label="go to project"
                      href={`${baseHref}/projects/panorama-by-elie-saab?design=2`}
                      className="projects_overlay home-projects-card-overlay w-inline-block"
                    >
                      <div className="projects_btn home-projects-card-overlay-button">
                        <div className="icon-large home-projects-card-overlay-icon w-embed">
                          <PlusIcon />
                        </div>
                      </div>
                      <div lang="" className="projects_caption home-projects-card-caption">
                        Panorama by Elie Saab
                      </div>
                    </Link>
                    <div className="img-cover home-projects-card-cover bg-color-grey200"></div>
                  </div>
                  <Link
                    aria-label="go to project"
                    href={`${baseHref}/projects/panorama-by-elie-saab?design=2`}
                    className="projects_content-wrap home-projects-card-content show-landscape w-inline-block"
                  >
                    <div fs-list-field="location" className="heading-style-h3 home-projects-card-title text-color-blue400">
                      Panorama by Elie Saab
                    </div>
                    <div fs-list-field="location" className="home-projects-card-location">Sea Breeze</div>
                    <div fs-list-field="status" className="home-projects-card-status hide">
                      Under Development
                    </div>
                  </Link>
                </div>

                {/* Project 2: Reportage Heights */}
                <div role="listitem" className="projects-prev_item home-projects-card home-projects-card-reportage img-reveal w-dyn-item">
                  <div className="projects-prev_holder home-projects-card-holder">
                    <div className="projects-prev_img-wrap home-projects-card-image-wrap">
                      <img
                        src="/cdn-assets/bacbb1fcd7-6926c88132426adc45a95ee0_9744a_reportage_uae_reportage_heights_exteriors_EXT3_final.avif"
                        loading="lazy"
                        alt="Reportage Heights"
                        sizes="100vw"
                        srcSet="
                          /cdn-assets/f66590c035-6926c88132426adc45a95ee0_9744a_reportage_uae_reportage_heights_exteriors_EXT3_final-p-500.avif 500w,
                          /cdn-assets/7e7911b3a5-6926c88132426adc45a95ee0_9744a_reportage_uae_reportage_heights_exteriors_EXT3_final-p-800.avif 800w,
                          /cdn-assets/964d10b1b8-6926c88132426adc45a95ee0_9744a_reportage_uae_reportage_heights_exteriors_EXT3_final-p-1080.avif 1080w,
                          /cdn-assets/bacbb1fcd7-6926c88132426adc45a95ee0_9744a_reportage_uae_reportage_heights_exteriors_EXT3_final.avif 2000w
                        "
                        className="fullwidth-img home-projects-card-image ease0-6"
                      />
                    </div>
                    <Link
                      aria-label="go to project"
                      href={`${baseHref}/projects/reportage-heights?design=2`}
                      className="projects_overlay home-projects-card-overlay w-inline-block"
                    >
                      <div className="projects_btn home-projects-card-overlay-button">
                        <div className="icon-large home-projects-card-overlay-icon w-embed">
                          <PlusIcon />
                        </div>
                      </div>
                      <div lang="" className="projects_caption home-projects-card-caption">
                        Reportage Heights
                      </div>
                    </Link>
                    <div className="img-cover home-projects-card-cover bg-color-grey200"></div>
                  </div>
                  <Link
                    aria-label="go to project"
                    href={`${baseHref}/projects/reportage-heights?design=2`}
                    className="projects_content-wrap home-projects-card-content show-landscape w-inline-block"
                  >
                    <div fs-list-field="location" className="heading-style-h3 home-projects-card-title text-color-blue400">
                      Reportage Heights
                    </div>
                    <div fs-list-field="location" className="home-projects-card-location">Sea Breeze</div>
                    <div fs-list-field="status" className="home-projects-card-status hide">
                      Under Development
                    </div>
                  </Link>
                </div>

                {/* Project 3: Arabian Ranches */}
                <div role="listitem" className="projects-prev_item home-projects-card home-projects-card-arabian-ranches img-reveal w-dyn-item">
                  <div className="projects-prev_holder home-projects-card-holder">
                    <div className="projects-prev_img-wrap home-projects-card-image-wrap">
                      <img
                        src="/cdn-assets/727892c49c-69e0ca6fb39a1d49bd14574e_arabiann-5.webp"
                        loading="lazy"
                        alt="Arabian Ranches"
                        sizes="100vw"
                        srcSet="
                          /cdn-assets/8ec46054d0-69e0ca6fb39a1d49bd14574e_arabiann-5-p-500.webp 500w,
                          /cdn-assets/d7c1b7074b-69e0ca6fb39a1d49bd14574e_arabiann-5-p-800.webp 800w,
                          /cdn-assets/880880508e-69e0ca6fb39a1d49bd14574e_arabiann-5-p-1080.webp 1080w,
                          /cdn-assets/87d5bf081b-69e0ca6fb39a1d49bd14574e_arabiann-5-p-1600.webp 1600w,
                          /cdn-assets/2a359466db-69e0ca6fb39a1d49bd14574e_arabiann-5-p-2000.webp 2000w,
                          /cdn-assets/727892c49c-69e0ca6fb39a1d49bd14574e_arabiann-5.webp 2602w
                        "
                        className="fullwidth-img home-projects-card-image ease0-6"
                      />
                    </div>
                    <Link
                      aria-label="go to project"
                      href={`${baseHref}/projects/arabian-ranches?design=2`}
                      className="projects_overlay home-projects-card-overlay w-inline-block"
                    >
                      <div className="projects_btn home-projects-card-overlay-button">
                        <div className="icon-large home-projects-card-overlay-icon w-embed">
                          <PlusIcon />
                        </div>
                      </div>
                      <div lang="" className="projects_caption home-projects-card-caption">
                        Arabian Ranches
                      </div>
                    </Link>
                    <div className="img-cover home-projects-card-cover bg-color-grey200"></div>
                  </div>
                  <Link
                    aria-label="go to project"
                    href={`${baseHref}/projects/arabian-ranches?design=2`}
                    className="projects_content-wrap home-projects-card-content show-landscape w-inline-block"
                  >
                    <div fs-list-field="location" className="heading-style-h3 home-projects-card-title text-color-blue400">
                      Arabian Ranches
                    </div>
                    <div fs-list-field="location" className="home-projects-card-location">Sea Breeze</div>
                    <div fs-list-field="status" className="home-projects-card-status hide">
                      Under Development
                    </div>
                  </Link>
                </div>

                {/* Project 4: Marina Village */}
                <div role="listitem" className="projects-prev_item home-projects-card home-projects-card-marina-village img-reveal w-dyn-item">
                  <div className="projects-prev_holder home-projects-card-holder">
                    <div className="projects-prev_img-wrap home-projects-card-image-wrap">
                      <img
                        src="/cdn-assets/6c90d80a07-6878c0b5046e1d573cd3b04d_700X800_MARİNA.avif"
                        loading="lazy"
                        alt="Marina Village"
                        sizes="100vw"
                        srcSet="
                          /cdn-assets/aca4359a2f-6878c0b5046e1d573cd3b04d_700X800_MARİNA-p-500.avif 500w,
                          /cdn-assets/a162c90b27-6878c0b5046e1d573cd3b04d_700X800_MARİNA.avif 700w
                        "
                        className="fullwidth-img home-projects-card-image ease0-6"
                      />
                    </div>
                    <Link
                      aria-label="go to project"
                      href={`${baseHref}/projects/marina-village?design=2`}
                      className="projects_overlay home-projects-card-overlay w-inline-block"
                    >
                      <div className="projects_btn home-projects-card-overlay-button">
                        <div className="icon-large home-projects-card-overlay-icon w-embed">
                          <PlusIcon />
                        </div>
                      </div>
                      <div lang="" className="projects_caption home-projects-card-caption">
                        Marina Village
                      </div>
                    </Link>
                    <div className="img-cover home-projects-card-cover bg-color-grey200"></div>
                  </div>
                  <Link
                    aria-label="go to project"
                    href={`${baseHref}/projects/marina-village?design=2`}
                    className="projects_content-wrap home-projects-card-content show-landscape w-inline-block"
                  >
                    <div fs-list-field="location" className="heading-style-h3 home-projects-card-title text-color-blue400">
                      Marina Village
                    </div>
                    <div fs-list-field="location" className="home-projects-card-location">Sea Breeze</div>
                    <div fs-list-field="status" className="home-projects-card-status hide">
                      Under Development
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Call to action */}
            <div className="projects-prev_cta-wrap home-projects-cta-wrap">
              <div className="projects-prev_cta-title home-projects-cta-title-wrap">
                <div className="home-projects-cta-title">Növbəti investisiya fürsətinizi tapmaq üçün layihələrimizi kəşf edin.</div>
              </div>
              <Link data-wf--button--variant="blue" href={`${baseHref}/projects`} className="button home-projects-cta-button w-inline-block">
                <ButtonText>Seçilmiş Layihələri Kəşf Edin</ButtonText>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
