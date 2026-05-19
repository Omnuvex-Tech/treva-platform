"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import { Project } from "@/lib/project.types";
import "./villa-siena.css";

import { ButtonText } from '@/app/components/ButtonText';
/* eslint-disable @next/next/no-img-element */

interface ProjectDetailProps {
  locale: string;
  project: Project;
}

const ProjectOverviewItem: React.FC<{
  number: string;
  title: string;
  content: string;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ number, title, content, isOpen, onToggle }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`project-overview_dropdown animate-right ${isOpen ? "is-open" : ""}`}>
      <div className="project-overview_toggle" onClick={onToggle}>
        <div className="project-overview_title">
          <div className="services_item-title">
            <div className="project-overview_number">({number})</div>
            <div className="text-color-blue400">{title}</div>
          </div>
          <div className="services_icon w-embed">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.1879 5.5V14.4375C17.1879 14.6198 17.1154 14.7947 16.9865 14.9236C16.8576 15.0526 16.6827 15.125 16.5004 15.125C16.318 15.125 16.1432 15.0526 16.0142 14.9236C15.8853 14.7947 15.8129 14.6198 15.8129 14.4375V7.15945L5.98679 16.9864C5.85779 17.1154 5.68282 17.1879 5.50038 17.1879C5.31794 17.1879 5.14298 17.1154 5.01398 16.9864C4.88497 16.8574 4.8125 16.6824 4.8125 16.5C4.8125 16.3176 4.88497 16.1426 5.01398 16.0136L14.8409 6.1875H7.56288C7.38055 6.1875 7.20568 6.11507 7.07675 5.98614C6.94782 5.8572 6.87538 5.68234 6.87538 5.5C6.87538 5.31766 6.94782 5.1428 7.07675 5.01386C7.20568 4.88493 7.38055 4.8125 7.56288 4.8125H16.5004C16.6827 4.8125 16.8576 4.88493 16.9865 5.01386C17.1154 5.1428 17.1879 5.31766 17.1879 5.5Z" fill="#4C525E"/>
            </svg>
          </div>
        </div>
      </div>
      <div 
        className="project-overview_nav" 
        ref={contentRef}
        style={{ 
          height: isOpen ? (contentRef.current?.scrollHeight || 0) + "px" : "0px",
          opacity: isOpen ? 1 : 0,
          overflow: "hidden",
          transition: "height 0.3s ease, opacity 0.3s ease"
        }}
      >
        <p className="project-overview_bio">{content}</p>
      </div>
    </div>
  );
};

