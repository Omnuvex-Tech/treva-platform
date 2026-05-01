import React from 'react';
import Link from 'next/link';
import "./styles/home.css";

// Reusable arrow up icon to avoid repetition
const ArrowUpIcon = () => (
  <svg width="0.75rem" height="0.875rem" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6.12221 0.376368L10.5913 4.84542C10.6824 4.93659 10.7337 5.06025 10.7337 5.18919C10.7337 5.31813 10.6824 5.44179 10.5913 5.53297C10.5001 5.62414 10.3764 5.67536 10.2475 5.67536C10.1186 5.67536 9.99489 5.62414 9.90372 5.53297L6.26445 1.8937L6.26488 11.7209C6.26488 11.8499 6.21363 11.9736 6.1224 12.0648C6.03118 12.1561 5.90745 12.2073 5.77844 12.2073C5.64943 12.2073 5.5257 12.1561 5.43448 12.0648C5.34325 11.9736 5.292 11.8499 5.292 11.7209L5.29243 1.8937L1.65316 5.53297C1.56199 5.62414 1.43833 5.67536 1.30939 5.67536C1.18045 5.67536 1.05679 5.62414 0.965616 5.53297C0.874441 5.44179 0.82322 5.31813 0.82322 5.18919C0.82322 5.06025 0.874441 4.93659 0.965616 4.84542L5.43467 0.376368C5.52584 0.285194 5.6495 0.233973 5.77844 0.233973C5.90738 0.233973 6.03104 0.285194 6.12221 0.376368Z"
      fill="white"
    />
  </svg>
);

const ArrowUpIconCurrent = () => (
  <svg width="0.75rem" height="0.875rem" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6.12221 0.376368L10.5913 4.84542C10.6824 4.93659 10.7337 5.06025 10.7337 5.18919C10.7337 5.31813 10.6824 5.44179 10.5913 5.53297C10.5001 5.62414 10.3764 5.67536 10.2475 5.67536C10.1186 5.67536 9.99489 5.62414 9.90372 5.53297L6.26445 1.8937L6.26488 11.7209C6.26488 11.8499 6.21363 11.9736 6.1224 12.0648C6.03118 12.1561 5.90745 12.2073 5.77844 12.2073C5.64943 12.2073 5.5257 12.1561 5.43448 12.0648C5.34325 11.9736 5.292 11.8499 5.292 11.7209L5.29243 1.8937L1.65316 5.53297C1.56199 5.62414 1.43833 5.67536 1.30939 5.67536C1.18045 5.67536 1.05679 5.62414 0.965616 5.53297C0.874441 5.44179 0.82322 5.31813 0.82322 5.18919C0.82322 5.06025 0.874441 4.93659 0.965616 4.84542L5.43467 0.376368C5.52584 0.285194 5.6495 0.233973 5.77844 0.233973C5.90738 0.233973 6.03104 0.285194 6.12221 0.376368Z"
      fill="currentcolor"
    />
  </svg>
);

type HomeFooterProps = {
  locale?: string;
};

