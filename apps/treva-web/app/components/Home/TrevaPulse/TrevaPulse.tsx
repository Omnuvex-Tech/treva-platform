'use client';

import React, { useState } from 'react';
import PageContainer from '@/app/components/Container/PageContainer';
import { DirectionButton, ViewAllButton } from '@/app/components/Buttons/PortfolioButtons';
import './treva-pulse.css';

const blogData = [
  {
    id: 1,
    title: "Why Some Developers Outpace the Market?",
    category: "BLOG",
    date: "29.04.2026",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600",
    author: "Tural Najafov",
    avatar: "https://i.pravatar.cc/150?u=tural"
  },
  {
    id: 2,
    title: "Apartment Prices in Baku 2026: Best Value Projects",
    category: "BLOG",
    date: "23.04.2026",
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600",
    author: "Leyla Baghirzada",
    avatar: "https://i.pravatar.cc/150?u=leyla"
  },
  {
    id: 3,
    title: "Mastering Baku's Real Estate Through Professional Sales.",
    category: "BLOG",
    date: "17.04.2026",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600",
    author: "Javid Akhundov",
    avatar: "https://i.pravatar.cc/150?u=javid"
  },
  {
    id: 4,
    title: "How Much to Downpay for an Apartment?",
    category: "BLOG",
    date: "08.05.2026",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600",
    author: "Emil Gurbanov",
    avatar: "https://i.pravatar.cc/150?u=emil"
  }
];

const TrevaPulse: React.FC = () => {
  // Aktiv filter düyməsini idarə etmək üçün state
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', 'Events', 'Blog', 'Highlights'];

  return (
    <main>
      <PageContainer>
        <section className="pulse">
          
          {/* ========================================================
              1. HEADER SECTION (Başlıq və Text Desktopda d:flex Qarşı-qarşıya)
             ======================================================== */}
          <div className="pulse__header">
            <div className="pulse__desktop-row">
              <h2 className="pulse__title">
                <span className="pulse__title-thin">TREVA</span>{" "}
                <span className="pulse__title-bold">PULSE</span>
              </h2>
              
              <p className="pulse__subtitle">
                Your curated source for industry news, expert <br />
                insights, and events. Stay connected to the pulse of <br />
                Baku’s premium real estate market.
              </p>
            </div>

            {/* Filters & View All Bölməsi */}
            <div className="pulse__controls-row">
              <div className="pulse__filters">
                <span className="pulse__filter-label">Filter by category</span>
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`pulse__filter-btn ${activeFilter === category ? 'pulse__filter-btn--active' : ''}`}
                    onClick={() => setActiveFilter(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              {/* Desktop View All Düyməsi */}
              <div className="pulse__view-all-wrapper d-desktop">
                <ViewAllButton />
              </div>
            </div>
          </div>

          {/* ========================================================
              2. BLOG CARDS GRID
             ======================================================== */}
          <div className="pulse__grid">
            {blogData.map((post) => (
              <a href="#" key={post.id} className="blog-card">
                <div className="blog-card__img-wrapper">
                  <img src={post.image} alt={post.title} className="blog-card__img" />
                </div>
                
                <div className="blog-card__meta">
                  {/* Yenilənmiş Xüsusi Dizaynlı Blog Etiketi */}
                  <span className="blog-card__category">{post.category}</span>
                  <span className="blog-card__date">{post.date}</span>
                </div>
                
                {/* Yenilənmiş 28px Oak Sans Başlıq */}
                <h3 className="blog-card__title">{post.title}</h3>
                
                <div className="blog-card__author">
                  <img src={post.avatar} alt={post.author} className="blog-card__avatar" />
                  <span className="blog-card__author-name">{post.author}</span>
                </div>
              </a>
            ))}
          </div>

          {/* Mobil üçün aşağıda çıxan View All */}
          <div className="d-mobile" style={{ marginTop: '32px' }}>
            <ViewAllButton mobile />
          </div>

          {/* ========================================================
              3. NAVIGATION BUTTONS (Sağ alt küncdəki oxlar)
             ======================================================== */}
          <div className="pulse__controls d-desktop">
            <DirectionButton direction="previous" label="Previous" />
            <DirectionButton direction="next" label="Next" />
          </div>

        </section>
      </PageContainer>
    </main>
  );
};

export default TrevaPulse;