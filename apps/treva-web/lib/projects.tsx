import React from "react";
import { ProjectModel } from "./projects.types";

export const PROJECTS: ProjectModel[] = [
  {
    slug: "panorama-by-elie-saab",
    hero: {
      title: "PANORAMA BY ELIE SAAB",
      desktopDescription: <>A<span className="lowercase-text"> sophisticated blend of high-fashion aesthetics and modern luxury.</span></>,
      mobileDescription: <>C<span className="lowercase-text">urated real estate investments and tailored lifestyle solutions.</span></>,
      backgroundImage: "/images/projects/project1.jpg",
      ctaText: "GET A CONSULTATION",
      ctaLink: "/consultation"
    },
    overview: {
      titleLight: "Project ",
      titleBold: "Overview",
      brandName: "Panorama by ELIE SAAB",
      debutText: " marks the debut of ",
      locationText: "branded residences",
      debutTextEnd: "at Sea Breeze.",
      description: (
        <>
          This landmark project translates <br className="mobile-br" />
          the legendary designer&apos;s <br className="desktop-br" />
          &quot;timeless <br className="mobile-br" />
          elegance&quot; from Haute Couture <br className="mobile-br" />
          into exclusive <br className="desktop-br" />
          coastal living. Every <br className="mobile-br" />
          detail is meticulously crafted to <br className="desktop-br" />
          <br className="mobile-br" />
          define a new global standard of <br className="mobile-br" />
          sophisticated lifestyle.
        </>
      ),
      images: {
        large: { url: "/images/project-overview/po1.jpg", label: "Modern architecture of buildings" },
        medium: { url: "/images/project-overview/po2.jpg", label: "Elegant living" },
        small: { url: "/images/project-overview/po3.jpg", label: "Incredible view" }
      },
      dataRows: [
        { key: "Project Type", value: "Residential complex" },
        { key: "Year of Completion", value: "2030" },
        { key: "Price Range", value: <>MIN &mdash; 188 874 USD,<br className="mobile-br" />&nbsp;&nbsp;MAX &mdash; 849 849 USD</> }
      ]
    },
    location: {
      titleLight: "Property ",
      titleBold: "LocatIon",
      mainLead: (
        <>
          Panorama by ELIE SAAB{" "}
          <span className="lead-light">
            <br className="mobile-br" />
            sits in the elite heart of <span className="lead-italic">Sea <br className="desktop-br" /> Breeze</span>, <br className="mobile-br" /> just behind the iconic Crescent.
          </span>
        </>
      ),
      subText: (
        <>
          Its unique position ensures a <br className="mobile-br" /> seamless blend of <br className="desktop-br" />breathtaking <br className="mobile-br" /> Caspian panoramas and lush,<span className="desktop-comma"> </span><br className="desktop-br" /><span className="desktop-comma"></span><span className="mobile-comma">, </span><br className="mobile-br" /> meticulously designed landscapes.
        </>
      ),
      mapImage: "/images/property-location/pl.png",
      footerAddress: (
        <>
          Sea Breeze Resort, Nardaran District, <br className="mobile-br" /> Baku, Azerbaijan
        </>
      )
    },
    layouts: [
      {
        title: "1 Bedroom Junior, 50.5 m²",
        code: "1BR Junior",
        floor: "23 floor",
        number: "N° 1",
        price: "$186 004",
        svgBlueprint: (
          <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
            <rect x="10" y="10" width="280" height="200" fill="none" stroke="#2b3541" strokeWidth="3"/>
            <line x1="10" y1="110" x2="190" y2="110" stroke="#2b3541" strokeWidth="2"/>
            <line x1="190" y1="10" x2="190" y2="170" stroke="#2b3541" strokeWidth="2"/>
            <line x1="190" y1="170" x2="290" y2="170" stroke="#2b3541" strokeWidth="2"/>
            <rect x="25" y="20" width="65" height="50" fill="none" stroke="#8e949a" strokeDasharray="2,2"/>
            <circle cx="57" cy="45" r="3" fill="#8e949a"/>
            <path d="M110,35 Q130,55 110,75" fill="none" stroke="#8e949a"/>
            <text x="70" y="140" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living + Kitchen</text>
            <text x="70" y="155" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">6.9 x 2.6</text>
            <text x="70" y="45" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom</text>
            <text x="70" y="60" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">4.4 x 2.6</text>
            <text x="240" y="65" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bathroom</text>
            <text x="240" y="78" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">2.4 x 1.8</text>
            <rect x="20" y="170" width="80" height="30" fill="none" stroke="#8e949a"/>
            <circle cx="190" cy="140" r="14" fill="none" stroke="#8e949a"/>
            <rect x="255" y="125" width="25" height="35" fill="none" stroke="#8e949a"/>
          </svg>
        )
      },
      {
        title: "1 Bedroom Type A, 67.8 m²",
        code: "1BR-A",
        floor: "23 floor",
        number: "N° 2",
        price: "$230 214",
        svgBlueprint: (
          <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
            <rect x="30" y="10" width="240" height="200" fill="none" stroke="#2b3541" strokeWidth="3"/>
            <line x1="155" y1="10" x2="155" y2="150" stroke="#2b3541" strokeWidth="2"/>
            <line x1="155" y1="150" x2="270" y2="150" stroke="#2b3541" strokeWidth="2"/>
            <line x1="155" y1="170" x2="155" y2="210" stroke="#2b3541" strokeWidth="2"/>
            <circle cx="90" cy="65" r="28" fill="none" stroke="#8e949a"/>
            <text x="95" y="95" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living & Kitchen</text>
            <text x="95" y="110" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">3.7 x 7.3</text>
            <rect x="175" y="30" width="75" height="70" fill="none" stroke="#8e949a"/>
            <text x="212" y="115" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom</text>
            <text x="212" y="128" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">3.4 x 4.5</text>
            <text x="245" y="180" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath</text>
            <text x="245" y="192" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">2.0 x 2.2</text>
            <text x="185" y="180" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Powder</text>
            <text x="185" y="192" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">1.3 x 2.2</text>
          </svg>
        )
      },
      {
        title: "1 Bedroom Type B, 67.8 m²",
        code: "1BR-B",
        floor: "1 floor",
        number: "N° 3",
        price: "$224 103",
        svgBlueprint: (
          <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
            <path d="M30,10 L270,10 C270,10 270,170 270,170 C270,170 240,200 190,160 L30,40 Z" fill="none" stroke="#2b3541" strokeWidth="3"/>
            <path d="M30,10 L30,40 M270,10 L270,180 C270,195 250,210 230,195 L65,55" fill="none" stroke="#2b3541" strokeWidth="3"/>
            <line x1="110" y1="10" x2="110" y2="75" stroke="#2b3541" strokeWidth="2"/>
            <line x1="110" y1="75" x2="270" y2="75" stroke="#2b3541" strokeWidth="2"/>
            <text x="75" y="28" fontFamily="Inter" fontSize="8" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath</text>
            <text x="75" y="38" fontFamily="Inter" fontSize="7" fill="#8e949a" textAnchor="middle">2.6 x 1.6</text>
            <text x="75" y="60" fontFamily="Inter" fontSize="8" fill="#2b3541" textAnchor="middle" fontWeight="500">Powder</text>
            <text x="75" y="70" fontFamily="Inter" fontSize="7" fill="#8e949a" textAnchor="middle">2.2 x 1.4</text>
            <text x="210" y="32" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom</text>
            <text x="210" y="44" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">4.7 x 3.1</text>
            <text x="180" y="140" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living & Kitchen</text>
            <text x="180" y="152" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">8.3 x 6.8</text>
            <circle cx="165" cy="110" r="14" fill="none" stroke="#8e949a"/>
            <rect x="185" y="85" width="65" height="25" fill="none" stroke="#8e949a"/>
          </svg>
        )
      }
    ],
    features: {
      headerMain: (
        <>
          The project&apos;s architecture is <br className="mobile-br" /> harmoniously complemented by a <br className="mobile-br" /> world-class infrastructure designed to <br className="mobile-br" /> anticipate your every need.
        </>
      ),
      headerSub: (
        <>
          From high-tech security to <br className="mobile-br" /> premium leisure zones, every <br className="mobile-br" /> technical specification is <br className="mobile-br" /> engineered for absolute comfort and peace of mind.
        </>
      ),
      titleLight: "Project ",
      titleBold: "DetaIls",
      sections: [
        {
          id: "01",
          title: { italic: "Comfort", rest: " and Safety" },
          subtitle: "Excellence in every detail.",
          items: [
            "Underground parking space",
            "24/7 Security system",
            "Business center and workspaces",
            "Lounge and relaxation areas",
          ],
          dark: true,
          image: "/images/project-details/pd1.jpg",
          imageLeft: true,
        },
        {
          id: "02",
          title: { italic: "Wellness", rest: " and Leisure" },
          subtitle: "An oasis of tranquility and relaxation.",
          items: [
            'Two spacious "infinity" pools',
            "Private SPA and wellness zone",
            "Water sports center",
            "Landscaped gardens and fountains",
          ],
          dark: false,
          image: "/images/project-details/pd2.jpg",
          imageLeft: false,
        },
        {
          id: "03",
          title: { italic: "Sports", rest: " and Activity" },
          subtitle: "Energy and movement in every space.",
          items: [
            "Fully equipped gym & fitness center",
            "Professional squash court",
            "Table tennis area",
            "Kids' entertainment and play zones",
          ],
          dark: true,
          image: "/images/project-details/pd3.jpg",
          imageLeft: true,
        },
        {
          id: "04",
          title: { italic: "Location", rest: " Highlights" },
          subtitle: "The perfect balance of city and sea.",
          items: [
            "Crescent Island  —  within walking distance",
            "Dream Arena  —  within walking distance",
            "Sea Breeze Casino  —  within walking distance",
            "Baku Airport (GYD)  —  easily accessible",
          ],
          dark: false,
          image: "/images/project-details/pd4.jpg",
          imageLeft: false,
        },
      ]
    },
    seoTitle: {
      en: "Panorama by Elie Saab | TREVA Real Estate"
    },
    seoDescription: {
      en: "A sophisticated blend of high-fashion aesthetics and modern luxury."
    },
    ogImage: "/images/projects/project1.jpg"
  } ,

   {
    slug: "yeni-layihe-adi",
    hero: {
      title: "sembolik proje başlığı",
      desktopDescription: <>A<span className="lowercase-text"> sophisticated blend of high-fashion aesthetics and modern luxury.</span></>,
      mobileDescription: <>C<span className="lowercase-text">urated real estate investments and tailored lifestyle solutions.</span></>,
      backgroundImage: "/images/projects/project1.jpg",
      ctaText: "GET A CONSULTATION",
      ctaLink: "/consultation"
    },
    overview: {
      titleLight: "Project ",
      titleBold: "Overview",
      brandName: "Panorama by ELIE SAAB",
      debutText: " marks the debut of ",
      locationText: "branded residences",
      debutTextEnd: "at Sea Breeze.",
      description: (
        <>
          This landmark project translates <br className="mobile-br" />
          the legendary designer&apos;s <br className="desktop-br" />
          &quot;timeless <br className="mobile-br" />
          elegance&quot; from Haute Couture <br className="mobile-br" />
          into exclusive <br className="desktop-br" />
          coastal living. Every <br className="mobile-br" />
          detail is meticulously crafted to <br className="desktop-br" />
          <br className="mobile-br" />
          define a new global standard of <br className="mobile-br" />
          sophisticated lifestyle.
        </>
      ),
      images: {
        large: { url: "/images/project-overview/po1.jpg", label: "Modern architecture of buildings" },
        medium: { url: "/images/project-overview/po2.jpg", label: "Elegant living" },
        small: { url: "/images/project-overview/po3.jpg", label: "Incredible view" }
      },
      dataRows: [
        { key: "Project Type", value: "Residential complex" },
        { key: "Year of Completion", value: "2030" },
        { key: "Price Range", value: <>MIN &mdash; 188 874 USD,<br className="mobile-br" />&nbsp;&nbsp;MAX &mdash; 849 849 USD</> }
      ]
    },
    location: {
      titleLight: "Property ",
      titleBold: "LocatIon",
      mainLead: (
        <>
          Panorama by ELIE SAAB{" "}
          <span className="lead-light">
            <br className="mobile-br" />
            sits in the elite heart of <span className="lead-italic">Sea <br className="desktop-br" /> Breeze</span>, <br className="mobile-br" /> just behind the iconic Crescent.
          </span>
        </>
      ),
      subText: (
        <>
          Its unique position ensures a <br className="mobile-br" /> seamless blend of <br className="desktop-br" />breathtaking <br className="mobile-br" /> Caspian panoramas and lush,<span className="desktop-comma"> </span><br className="desktop-br" /><span className="desktop-comma"></span><span className="mobile-comma">, </span><br className="mobile-br" /> meticulously designed landscapes.
        </>
      ),
      mapImage: "/images/property-location/pl.png",
      footerAddress: (
        <>
          Sea Breeze Resort, Nardaran District, <br className="mobile-br" /> Baku, Azerbaijan
        </>
      )
    },
    layouts: [
      {
        title: "1 Bedroom Junior, 50.5 m²",
        code: "1BR Junior",
        floor: "23 floor",
        number: "N° 1",
        price: "$186 004",
        svgBlueprint: (
          <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
            <rect x="10" y="10" width="280" height="200" fill="none" stroke="#2b3541" strokeWidth="3"/>
            <line x1="10" y1="110" x2="190" y2="110" stroke="#2b3541" strokeWidth="2"/>
            <line x1="190" y1="10" x2="190" y2="170" stroke="#2b3541" strokeWidth="2"/>
            <line x1="190" y1="170" x2="290" y2="170" stroke="#2b3541" strokeWidth="2"/>
            <rect x="25" y="20" width="65" height="50" fill="none" stroke="#8e949a" strokeDasharray="2,2"/>
            <circle cx="57" cy="45" r="3" fill="#8e949a"/>
            <path d="M110,35 Q130,55 110,75" fill="none" stroke="#8e949a"/>
            <text x="70" y="140" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living + Kitchen</text>
            <text x="70" y="155" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">6.9 x 2.6</text>
            <text x="70" y="45" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom</text>
            <text x="70" y="60" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">4.4 x 2.6</text>
            <text x="240" y="65" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bathroom</text>
            <text x="240" y="78" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">2.4 x 1.8</text>
            <rect x="20" y="170" width="80" height="30" fill="none" stroke="#8e949a"/>
            <circle cx="190" cy="140" r="14" fill="none" stroke="#8e949a"/>
            <rect x="255" y="125" width="25" height="35" fill="none" stroke="#8e949a"/>
          </svg>
        )
      },
      {
        title: "1 Bedroom Type A, 67.8 m²",
        code: "1BR-A",
        floor: "23 floor",
        number: "N° 2",
        price: "$230 214",
        svgBlueprint: (
          <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
            <rect x="30" y="10" width="240" height="200" fill="none" stroke="#2b3541" strokeWidth="3"/>
            <line x1="155" y1="10" x2="155" y2="150" stroke="#2b3541" strokeWidth="2"/>
            <line x1="155" y1="150" x2="270" y2="150" stroke="#2b3541" strokeWidth="2"/>
            <line x1="155" y1="170" x2="155" y2="210" stroke="#2b3541" strokeWidth="2"/>
            <circle cx="90" cy="65" r="28" fill="none" stroke="#8e949a"/>
            <text x="95" y="95" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living & Kitchen</text>
            <text x="95" y="110" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">3.7 x 7.3</text>
            <rect x="175" y="30" width="75" height="70" fill="none" stroke="#8e949a"/>
            <text x="212" y="115" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom</text>
            <text x="212" y="128" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">3.4 x 4.5</text>
            <text x="245" y="180" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath</text>
            <text x="245" y="192" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">2.0 x 2.2</text>
            <text x="185" y="180" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Powder</text>
            <text x="185" y="192" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">1.3 x 2.2</text>
          </svg>
        )
      },
      {
        title: "1 Bedroom Type B, 67.8 m²",
        code: "1BR-B",
        floor: "1 floor",
        number: "N° 3",
        price: "$224 103",
        svgBlueprint: (
          <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
            <path d="M30,10 L270,10 C270,10 270,170 270,170 C270,170 240,200 190,160 L30,40 Z" fill="none" stroke="#2b3541" strokeWidth="3"/>
            <path d="M30,10 L30,40 M270,10 L270,180 C270,195 250,210 230,195 L65,55" fill="none" stroke="#2b3541" strokeWidth="3"/>
            <line x1="110" y1="10" x2="110" y2="75" stroke="#2b3541" strokeWidth="2"/>
            <line x1="110" y1="75" x2="270" y2="75" stroke="#2b3541" strokeWidth="2"/>
            <text x="75" y="28" fontFamily="Inter" fontSize="8" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath</text>
            <text x="75" y="38" fontFamily="Inter" fontSize="7" fill="#8e949a" textAnchor="middle">2.6 x 1.6</text>
            <text x="75" y="60" fontFamily="Inter" fontSize="8" fill="#2b3541" textAnchor="middle" fontWeight="500">Powder</text>
            <text x="75" y="70" fontFamily="Inter" fontSize="7" fill="#8e949a" textAnchor="middle">2.2 x 1.4</text>
            <text x="210" y="32" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom</text>
            <text x="210" y="44" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">4.7 x 3.1</text>
            <text x="180" y="140" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living & Kitchen</text>
            <text x="180" y="152" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">8.3 x 6.8</text>
            <circle cx="165" cy="110" r="14" fill="none" stroke="#8e949a"/>
            <rect x="185" y="85" width="65" height="25" fill="none" stroke="#8e949a"/>
          </svg>
        )
      }
    ],
    features: {
      headerMain: (
        <>
          The project&apos;s architecture is <br className="mobile-br" /> harmoniously complemented by a <br className="mobile-br" /> world-class infrastructure designed to <br className="mobile-br" /> anticipate your every need.
        </>
      ),
      headerSub: (
        <>
          From high-tech security to <br className="mobile-br" /> premium leisure zones, every <br className="mobile-br" /> technical specification is <br className="mobile-br" /> engineered for absolute comfort and peace of mind.
        </>
      ),
      titleLight: "Project ",
      titleBold: "DetaIls",
      sections: [
        {
          id: "01",
          title: { italic: "Comfort", rest: " and Safety" },
          subtitle: "Excellence in every detail.",
          items: [
            "Underground parking space",
            "24/7 Security system",
            "Business center and workspaces",
            "Lounge and relaxation areas",
          ],
          dark: true,
          image: "/images/project-details/pd1.jpg",
          imageLeft: true,
        },
        {
          id: "02",
          title: { italic: "Wellness", rest: " and Leisure" },
          subtitle: "An oasis of tranquility and relaxation.",
          items: [
            'Two spacious "infinity" pools',
            "Private SPA and wellness zone",
            "Water sports center",
            "Landscaped gardens and fountains",
          ],
          dark: false,
          image: "/images/project-details/pd2.jpg",
          imageLeft: false,
        },
        {
          id: "03",
          title: { italic: "Sports", rest: " and Activity" },
          subtitle: "Energy and movement in every space.",
          items: [
            "Fully equipped gym & fitness center",
            "Professional squash court",
            "Table tennis area",
            "Kids' entertainment and play zones",
          ],
          dark: true,
          image: "/images/project-details/pd3.jpg",
          imageLeft: true,
        },
        {
          id: "04",
          title: { italic: "Location", rest: " Highlights" },
          subtitle: "The perfect balance of city and sea.",
          items: [
            "Crescent Island  —  within walking distance",
            "Dream Arena  —  within walking distance",
            "Sea Breeze Casino  —  within walking distance",
            "Baku Airport (GYD)  —  easily accessible",
          ],
          dark: false,
          image: "/images/project-details/pd4.jpg",
          imageLeft: false,
        },
      ]
    },
    seoTitle: {
      en: "Panorama by Elie Saab | TREVA Real Estate"
    },
    seoDescription: {
      en: "A sophisticated blend of high-fashion aesthetics and modern luxury."
    },
    ogImage: "/images/projects/project1.jpg"
  }
];

export function getProjectModelBySlug(slug: string): ProjectModel | undefined {
  return PROJECTS.find(p => p.slug === slug);
}
