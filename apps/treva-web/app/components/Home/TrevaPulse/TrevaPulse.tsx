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
    >
      {category}
    </button>
  );
}

type PulseCategoryFiltersProps = {
  categories: string[];
  activeFilter: string;
  onFilterChange: (category: string) => void;
};

function PulseCategoryFilters({ categories, activeFilter, onFilterChange }: PulseCategoryFiltersProps) {
  return (
    <div className="pulse__btn-group">
      {categories.map((category) => (
        <PulseFilterButton
          key={category}
          category={category}
          isActive={activeFilter === category}
          onClick={onFilterChange}
        />
      ))}
    </div>
  );
}

const TrevaPulse: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('Blog');

  const categories = ['All', 'Events', 'Blog', 'HIghlIghts'];

  return (
    <main>
      <PageContainer>
        <section className="pulse">
          
          {/* ========================================================
              1. HEADER SECTION
             ======================================================== */}
          <div className="pulse__header">
            <div className="pulse__desktop-row">
              <h2 className="pulse__title">
                <span className="pulse__title-thin">TREVA</span>{" "}
                <span className="pulse__title-bold">PULSE</span>
              </h2>
              
              {/* İstədiyiniz sətir ardıcıllığı ilə tam tənzimlənmiş alt mətn */}
              <p className="pulse__subtitle">
                Your curated source for industry <br />
                news, expert insights, and events. <br />
                Stay connected to the pulse of <br />
                Baku’s premium real estate market.
              </p>
            </div>

            {/* Filters & View All Bölməsi */}
            <div className="pulse__controls-row">
              <div className="pulse__filters">
                <span className="pulse__filter-label">FIlter by category</span>
                <PulseCategoryFilters
                  categories={categories}
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                />
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
                  <span className="blog-card__category">{post.category}</span>
                  <span className="blog-card__date">{post.date}</span>
                </div>
                
                <h3 className="blog-card__title">{post.title}</h3>
                
                <div className="blog-card__author">
                  <img src={post.avatar} alt={post.author} className="blog-card__avatar" />
                  <span className="blog-card__author-name">{post.author}</span>
                </div>
              </a>
            ))}
          </div>

          {/* Mobil üçün aşağıda çıxan View All */}
          <div className="pulse__mobile-view-all d-mobile">
            <ViewAllButton mobile />
          </div>

          {/* ========================================================
              3. NAVIGATION BUTTONS (Sağ alt küncdə tam sabit)
             ======================================================== */}
          <div className="pulse__controls-wrapper d-desktop">
            <div className="pulse__controls">
              <DirectionButton direction="previous" label="Previous" />
              <DirectionButton direction="next" label="Next" />
            </div>
          </div>

        </section>
      </PageContainer>
    </main>
  );
};

export default TrevaPulse;
