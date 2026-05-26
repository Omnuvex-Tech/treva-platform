"use client";

import React from "react";
import "./property-location.css";

export default function PropertyLocation() {
  return (
    <section className="property-location-section">
      <div className="property-location-container">
        
        {/* --- BAŞLIQ VƏ MƏTN BLOKU --- */}
        <div className="property-header-block">
          {/* Sol Tərəf: Bölmənin Adı */}
          <h2 className="property-section-title">
            PROPERTY <span className="title-bold">LOCATION</span>
          </h2>
          
          {/* Sağ Tərəf: Təsvir və Detallar */}
          <div className="property-description-wrapper">
            <p className="property-main-lead">
              Panorama by ELIE SAAB{" "}
              <span className="lead-light">
                sits in the elite heart of <span className="lead-italic">Sea Breeze</span>, just behind the iconic Crescent.
              </span>
            </p>
            
            {/* Maketdəki İncə Bölücü Xətt */}
            <div className="property-divider-line" />
            
            <p className="property-sub-text">
              Its unique position ensures a seamless blend of breathtaking Caspian panoramas and lush, meticulously designed landscapes.
            </p>
          </div>
        </div>

        {/* --- XƏRİTƏ İNTERFEYSİ --- */}
        <div className="property-map-wrapper">
          <div className="property-map-container">
            {/* Real xəritə inteqrasiyası (Google Maps/Mapbox API) və ya şəkil bura yerləşdiriləcək */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12117.842790906232!2d50.0094!3d40.5562!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDMzJzIyLjMiTiA1MMKwMDAnMzMuOCJF!5e0!3m2!1saz!2saz!4v1716550000000!5m2!1saz!2saz"
              className="property-real-map"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* --- ALT ÜNVAN MƏTNİ --- */}
        <p className="property-footer-address">
          Sea Breeze Resort, Nardaran District, Baku, Azerbaijan
        </p>

      </div>
    </section>
  );
}