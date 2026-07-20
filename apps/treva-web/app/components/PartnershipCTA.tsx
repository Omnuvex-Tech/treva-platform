'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef } from 'react'
import type { MouseEventHandler } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ButtonText } from '@/app/components/ButtonText'

type CTAButton = {
  href: string
  label: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
  external?: boolean
  target?: string
  rel?: string
}

type PartnershipCTAProps = {
  primaryAction: CTAButton
  secondaryAction: CTAButton
  hideImagesOnMobile?: boolean
  centerContentOnMobile?: boolean
}

declare global {
  interface Window {
    gsap?: any
    ScrollTrigger?: any
  }
}

const PRIMARY_BUTTON_CLASS =
  'button w-variant-396e566b-0a82-5a60-ac2f-21a23e91a30e w-inline-block'

const SECONDARY_BUTTON_CLASS =
  'button w-variant-6df2cdf2-59f5-a951-7112-29ad9c77d0eb w-inline-block'

const PRIMARY_TEXT_CLASS = 'w-variant-396e566b-0a82-5a60-ac2f-21a23e91a30e'
const SECONDARY_TEXT_CLASS = 'w-variant-6df2cdf2-59f5-a951-7112-29ad9c77d0eb'
const PENDING_SCROLL_KEY = 'treva_pending_hash_scroll'
const CTA_IMAGES = {
  topLeft: '/assets/Brabus%201014x598.jpg',
  topRight: '/assets/Sabah%20Towers%20536x620_.jpg',
  middleRight: '/assets/Arabian%20536x620.jpg',
  bottomLeft: '/assets/16X9.avif',
  bottomRight: '/assets/700X800_MARI%CC%87NA.avif',
} as const

function CTAActionButton({
  action,
  className,
  textClassName,
  variant,
}: {
  action: CTAButton
  className: string
  textClassName: string
  variant: 'blue-large' | 'ghost-large'
}) {
  const content = (
    <>
      <div className="svg-code">This is some text inside of a div block.</div>
      <ButtonText className={textClassName}>{action.label}</ButtonText>
    </>
  )

  if (action.external) {
    return (
      <a
        href={action.href}
        onClick={action.onClick}
        target={action.target ?? '_blank'}
        rel={action.rel ?? 'noopener noreferrer'}
        className={className}
        data-wf--button--variant={variant}
      >
        {content}
      </a>
    )
  }

  return (
    <Link
      href={action.href}
      onClick={action.onClick}
      className={className}
      data-wf--button--variant={variant}
    >
      {content}
    </Link>
  )
}

