// 'use client'

// import { useEffect, useRef, useState } from 'react'
// import { gsap } from 'gsap'
// import { ScrollTrigger } from 'gsap/ScrollTrigger'
// import { SplitText } from 'gsap/SplitText'
// import Navbar from '@/app/components/Home/TrevaHero/navbar'
// import { HomeFooter } from '@/app/components/Home/HomeFooter'
// import CallbackForm from '@/app/components/Home/Callback/CallbackForm'
// import { getAssetUrl } from '@/lib/asset-url'
// import './projects.css'

// gsap.registerPlugin(ScrollTrigger, SplitText)

// const CMS_API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:10021";

// type LocalizedValue = string | { az?: string; en?: string; ru?: string };

// function getLocalized(val: LocalizedValue | undefined | null, loc: string, fallback = ""): string {
//   if (!val) return fallback;
//   if (typeof val === "string") return val || fallback;
//   const obj = val as Record<string, string | undefined>;
//   return obj[loc] || obj.az || obj.en || obj.ru || fallback;
// }

// interface ProjectCategory {
//   id: string;
//   title: LocalizedValue;
//   slug: string;
//   image: string | null;
//   brand: LocalizedValue | null;
//   order?: number;
// }

// interface ProjectsPageProps {
//   locale: string
// }

// export function ProjectsPage({ locale }: ProjectsPageProps) {
//   const containerRef = useRef<HTMLDivElement>(null)
//   const [openDropdown, setOpenDropdown] = useState<string | null>(null)
//   const [categories, setCategories] = useState<ProjectCategory[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await fetch(`${CMS_API}/layihelerimiz/categories/visible`);
//         if (res.ok) {
//           const data = await res.json();
//           const list = Array.isArray(data) ? data : data.value || [];
//           list.sort((a: ProjectCategory, b: ProjectCategory) => (a.order ?? 0) - (b.order ?? 0));
//           setCategories(list);
//         }
//       } catch {
//         // fallback
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (!(event.target as Element).closest('.projects_drodpown')) {
//         setOpenDropdown(null)
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside)
//     return () => document.removeEventListener('mousedown', handleClickOutside)
//   }, [])

//   useEffect(() => {
//     const container = containerRef.current
//     if (!container) return

//     gsap.to('body', { autoAlpha: 1, duration: 0.2 })

//     const section = container.querySelector('.projects_component')
//     if (!section) return

//     const splitInstances: SplitText[] = []
//     const lineElements: HTMLElement[] = []

//     if (window.innerWidth > 767) {
//       container.querySelectorAll('h1, h2, h3, p').forEach((el) => {
//         if (el.classList.contains('no-animate') || el.closest('.w-richtext')) return

//         const split = new SplitText(el as HTMLElement, {
//           type: 'lines',
//           lineClass: 'line-wrap',
//         })
//         splitInstances.push(split)

//         split.lines.forEach((line) => {
//           const wrapper = document.createElement('div')
//           wrapper.classList.add('line-mask')
//           line.parentNode?.insertBefore(wrapper, line)
//           wrapper.appendChild(line)
//           lineElements.push(line as HTMLElement)
//         })
//       })
//     }

//     const tl = gsap.timeline({
//       scrollTrigger: {
//         trigger: section,
//         start: 'top 85%',
//         toggleActions: 'play none none none',
//       },
//     })

//     if (lineElements.length) {
//       tl.from(lineElements, {
//         yPercent: 100,
//         duration: 0.8,
//         ease: 'power3.out',
//         stagger: 0,
//       }, 0)
//     }

//     const animationTypes = [
//       { cls: '.animate-up', y: 40, x: 0 },
//       { cls: '.animate-down', y: -40, x: 0 },
//       { cls: '.animate-fade', y: 0, x: 0 },
//     ]

//     animationTypes.forEach(({ cls, y, x }) => {
//       container.querySelectorAll(cls).forEach((el) => {
//         const duration = parseFloat(el.getAttribute('data-gsap-duration') || '0.8')
//         const delay = parseFloat(el.getAttribute('data-gsap-delay') || '0.1')
//         const animProps: gsap.TweenVars = {
//           opacity: 0,
//           duration,
//           delay,
//           ease: 'power2.out',
//         }
//         if (y !== 0) animProps.y = y
//         if (x !== 0) animProps.x = x
//         tl.from(el, animProps, 0)
//       })
//     })

//     return () => {
//       ScrollTrigger.getAll().forEach(trigger => trigger.kill())
//       splitInstances.forEach(split => {
//         if (split.lines) {
//           split.lines.forEach((line) => {
//             const mask = line.parentNode
//             if (mask && (mask as Element).classList.contains('line-mask')) {
//               mask.parentNode?.insertBefore(line, mask)
//               mask.parentNode?.removeChild(mask)
//             }
//           })
//         }
//         split.revert()
//       })
//       tl.kill()
//     }
//   }, [categories])

//   const toggleDropdown = (name: string) => {
//     setOpenDropdown(openDropdown === name ? null : name)
//   }

//   return (
//     <>
//       <div className="page-wrapper" data-locale={locale} ref={containerRef}>
//         <Navbar locale={locale} variant="solid" />
//         <main className="main-wrapper">
//           <section id="projects" className="section_projects">
//             <div className="global-padding padding-section-medium">
//               <div className="container-large">
//                 <div className="projects_component">
//                   <div className="projects_intro-wrap">
//                     <div className="max-width-34rem">
//                       <h1>
//                         <span className="heading-gap-h1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
//                         Arzuların reallaşdığı məkan
//                       </h1>
//                     </div>
//                     <div className="projects_bio">
//                       <p className="contact-p-technology">
//                         <span>Biz qabaqcıl texnologiyanı sənaye bilikləri ilə birləşdirərək, sizə müqavilələri daha sürətli bağlamağa və daha geniş auditoriyaya çatmağa kömək edirik.</span>
//                       </p>
//                     </div>
//                   </div>

