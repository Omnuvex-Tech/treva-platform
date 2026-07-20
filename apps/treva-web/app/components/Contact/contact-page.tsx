'use client'
import { ButtonText } from '@/app/components/ButtonText';

import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, MouseEvent } from 'react'
import Script from 'next/script'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import Header from '@/app/components/Home/TrevaHero/navbar'
import { HomeFooter } from '@/app/components/Home/HomeFooter'
import PartnershipCTA from '@/app/components/PartnershipCTA'
import 'swiper/css'
import './contact.css'  // ayrıca CSS faylı

declare global {
  interface Window {
    gsap?: any
    ScrollTrigger?: any
    SplitText?: any
  }
}

/* ── Arrow Icon (used in offices & connect) ─────────────── */
const ArrowDiagSVG = ({ fill = '#2E3139' }) => (
  <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.6558 7.25V19.0313C22.6558 19.2716 22.5603 19.5021 22.3903 19.6721C22.2204 19.842 21.9899 19.9375 21.7495 19.9375C21.5092 19.9375 21.2787 19.842 21.1087 19.6721C20.9388 19.5021 20.8433 19.2716 20.8433 19.0313V9.43746L7.8907 22.3912C7.72065 22.5612 7.49001 22.6568 7.24953 22.6568C7.00904 22.6568 6.7784 22.5612 6.60836 22.3912C6.43831 22.2211 6.34277 21.9905 6.34277 21.75C6.34277 21.5095 6.43831 21.2789 6.60836 21.1088L19.5621 8.15625H9.96828C9.72792 8.15625 9.49742 8.06077 9.32746 7.89082C9.15751 7.72086 9.06203 7.49035 9.06203 7.25C9.06203 7.00965 9.15751 6.77914 9.32746 6.60918C9.49742 6.43923 9.72792 6.34375 9.96828 6.34375H21.7495C21.9899 6.34375 22.2204 6.43923 22.3903 6.60918C22.5603 6.77914 22.6558 7.00965 22.6558 7.25Z" fill={fill}/>
  </svg>
)

const LinkArrowSVG = ({ fill = 'white' }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.1859 5.5V14.4375C17.1859 14.6198 17.1135 14.7947 16.9846 14.9236C16.8556 15.0526 16.6808 15.125 16.4984 15.125C16.3161 15.125 16.1412 15.0526 16.0123 14.9236C15.8834 14.7947 15.8109 14.6198 15.8109 14.4375V7.15945L5.98484 16.9864C5.85583 17.1154 5.68087 17.1879 5.49843 17.1879C5.31599 17.1879 5.14103 17.1154 5.01202 16.9864C4.88302 16.8574 4.81055 16.6824 4.81055 16.5C4.81055 16.3176 4.88302 16.1426 5.01202 16.0136L14.839 6.1875H7.56093C7.37859 6.1875 7.20372 6.11507 7.07479 5.98614C6.94586 5.8572 6.87343 5.68234 6.87343 5.5C6.87343 5.31766 6.94586 5.1428 7.07479 5.01386C7.20372 4.88493 7.37859 4.8125 7.56093 4.8125H16.4984C16.6808 4.8125 16.8556 4.88493 16.9846 5.01386C17.1135 5.1428 17.1859 5.31766 17.1859 5.5Z" fill={fill}/>
  </svg>
)

type ConnectLinkProps = {
  href: string
  label: string
  isLarge?: boolean
  isSmallCaps?: boolean
  external?: boolean
}

type ContactFields = {
  name: string
  email: string
  phone: string
  service?: string
  budget?: string
  timeline?: string
  message: string
}

type ContactErrors = Partial<Record<keyof ContactFields, string>>
type ContactStatus = 'idle' | 'loading' | 'success' | 'error'

/* ─────────────────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────────────────── */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:10021'
const LEAD_ENDPOINT = `${API_BASE}/contact/submit`
const INITIAL_CONTACT_FIELDS: ContactFields = {
  name: '',
  email: '',
  phone: '',
  message: '',
}