const ProjectDetail: React.FC<ProjectDetailProps> = ({ locale, project }) => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="page-wrapper">
      <Navbar locale={locale} />
      
      <main className="main-wrapper">
        <section className="section_header">
          <div className="global-padding">
            <div className="container-large">
              <div className="header_component">
                <div className="header_wrap">
                  <div className="header_content-wrap">
                    <div className="max-width-48rem is-az">
                      <h1>{project.heroTitle}</h1>
                    </div>
                    <div className="header_cta-block is-small-top animate-up">
                      <Link href={`/${locale}/projects`} className="project_back-btn w-inline-block">
                        <div className="icon-small ease0-3 w-embed">
                          <svg width="0.75rem" height="0.75rem" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.326388 5.17449L4.57005 0.93083C4.65663 0.844254 4.77405 0.795617 4.89649 0.795617C5.01892 0.795617 5.13635 0.844254 5.22292 0.930831C5.3095 1.01741 5.35814 1.13483 5.35814 1.25727C5.35814 1.3797 5.3095 1.49713 5.22292 1.5837L1.76719 5.03943L11.0988 5.03902C11.2213 5.03902 11.3388 5.08769 11.4254 5.17431C11.512 5.26094 11.5607 5.37842 11.5607 5.50093C11.5607 5.62344 11.512 5.74092 11.4254 5.82755C11.3388 5.91417 11.2213 5.96284 11.0988 5.96284L1.76719 5.96243L5.22292 9.41816C5.3095 9.50473 5.35814 9.62216 5.35814 9.74459C5.35814 9.86703 5.3095 9.98445 5.22292 10.071C5.13635 10.1576 5.01893 10.2062 4.89649 10.2062C4.77405 10.2062 4.65663 10.1576 4.57005 10.071L0.326388 5.82737C0.239812 5.74079 0.191175 5.62337 0.191174 5.50093C0.191175 5.37849 0.239812 5.26107 0.326388 5.17449Z" fill="#17191C"/>
                          </svg>
                        </div>
                        <ButtonText>bütün layihələr</ButtonText>
                      </Link>
                      <div className="header_cta-wrap">
                        <a href={project.externalLink} target="_blank" rel="noreferrer" className="button project_external-btn w-inline-block">
                          <div className="button-icon-wrap w-embed">
                            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8.30995 0.807353V6.8088C8.30995 6.93124 8.26131 7.04866 8.17474 7.13524C8.08816 7.22181 7.97074 7.27045 7.8483 7.27045C7.72587 7.27045 7.60844 7.22181 7.52187 7.13524C7.43529 7.04866 7.38665 6.93124 7.38665 6.8088L7.38665 1.92166L0.788524 8.52036C0.701899 8.60699 0.584412 8.65566 0.461906 8.65566C0.339401 8.65566 0.221913 8.60699 0.135289 8.52036C0.048665 8.43374 0 8.31625 0 8.19375C0 8.07124 0.048665 7.95376 0.135289 7.86713L6.73399 1.269L1.84686 1.269C1.72442 1.269 1.607 1.22036 1.52042 1.13379C1.43384 1.04721 1.38521 0.92979 1.38521 0.807353C1.38521 0.684916 1.43384 0.567493 1.52042 0.480917C1.607 0.394341 1.72442 0.345703 1.84686 0.345703L7.8483 0.345703C7.97074 0.345703 8.08816 0.394341 8.17474 0.480917C8.26131 0.567493 8.30995 0.684916 8.30995 0.807353Z" fill="currentcolor"/>
                            </svg>
                          </div>
                          <ButtonText>Sayta daxil olun</ButtonText>
                        </a>
                        <Link href={`/${locale}/contacts`} className="button w-variant-bc0192ac-8f77-bda0-587a-2ac5ad6e5e49 w-inline-block">
                          <ButtonText>sorğu göndərin</ButtonText>
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="header_video-wrap img-reveal">
                    <img 
                      src={project.heroImage} 
                      loading="lazy" 
                      width="1360" 
                      alt={project.heroAlt} 
                      className="fullwidth-img is-80-top"
                    />
                    <div className="img-cover"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="section_project-overview">
          <div className="global-padding padding-section-large">
            <div className="container-large">
              <div className="project-overview_component">
                <div className="project-overview_intro">
                  <div className="max-width-60rem is-az">
                    <h2>{project.overviewTitle}</h2>
                  </div>
                  <p className="project-overview_label">{project.overviewLabel}</p>
                </div>
                <div className="project-overview_wrap">
                  <div className="note_wrap is-wide">
                    <p>
                      ƏLAVƏ MƏLUMAT ÜÇÜN<br/>
                      Satış komandası ilə <Link href={`/${locale}/contacts`} className="text-style-underline text-color-blue400">əlaqə saxlayın</Link>
                    </p>
                  </div>
                  <div className="project-overview_content-wrap">
                    <div className="project-overview_list">
                      {project.overviewItems.map((item, index) => (
                        <ProjectOverviewItem 
                          key={item.number}
                          number={item.number} 
                          title={item.title} 
                          content={item.content}
                          isOpen={openIndex === index}
                          onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="project-overview_gallery-wrap">
                  <div className="project-overview_gallery-2col">
                    <div className="project-overview_gallery-img img-reveal">
                      <img src={project.overviewGallery[0]} loading="lazy" alt="Gallery 1" className="fullwidth-img" />
                      <div className="img-cover"></div>
                    </div>
                    <div className="project-overview_gallery-img img-reveal">
                      <img src={project.overviewGallery[1]} loading="lazy" alt="Gallery 2" className="fullwidth-img" />
                      <div className="img-cover"></div>
                    </div>
                  </div>
                  <div className="project-overview_gallery-1col">
                    <div className="project-overview_gallery-img img-reveal">
                      <img src={project.overviewGallery[2]} loading="lazy" alt="Gallery 3" className="fullwidth-img" />
                      <div className="img-cover"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section_details bg-color-blue100 parallax-reveal">
          <div className="global-padding padding-section-large">
            <div className="container-large">
              <div className="details_component">
                <div className="details_intro-wrap">
                  <p className="text-color-white60">(layihə detalları)</p>
                  <div className="max-width-49rem">
                    <h2 className="heading-style-h2-small text-color-white">{project.detailsTitle}</h2>
                  </div>
                </div>
                <div className="details_wrap">
                  {project.detailsRows.map((row, index) => (
                    <div key={index} className="details_row animate-up">
                      <div className="text-color-white60">{row.label}</div>
                      <div>{row.value}</div>
                    </div>
                  ))}
                </div>
                <div className="details_contact-wrap">
                  <div className="connect_contact-block animate-up">
                    <div>Sosial media</div>
                    <div className="connect_list-wrap">
                      {project.socialLinks.instagram && (
                        <a aria-label="go to instagram" href={project.socialLinks.instagram} target="_blank" rel="noreferrer" className="connect_link-wrap w-inline-block">
                          <div className="connect_link-text">Instagram</div>
                          <div className="icon-slide-wrap">
                            <div className="icon-slide icon-large w-embed">
                              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.1859 5.5V14.4375C17.1859 14.6198 17.1135 14.7947 16.9846 14.9236C16.8556 15.0526 16.6808 15.125 16.4984 15.125C16.3161 15.125 16.1412 15.0526 16.0123 14.9236C15.8834 14.7947 15.8109 14.6198 15.8109 14.4375V7.15945L5.98484 16.9864C5.85583 17.1154 5.68087 17.1879 5.49843 17.1879C5.31599 17.1879 5.14103 17.1154 5.01202 16.9864C4.88302 16.8574 4.81055 16.6824 4.81055 16.5C4.81055 16.3176 4.88302 16.1426 5.01202 16.0136L14.839 6.1875H7.56093C7.37859 6.1875 7.20372 6.11507 7.07479 5.98614C6.94586 5.8572 6.87343 5.68234 6.87343 5.5C6.87343 5.31766 6.94586 5.1428 7.07479 5.01386C7.20568 4.88493 7.38055 4.8125 7.56093 4.8125H16.4984C16.6808 4.8125 16.8556 4.88493 16.9846 5.01386C17.1135 5.1428 17.1859 5.31766 17.1859 5.5Z" fill="white"/>
                              </svg>
                            </div>
                          </div>
                        </a>
                      )}
                      {project.socialLinks.tiktok && (
                        <a aria-label="go to tiktok" href={project.socialLinks.tiktok} target="_blank" rel="noreferrer" className="connect_link-wrap w-inline-block">
                          <div className="connect_link-text">tiktok</div>
                          <div className="icon-slide-wrap">
                            <div className="icon-slide icon-large w-embed">
                              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.1859 5.5V14.4375C17.1859 14.6198 17.1135 14.7947 16.9846 14.9236C16.8556 15.0526 16.6808 15.125 16.4984 15.125C16.3161 15.125 16.1412 15.0526 16.0123 14.9236C15.8834 14.7947 15.8109 14.6198 15.8109 14.4375V7.15945L5.98484 16.9864C5.85583 17.1154 5.68087 17.1879 5.49843 17.1879C5.31599 17.1879 5.14103 17.1154 5.01202 16.9864C4.88302 16.8574 4.81055 16.6824 4.81055 16.5C4.81055 16.3176 4.88302 16.1426 5.01202 16.0136L14.839 6.1875H7.56093C7.37859 6.1875 7.20372 6.11507 7.07479 5.98614C6.94586 5.8572 6.87343 5.68234 6.87343 5.5C6.87343 5.31766 6.94586 5.1428 7.07479 5.01386C7.20568 4.88493 7.38055 4.8125 7.56093 4.8125H16.4984C16.6808 4.8125 16.8556 4.88493 16.9846 5.01386C17.1135 5.1428 17.1859 5.31766 17.1859 5.5Z" fill="white"/>
                              </svg>
                            </div>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="connect_contact-block animate-up">
                    <div>kəşf et</div>
                    <div className="connect_list-wrap">
                      {project.videoLink && (
                        <a href={project.videoLink} className="connect_link-wrap w-inline-block">
                          <div className="connect_link-text">Layihənin videosunu izləyin</div>
                        </a>
                      )}
                      <Link href={`/${locale}/contacts`} className="connect_link-wrap w-inline-block">
                        <div className="connect_link-text">Satışla əlaqə saxlayın</div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section_cta bg-color-white">
          <div className="global-padding padding-section-xlarge">
            <div className="container-large">
              <div className="cta_component">
                <div className="cta_wrap">
                  <div className="cta_content">
                    <h2 className="cta_heading">Tərəfdaşlığa <em>hazırsınız?</em></h2>
                    <div className="button-group">
                      <Link href={`/${locale}/contacts#get-in-touch`} className="button contact_cta-action-button contact_cta-action-button--primary">
                        <ButtonText className="elaqe-saxlayin">Əlaqə saxlayın</ButtonText>
                      </Link>
                      <Link href={`/${locale}/brokers#broker-registration`} className="button contact_cta-action-button contact_cta-action-button--secondary">
                        <ButtonText className="elaqe-saxlayin">Şəbəkəmizə qoşulun</ButtonText>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="cta_bg-wrap">
            <div className="cta_bg-top is-consultation">
              <div className="cta_img-wrap is-top-left is-az">
                <img src={project.ctaImages[0]} alt="CTA 1" className="fullwidth-img" />
              </div>
              <div className="cta_img-wrap is-top-right is-az">
                <img src={project.ctaImages[1]} alt="CTA 2" className="fullwidth-img" />
              </div>
            </div>
            <div className="cta_bg-middle is-consultation">
              <div className="cta_img-wrap is-middle-right">
                <img src={project.ctaImages[2]} alt="CTA 3" className="fullwidth-img" />
              </div>
            </div>
            <div className="cta_bg-bottom is-consultation">
              <div className="cta_img-wrap is-bottom-left">
                <img src={project.ctaImages[3]} alt="CTA 4" className="fullwidth-img" />
              </div>
              <div className="cta_img-wrap is-bottom-right">
                <img src={project.ctaImages[4]} alt="CTA 5" className="fullwidth-img" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <HomeFooter locale={locale} />
    </div>
  );
};

export default ProjectDetail;
