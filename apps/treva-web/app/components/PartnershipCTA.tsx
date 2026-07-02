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

      cleanup = () => mm.revert()
    }

    initCTAAnimation()
    window.addEventListener('gsap-ready', initCTAAnimation)

    return () => {
      window.removeEventListener('gsap-ready', initCTAAnimation)
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
              alt="A large white building with palm trees in front of it - arabian ranches"
              src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6877795ce390ea79b5c67e2e_1014X598.avif"
              className="fullwidth-img"
            />
          </div>
          <div className="cta_img-wrap is-top-right is-az">
            <img
              width="Auto"
              sizes="100vw"
              alt="A building with a fountain in front of it - villa siena"
              src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e484afd3d27df4a880_1920X1080.avif"
              loading="lazy"
              srcSet="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e484afd3d27df4a880_1920X1080-p-500.avif 500w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e484afd3d27df4a880_1920X1080-p-800.avif 800w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e484afd3d27df4a880_1920X1080-p-1080.avif 1080w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e484afd3d27df4a880_1920X1080.avif 1920w"
              className="fullwidth-img"
            />
          </div>
        </div>
        <div className="cta_bg-middle is-consultation">
          <div className="cta_img-wrap is-middle-right">
            <img
              width="Auto"
              sizes="100vw"
              alt="A large house with a pool in front of it  - villa siena"
              src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e35e32834841daa30b_1014X598.avif"
              loading="lazy"
              srcSet="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e35e32834841daa30b_1014X598-p-500.avif 500w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e35e32834841daa30b_1014X598.avif 1014w"
              className="fullwidth-img"
            />
          </div>
        </div>
        <div className="cta_bg-bottom is-consultation">
          <div className="cta_img-wrap is-bottom-left">
            <img
              sizes="100vw"
              srcSet="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/68778c96c2e171e2e9f756e5_16X9-p-500.avif 500w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/68778c96c2e171e2e9f756e5_16X9-p-800.avif 800w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/68778c96c2e171e2e9f756e5_16X9.avif 1920w"
              alt="A plane flying over a building with a curved facade - Sabah Residence"
              src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/68778c96c2e171e2e9f756e5_16X9.avif"
              loading="lazy"
              className="fullwidth-img"
            />
          </div>
          <div className="cta_img-wrap is-bottom-right">
            <img
              width="Auto"
              sizes="100vw"
              alt="A large building with a boat in front of it - marina village"
              src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687785016cf80af995692f8b_2X1.avif"
              loading="lazy"
              srcSet="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687785016cf80af995692f8b_2X1-p-500.avif 500w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687785016cf80af995692f8b_2X1-p-800.avif 800w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687785016cf80af995692f8b_2X1-p-1080.avif 1080w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687785016cf80af995692f8b_2X1-p-1600.avif 1600w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687785016cf80af995692f8b_2X1.avif 2000w"
              className="fullwidth-img"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
