'use client'

import Link from 'next/link'
import type { MouseEventHandler } from 'react'
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
  sectionDataWId?: string
}

const PRIMARY_BUTTON_CLASS =
  'button w-variant-396e566b-0a82-5a60-ac2f-21a23e91a30e w-inline-block'

const SECONDARY_BUTTON_CLASS =
  'button w-variant-6df2cdf2-59f5-a951-7112-29ad9c77d0eb w-inline-block'

const PRIMARY_TEXT_CLASS = 'w-variant-396e566b-0a82-5a60-ac2f-21a23e91a30e'
const SECONDARY_TEXT_CLASS = 'w-variant-6df2cdf2-59f5-a951-7112-29ad9c77d0eb'

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
  sectionDataWId,
}: PartnershipCTAProps) {
  return (
    <section
      className="section_cta bg-color-white"
      {...(sectionDataWId ? { 'data-w-id': sectionDataWId } : {})}
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
                    action={primaryAction}
                    className={PRIMARY_BUTTON_CLASS}
                    textClassName={PRIMARY_TEXT_CLASS}
                    variant="blue-large"
                  />
                  <CTAActionButton
                    action={secondaryAction}
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
