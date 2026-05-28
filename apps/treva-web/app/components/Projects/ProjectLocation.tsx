"use client";

import React from "react";
import { ProjectLocationData } from "@/lib/projects.types";
import "./property-location.css";

interface Props {
  data: ProjectLocationData;
}

export default function ProjectLocation({ data }: Props) {
  return (
    <section className="property-location-section">
      <div className="property-location-container">
        
        {/* Header Block */}
        <div className="property-header-block">
          <h2 className="property-section-title">
            <span className="po-title-light">{data.titleLight}</span>
            <span className="po-title-bold">{data.titleBold}</span>
          </h2>
          
          <div className="property-description-wrapper">
            <p className="property-main-lead">
              {data.mainLead}
            </p>
            
            <div className="property-divider-line" />
            
            <p className="property-sub-text">
              {data.subText}
            </p>
          </div>
        </div>

        {/* Map UI */}
        <div className="property-map-wrapper">
          <div className="property-map-container">
            <img 
              src={data.mapImage} 
              alt="Property Location Map"
              className="property-real-map"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Footer Address */}
        <p className="property-footer-address">
          {data.footerAddress}
        </p>

      </div>
    </section>
  );
}