//                   <div className="projects_wrap">
//                     {loading ? (
//                       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' }}>
//                         <div style={{
//                           width: 40,
//                           height: 40,
//                           border: '3px solid #e5e7eb',
//                           borderTop: '3px solid #3F4249',
//                           borderRadius: '50%',
//                           animation: 'spin 0.8s linear infinite',
//                         }} />
//                         <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
//                       </div>
//                     ) : (
//                     <div className="w-dyn-list">
//                       <div fs-list-element="list" role="list" className="projects_list w-dyn-items">
//                         {categories.map((cat) => (
//                           <div key={cat.slug} role="listitem" className="w-dyn-item">
//                             <a
//                               aria-label="go to project"
//                               href={`/${locale}/projects/${cat.slug}?design=2`}
//                               className="projects_item w-inline-block"
//                             >
//                               <div className="projects_img-wrap">
//                                 <div className="projects_img-holder">
//                                   {cat.image ? (
//                                     <img
//                                       src={getAssetUrl(cat.image || undefined)}
//                                       loading="lazy"
//                                       alt={getLocalized(cat.title, locale)}
//                                       className="fullwidth-img"
//                                     />
//                                   ) : (
//                                     <div style={{ width: '100%', height: '100%', background: '#f3f4f6' }} />
//                                   )}
//                                 </div>
//                                 <div className="projects_overlay">
//                                   <div className="news_btn">
//                                     <div>Layihəyə bax</div>
//                                   </div>
//                                 </div>
//                                 <div className="img-cover"></div>
//                               </div>
//                               <div className="projects_content-wrap">
//                                 <div className="heading-style-h3 text-color-blue400">{getLocalized(cat.title, locale)}</div>
//                                 <div fs-list-field="location">{getLocalized(cat.brand, locale)}</div>
//                               </div>
//                             </a>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>
//         </main>
//         <CallbackForm allowedRoles={['Client']} />
//         <HomeFooter locale={locale} />
//       </div>
//     </>
//   )
// }


'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Navbar from '@/app/components/Home/TrevaHero/navbar'
import { HomeFooter } from '@/app/components/Home/HomeFooter'
import CallbackForm from '@/app/components/Home/Callback/CallbackForm'
import { getAssetUrl } from '@/lib/asset-url'
import './projects.css'

gsap.registerPlugin(ScrollTrigger, SplitText)

const CMS_API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:10021";

type LocalizedValue = string | { az?: string; en?: string; ru?: string };

function getLocalized(val: LocalizedValue | undefined | null, loc: string, fallback = ""): string {
  if (!val) return fallback;
  if (typeof val === "string") return val || fallback;
  const obj = val as Record<string, string | undefined>;
  return obj[loc] || obj.az || obj.en || obj.ru || fallback;
}

interface ProjectCategory {
  id: string;
  title: LocalizedValue;
  slug: string;
  image: string | null;
  brand: LocalizedValue | null;
  order?: number;
}

interface ProjectsPageProps {
  locale: string
}

export function ProjectsPage({ locale }: ProjectsPageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasAnimatedRef = useRef(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [categories, setCategories] = useState<ProjectCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${CMS_API}/layihelerimiz/categories/visible`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.value || [];
          list.sort((a: ProjectCategory, b: ProjectCategory) => (a.order ?? 0) - (b.order ?? 0));
          setCategories(list);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.projects_drodpown')) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (loading || hasAnimatedRef.current) return

    const container = containerRef.current
    if (!container) return

    hasAnimatedRef.current = true

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
  }, [loading])

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  return (
    <>
      <div className="page-wrapper" data-locale={locale} ref={containerRef}>
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

                  <div className="projects_wrap">
                    {loading ? (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          border: '3px solid #e5e7eb',
                          borderTop: '3px solid #3F4249',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }} />
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                      </div>
                    ) : (
                    <div className="w-dyn-list">
                      <div fs-list-element="list" role="list" className="projects_list w-dyn-items">
                        {categories.map((cat) => (
                          <div key={cat.slug} role="listitem" className="w-dyn-item">
                            <a
                              aria-label="go to project"
                              href={`/${locale}/projects/${cat.slug}?design=2`}
                              className="projects_item w-inline-block"
                            >
                              <div className="projects_img-wrap">
                                <div className="projects_img-holder">
                                  {cat.image ? (
                                    <img
                                      src={getAssetUrl(cat.image || undefined)}
                                      loading="lazy"
                                      alt={getLocalized(cat.title, locale)}
                                      className="fullwidth-img"
                                    />
                                  ) : (
                                    <div style={{ width: '100%', height: '100%', background: '#f3f4f6' }} />
                                  )}
                                </div>
                                <div className="projects_overlay">
                                  <div className="news_btn">
                                    <div>Layihəyə bax</div>
                                  </div>
                                </div>
                                <div className="img-cover"></div>
                              </div>
                              <div className="projects_content-wrap">
                                <div className="heading-style-h3 text-color-blue400">{getLocalized(cat.title, locale)}</div>
                                <div fs-list-field="location">{getLocalized(cat.brand, locale)}</div>
                              </div>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <CallbackForm allowedRoles={['Client']} />
        <HomeFooter locale={locale} />
      </div>
    </>
  )
}