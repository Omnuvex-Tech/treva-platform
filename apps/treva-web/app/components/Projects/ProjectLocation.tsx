"use client";

import React from "react";
import "./property-location.css";

interface Props {
  titleLight: string;
  titleBold: string;
  brandName: string;
  mainLead: string;
  subText: string;
  mapImage: string;
  footerAddress: string;
  googleMapsUrl?: string;
  getImageUrl: (url: string) => string;
}

/**
 * Convert any Google Maps URL to a working embed URL.
 * Handles: /maps/place/, /maps?q=, /maps?ll=, direct embed URLs.
 */
function toGoogleMapsEmbed(url: string): string {
  if (!url) return "";

  // Already an embed URL — pass through
  if (url.includes("/maps/embed")) return url;
  if (url.includes("/maps/embed/v1")) return url;

  // Extract coordinates from /maps/place/.../@lat,lng,zoom
  const placeMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*),(\d+\.?\d*)/);
  if (placeMatch) {
    const [, lat, lng, zoom] = placeMatch;
    return `https://maps.google.com/maps?q=${lat},${lng}&z=${Math.round(Number(zoom))}&output=embed`;
  }

  // Extract coordinates from /maps?ll=lat,lng
  const llMatch = url.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (llMatch) {
    const [, lat, lng] = llMatch;
    const zoomMatch = url.match(/[?&]z=(\d+)/);
    const zoom = zoomMatch ? zoomMatch[1] : "15";
    return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
  }

  // Extract query from /maps?q=
  const qMatch = url.match(/[?&]q=([^&]+)/);
  if (qMatch) {
    const query = decodeURIComponent(qMatch[1]!);
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  }

  // Extract place name from /maps/place/NAME/... before @
  const placeNameMatch = url.match(/\/maps\/place\/([^/@]+)/);
  if (placeNameMatch) {
    const placeName = decodeURIComponent(placeNameMatch[1]!.replace(/\+/g, " "));
    return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&output=embed`;
  }

  // Fallback: treat the whole URL as a query
  return `https://maps.google.com/maps?q=${encodeURIComponent(url)}&output=embed`;
}

export default function ProjectLocation({
  titleLight,
  titleBold,
  brandName,
  mainLead,
  subText,
  mapImage,
  footerAddress,
  googleMapsUrl,
  getImageUrl,
}: Props) {
  const hasGoogleMapsUrl = !!googleMapsUrl;
  const embedUrl = hasGoogleMapsUrl ? toGoogleMapsEmbed(googleMapsUrl) : "";

  const showIframe = !!embedUrl;
  const showImage = !showIframe && !!mapImage;
  const showLinkOnly = !showIframe && !showImage && hasGoogleMapsUrl;
  const showEmpty = !showIframe && !showImage && !showLinkOnly;

  return (
    <section className="property-location-section">
      <div className="property-location-container">
        {/* Header Block */}
        <div className="property-header-block">
          {(titleLight || titleBold) && (
            <h2 className="property-section-title">
              <span className="po-title-light">{titleLight}</span>
              <span className="po-title-bold">{titleBold}</span>
            </h2>
          )}

          {(brandName || mainLead || subText) && (
            <div className="property-description-wrapper">
              {(brandName || mainLead) && (
                <p className="property-description-text">
                  {brandName && <span className="property-brand-name">{brandName} </span>}
                  {mainLead && <span className="property-main-lead">{mainLead}</span>}
                </p>
              )}
              <div className="property-divider-line" />
              {subText && <p className="property-sub-text">{subText}</p>}
            </div>
          )}
        </div>

        {/* Case 1: Google Maps URL provided → full height iframe */}
        {showIframe && (
          <div className="property-map-wrapper">
            <div className="property-map-container">
              <iframe
                src={embedUrl}
                width="100%"
                height="450"
                style={{ border: 0, borderRadius: 12 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Property Location Map"
              />
            </div>
          </div>
        )}

        {/* Case 2: No iframe, but map image available → show image + link */}
        {showImage && (
          <div className="property-map-wrapper">
            <div className="property-map-container">
              <img
                src={getImageUrl(mapImage)}
                alt="Property Location Map"
                className="property-real-map"
                style={{ objectFit: "cover" }}
              />
              {hasGoogleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="property-map-link"
                >
                  Google Maps-də aç
                </a>
              )}
            </div>
          </div>
        )}

        {/* Case 3: Has Google Maps URL but no image → link only */}
        {showLinkOnly && (
          <div className="property-map-wrapper">
            <div className="property-map-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="property-map-link"
              >
                Google Maps-də aç
              </a>
            </div>
          </div>
        )}

        {/* Case 4: No URL, no image → minimal placeholder */}
        {showEmpty && (
          <div className="property-map-wrapper">
            <div className="property-map-container property-map-container--empty" />
          </div>
        )}

        {/* Footer Address */}
        {footerAddress && (
          <p className="property-footer-address">{footerAddress}</p>
        )}
      </div>
    </section>
  );
}