export const HomeFooter = ({ locale = "az" }: HomeFooterProps) => {
  const homeHref = `/${locale}`;
  const contactHref = `/${locale}/contact`;

  return (
    <footer className="footer">
      <section className="section_footer bg-color-blue100 parallax-reveal">
        <div className="global-padding">
          <div className="container-large">
            <div className="footer_component">
              <div className="footer_wrap">
                {/* Navigation columns */}
                <div className="footer_nav-wrap">
                  {/* Site map column */}
                  <div className="footer_col">
                    <div className="text-color-white60">sayt xəritəsi</div>
                    <div className="footer_nav">
                      <Link href={homeHref} aria-current="page" className="footer_link-wrap w-inline-block w--current">
                        <div className="footer_link-content">
                          <div className="footer_link-text">Ana səhifə</div>
                          <div className="footer_link-text">Ana səhifə</div>
                        </div>
                      </Link>
                      <Link href="/projects" className="footer_link-wrap w-inline-block">
                        <div className="footer_link-content">
                          <div className="footer_link-text">Layihələr</div>
                          <div className="footer_link-text">Layihələr</div>
                        </div>
                      </Link>
                      <Link href="/developers" className="footer_link-wrap w-inline-block">
                        <div className="footer_link-content">
                          <div className="footer_link-text">Developerlər</div>
                          <div className="footer_link-text">Developerlər</div>
                        </div>
                      </Link>
                      <Link href="/brokers" className="footer_link-wrap w-inline-block">
                        <div className="footer_link-content">
                          <div className="footer_link-text">Brokerlər</div>
                          <div className="footer_link-text">Brokerlər</div>
                        </div>
                      </Link>
                      <Link href="/pulse" className="footer_link-wrap is-pulse w-inline-block">
                        <div className="footer_link-content">
                          <div className="footer_link-text">pulse</div>
                          <div className="footer_link-text">pulse</div>
                        </div>
                        <span className="red-dot" aria-hidden="true">
                          <span className="red-dot__ping" />
                          <span className="red-dot__core" />
                        </span>
                      </Link>
                      <Link href={contactHref} className="footer_link-wrap w-inline-block">
                        <div className="footer_link-content">
                          <div className="footer_link-text">Əlaqə</div>
                          <div className="footer_link-text">Əlaqə</div>
                        </div>
                      </Link>
                      <Link href="/privacy-policy" className="footer_link-wrap w-inline-block">
                        <div className="footer_link-content">
                          <div className="footer_link-text">Məxfilik Siyasəti</div>
                          <div className="footer_link-text">Məxfilik Siyasəti</div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Social media column */}
                  <div className="footer_col">
                    <div className="text-color-white60">Sosial media</div>
                    <div className="footer_nav">
                      <a
                        href="https://www.linkedin.com/company/trevarealestate"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer_link-wrap w-inline-block"
                      >
                        <div className="footer_link-content">
                          <div className="footer_link-text">Linkedin</div>
                          <div className="footer_link-text">Linkedin</div>
                        </div>
                      </a>
                      <a
                        href="https://www.instagram.com/treva.realestate?igsh=cDY3OTh0b3JyOGZy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer_link-wrap w-inline-block"
                      >
                        <div className="footer_link-content">
                          <div className="footer_link-text">Instagram</div>
                          <div className="footer_link-text">Instagram</div>
                        </div>
                      </a>
                      <a
                        href="https://www.facebook.com/people/Trevarealestate/61576234409540/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer_link-wrap w-inline-block"
                      >
                        <div className="footer_link-content">
                          <div className="footer_link-text">Facebook</div>
                          <div className="footer_link-text">Facebook</div>
                        </div>
                      </a>
                      <a
                        href="https://youtube.com/@trevarealestate?si=zN8KQjIc7UJA7mlY"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer_link-wrap w-inline-block"
                      >
                        <div className="footer_link-content">
                          <div className="footer_link-text">Youtube</div>
                          <div className="footer_link-text">Youtube</div>
                        </div>
                      </a>
                      <a
                        href="https://www.tiktok.com/@treva.realestate?_t=ZS-8y85uLU6heS&_r=1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer_link-wrap w-inline-block"
                      >
                        <div className="footer_link-content">
                          <div className="footer_link-text">Tiktok</div>
                          <div className="footer_link-text">Tiktok</div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Contact section */}
                <div className="footer_contact-wrap">
                  <a href="tel:2662" className="footer_link-wrap is-large w-inline-block">
                    <div className="footer_link-content">
                      <div className="footer_link-text">*2662</div>
                      <div className="footer_link-text">*2662</div>
                    </div>
                  </a>
                  <a href="tel:+994502772662" className="footer_link-wrap is-large w-inline-block">
                    <div className="footer_link-content">
                      <div className="footer_link-text">050-277-2662</div>
                      <div className="footer_link-text">050-277-2662</div>
                    </div>
                  </a>
                  <a href="mailto:info@treva.realestate" className="footer_link-wrap is-large w-inline-block">
                    <div className="footer_link-content">
                      <div className="footer_link-text small-caps">info@treva.realestate</div>
                      <div className="footer_link-text small-caps">info@treva.realestate</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="footer_bottom-wrap">
                <Link href={homeHref} aria-current="page" className="footer_logo-wrap w-inline-block w--current">
                  <img
                    loading="lazy"
                    src="/cdn-assets/c06d6deb09-685d6b08f6dce7040049422e_treva-logo.svg"
                    alt="treva logo"
                  />
                </Link>
                <div className="footer_specs-wrap">
                  <a
                    id="w-node-d6b5acf9-ec8f-922c-e881-4fd1904497b0-9044974f"
                    href="https://www.google.com/maps/place/TREVA+Real+Estate/@40.3517196,49.827273,17z/data=!3m1!4b1!4m6!3m5!1s0x40307dfdbff258c3:0xbf7d738965fd51c4!8m2!3d40.3517197!4d49.8321386!16s%2Fg%2F11xvq3cxhy?entry=ttu&g_ep=EgoyMDI1MDgzMC4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cs_scroll-wrap is-alternate w-inline-block"
                  >
                    <div className="button-text-wrap">
                      <div className="button-text">Baş ofis — Ziya Yusifzade 10, Sabah Residence</div>
                      <div className="button-text">Baş ofis — Ziya Yusifzade 10, Sabah Residence</div>
                    </div>
                  </a>
                  <a href="#top" className="cs_scroll-wrap is-alternate w-inline-block">
                    <div className="button-text-wrap">
                      <div className="button-text">YUXARIYA QAYIT</div>
                      <div className="button-text">YUXARIYA QAYIT</div>
                    </div>
                    <div className="button-icon-wrap is-small">
                      <div className="button-icon w-embed">
                        <ArrowUpIcon />
                      </div>
                      <div className="button-icon w-embed">
                        <ArrowUpIconCurrent />
                      </div>
                    </div>
                  </a>
                  <div>©treva 2025</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
};
