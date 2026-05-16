import { ButtonText } from '@/app/components/ButtonText';
'use client'

import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import Script from 'next/script'
import Link from 'next/link'
import Header from '@/app/components/Navbar/navbar'
import { HomeFooter } from '@/app/components/Home/HomeFooter'
import './contact.css'  // ayrıca CSS faylı

declare global {
  interface Window {
    gsap?: any
    ScrollTrigger?: any
    ScrollSmoother?: any
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

const CheckCircleSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#ffffff" viewBox="0 0 256 256">
    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"/>
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
  message: string
}

type ContactErrors = Partial<Record<keyof ContactFields, string>>
type ContactStatus = 'idle' | 'loading' | 'success' | 'error'

/* ─────────────────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────────────────── */
const LEAD_ENDPOINT = 'https://nodebitrixproject15.vercel.app/api/webflow-lead'
const FALLBACK_PHONE_PREFIX = '+994'

const INITIAL_CONTACT_FIELDS: ContactFields = {
  name: '',
  email: '',
  phone: FALLBACK_PHONE_PREFIX,
  message: '',
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const fieldName = name as keyof ContactFields
    setFields(f => ({ ...f, [name]: value }))
    if (errors[fieldName]) setErrors(er => ({ ...er, [fieldName]: '' }))
  }

  const handlePhoneInput = (e: ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, '')
    if (digits.startsWith('994')) digits = digits.slice(3)
    if (digits.startsWith('0')) digits = digits.slice(1)
    setFields(f => ({ ...f, phone: `${FALLBACK_PHONE_PREFIX}${digits.slice(0, 9)}` }))
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
      const result = await res.json()
      if (res.ok && result.success) {
        setStatus('success')
        setFields(INITIAL_CONTACT_FIELDS)
      } else {
        throw new Error(result.message || 'Xəta baş verdi')
      }
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  if (status === 'success') {
    return (
      <div className="cs_form-success" style={{ display: 'block' }}>
        <div className="cs_form-success-content">
          <div className="icon-huge"><CheckCircleSVG /></div>
          <div>
            Qeydiyyat üçün təşəkkür edirik! <br />
            Komandamız tezliklə sizinlə əlaqə saxlayacaq.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="connect_form-wrap animate-up">
      <form id="email-form" name="email-form" onSubmit={handleSubmit} className="connect_form contact_form" noValidate>
        <div className="contact_form-row contact_form-row--split">
          <div className="field_wrap">
            <input
              className={`connect_input-field${errors.name ? ' error' : ''}`}
              name="name"
              maxLength={256}
              placeholder="Tam ad *"
              type="text"
              value={fields.name}
              onChange={handleChange}
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
            />
            {errors.email && <div className="connect_error" style={{ display: 'block' }}>{errors.email}</div>}
          </div>
        </div>

        <div className="contact_form-row">
          <div className="field_wrap">
            <input
              className={`connect_input-field${errors.phone ? ' error' : ''}`}
              name="phone"
              maxLength={13}
              placeholder="Telefon nömrəsi (+994...) *"
              type="tel"
              value={fields.phone}
              onChange={handlePhoneInput}
            />
            {errors.phone && <div className="connect_error" style={{ display: 'block' }}>{errors.phone}</div>}
          </div>
        </div>

        <div className="contact_form-row">
          <div className="field_wrap">
            <textarea
              className="connect_input-field contact_message-field"
              name="message"
              maxLength={500}
              placeholder="Mesajınızı yazın..."
              rows={4}
              value={fields.message}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="contact_form-row contact_form-row--submit">
          <button
            type="submit"
            className="button white"
            disabled={status === 'loading'}
            style={{ cursor: status === 'loading' ? 'wait' : 'pointer' }}
          >
            {status === 'loading' ? 'Göndərilir...' : 'Mesaj göndər'}
          </button>
        </div>
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
  const smoothWrapRef = useRef<HTMLDivElement | null>(null)
  const gsapReady = useRef(false)

  const initGSAP = () => {
    if (gsapReady.current) return
    if (typeof window === 'undefined') return
    if (!window.gsap || !window.ScrollTrigger) return
    gsapReady.current = true

    const { gsap, ScrollTrigger, ScrollSmoother, SplitText } = window

    if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger)
    if (SplitText)     gsap.registerPlugin(SplitText)

    gsap.to('body', { autoAlpha: 1, duration: 0.3 })

    const isMobile  = window.matchMedia('(max-width: 768px)').matches
    const noSmooth  = window.location.pathname.includes('/treva-live')

    if (!isMobile && !noSmooth && ScrollSmoother) {
      const smoother = ScrollSmoother.create({
        wrapper:  '#smooth-wrapper',
        content:  '#smooth-content',
        smooth:   1.6,
        effects:  true,
      })
      const hash = window.location.hash
      if (hash) {
        setTimeout(() => {
          const target = document.querySelector(hash)
          if (target) smoother.scrollTo(target, true)
        }, 500)
      }
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', () => {
          document.documentElement.classList.add('disable-smooth-scroll')
          setTimeout(() => document.documentElement.classList.remove('disable-smooth-scroll'), 100)
        })
      })
    }

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
      <Script
        src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollSmoother.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          setTimeout(initGSAP, 100)
        }}
      />

      <div id="smooth-wrapper" className="smooth-wrapper" ref={smoothWrapRef}>
        <div id="smooth-content" className="page-wrapper">

          <Header locale={locale} />

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
                      <p className="contact_top-label">(bizimlə əlaqə)</p>
                    </div>

                    <div className="contact_offices-wrap">
                      <div className="offices_bio-wrap">
                        <p>
                          Bakıdakı baş ofisimizə gəlin və ya tərəfdaşlıq imkanlarını araşdırmaq
                          üçün Sea Breeze satış ofisimizə yaxınlaşın.
                        </p>
                      </div>

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
                            <img
                              src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/689706aae06419ffd1eb8aa7_Ekran-treva.avif"
                              loading="lazy"
                              width={462}
                              alt="TREVA Real Estate Bakı Baş Ofisi"
                              className="fullwidth-img ease0-6"
                            />
                            <div className="img-cover" />
                          </div>
                          <div className="offices_content-wrap">
                            <div className="offices_title-wrap">
                              <div>Bakı Baş Ofisi</div>
                              <div className="offices_caption">Ziya Yusifzadə küçəsi 10, Sabah Residence</div>
                            </div>
                            <div className="icon-xxlarge"><ArrowDiagSVG /></div>
                          </div>
                        </a>

                        <a
                          href="https://maps.app.goo.gl/fU1nX7dWJVy4KTkA9"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="offices_item"
                        >
                          <div className="offices_img-wrap is-large img-reveal">
                            <img
                              src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687dea9661c0efc7fbff9e44_office.avif"
                              loading="lazy"
                              alt="Sea Breeze Satış Ofisi"
                              className="fullwidth-img ease0-6"
                            />
                            <div className="offices_overlay">
                              <div className="offices_btn"><div>Xəritədə göstər</div></div>
                            </div>
                            <div className="img-cover" />
                          </div>
                          <div className="offices_content-wrap">
                            <div className="offices_title-wrap">
                              <div>Sea Breeze Satış Ofisi</div>
                              <div className="offices_caption">Mikayıl Müşfiq küçəsi, Nardaran, Bakı 1097</div>
                            </div>
                            <div className="icon-xxlarge"><ArrowDiagSVG /></div>
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
                        <h2 className="text-color-white contact_heading-az no-animate">Bizimlə Əlaqə saxlayın</h2>
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
            <section className="section_cta bg-color-white">
              <div className="global-padding padding-section-xlarge">
                <div className="container-large">
                  <div className="cta_component">
                    <div className="cta_wrap">
                      <div className="cta_content">
                        <h2 className="cta_heading">
                          Tərəfdaşlığa <em>hazırsınız?</em>
                        </h2>
                        <div className="button-group">
                          <Link
                            href="#get-in-touch"
                            className="button contact_cta-action-button contact_cta-action-button--primary"
                            data-wf--button--variant="blue-large"
                          >
                            <ButtonText className="elaqe-saxlayin">Əlaqə saxlayın</ButtonText>
                          </Link>
                          <Link
                            href="/brokers#broker-registration"
                            className="button contact_cta-action-button contact_cta-action-button--secondary"
                            data-wf--button--variant="ghost-large"
                          >
                            <ButtonText className="elaqe-saxlayin">Şəbəkəmizə qoşulun</ButtonText>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cta_bg-wrap" aria-hidden="true">
                <div className="cta_bg-top is-consultation">
                  <div className="cta_img-wrap is-top-left is-az">
                    <img
                      loading="lazy"
                      alt="Arabian Ranches"
                      src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6877795ce390ea79b5c67e2e_1014X598.avif"
                      className="fullwidth-img"
                    />
                  </div>
                  <div className="cta_img-wrap is-top-right is-az">
                    <img
                      loading="lazy"
                      alt="Villa Siena"
                      src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e484afd3d27df4a880_1920X1080.avif"
                      className="fullwidth-img"
                    />
                  </div>
                </div>
                <div className="cta_bg-middle is-consultation">
                  <div className="cta_img-wrap is-middle-right">
                    <img
                      loading="lazy"
                      alt="Villa Siena pool"
                      src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e35e32834841daa30b_1014X598.avif"
                      className="fullwidth-img"
                    />
                  </div>
                </div>
                <div className="cta_bg-bottom is-consultation">
                  <div className="cta_img-wrap is-bottom-left">
                    <img
                      loading="lazy"
                      alt="Sabah Residence"
                      src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/68778c96c2e171e2e9f756e5_16X9.avif"
                      className="fullwidth-img"
                    />
                  </div>
                  <div className="cta_img-wrap is-bottom-right">
                    <img
                      loading="lazy"
                      alt="Marina Village"
                      src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687785016cf80af995692f8b_2X1.avif"
                      className="fullwidth-img"
                    />
                  </div>
                </div>
              </div>
            </section>

          </main>

          <HomeFooter locale={locale} />
        </div>
      </div>
    </>
  )
}