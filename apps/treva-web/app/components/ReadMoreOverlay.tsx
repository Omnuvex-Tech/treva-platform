import React from 'react';

type ReadMoreOverlayProps = {
  text?: string;
  className?: string;
};

export const ReadMoreOverlay = ({ text = "Məqaləni oxu", className = "" }: ReadMoreOverlayProps) => {
  return (
    <div className={`projects_overlay ${className}`}>
      <div className="news_btn">
        <div>{text}</div>
      </div>
    </div>
  );
};