export default function PartnershipCTA({
  primaryAction,
  secondaryAction,
  hideImagesOnMobile = false,
  centerContentOnMobile = false,
}: PartnershipCTAProps) {
  const pathname = usePathname()
  const router = useRouter()
  const sectionRef = useRef<HTMLElement | null>(null)

  const scrollToHashTarget = (hash: string) => {
    if (typeof window === 'undefined') return

    const targetId = hash.replace(/^#/, '')
    if (!targetId) return

    const attemptScroll = (remainingAttempts = 20) => {
      const target = document.getElementById(targetId)
      if (!target) {
        if (remainingAttempts > 0) {
          window.setTimeout(() => attemptScroll(remainingAttempts - 1), 120)
        }
        return
      }

      const navHeightValue = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue('--treva-nav-height')
      const navHeight = Number.parseFloat(navHeightValue) || 64
      const offset = navHeight + 24

      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${targetId}`)
      window.scrollTo({
        top: Math.max(target.getBoundingClientRect().top + window.scrollY - offset, 0),
        behavior: 'smooth',
      })
    }

    attemptScroll()
  }

  const enhanceAction = (action: CTAButton): CTAButton => {
    if (action.external || !action.href.includes('#')) {
      return action
    }

    const [rawPath, rawHash] = action.href.split('#')
    const targetHash = rawHash ? `#${rawHash}` : ''

    if (!targetHash) {
      return action
    }

    const targetPath = rawPath || pathname || ''
    const isSamePage = !rawPath || rawPath === pathname

    return {
      ...action,
      onClick: (event) => {
        event.preventDefault()

        if (isSamePage) {
          scrollToHashTarget(targetHash)
          return
        }

        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(
            PENDING_SCROLL_KEY,
            JSON.stringify({ pathname: targetPath, hash: targetHash }),
          )
        }

        router.push(`${targetPath}${targetHash}`)
      },
    }
  }

  const resolvedPrimaryAction = useMemo(
    () => enhanceAction(primaryAction),
    [pathname, primaryAction],
  )

  const resolvedSecondaryAction = useMemo(
    () => enhanceAction(secondaryAction),
    [pathname, secondaryAction],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    let cleanup: (() => void) | undefined
    let retryTimer: number | undefined

    const initCTAAnimation = () => {
      if (!sectionRef.current) return
      if (!window.gsap || !window.ScrollTrigger) return

      const { gsap, ScrollTrigger } = window
      gsap.registerPlugin(ScrollTrigger)

      cleanup?.()

      const mm = gsap.matchMedia()
      mm.add('(min-width: 768px)', () => {
        const q = gsap.utils.selector(sectionRef.current)
        const scrollProgress = { value: 0 }
        const ctaTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.93,
          },
          defaults: { ease: 'none' },
        })

        gsap.set(q('.cta_img-wrap.is-top-left'), { y: '4rem' })
        gsap.set(q('.cta_img-wrap.is-top-right'), { y: '0rem' })
        gsap.set(q('.cta_img-wrap.is-middle-right'), { y: '0rem' })
        gsap.set(q('.cta_img-wrap.is-bottom-left'), { y: '4rem' })
        gsap.set(q('.cta_img-wrap.is-bottom-right'), { y: '-2rem' })

        ctaTimeline
          .to(scrollProgress, { value: 1, duration: 1 }, 0)
          .to(q('.cta_img-wrap.is-top-left'), { y: '-1rem', duration: 0.52 }, 0.12)
          .to(q('.cta_img-wrap.is-top-right'), { y: '5rem', duration: 0.52 }, 0.12)
          .to(q('.cta_img-wrap.is-middle-right'), { y: '-6rem', duration: 0.55 }, 0.2)
          .to(q('.cta_img-wrap.is-bottom-left'), { y: '-1rem', duration: 0.6 }, 0.3)
          .to(q('.cta_img-wrap.is-bottom-right'), { y: '2rem', duration: 0.6 }, 0.3)

        return () => {
          ctaTimeline.kill()
        }
      })

      mm.add('(max-width: 767px)', () => {
        const q = gsap.utils.selector(sectionRef.current)
        const ctaTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.85,
          },
          defaults: { ease: 'none' },
        })

        gsap.set(q('.cta_img-wrap.is-top-left'), { y: '1.5rem' })
        gsap.set(q('.cta_img-wrap.is-top-right'), { y: '-0.5rem' })
        gsap.set(q('.cta_img-wrap.is-middle-right'), { y: '0.75rem' })
        gsap.set(q('.cta_img-wrap.is-bottom-left'), { y: '1.25rem' })
        gsap.set(q('.cta_img-wrap.is-bottom-right'), { y: '-1rem' })

        ctaTimeline
          .to(q('.cta_img-wrap.is-top-left'), { y: '-0.5rem', duration: 0.55 }, 0.08)
          .to(q('.cta_img-wrap.is-top-right'), { y: '2rem', duration: 0.55 }, 0.08)
          .to(q('.cta_img-wrap.is-middle-right'), { y: '-2rem', duration: 0.58 }, 0.16)
          .to(q('.cta_img-wrap.is-bottom-left'), { y: '-0.25rem', duration: 0.6 }, 0.22)
          .to(q('.cta_img-wrap.is-bottom-right'), { y: '1.25rem', duration: 0.6 }, 0.22)

        return () => {
          ctaTimeline.kill()
        }
      })

      cleanup = () => mm.revert()
    }

    initCTAAnimation()
    if (!window.gsap || !window.ScrollTrigger) {
      retryTimer = window.setTimeout(initCTAAnimation, 450)
    }
    window.addEventListener('gsap-ready', initCTAAnimation)

    return () => {
      window.removeEventListener('gsap-ready', initCTAAnimation)
      if (retryTimer) {
        window.clearTimeout(retryTimer)
      }
      cleanup?.()
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const rawPendingScroll = window.sessionStorage.getItem(PENDING_SCROLL_KEY)
    if (!rawPendingScroll) return

    try {
      const pendingScroll = JSON.parse(rawPendingScroll) as { pathname?: string; hash?: string }
      if (pendingScroll.pathname !== pathname || !pendingScroll.hash) return

      window.sessionStorage.removeItem(PENDING_SCROLL_KEY)
      scrollToHashTarget(pendingScroll.hash)
    } catch {
      window.sessionStorage.removeItem(PENDING_SCROLL_KEY)
    }
  }, [pathname])

  return (
    <section
      ref={sectionRef}
      className="section_cta bg-color-white"
      data-mobile-images={hideImagesOnMobile ? 'hidden' : 'visible'}
      data-mobile-center={centerContentOnMobile ? 'true' : 'false'}
    >
      <div className="global-padding padding-section-xlarge">
        <div className="container-large">
          <div className="cta_component">
            <div className="cta_wrap">
              <div className="cta_content">
                <h2 className="cta_heading">
                  Tərəfdaşlığa <em>hazırsınız?</em>
                </h2>
                <div className="button-group">
                  <CTAActionButton
                    action={resolvedPrimaryAction}
                    className={PRIMARY_BUTTON_CLASS}
                    textClassName={PRIMARY_TEXT_CLASS}
                    variant="blue-large"
                  />
                  <CTAActionButton
                    action={resolvedSecondaryAction}
                    className={SECONDARY_BUTTON_CLASS}
                    textClassName={SECONDARY_TEXT_CLASS}
                    variant="ghost-large"
                  />
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
              width="Auto"
              loading="lazy"
              alt="Brabus"
              src={CTA_IMAGES.topLeft}
              className="fullwidth-img"
            />
          </div>
          <div className="cta_img-wrap is-top-right is-az">
            <img
              width="Auto"
              alt="Sabah Towers"
              src={CTA_IMAGES.topRight}
              loading="lazy"
              className="fullwidth-img"
            />
          </div>
        </div>
        <div className="cta_bg-middle is-consultation">
          <div className="cta_img-wrap is-middle-right">
            <img
              width="Auto"
              alt="Arabian"
              src={CTA_IMAGES.middleRight}
              loading="lazy"
              className="fullwidth-img"
            />
          </div>
        </div>
        <div className="cta_bg-bottom is-consultation">
          <div className="cta_img-wrap is-bottom-left">
            <img
              alt="A plane flying over a building with a curved facade - Sabah Residence"
              src={CTA_IMAGES.bottomLeft}
              loading="lazy"
              className="fullwidth-img"
            />
          </div>
          <div className="cta_img-wrap is-bottom-right">
            <img
              width="Auto"
              alt="Marina"
              src={CTA_IMAGES.bottomRight}
              loading="lazy"
              className="fullwidth-img"
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .section_cta .cta_component {
          position: relative;
          z-index: 2;
        }

        .section_cta .cta_content {
          max-width: 40rem;
        }

        .section_cta .button-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .section_cta .button-group .button {
          min-width: 0;
        }

        .section_cta .button-group .button-text-wrap {
          overflow: hidden;
        }

        .section_cta .cta_bg-wrap {
          z-index: 1;
        }

        @media screen and (max-width: 767px) {
          .section_cta {
            padding-top: 6rem !important;
            padding-bottom: 6rem !important;
          }

          .section_cta[data-mobile-images='hidden'] .cta_bg-wrap {
            display: none !important;
          }

          .section_cta[data-mobile-center='true'] .cta_wrap {
            display: flex;
            justify-content: center;
          }

          .section_cta[data-mobile-center='true'] .cta_content {
            margin-left: auto;
            margin-right: auto;
            text-align: center;
          }

          .section_cta .cta_content {
            max-width: 100%;
            gap: 1.5rem;
          }

          .section_cta .cta_heading {
            max-width: 11ch;
            font-size: clamp(2.75rem, 12vw, 4rem) !important;
            line-height: 1.04 !important;
          }

          .section_cta[data-mobile-center='true'] .cta_heading {
            width: 100%;
            max-width: 100%;
            margin-left: auto;
            margin-right: auto;
            text-align: center;
          }

          .section_cta .button-group {
            flex-direction: column;
            align-items: stretch;
            width: 100%;
          }

          .section_cta[data-mobile-center='true'] .button-group {
            align-items: center;
          }

          .section_cta .button-group .button {
            width: 100%;
            min-height: 52px;
            padding: 0.95rem 1rem;
            justify-content: center;
          }

          .section_cta .button-group .button-text-wrap {
            display: flex !important;
            height: auto !important;
            min-height: 1.25rem;
            width: 100%;
            justify-content: center;
            align-items: center;
            text-align: center;
          }

          .section_cta .button-group .button-text {
            position: static !important;
            height: auto !important;
            line-height: 1.15 !important;
            transform: none !important;
            width: 100%;
            justify-content: center !important;
            text-align: center;
          }

          .section_cta .button-group .button-text[aria-hidden='true'] {
            display: none !important;
          }

          .section_cta .cta_bg-wrap {
            width: min(100%, 24rem);
            min-height: 21rem;
            margin: 0 auto;
          }

          .section_cta .cta_img-wrap {
            border-radius: 0.5rem;
            overflow: hidden;
          }

          .section_cta .cta_img-wrap.is-middle-right {
            display: block !important;
            width: 5.75rem;
            right: -4%;
            bottom: 32%;
          }

          .section_cta .cta_img-wrap.is-bottom-left {
            width: 5.5rem;
            left: -2%;
            bottom: 72%;
          }

          .section_cta .cta_img-wrap.is-top-right {
            width: 6rem;
            right: 2%;
            bottom: -11%;
          }

          .section_cta .cta_img-wrap.is-top-left {
            width: 10.5rem;
            left: -10%;
            bottom: -14%;
          }

          .section_cta .cta_img-wrap.is-bottom-right {
            width: 9.75rem;
            right: -10%;
            bottom: 70%;
          }
        }

        @media screen and (max-width: 479px) {
          .section_cta {
            padding-top: 4rem !important;
            padding-bottom: 4rem !important;
          }

          .section_cta[data-mobile-images='hidden'] {
            padding-top: 3.5rem !important;
            padding-bottom: 3rem !important;
          }

          .section_cta .cta_heading {
            font-size: clamp(2.5rem, 11.5vw, 3.5rem) !important;
            line-height: 1.06 !important;
          }

          .section_cta .cta_bg-wrap {
            width: min(100%, 21.5rem);
            min-height: 18.5rem;
          }

          .section_cta .cta_img-wrap.is-middle-right {
            width: 5.25rem;
            right: -3%;
            bottom: 31%;
          }

          .section_cta .cta_img-wrap.is-bottom-left {
            width: 4.75rem;
            left: -2%;
            bottom: 70%;
          }

          .section_cta .cta_img-wrap.is-top-right {
            width: 5rem;
            right: 3%;
            bottom: -10%;
          }

          .section_cta .cta_img-wrap.is-top-left {
            width: 8.5rem;
            left: -9%;
            bottom: -12%;
          }

          .section_cta .cta_img-wrap.is-bottom-right {
            width: 8rem;
            right: -8%;
            bottom: 67%;
          }
        }
      `}</style>
    </section>
  )
}