const officeGalleryImages = {
  trevabaku: [
    '/images/contact/trevabaku/office1.jpeg',
    '/images/contact/trevabaku/office2.jpeg',
  ],
  seaBreeze: [
    '/images/contact/sea-breeze/office1.png',
    '/images/contact/sea-breeze/office2.PNG',
    '/images/contact/sea-breeze/office3.PNG',
    '/images/contact/sea-breeze/office4.PNG',
  ],
}

type OfficeImageSliderProps = {
  images: string[]
  alt: string
  delay?: number
}

function OfficeImageSlider({ images, alt, delay = 2800 }: OfficeImageSliderProps) {
  return (
    <Swiper
      modules={[Autoplay]}
      loop={images.length > 1}
      speed={900}
      autoplay={{
        delay: delay,
        disableOnInteraction: false,
      }}
      allowTouchMove={false}
      slidesPerView={1}
      spaceBetween={0}
      className="office_image-swiper"
    >
      {images.map((src, index) => (
        <SwiperSlide key={src}>
          <img
            src={src}
            loading={index === 0 ? 'eager' : 'lazy'}
            alt={alt}
            className="fullwidth-img ease0-6"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

function ConnectLink({ href, label, isLarge = false, isSmallCaps = false, external = false }: ConnectLinkProps) {
  const Tag = external ? 'a' : Link
  const props = external ? { href, target: '_blank', rel: 'noopener noreferrer' } : { href }
  return (
    <Tag
      {...props}
      className={`connect_link-wrap${isLarge ? ' is-large' : ''}${isSmallCaps ? ' is-small-caps' : ''}`}
    >
      <div className="connect_link-text">{label}</div>
      <div className="icon-slide-wrap">
        <div className="icon-slide icon-large"><LinkArrowSVG /></div>
        <div className="icon-slide is-absolute icon-large"><LinkArrowSVG fill="currentcolor" /></div>
      </div>
    </Tag>
  )
}

/* ── Contact Form ────────────────────────────────────────── */
function ContactForm() {
  const [fields, setFields] = useState<ContactFields>(INITIAL_CONTACT_FIELDS)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [status, setStatus] = useState<ContactStatus>('idle')

  const validate = () => {
    const errs: ContactErrors = {}
    if (!fields.name.trim()) errs.name = 'Bu sahə mütləq doldurulmalıdır'
    if (!fields.email.trim() || !fields.email.includes('@') || !fields.email.includes('.'))
      errs.email = 'Etibarlı e-poçt ünvanı daxil edin'
    if (!fields.phone.trim() || fields.phone.replace(/\D/g, '').length < 8)
      errs.phone = 'Etibarlı telefon nömrəsi daxil edin'
    return errs
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const fieldName = name as keyof ContactFields
    setFields(f => ({ ...f, [name]: value }))
    if (errors[fieldName]) setErrors(er => ({ ...er, [fieldName]: '' }))
  }

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^\d+]/g, '')
    const firstPlus = clean.indexOf('+')
    const filtered = clean
      .split('')
      .filter((char, i) => char !== '+' || i === firstPlus)
      .join('')
    setFields(f => ({ ...f, phone: filtered }))
    if (errors.phone) setErrors(er => ({ ...er, phone: '' }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStatus('loading')
    try {
      const res = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      if (res.ok) {
        setStatus('success')
        setFields(INITIAL_CONTACT_FIELDS)
      } else {
        throw new Error('Xəta baş verdi')
      }
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  if (status === 'success') {
    return (
      <div className="connect_form-wrap animate-up">
        <div className="contact-success-inline">
          <div className="contact-success-icon">
            <svg viewBox="0 0 52 52" className="contact-checkmark">
              <circle className="contact-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
              <path className="contact-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
          <h3 className="contact-success-title">Mesajınız göndərildi!</h3>
          <p className="contact-success-text">Tezliklə sizinlə əlaqə saxlayacağıq.</p>
          <button type="button" className="contact-success-btn" onClick={() => setStatus('idle')}>
            Yeni mesaj göndər
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="connect_form-wrap animate-up">
      <form id="email-form" name="email-form" onSubmit={handleSubmit} className="connect_form contact_form" noValidate>
        <div className="field_wrap">
          <input
            className={`connect_input-field${errors.name ? ' error' : ''}`}
            name="name"
            maxLength={256}
            placeholder="Tam ad *"
            type="text"
            value={fields.name}
            onChange={handleChange}
            disabled={status === 'loading'}
          />
          {errors.name && <div className="connect_error" style={{ display: 'block' }}>{errors.name}</div>}
        </div>

        <div className="field_wrap">
          <input
            className={`connect_input-field${errors.email ? ' error' : ''}`}
            name="email"
            maxLength={256}
            placeholder="Email ünvanı *"
            type="email"
            value={fields.email}
            onChange={handleChange}
            disabled={status === 'loading'}
          />
          {errors.email && <div className="connect_error" style={{ display: 'block' }}>{errors.email}</div>}
        </div>

        <div className="field_wrap phone-field-wrap">
          <input
            className={`connect_input-field${errors.phone ? ' error' : ''}`}
            name="phone"
            maxLength={256}
            placeholder="Telefon nömrəsi *"
            type="tel"
            value={fields.phone}
            onChange={handlePhoneChange}
            disabled={status === 'loading'}
          />
          {errors.phone && <div className="connect_error" style={{ display: 'block' }}>{errors.phone}</div>}
        </div>

        <input
          className="connect_input-field message-field"
          name="message"
          maxLength={256}
          placeholder="Mesaj"
          type="text"
          value={fields.message}
          onChange={handleChange}
          disabled={status === 'loading'}
        />

        <button
          type="submit"
          className={`button white contact-submit-btn${status === 'loading' ? ' is-loading' : ''}`}
          disabled={status === 'loading'}
        >
          {status === 'loading' && <span className="contact-spinner"></span>}
          <span className="contact-btn-text">MESAJ GÖNDƏR</span>
        </button>
      </form>

      {status === 'error' && (
        <div className="cs_error" style={{ display: 'block', marginTop: '1rem' }}>
          <div>Oops! Xəta baş verdi. Yenidən cəhd edin.</div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────────────────── */
type ContactPageProps = {
  locale: string
}

export function ContactPage({ locale }: ContactPageProps) {
  const gsapReady = useRef(false)
  const officeDictionary = {
    az: { mapLinkLabel: 'Xəritəyə bax' },
    en: { mapLinkLabel: 'View map' },
    ru: { mapLinkLabel: 'Смотреть карту' },
  } as const
  const officeContent =
    officeDictionary[locale as keyof typeof officeDictionary] ?? officeDictionary.az

  const scrollToContactForm = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()

    const target = document.getElementById('get-in-touch')
    if (!target) return

    window.history.replaceState(null, '', '#get-in-touch')
    target.scrollIntoView({ block: 'start' })
  }

  const initGSAP = () => {
    if (gsapReady.current) return
    if (typeof window === 'undefined') return
    if (!window.gsap || !window.ScrollTrigger) return
    gsapReady.current = true

    const { gsap, ScrollTrigger, SplitText } = window

    if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger)
    if (SplitText)     gsap.registerPlugin(SplitText)

    gsap.to('body', { autoAlpha: 1, duration: 0.3 })

    const isMobile  = window.matchMedia('(max-width: 768px)').matches

    function getAttr(el: Element, name: string, fallback: number) {
      return el.hasAttribute(name) ? parseFloat(el.getAttribute(name) ?? `${fallback}`) : fallback
    }

    const animTypes = [
      { cls: '.animate-up',    y:  40, x:  0 },
      { cls: '.animate-down',  y: -40, x:  0 },
      { cls: '.animate-right', y:   0, x: -40 },
      { cls: '.animate-fade',  y:   0, x:  0 },
    ]
    animTypes.forEach(({ cls, y, x }) => {
      document.querySelectorAll(cls).forEach(el => {
        const duration = getAttr(el, 'data-gsap-duration', 0.8)
        const delay    = getAttr(el, 'data-gsap-delay', 0.1)
        const props: { opacity: number; duration: number; delay: number; ease: string; y?: number; x?: number } = { opacity: 0, duration, delay, ease: 'power2.out' }
        if (y !== 0) props.y = y
        if (x !== 0) props.x = x

        if (el.classList.contains('animate-instant')) {
          gsap.from(el, props)
        } else {
          gsap.from(el, {
            ...props,
            scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
          })
        }
      })
    })

    if (!isMobile && SplitText) {
      document.querySelectorAll('h1, h2, h3, p').forEach(el => {
        if (el.classList.contains('no-animate')) return
        if (el.closest('.w-richtext')) return

        const split = new SplitText(el, { type: 'lines', lineClass: 'line-wrap' })
        split.lines.forEach((line: HTMLElement) => {
          const wrapper = document.createElement('div')
          wrapper.classList.add('line-mask')
          if (!line.parentNode) return
          line.parentNode.insertBefore(wrapper, line)
          wrapper.appendChild(line)
        })
        gsap.from(split.lines, {
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
          yPercent: 100,
          duration:  getAttr(el, 'data-gsap-duration', 0.8),
          delay:     getAttr(el, 'data-gsap-delay', 0.1),
          ease:      'power3.out',
          stagger:   0.08,
        })
      })
    }

    document.querySelectorAll('.img-reveal').forEach(wrapper => {
      const cover = wrapper.querySelector('.img-cover')
      if (!cover) return
      gsap.set(cover, { opacity: 1, yPercent: 0 })
      gsap.timeline({
        scrollTrigger: { trigger: wrapper, start: 'top 95%', toggleActions: 'play none none none' },
      }).to(cover, {
        yPercent: -100,
        duration: getAttr(wrapper, 'data-gsap-duration', 1),
        delay:    getAttr(wrapper, 'data-gsap-delay', 0.1),
        ease:     'power2.out',
      })
    })

    document.querySelectorAll(".parallax-reveal").forEach((el) => {
      gsap.from(el, {
          scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true
          },
          y: 50,
          ease: "none"
      });
    });

    if (window.innerWidth <= 991) {
      gsap.utils.toArray(".projects_overlay").forEach((el: any) => {
        gsap.to(el, {
          opacity: 1,
          duration: 0.5,
          delay: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            once: true
          }
        });
      });
    }

  }

  useEffect(() => {
    if (window.gsap && window.ScrollTrigger) {
      initGSAP()
    }
    const onLoad = () => initGSAP()
    window.addEventListener('gsap-ready', onLoad)
    return () => window.removeEventListener('gsap-ready', onLoad)
  }, [])

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.gsap && window.ScrollTrigger) {
            window.dispatchEvent(new Event('gsap-ready'))
          }
        }}
      />
      <Script
        src="https://cdn.prod.website-files.com/gsap/3.15.0/SplitText.min.js"
        strategy="afterInteractive"
        onLoad={() => window.dispatchEvent(new Event('gsap-ready'))}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"
        strategy="afterInteractive"
        onLoad={() => window.dispatchEvent(new Event('gsap-ready'))}
      />
      <div className="page-wrapper" data-locale={locale}>

          <Header locale={locale} variant="solid" />

          <main className="main-wrapper">

            {/* SECTION 1: OFFICES */}
            <section className="section_contact">
              <div className="global-padding padding-section-medium">
                <div className="container-large">
                  <div className="offices_component">
                    <div className="contact_office-intro">
                      <div className="max-width-48rem">
                        <h1 className="contact_heading-az no-animate">
                          <span className="heading-gap-h1">      </span>
                          Kömək üçün buradayıq, bizimlə əlaqə saxlayın
                        </h1>
                      </div>
                      <div className="contact_office-copy offices_bio-wrap">
                        <p>
                          Bakıdakı baş ofisimizə gəlin və ya tərəfdaşlıq imkanlarını araşdırmaq
                          üçün Sea Breeze satış ofisimizə yaxınlaşın.
                        </p>
                        <p className="contact_top-label">(bizimlə əlaqə)</p>
                      </div>
                    </div>

                    <div className="contact_offices-wrap">
                      <div className="offices_block">
                        <a
                          href="https://www.google.com/maps/place/TREVA+Real+Estate/@40.3517196,49.827273,17z"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="offices_item is-large"
                        >
                          <div className="offices_img-wrap img-reveal">
                            <div className="offices_overlay">
                              <div className="offices_btn"><div>Xəritədə göstər</div></div>
                            </div>
                            <OfficeImageSlider
                              images={officeGalleryImages.trevabaku}
                              alt="TREVA Real Estate Bakı Baş Ofisi"
                              delay={5000}
                            />
                            <div className="img-cover" />
                          </div>
                          <div className="offices_content-wrap">
                            <div className="offices_title-wrap">
                              <div>Bakı Baş Ofisi</div>
                              <div className="offices_caption">Ziya Yusifzadə küçəsi 10, Sabah Residence</div>
                            </div>
                            <div className="offices_map-link">
                              <span>{officeContent.mapLinkLabel}</span>
                              <div className="icon-xxlarge"><ArrowDiagSVG /></div>
                            </div>
                          </div>
                        </a>

                        <a
                          href="https://maps.app.goo.gl/fU1nX7dWJVy4KTkA9"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="offices_item"
                        >
                          <div className="offices_img-wrap img-reveal">
                            <div className="offices_overlay">
                              <div className="offices_btn"><div>Xəritədə göstər</div></div>
                            </div>
                            <OfficeImageSlider
                              images={officeGalleryImages.seaBreeze}
                              alt="Sea Breeze Satış Ofisi"
                              delay={5500}
                            />
                            <div className="img-cover" />
                          </div>
                          <div className="offices_content-wrap">
                            <div className="offices_title-wrap">
                              <div>Sea Breeze Satış Ofisi</div>
                              <div className="offices_caption">Mikayıl Müşfiq küçəsi, Nardaran, Bakı 1097</div>
                            </div>
                            <div className="offices_map-link">
                              <span>{officeContent.mapLinkLabel}</span>
                              <div className="icon-xxlarge"><ArrowDiagSVG /></div>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: CONNECT */}
            <section className="section_connect bg-color-blue100 parallax-reveal">
              <div id="get-in-touch" className="global-padding padding-section-large">
                <div className="container-large">
                  <div className="connect_component">
                    <div className="connect_wrap">
                      <div className="connect_title-wrap">
                        <p className="text-color-white60">TREVA ilə əlaqədə qalın</p>
                        <h2 className="text-color-white contact_heading-az no-animate">Bizimlə Əlaqə <br /> saxlayın</h2>
                      </div>
                      <ContactForm />
                    </div>

                    <div className="connect_contact-wrap">
                      <div className="connect_contact-block animate-up">
                        <div>TREVA ilə Əlaqədə Qalın</div>
                        <div className="connect_list-wrap">
                          <ConnectLink href="https://www.linkedin.com/company/trevarealestate" label="Linkedin" external />
                          <ConnectLink href="https://www.instagram.com/treva.realestate?igsh=cDY3OTh0b3JyOGZy" label="instagram" external />
                          <ConnectLink href="https://www.facebook.com/people/Trevarealestate/61576234409540/" label="facebook" external />
                          <ConnectLink href="https://youtube.com/@trevarealestate?si=zN8KQjIc7UJA7mlY" label="Youtube" external />
                          <ConnectLink href="https://www.tiktok.com/@treva.realestate?_t=ZS-8y85uLU6heS&_r=1" label="Tiktok" external />
                        </div>
                      </div>

                      <div className="connect_contact-block animate-up">
                        <div>Birbaşa əlaqə saxlayın</div>
                        <div className="connect_list-wrap">
                          <ConnectLink href="tel:2662"            label="*2662"                isLarge />
                          <ConnectLink href="tel:+994502772662"   label="050-277-2662"          isLarge external />
                          <ConnectLink href="mailto:info@treva.realestate" label="info@treva.realestate" isLarge isSmallCaps external />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: CTA */}
            <PartnershipCTA
              hideImagesOnMobile
              centerContentOnMobile
              primaryAction={{
                href: '#get-in-touch',
                label: 'Əlaqə saxlayın',
                onClick: scrollToContactForm,
              }}
              secondaryAction={{
                href: `/${locale}/brokers#broker-registration`,
                label: 'Şəbəkəmizə qoşulun',
              }}
            />

          </main>

          <HomeFooter locale={locale} />
      </div>
    </>
  )
}
