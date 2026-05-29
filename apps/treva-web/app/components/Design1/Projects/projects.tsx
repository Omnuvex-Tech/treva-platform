'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Navbar from '@/app/components/Home/TrevaHero/navbar'
import { HomeFooter } from '@/app/components/Home/HomeFooter'
import './projects.css'

gsap.registerPlugin(ScrollTrigger, SplitText)

interface ProjectsPageProps {
  locale: string
}

export function ProjectsPage({ locale }: ProjectsPageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<string>('')

  // Dropdown xarici klik
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.projects_drodpown')) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // GSAP – bir dəfə, sinxron, gecikməsiz
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    gsap.to('body', { autoAlpha: 1, duration: 0.2 })

    const section = container.querySelector('.projects_component')
    if (!section) return

    const splitInstances: SplitText[] = []
    const lineElements: HTMLElement[] = []

    if (window.innerWidth > 767) {
      container.querySelectorAll('h1, h2, h3, p').forEach((el) => {
        if (el.classList.contains('no-animate') || el.closest('.w-richtext')) return

        const split = new SplitText(el as HTMLElement, {
          type: 'lines',
          lineClass: 'line-wrap',
        })
        splitInstances.push(split)

        split.lines.forEach((line) => {
          const wrapper = document.createElement('div')
          wrapper.classList.add('line-mask')
          line.parentNode?.insertBefore(wrapper, line)
          wrapper.appendChild(line)
          lineElements.push(line as HTMLElement)
        })
      })
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })

    if (lineElements.length) {
      tl.from(lineElements, {
        yPercent: 100,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0,
      }, 0)
    }

    const animationTypes = [
      { cls: '.animate-up', y: 40, x: 0 },
      { cls: '.animate-down', y: -40, x: 0 },
      { cls: '.animate-fade', y: 0, x: 0 },
    ]

    animationTypes.forEach(({ cls, y, x }) => {
      container.querySelectorAll(cls).forEach((el) => {
        const duration = parseFloat(el.getAttribute('data-gsap-duration') || '0.8')
        const delay = parseFloat(el.getAttribute('data-gsap-delay') || '0.1')
        const animProps: gsap.TweenVars = {
          opacity: 0,
          duration,
          delay,
          ease: 'power2.out',
        }
        if (y !== 0) animProps.y = y
        if (x !== 0) animProps.x = x
        tl.from(el, animProps, 0)
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      splitInstances.forEach(split => {
        if (split.lines) {
          split.lines.forEach((line) => {
            const mask = line.parentNode
            if (mask && (mask as Element).classList.contains('line-mask')) {
              mask.parentNode?.insertBefore(line, mask)
              mask.parentNode?.removeChild(mask)
            }
          })
        }
        split.revert()
      })
      tl.kill()
    }
  }, [])

  // Finsweet atributları
  useEffect(() => {
    const scriptId = 'finsweet-attributes-script'
    if (document.getElementById(scriptId)) return
    const script = document.createElement('script')
    script.id = scriptId
    script.async = true
    script.type = 'module'
    script.src = 'https://cdn.jsdelivr.net/npm/@finsweet/attributes@2/attributes.js'
    script.setAttribute('fs-list', 'true')
    document.body.appendChild(script)
  }, [])

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  const handleFilterClick = (type: 'status' | 'location', value: string) => {
    if (type === 'status') setSelectedStatus(value)
    if (type === 'location') setSelectedLocation(value)
  }

  const clearFilters = () => {
    setSelectedStatus('')
    setSelectedLocation('')
    setOpenDropdown(null)
  }

  return (
    <>
      <div className="page-wrapper" ref={containerRef}>
        <Navbar locale={locale} variant="solid" />
        <main className="main-wrapper">
          <section id="projects" className="section_projects">
            <div className="global-padding padding-section-medium">
              <div className="container-large">
                <div className="projects_component">
                  <div className="projects_intro-wrap">
                    <div className="max-width-34rem">
                      <h1>
                        <span className="heading-gap-h1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                        Arzuların reallaşdığı məkan
                      </h1>
                    </div>
                    <div className="projects_bio">
                      <p className="contact-p-technology">
                        <span>Biz qabaqcıl texnologiyanı sənaye bilikləri ilə birləşdirərək, sizə müqavilələri daha sürətli bağlamağa və daha geniş auditoriyaya çatmağa kömək edirik.</span>
                      </p>
                    </div>
                  </div>

                  <div className="projects_form-block animate-up w-form">
                    <form id="email-form" name="email-form" fs-list-element="filters" className="projects_filters-wrap">
                      <div className="projects_filters-block">
                        {/* Status Dropdown */}
                        <div className="projects_drodpown w-dropdown">
                          <div
                            className={`projects_toggle w-dropdown-toggle ${openDropdown === 'status' ? 'w--open' : ''}`}
                            onClick={() => toggleDropdown('status')}
                          >
                            <div>status</div>
                            <div className="icon-regular ease0-3 w-embed">
                              <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.354 6.85403L8.35403 11.854C8.30759 11.9005 8.25245 11.9374 8.19175 11.9626C8.13105 11.9877 8.06599 12.0007 8.00028 12.0007C7.93457 12.0007 7.86951 11.9877 7.80881 11.9626C7.74811 11.9374 7.69296 11.9005 7.64653 11.854L2.64653 6.85403C2.55271 6.76021 2.5 6.63296 2.5 6.50028C2.5 6.3676 2.55271 6.24035 2.64653 6.14653C2.74035 6.05271 2.8676 6 3.00028 6C3.13296 6 3.26021 6.05271 3.35403 6.14653L8.00028 10.7934L12.6465 6.14653C12.693 6.10007 12.7481 6.06322 12.8088 6.03808C12.8695 6.01294 12.9346 6 13.0003 6C13.066 6 13.131 6.01294 13.1917 6.03808C13.2524 6.06322 13.3076 6.10007 13.354 6.14653C13.4005 6.19298 13.4373 6.24813 13.4625 6.30883C13.4876 6.36953 13.5006 6.43458 13.5006 6.50028C13.5006 6.56598 13.4876 6.63103 13.4625 6.69173C13.4373 6.75242 13.4005 6.80757 13.354 6.85403Z" fill="currentcolor" />
                              </svg>
                            </div>
                          </div>
                          <nav className={`projects_dropdown-nav w-dropdown-list ${openDropdown === 'status' ? 'w--open' : ''}`}>
                            <div className="projects_checkbox-holder">
                              {['Hazırlanır', 'Tamamlandı'].map((status) => (
                                <label key={status} className="projects_checkbox-field w-radio" onClick={() => handleFilterClick('status', status)}>
                                  <div className={`w-form-formradioinput w-form-formradioinput--inputType-custom projects_checkbox w-radio-input ${selectedStatus === status ? 'w--redirected-checked' : ''}`}></div>
                                  <input fs-list-value={status} fs-list-field="status" name="radio-status" type="radio" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} />
                                  <span className="w-form-label">{status}</span>
                                </label>
                              ))}
                            </div>
                            <div fs-list-element="clear" fs-list-field="status" className="projects_clear-btn" onClick={() => setSelectedStatus('')}>sıfırla</div>
                          </nav>
                        </div>

                        {/* Location Dropdown */}
                        <div className="projects_drodpown w-dropdown">
                          <div
                            className={`projects_toggle w-dropdown-toggle ${openDropdown === 'location' ? 'w--open' : ''}`}
                            onClick={() => toggleDropdown('location')}
                          >
                            <div>məkan</div>
                            <div className="icon-regular ease0-3 w-embed">
                              <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.354 6.85403L8.35403 11.854C8.30759 11.9005 8.25245 11.9374 8.19175 11.9626C8.13105 11.9877 8.06599 12.0007 8.00028 12.0007C7.93457 12.0007 7.86951 11.9877 7.80881 11.9626C7.74811 11.9374 7.69296 11.9005 7.64653 11.854L2.64653 6.85403C2.55271 6.76021 2.5 6.63296 2.5 6.50028C2.5 6.3676 2.55271 6.24035 2.64653 6.14653C2.74035 6.05271 2.8676 6 3.00028 6C3.13296 6 3.26021 6.05271 3.35403 6.14653L8.00028 10.7934L12.6465 6.14653C12.693 6.10007 12.7481 6.06322 12.8088 6.03808C12.8695 6.01294 12.9346 6 13.0003 6C13.066 6 13.131 6.01294 13.1917 6.03808C13.2524 6.06322 13.3076 6.10007 13.354 6.14653C13.4005 6.19298 13.4373 6.24813 13.4625 6.30883C13.4876 6.36953 13.5006 6.43458 13.5006 6.50028C13.5006 6.56598 13.4876 6.63103 13.4625 6.69173C13.4373 6.75242 13.4005 6.80757 13.354 6.85403Z" fill="currentcolor" />
                              </svg>
                            </div>
                          </div>
                          <nav className={`projects_dropdown-nav w-dropdown-list ${openDropdown === 'location' ? 'w--open' : ''}`}>
                            <div className="projects_checkbox-holder">
                              {['Sea Breeze', 'Baku'].map((loc) => (
                                <label key={loc} className="projects_checkbox-field w-radio" onClick={() => handleFilterClick('location', loc)}>
                                  <div className={`w-form-formradioinput w-form-formradioinput--inputType-custom projects_checkbox w-radio-input ${selectedLocation === loc ? 'w--redirected-checked' : ''}`}></div>
                                  <input fs-list-value={loc} fs-list-field="location" name="radio-location" type="radio" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} />
                                  <span className="w-form-label">{loc}</span>
                                </label>
                              ))}
                            </div>
                            <div fs-list-element="clear" fs-list-field="location" className="projects_clear-btn" onClick={() => setSelectedLocation('')}>sıfırla</div>
                          </nav>
                        </div>
                      </div>

                      <div className={`projects_tags-block${(selectedStatus || selectedLocation) ? '' : ' hide'}`}>
                        <div className="projects_tags-wrap">
                          {selectedStatus && (
                            <div fs-list-element="tag" className="projects_tag-item">
                              <div fs-list-element="tag-remove" className="projects_tag-remove" onClick={() => setSelectedStatus('')}>
                                <div className="icon w-embed">
                                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.37276 8.62821C9.41341 8.66886 9.44566 8.71712 9.46765 8.77023C9.48965 8.82334 9.50098 8.88026 9.50098 8.93774C9.50098 8.99523 9.48965 9.05215 9.46765 9.10526C9.44566 9.15837 9.41341 9.20663 9.37276 9.24728C9.33212 9.28792 9.28386 9.32017 9.23075 9.34217C9.17764 9.36416 9.12072 9.37549 9.06323 9.37549C9.00575 9.37549 8.94882 9.36416 8.89571 9.34217C8.84261 9.32017 8.79435 9.28792 8.7537 9.24728L5.12573 5.61876L1.49776 9.24728C1.41567 9.32937 1.30433 9.37549 1.18823 9.37549C1.07213 9.37549 0.960793 9.32937 0.8787 9.24728C0.796607 9.16518 0.750488 9.05384 0.750488 8.93774C0.750488 8.82165 0.796608 8.71031 0.8787 8.62821L4.50722 5.00024L0.8787 1.37227C0.796607 1.29018 0.750488 1.17884 0.750488 1.06274C0.750488 0.946647 0.796607 0.835305 0.8787 0.753212C0.960793 0.671119 1.07213 0.625 1.18823 0.625C1.30433 0.625 1.41567 0.671119 1.49776 0.753212L5.12573 4.38173L8.7537 0.753212C8.83579 0.671119 8.94714 0.625 9.06323 0.625C9.17933 0.625 9.29067 0.671119 9.37276 0.753212C9.45486 0.835305 9.50098 0.946647 9.50098 1.06274C9.50098 1.17884 9.45486 1.29018 9.37276 1.37227L5.74425 5.00024L9.37276 8.62821Z" fill="black" />
                                  </svg>
                                </div>
                              </div>
                              <div fs-list-element="tag-value" className="projects_tag-value">{selectedStatus}</div>
                            </div>
                          )}
                          {selectedLocation && (
                            <div fs-list-element="tag" className="projects_tag-item">
                              <div fs-list-element="tag-remove" className="projects_tag-remove" onClick={() => setSelectedLocation('')}>
                                <div className="icon w-embed">
                                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.37276 8.62821C9.41341 8.66886 9.44566 8.71712 9.46765 8.77023C9.48965 8.82334 9.50098 8.88026 9.50098 8.93774C9.50098 8.99523 9.48965 9.05215 9.46765 9.10526C9.44566 9.15837 9.41341 9.20663 9.37276 9.24728C9.33212 9.28792 9.28386 9.32017 9.23075 9.34217C9.17764 9.36416 9.12072 9.37549 9.06323 9.37549C9.00575 9.37549 8.94882 9.36416 8.89571 9.34217C8.84261 9.32017 8.79435 9.28792 8.7537 9.24728L5.12573 5.61876L1.49776 9.24728C1.41567 9.32937 1.30433 9.37549 1.18823 9.37549C1.07213 9.37549 0.960793 9.32937 0.8787 9.24728C0.796607 9.16518 0.750488 9.05384 0.750488 8.93774C0.750488 8.82165 0.796608 8.71031 0.8787 8.62821L4.50722 5.00024L0.8787 1.37227C0.796607 1.29018 0.750488 1.17884 0.750488 1.06274C0.750488 0.946647 0.796607 0.835305 0.8787 0.753212C0.960793 0.671119 1.07213 0.625 1.18823 0.625C1.30433 0.625 1.41567 0.671119 1.49776 0.753212L5.12573 4.38173L8.7537 0.753212C8.83579 0.671119 8.94714 0.625 9.06323 0.625C9.17933 0.625 9.29067 0.671119 9.37276 0.753212C9.45486 0.835305 9.50098 0.946647 9.50098 1.06274C9.50098 1.17884 9.45486 1.29018 9.37276 1.37227L5.74425 5.00024L9.37276 8.62821Z" fill="black" />
                                  </svg>
                                </div>
                              </div>
                              <div fs-list-element="tag-value" className="projects_tag-value">{selectedLocation}</div>
                            </div>
                          )}
                        </div>
                        <a href="#" className="projects_clear-link w-inline-block" onClick={(e) => { e.preventDefault(); clearFilters(); }}>
                          <div className="projects_clear-content">
                            <div className="projects_clear-text">filtrləri sıfırla</div>
                            <div className="projects_clear-text">filtrləri sıfırla</div>
                          </div>
                        </a>
                      </div>
                    </form>
                  </div>

                  <div className="projects_wrap">
                    <div className="w-dyn-list">
                      <div fs-list-element="list" role="list" className="projects_list w-dyn-items">
                        {/* Layihə 1 - Panorama by Elie Saab */}
                        <div role="listitem" className="w-dyn-item">
                          <a aria-label="go to project" href={`/${locale}/projects/panorama-by-elie-saab?design=2`} className="projects_item w-inline-block">
                            <div className="projects_img-wrap">
                              <div className="projects_img-holder">
                                <img src="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69280b7104d977e586a79fc0_elie saab sekil kesilmis.avif" loading="lazy" alt="Panorama by Elie Saab" sizes="100vw" srcSet="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69280b7104d977e586a79fc0_elie%20saab%20sekil%20kesilmis-p-500.avif 500w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69280b7104d977e586a79fc0_elie%20saab%20sekil%20kesilmis-p-800.avif 800w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69280b7104d977e586a79fc0_elie%20saab%20sekil%20kesilmis.avif 1306w" className="fullwidth-img" />
                              </div>
                              <div className="projects_overlay">
                                <div className="news_btn">
                                  <div>Layihəyə bax</div>
                                </div>
                              </div>
                              <div className="img-cover"></div>
                            </div>
                            <div className="projects_content-wrap">
                              <div className="heading-style-h3 text-color-blue400">Panorama by Elie Saab</div>
                              <div fs-list-field="location">Sea Breeze</div>
                              <div fs-list-field="status" className="hide">Hazırlanır</div>
                            </div>
                          </a>
                        </div>

                        {/* Layihə 2 - Reportage Heights */}
                        <div role="listitem" className="w-dyn-item">
                          <a aria-label="go to project" href={`/${locale}/projects/reportage-heights?design=2`} className="projects_item w-inline-block">
                            <div className="projects_img-wrap">
                              <div className="projects_img-holder">
                                <img src="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6926c88132426adc45a95ee0_9744a_reportage_uae_reportage_heights_exteriors_EXT3_final.avif" loading="lazy" alt="Reportage Heights" sizes="100vw" srcSet="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6926c88132426adc45a95ee0_9744a_reportage_uae_reportage_heights_exteriors_EXT3_final-p-500.avif 500w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6926c88132426adc45a95ee0_9744a_reportage_uae_reportage_heights_exteriors_EXT3_final-p-800.avif 800w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6926c88132426adc45a95ee0_9744a_reportage_uae_reportage_heights_exteriors_EXT3_final-p-1080.avif 1080w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6926c88132426adc45a95ee0_9744a_reportage_uae_reportage_heights_exteriors_EXT3_final.avif 2000w" className="fullwidth-img" />
                              </div>
                              <div className="projects_overlay">
                                <div className="news_btn">
                                  <div>Layihəyə bax</div>
                                </div>
                              </div>
                              <div className="img-cover"></div>
                            </div>
                            <div className="projects_content-wrap">
                              <div className="heading-style-h3 text-color-blue400">Reportage Heights</div>
                              <div fs-list-field="location">Sea Breeze</div>
                              <div fs-list-field="status" className="hide">Hazırlanır</div>
                            </div>
                          </a>
                        </div>

                        {/* Layihə 3 - Arabian Ranches */}
                        <div role="listitem" className="w-dyn-item">
                          <a aria-label="go to project" href={`/${locale}/projects/arabian-ranches?design=2`} className="projects_item w-inline-block">
                            <div className="projects_img-wrap">
                              <div className="projects_img-holder">
                                <img src="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e0ca6fb39a1d49bd14574e_arabiann-5.webp" loading="lazy" alt="Arabian Ranches" sizes="100vw" srcSet="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e0ca6fb39a1d49bd14574e_arabiann-5-p-500.webp 500w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e0ca6fb39a1d49bd14574e_arabiann-5-p-800.webp 800w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e0ca6fb39a1d49bd14574e_arabiann-5-p-1080.webp 1080w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e0ca6fb39a1d49bd14574e_arabiann-5.webp 2602w" className="fullwidth-img" />
                              </div>
                              <div className="projects_overlay">
                                <div className="news_btn">
                                  <div>Layihəyə bax</div>
                                </div>
                              </div>
                              <div className="img-cover"></div>
                            </div>
                            <div className="projects_content-wrap">
                              <div className="heading-style-h3 text-color-blue400">Arabian Ranches</div>
                              <div fs-list-field="location">Sea Breeze</div>
                              <div fs-list-field="status" className="hide">Hazırlanır</div>
                            </div>
                          </a>
                        </div>

                        {/* Layihə 4 - Marina Village */}
                        <div role="listitem" className="w-dyn-item">
                          <a aria-label="go to project" href={`/${locale}/projects/marina-village?design=2`} className="projects_item w-inline-block">
                            <div className="projects_img-wrap">
                              <div className="projects_img-holder">
                                <img src="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6878c0b5046e1d573cd3b04d_700X800_MARI%CC%87NA.avif" loading="lazy" alt="Marina Village" sizes="100vw" srcSet="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6878c0b5046e1d573cd3b04d_700X800_MARI%CC%87NA-p-500.avif 500w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6878c0b5046e1d573cd3b04d_700X800_MARI%CC%87NA.avif 700w" className="fullwidth-img" />
                              </div>
                              <div className="projects_overlay">
                                <div className="news_btn">
                                  <div>Layihəyə bax</div>
                                </div>
                              </div>
                              <div className="img-cover"></div>
                            </div>
                            <div className="projects_content-wrap">
                              <div className="heading-style-h3 text-color-blue400">Marina Village</div>
                              <div fs-list-field="location">Sea Breeze</div>
                              <div fs-list-field="status" className="hide">Hazırlanır</div>
                            </div>
                          </a>
                        </div>

                        {/* Layihə 5 - Villa Siena */}
                        <div role="listitem" className="w-dyn-item">
                          <a aria-label="go to project" href={`/${locale}/projects/villa-siena?design=2`} className="projects_item w-inline-block">
                            <div className="projects_img-wrap">
                              <div className="projects_img-holder">
                                <img src="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6878c132b243b50c391cf0eb_700X800.avif" loading="lazy" alt="Villa Siena" sizes="100vw" srcSet="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6878c132b243b50c391cf0eb_700X800-p-500.avif 500w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6878c132b243b50c391cf0eb_700X800.avif 700w" className="fullwidth-img" />
                              </div>
                              <div className="projects_overlay">
                                <div className="news_btn">
                                  <div>Layihəyə bax</div>
                                </div>
                              </div>
                              <div className="img-cover"></div>
                            </div>
                            <div className="projects_content-wrap">
                              <div className="heading-style-h3 text-color-blue400">Villa Siena</div>
                              <div fs-list-field="location">Baku</div>
                              <div fs-list-field="status" className="hide">Tamamlandı</div>
                            </div>
                          </a>
                        </div>

                        {/* Layihə 6 - Sabah Residence */}
                        <div role="listitem" className="w-dyn-item">
                          <a aria-label="go to project" href={`/${locale}/projects/sabah-residence?design=2`} className="projects_item w-inline-block">
                            <div className="projects_img-wrap">
                              <div className="projects_img-holder">
                                <img src="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/692d30a5de9b28406e24d70b_sabah4.jpg" loading="lazy" alt="Sabah Residence" className="fullwidth-img" />
                              </div>
                              <div className="projects_overlay">
                                <div className="news_btn">
                                  <div>Layihəyə bax</div>
                                </div>
                              </div>
                              <div className="img-cover"></div>
                            </div>
                            <div className="projects_content-wrap">
                              <div className="heading-style-h3 text-color-blue400">Sabah Residence</div>
                              <div fs-list-field="location">Baku</div>
                              <div fs-list-field="status" className="hide">Tamamlandı</div>
                            </div>
                          </a>
                        </div>
                      </div>
                      <div fs-list-element="empty" className="projects_empty-state hide">
                        <div>No results found.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <HomeFooter locale={locale} />
      </div>
    </>
  )
}
