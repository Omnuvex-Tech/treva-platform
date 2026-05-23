"use client";

import React from "react";
import "./about-us.css";

const AboutUs: React.FC = () => {
  return (
    <main className="about-section">
      <section className="about-section__hero">
        <div className="about-section__content">
          <h1 className="about-section__title">
            About <span>Us</span>
          </h1>
          <div className="about-section__description">
            <p>
              At TREVA Real Estate, we bring together deep market expertise,
              innovative strategies, and a client-first approach to unlock real
              value in every deal.
            </p>
            <p>
              From property sales to investment advisory, we provide end-to-end
              solutions tailored to your goals.
            </p>
            <p>
              Our mission is simple: to help you make confident decisions and
              achieve sustainable growth in Baku's dynamic real estate market.
            </p>
          </div>
        </div>
        <div className="about-section__image-wrapper">
          <img
            className="about-section__image"
            src="Screenshot%202026-05-22%20173711.png"
            alt="TREVA Real Estate office showcase and architectural models"
          />
        </div>
      </section>

      <section className="services-list">
        <div className="services-list__item">
          <div className="services-list__icon-container">
            <svg
              className="services-list__icon"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.34 15.84c-.68-.15-1.48-.12-2.15.22-.67.34-1.12.98-1.2 1.71-.08.73.23 1.45.83 1.87.6.42 1.39.46 2.03.11.64-.35 1.03-1.03 1-1.76l-.11-2.15zM20.61 5.39l-4.24-4.24a1.5 1.5 0 00-2.12 0L9.12 6.27a1.5 1.5 0 000 2.12l4.24 4.24a1.5 1.5 0 002.12 0l5.13-5.13a1.5 1.5 0 000-2.12z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 10.5L3 21m0 0h6m-6 0v-6"
              />
            </svg>
          </div>
          <h2 className="services-list__title">Sales & Marketing</h2>
          <p className="services-list__description">
            Effectively showcasing exclusive real estate opportunities to
            connect properties with the right buyers.
          </p>
        </div>

        <div className="services-list__item">
          <div className="services-list__icon-container">
            <svg
              className="services-list__icon"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94-3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
          </div>
          <h2 className="services-list__title">CRM & Lead Management</h2>
          <p className="services-list__description">
            Systematically managing client relationships and lead pipelines to
            drive superior performance and results.
          </p>
        </div>

        <div className="services-list__item">
          <div className="services-list__icon-container">
            <svg
              className="services-list__icon"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.003 9.003 0 018.716 5.253M12 3a9.003 9.003 0 00-8.716 5.253M12 11.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
              />
            </svg>
          </div>
          <h2 className="services-list__title">Broker Network Activation</h2>
          <p className="services-list__description">
            Empowering broker collaborations, expanding market reach, and
            maximizing overall sales efficiency.
          </p>
        </div>

        <div className="services-list__item">
          <div className="services-list__icon-container">
            <svg
              className="services-list__icon"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
          </div>
          <h2 className="services-list__title">Investment Advisory</h2>
          <p className="services-list__description">
            Providing expert counsel and strategic market analysis to guarantee
            well-informed investment decisions.
          </p>
        </div>
      </section>
    </main>
  );
};

export default AboutUs;