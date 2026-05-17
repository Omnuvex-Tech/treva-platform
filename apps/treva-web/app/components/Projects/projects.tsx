'use client'

import { useEffect, useRef, useState } from 'react'
import Navbar from '@/app/components/Navbar/navbar'
import { HomeFooter } from '@/app/components/Home/HomeFooter'
import './projects.css'

interface ProjectsPageProps {
  locale: string
}

export function ProjectsPage({ locale }: ProjectsPageProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  
  const smoothWrapRef = useRef<HTMLDivElement | null>(null)
  const gsapReady = useRef(false)

  useEffect(() => {
    // Dropdown click outside listener
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.projects_drodpown')) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    let isCancelled = false
    let cleanupGSAP: (() => void) | null = null

    const initGSAP = async () => {
      if (typeof window === 'undefined' || gsapReady.current) return

      const [{ gsap }, { ScrollTrigger }, { ScrollSmoother }, { SplitText }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('gsap/ScrollSmoother'),
        import('gsap/SplitText'),
      ])

      if (isCancelled) return

      gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText)
      const splitInstances: any[] = []
      const smoother =
        window.innerWidth > 768
          ? ScrollSmoother.create({
              wrapper: '#smooth-wrapper',
              content: '#smooth-content',
              smooth: 1.6,
              effects: true,
            })
          : null

      gsap.to('body', { autoAlpha: 1, duration: 0.3 })

      const animationTypes = [
        { cls: ".animate-up", y: 40, x: 0 },
        { cls: ".animate-down", y: -40, x: 0 },
        { cls: ".animate-fade", y: 0, x: 0 }
      ]

      animationTypes.forEach(({ cls, y, x }) => {
        document.querySelectorAll(cls).forEach((el: any) => {
          const duration = parseFloat(el.getAttribute('data-gsap-duration')) || 0.8
          const delay = parseFloat(el.getAttribute('data-gsap-delay')) || 0.1

          const animProps: any = {
            opacity: 0,
            duration,
            delay,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none"
            }
          }
          if (y !== 0) animProps.y = y
          if (x !== 0) animProps.x = x

          gsap.from(el, animProps)
        })
      })

      if (window.innerWidth > 767) {
        document.querySelectorAll("h1, h2, h3, p").forEach((el: any) => {
          if (el.classList.contains("no-animate") || el.closest(".w-richtext")) return

          const split = new SplitText(el, {
            type: "lines",
            lineClass: "line-wrap"
          })
          splitInstances.push(split)

          split.lines.forEach((line: Element) => {
            const wrapper = document.createElement("div")
            wrapper.classList.add("line-mask")
            line.parentNode?.insertBefore(wrapper, line)
            wrapper.appendChild(line)
          })

          gsap.from(split.lines, {
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none"
            },
            yPercent: 100,
            duration: parseFloat(el.getAttribute("data-gsap-duration")) || 0.8,
            delay: parseFloat(el.getAttribute("data-gsap-delay")) || 0.1,
            ease: "power3.out",
            stagger: 0.08
          })
        })
      }

      gsapReady.current = true
      cleanupGSAP = () => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
        smoother?.kill()
        splitInstances.forEach((split) => split.revert())
        gsapReady.current = false
      }
    }

    const timer = window.setTimeout(() => {
      void initGSAP()
    }, 500)

    return () => {
      isCancelled = true
      window.clearTimeout(timer)
      cleanupGSAP?.()
    }
  }, [locale])

  useEffect(() => {
    const scriptId = 'finsweet-attributes-script'

    if (document.getElementById(scriptId)) {
      return
    }

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
    // In a real Finsweet environment, we'd trigger a click on the hidden radio
  }

  const clearFilters = () => {
    setSelectedStatus('')
    setSelectedLocation('')
    setOpenDropdown(null)
  }

  return (
    <>
      <div id="smooth-wrapper" className="smooth-wrapper" ref={smoothWrapRef}>
        <div id="smooth-content" className="page-wrapper">
          <Navbar locale={locale} />
          
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
                              <div>{selectedStatus || 'status'}</div>
                              <div className="icon-regular ease0-3 w-embed">
                                <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M13.354 6.85403L8.35403 11.854C8.30759 11.9005 8.25245 11.9374 8.19175 11.9626C8.13105 11.9877 8.06599 12.0007 8.00028 12.0007C7.93457 12.0007 7.86951 11.9877 7.80881 11.9626C7.74811 11.9374 7.69296 11.9005 7.64653 11.854L2.64653 6.85403C2.55271 6.76021 2.5 6.63296 2.5 6.50028C2.5 6.3676 2.55271 6.24035 2.64653 6.14653C2.74035 6.05271 2.8676 6 3.00028 6C3.13296 6 3.26021 6.05271 3.35403 6.14653L8.00028 10.7934L12.6465 6.14653C12.693 6.10007 12.7481 6.06322 12.8088 6.03808C12.8695 6.01294 12.9346 6 13.0003 6C13.066 6 13.131 6.01294 13.1917 6.03808C13.2524 6.06322 13.3076 6.10007 13.354 6.14653C13.4005 6.19298 13.4373 6.24813 13.4625 6.30883C13.4876 6.36953 13.5006 6.43458 13.5006 6.50028C13.5006 6.56598 13.4876 6.63103 13.4625 6.69173C13.4373 6.75242 13.4005 6.80757 13.354 6.85403Z" fill="currentcolor"/>
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
                              <div>{selectedLocation || 'məkan'}</div>
                              <div className="icon-regular ease0-3 w-embed">
                                <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M13.354 6.85403L8.35403 11.854C8.30759 11.9005 8.25245 11.9374 8.19175 11.9626C8.13105 11.9877 8.06599 12.0007 8.00028 12.0007C7.93457 12.0007 7.86951 11.9877 7.80881 11.9626C7.74811 11.9374 7.69296 11.9005 7.64653 11.854L2.64653 6.85403C2.55271 6.76021 2.5 6.63296 2.5 6.50028C2.5 6.3676 2.55271 6.24035 2.64653 6.14653C2.74035 6.05271 2.8676 6 3.00028 6C3.13296 6 3.26021 6.05271 3.35403 6.14653L8.00028 10.7934L12.6465 6.14653C12.693 6.10007 12.7481 6.06322 12.8088 6.03808C12.8695 6.01294 12.9346 6 13.0003 6C13.066 6 13.131 6.01294 13.1917 6.03808C13.2524 6.06322 13.3076 6.10007 13.354 6.14653C13.4005 6.19298 13.4373 6.24813 13.4625 6.30883C13.4876 6.36953 13.5006 6.43458 13.5006 6.50028C13.5006 6.56598 13.4876 6.63103 13.4625 6.69173C13.4373 6.75242 13.4005 6.80757 13.354 6.85403Z" fill="currentcolor"/>
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

                        <div className="projects_tags-block hide">
                        </div>
                      </form>
                    </div>

                    <div className="projects_wrap">
                      <div className="w-dyn-list">
                        <div fs-list-element="list" role="list" className="projects_list w-dyn-items">
                          
                          {/* Project Item 1 */}
                          <div role="listitem" className="w-dyn-item">
                            <a aria-label="go to project" href={`/${locale}/project/panorama-by-elie-saab`} className="projects_item w-inline-block">
                              <div className="projects_img-wrap">
                                <div className="projects_img-holder">
                                  <img src="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69280b7104d977e586a79fc0_elie saab sekil kesilmis.avif" loading="lazy" alt="Panorama by Elie Saab" sizes="100vw" srcSet="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69280b7104d977e586a79fc0_elie%20saab%20sekil%20kesilmis-p-500.avif 500w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69280b7104d977e586a79fc0_elie%20saab%20sekil%20kesilmis-p-800.avif 800w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69280b7104d977e586a79fc0_elie%20saab%20sekil%20kesilmis.avif 1306w" className="fullwidth-img"/>
                                </div>
                                <div className="projects_overlay hide-tablet">
                                  <div className="projects_btn is-large">
                                    <div className="icon-xlarge w-embed">
                                      <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.6557 10.4994C17.6557 10.6575 17.5929 10.8092 17.4811 10.921C17.3692 11.0328 17.2176 11.0957 17.0594 11.0957H11.0964V17.0587C11.0964 17.2168 11.0336 17.3685 10.9217 17.48003C10.8099 17.5922 10.6582 17.655 10.5001 17.655C10.3419 17.655 10.1903 17.5922 10.0784 17.48003C9.96662 17.3685 9.90379 17.2168 9.90379 17.0587V11.0957H3.94078C3.78263 11.0957 3.63096 11.0328 3.51914 10.921C3.40731 10.8092 3.34448 10.6575 3.34448 10.4994C3.34448 10.3412 3.40731 10.1895 3.51914 10.0777C3.63096 9.96589 3.78263 9.90306 3.94078 9.90306H9.90379V3.94005C9.90379 3.7819 9.96662 3.63023 10.0784 3.5184C10.1903 3.40657 10.3419 3.34375 10.5001 3.34375C10.6582 3.34375 10.8099 3.40657 10.9217 3.5184C11.0336 3.63023 11.0964 3.7819 11.0964 3.94005V9.90306H17.0594C17.2176 9.90306 17.3692 9.96589 17.4811 10.0777C17.5929 10.1895 17.6557 10.3412 17.6557 10.4994Z" fill="white"/>
                                      </svg>
                                    </div>
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

                          {/* Project Item 2 */}
                          <div role="listitem" className="w-dyn-item">
                            <a aria-label="go to project" href={`/${locale}/project/reportage-heights`} className="projects_item w-inline-block">
                              <div className="projects_img-wrap">
                                <div className="projects_img-holder">
                                  <img src="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6926c88132426adc45a95ee0_9744a_reportage_uae_reportage_heights_exteriors_EXT3_final.avif" loading="lazy" alt="Reportage Heights" sizes="100vw" srcSet="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6926c88132426adc45a95ee0_9744a_reportage_uae_reportage_heights_exteriors_EXT3_final-p-500.avif 500w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6926c88132426adc45a95ee0_9744a_reportage_uae_reportage_heights_exteriors_EXT3_final-p-800.avif 800w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6926c88132426adc45a95ee0_9744a_reportage_uae_reportage_heights_exteriors_EXT3_final-p-1080.avif 1080w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6926c88132426adc45a95ee0_9744a_reportage_uae_reportage_heights_exteriors_EXT3_final.avif 2000w" className="fullwidth-img"/>
                                </div>
                                <div className="projects_overlay">
                                  <div className="projects_btn is-large">
                                    <div className="icon-xlarge w-embed">
                                      <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.6557 10.4994C17.6557 10.6575 17.5929 10.8092 17.4811 10.921C17.3692 11.0328 17.2176 11.0957 17.0594 11.0957H11.0964V17.0587C11.0964 17.2168 11.0336 17.3685 10.9217 17.48003C10.8099 17.5922 10.6582 17.655 10.5001 17.655C10.3419 17.655 10.1903 17.5922 10.0784 17.48003C9.96662 17.3685 9.90379 17.2168 9.90379 17.0587V11.0957H3.94078C3.78263 11.0957 3.63096 11.0328 3.51914 10.921C3.40731 10.8092 3.34448 10.6575 3.34448 10.4994C3.34448 10.3412 3.40731 10.1895 3.51914 10.0777C3.63096 9.96589 3.78263 9.90306 3.94078 9.90306H9.90379V3.94005C9.90379 3.7819 9.96662 3.63023 10.0784 3.5184C10.1903 3.40657 10.3419 3.34375 10.5001 3.34375C10.6582 3.34375 10.8099 3.40657 10.9217 3.5184C11.0336 3.63023 11.0964 3.7819 11.0964 3.94005V9.90306H17.0594C17.2176 9.90306 17.3692 9.96589 17.4811 10.0777C17.5929 10.1895 17.6557 10.3412 17.6557 10.4994Z" fill="white"/>
                                      </svg>
                                    </div>
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

                          {/* Project Item 3 */}
                          <div role="listitem" className="w-dyn-item">
                            <a aria-label="go to project" href={`/${locale}/project/arabian-ranches`} className="projects_item w-inline-block">
                              <div className="projects_img-wrap">
                                <div className="projects_img-holder">
                                  <img src="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e0ca6fb39a1d49bd14574e_arabiann-5.webp" loading="lazy" alt="Arabian Ranches" sizes="100vw" srcSet="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e0ca6fb39a1d49bd14574e_arabiann-5-p-500.webp 500w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e0ca6fb39a1d49bd14574e_arabiann-5-p-800.webp 800w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e0ca6fb39a1d49bd14574e_arabiann-5-p-1080.webp 1080w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e0ca6fb39a1d49bd14574e_arabiann-5-p-1600.webp 1600w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e0ca6fb39a1d49bd14574e_arabiann-5-p-2000.webp 2000w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e0ca6fb39a1d49bd14574e_arabiann-5.webp 2602w" className="fullwidth-img"/>
                                </div>
                                <div className="projects_overlay">
                                  <div className="projects_btn is-large">
                                    <div className="icon-xlarge w-embed">
                                      <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.6557 10.4994C17.6557 10.6575 17.5929 10.8092 17.4811 10.921C17.3692 11.0328 17.2176 11.0957 17.0594 11.0957H11.0964V17.0587C11.0964 17.2168 11.0336 17.3685 10.9217 17.48003C10.8099 17.5922 10.6582 17.655 10.5001 17.655C10.3419 17.655 10.1903 17.5922 10.0784 17.48003C9.96662 17.3685 9.90379 17.2168 9.90379 17.0587V11.0957H3.94078C3.78263 11.0957 3.63096 11.0328 3.51914 10.921C3.40731 10.8092 3.34448 10.6575 3.34448 10.4994C3.34448 10.3412 3.40731 10.1895 3.51914 10.0777C3.63096 9.96589 3.78263 9.90306 3.94078 9.90306H9.90379V3.94005C9.90379 3.7819 9.96662 3.63023 10.0784 3.5184C10.1903 3.40657 10.3419 3.34375 10.5001 3.34375C10.6582 3.34375 10.8099 3.40657 10.9217 3.5184C11.0336 3.63023 11.0964 3.7819 11.0964 3.94005V9.90306H17.0594C17.2176 9.90306 17.3692 9.96589 17.4811 10.0777C17.5929 10.1895 17.6557 10.3412 17.6557 10.4994Z" fill="white"/>
                                      </svg>
                                    </div>
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

                          {/* Project Item 4 */}
                          <div role="listitem" className="w-dyn-item">
                            <a aria-label="go to project" href={`/${locale}/project/marina-village`} className="projects_item w-inline-block">
                              <div className="projects_img-wrap">
                                <div className="projects_img-holder">
                                  <img src="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6878c0b5046e1d573cd3b04d_700X800_MARI%CC%87NA.avif" loading="lazy" alt="Marina Village" sizes="100vw" srcSet="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6878c0b5046e1d573cd3b04d_700X800_MARI%CC%87NA-p-500.avif 500w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6878c0b5046e1d573cd3b04d_700X800_MARI%CC%87NA.avif 700w" className="fullwidth-img"/>
                                </div>
                                <div className="projects_overlay">
                                  <div className="projects_btn is-large">
                                    <div className="icon-xlarge w-embed">
                                      <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.6557 10.4994C17.6557 10.6575 17.5929 10.8092 17.4811 10.921C17.3692 11.0328 17.2176 11.0957 17.0594 11.0957H11.0964V17.0587C11.0964 17.2168 11.0336 17.3685 10.9217 17.48003C10.8099 17.5922 10.6582 17.655 10.5001 17.655C10.3419 17.655 10.1903 17.5922 10.0784 17.48003C9.96662 17.3685 9.90379 17.2168 9.90379 17.0587V11.0957H3.94078C3.78263 11.0957 3.63096 11.0328 3.51914 10.921C3.40731 10.8092 3.34448 10.6575 3.34448 10.4994C3.34448 10.3412 3.40731 10.1895 3.51914 10.0777C3.63096 9.96589 3.78263 9.90306 3.94078 9.90306H9.90379V3.94005C9.90379 3.7819 9.96662 3.63023 10.0784 3.5184C10.1903 3.40657 10.3419 3.34375 10.5001 3.34375C10.6582 3.34375 10.8099 3.40657 10.9217 3.5184C11.0336 3.63023 11.0964 3.7819 11.0964 3.94005V9.90306H17.0594C17.2176 9.90306 17.3692 9.96589 17.4811 10.0777C17.5929 10.1895 17.6557 10.3412 17.6557 10.4994Z" fill="white"/>
                                      </svg>
                                    </div>
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

                          {/* Project Item 5 */}
                          <div role="listitem" className="w-dyn-item">
                            <a aria-label="go to project" href={`/${locale}/project/villa-siena`} className="projects_item w-inline-block">
                              <div className="projects_img-wrap">
                                <div className="projects_img-holder">
                                  <img src="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6878c132b243b50c391cf0eb_700X800.avif" loading="lazy" alt="Villa Siena" sizes="100vw" srcSet="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6878c132b243b50c391cf0eb_700X800-p-500.avif 500w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6878c132b243b50c391cf0eb_700X800.avif 700w" className="fullwidth-img"/>
                                </div>
                                <div className="projects_overlay">
                                  <div className="projects_btn is-large">
                                    <div className="icon-xlarge w-embed">
                                      <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.6557 10.4994C17.6557 10.6575 17.5929 10.8092 17.4811 10.921C17.3692 11.0328 17.2176 11.0957 17.0594 11.0957H11.0964V17.0587C11.0964 17.2168 11.0336 17.3685 10.9217 17.48003C10.8099 17.5922 10.6582 17.655 10.5001 17.655C10.3419 17.655 10.1903 17.5922 10.0784 17.48003C9.96662 17.3685 9.90379 17.2168 9.90379 17.0587V11.0957H3.94078C3.78263 11.0957 3.63096 11.0328 3.51914 10.921C3.40731 10.8092 3.34448 10.6575 3.34448 10.4994C3.34448 10.3412 3.40731 10.1895 3.51914 10.0777C3.63096 9.96589 3.78263 9.90306 3.94078 9.90306H9.90379V3.94005C9.90379 3.7819 9.96662 3.63023 10.0784 3.5184C10.1903 3.40657 10.3419 3.34375 10.5001 3.34375C10.6582 3.34375 10.8099 3.40657 10.9217 3.5184C11.0336 3.63023 11.0964 3.7819 11.0964 3.94005V9.90306H17.0594C17.2176 9.90306 17.3692 9.96589 17.4811 10.0777C17.5929 10.1895 17.6557 10.3412 17.6557 10.4994Z" fill="white"/>
                                      </svg>
                                    </div>
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

                          {/* Project Item 6 */}
                          <div role="listitem" className="w-dyn-item">
                            <a aria-label="go to project" href={`/${locale}/project/sabah-residence`} className="projects_item w-inline-block">
                              <div className="projects_img-wrap">
                                <div className="projects_img-holder">
                                  <img src="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/692d30a5de9b28406e24d70b_sabah4.jpg" loading="lazy" alt="Sabah Residence" className="fullwidth-img"/>
                                </div>
                                <div className="projects_overlay">
                                  <div className="projects_btn is-large">
                                    <div className="icon-xlarge w-embed">
                                      <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.6557 10.4994C17.6557 10.6575 17.5929 10.8092 17.4811 10.921C17.3692 11.0328 17.2176 11.0957 17.0594 11.0957H11.0964V17.0587C11.0964 17.2168 11.0336 17.3685 10.9217 17.48003C10.8099 17.5922 10.6582 17.655 10.5001 17.655C10.3419 17.655 10.1903 17.5922 10.0784 17.48003C9.96662 17.3685 9.90379 17.2168 9.90379 17.0587V11.0957H3.94078C3.78263 11.0957 3.63096 11.0328 3.51914 10.921C3.40731 10.8092 3.34448 10.6575 3.34448 10.4994C3.34448 10.3412 3.40731 10.1895 3.51914 10.0777C3.63096 9.96589 3.78263 9.90306 3.94078 9.90306H9.90379V3.94005C9.90379 3.7819 9.96662 3.63023 10.0784 3.5184C10.1903 3.40657 10.3419 3.34375 10.5001 3.34375C10.6582 3.34375 10.8099 3.40657 10.9217 3.5184C11.0336 3.63023 11.0964 3.7819 11.0964 3.94005V9.90306H17.0594C17.2176 9.90306 17.3692 9.96589 17.4811 10.0777C17.5929 10.1895 17.6557 10.3412 17.6557 10.4994Z" fill="white"/>
                                      </svg>
                                    </div>
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
      </div>
    </>
  )
}
