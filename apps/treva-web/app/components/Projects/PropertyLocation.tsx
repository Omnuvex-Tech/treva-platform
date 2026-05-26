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
            <span className="po-title-light">Property </span>
            <span className="po-title-bold">LocatIon</span>
          </h2>
          
          {/* Sağ Tərəf: Təsvir və Detallar */}
          <div className="property-description-wrapper">
            <p className="property-main-lead">
              Panorama by ELIE SAAB{" "}
              <span className="lead-light">
                <br className="mobile-br" />
                sits in the elite heart of <span className="lead-italic">Sea <br className="desktop-br" /> Breeze</span>, <br className="mobile-br" /> just behind the iconic Crescent.
              </span>
            </p>
            
            {/* Maketdəki İncə Bölücü Xətt */}
            <div className="property-divider-line" />
            
            <p className="property-sub-text">
              Its unique position ensures a <br className="mobile-br" /> seamless blend of <br className="desktop-br" />breathtaking <br className="mobile-br" /> Caspian panoramas and lush,<span className="desktop-comma"> </span><br className="desktop-br" /><span className="desktop-comma"></span><span className="mobile-comma">, </span><br className="mobile-br" /> meticulously designed landscapes.
            </p>
          </div>
        </div>

        {/* --- XƏRİTƏ İNTERFEYSİ --- */}
        <div className="property-map-wrapper">
          <div className="property-map-container">
            <img 
              src="/images/property-location/pl.png" 
              alt="Property Location Map"
              className="property-real-map"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* --- ALT ÜNVAN MƏTNİ --- */}
        <p className="property-footer-address">
          Sea Breeze Resort, Nardaran District, <br className="mobile-br" /> Baku, Azerbaijan
        </p>

      </div>
    </section>
  );
}