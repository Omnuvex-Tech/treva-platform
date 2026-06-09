'use client';

import React, { useState, useEffect } from 'react';
import PageContainer from '@/app/components/Container/PageContainer';
import { ViewAllButton } from '@/app/components/Buttons/PortfolioButtons';
import './treva-pulse.css';

const blogData = [
  {
    id: 1,
    title: "Why Some Developers Outpace the Market?",
    category: "BLOG",
    date: "29.04.2026",
    image: "/images/treva-pulse/tp1.png",
    author: "Tural Najafov",
    avatar: "/images/treva-pulse/tural-najafov.png"
  },
  {
    id: 2,
    title: "Apartment Prices in Baku 2026: Best Value Projects",
    category: "BLOG",
    date: "23.04.2026",
    image: "/images/treva-pulse/tp2.png",
    author: "Leyla Baghirzada",
    avatar: "/images/treva-pulse/leyla-bagirzade.png"
  },
  {
    id: 3,
    title: "Mastering Baku's Real Estate Through Professional Sales.",
    category: "BLOG",
    date: "17.04.2026",
    image: "/images/treva-pulse/tp3.png",
    author: "Javid Akhundov",
    avatar: "/images/treva-pulse/cavid-axundov.png"
  },
  {
    id: 4,
    title: "How Much to Downpay for an Apartment?",
    category: "BLOG",
    date: "08.05.2026",
    image: "/images/treva-pulse/tp4.png",
    author: "Emil Gurbanov",
    avatar: "/images/treva-pulse/emil-qurbanov.png"
  }
];

type PulseFilterButtonProps = {
  category: string;
  isActive: boolean;
  onClick: (category: string) => void;
};

function PulseFilterButton({ category, isActive, onClick }: PulseFilterButtonProps) {
  return (
    <button
      type="button"
      className={`pulse__filter-btn ${isActive ? 'pulse__filter-btn--active' : ''}`}
      onClick={() => onClick(category)}
      suppressHydrationWarning
    >
      {category}
    </button>
  );
}

const TrevaPulse: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('Blog');
  const [itemsVisible, setItemsVisible] = useState(3);

  const categories = ['All', 'Events', 'Blog', 'Highlights'];

  const filteredData = activeFilter === 'All' 
    ? blogData 
    : blogData.filter(post => post.category.toLowerCase() === activeFilter.toLowerCase());

  // Ekran ölçüsünə görə görünən kart sayı
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setItemsVisible(1); // Mobildə dəqiq 1 kart
      } else if (window.innerWidth <= 1024) {
        setItemsVisible(2); // Planşetdə 2 kart
      } else {
        setItemsVisible(3); // Desktopda 3 kart
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sonsuz fırlanma (Infinite) üçün datanı nizamlayırıq
  let baseData = [...filteredData];
  if (baseData.length > 0) {
    while (baseData.length <= itemsVisible) {
      baseData = [...baseData, ...filteredData];
    }
  }
  
  const duplicatedData = [...baseData, ...baseData];
  const totalItems = duplicatedData.length;

  // Genişlik hesablamaları (Mobildə sıxılmanın qarşısını alır)
  const trackWidth = totalItems === 0 ? "100%" : `${(totalItems / itemsVisible) * 100}%`;
  const cardWidth = totalItems === 0 ? "100%" : `${100 / totalItems}%`;
  
  // SÜRATLƏNDİRİLDİ: "baseData.length * 2" saniyəyə endirildi (Əvvəl 4 idi)
  const scrollSpeed = `${baseData.length * 2}s`; 

  return (
    <main>
      <PageContainer>
        <section className="pulse my-10">
          
          <div className="pulse__header">
            <div className="pulse__desktop-row">
              <h2 className="pulse__title">
                <span className="pulse__title-thin">TREVA</span>{" "}
                <span className="pulse__title-bold">PULSE</span>
              </h2>
              
              <p className="pulse__subtitle">
                Your curated source for industry <br />
                news, expert insights, and events. <br />
                Stay connected to the pulse of <br />
                Baku’s premium real estate market.
              </p>
            </div>

            <div className="pulse__controls-row">
              <div className="pulse__filters">
                <span className="pulse__filter-label">Filter by category</span>
                <div className="pulse__btn-group">
                  {categories.map((category) => (
                    <PulseFilterButton
                      key={category}
                      category={category}
                      isActive={activeFilter === category}
                      onClick={setActiveFilter}
                    />
                  ))}
                </div>
              </div>
              
              <div className="pulse__view-all-wrapper d-desktop">
                <ViewAllButton />
              </div>
            </div>
          </div>

          {/* SLIDER CONTAINER */}
          <div className="pulse__slider-wrapper">
            {totalItems > 0 ? (
              <div 
                className="pulse__slider-track"
                style={{ 
                  width: trackWidth,
                  '--scroll-speed': scrollSpeed 
                } as React.CSSProperties}
              >
                {duplicatedData.map((post, index) => (
                  <a 
                    href="#" 
                    key={`${post.id}-${index}`} 
                    className="blog-card"
                    style={{ flex: `0 0 ${cardWidth}`, width: cardWidth }}
                  >
                    <div className="blog-card__inner">
                      <div className="blog-card__img-wrapper">
                        <img src={post.image} alt={post.title} className="blog-card__img" />
                      </div>
                      
                      <div className="blog-card__meta">
                        <span className="blog-card__category">{post.category}</span>
                        <span className="blog-card__date">{post.date}</span>
                      </div>
                      
                      <h3 className="blog-card__title">{post.title}</h3>
                      
                      <div className="blog-card__author">
                        <img src={post.avatar} alt={post.author} className="blog-card__avatar" />
                        <span className="blog-card__author-name">{post.author}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="pulse__no-data">No articles found in this category.</div>
            )}
          </div>

          <div className="pulse__mobile-view-all d-mobile">
            <ViewAllButton mobile />
          </div>

        </section>
      </PageContainer>
    </main>
  );
};

export default TrevaPulse;