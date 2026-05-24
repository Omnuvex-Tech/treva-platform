'use client';

import React from 'react';
import './portfolio-buttons.css';

type ViewAllButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  label?: string;
  mobile?: boolean;
};

export function ViewAllButton({
  label = 'vIew all',
  mobile = false,
  className = '',
  href = '#',
  ...props
}: ViewAllButtonProps) {
  return (
    <a
      href={href}
      className={`portfolio-view-all${mobile ? ' portfolio-view-all--mobile' : ''}${className ? ` ${className}` : ''}`}
      {...props}
    >
      {label}
    </a>
  );
}

type DirectionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  direction: 'previous' | 'next';
  label?: string;
};

export function DirectionButton({
  direction,
  label,
  className = '',
  ...props
}: DirectionButtonProps) {
  const isPrevious = direction === 'previous';
  const ariaLabel = label ?? (isPrevious ? 'Previous' : 'Next');

  return (
    <button
      type="button"
      className={`portfolio-direction-button${className ? ` ${className}` : ''}`}
      aria-label={ariaLabel}
      {...props}
    >
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d={isPrevious ? 'M7 13L1 7M1 7L7 1M1 7H17' : 'M11 13L17 7M17 7L11 1M17 7H1'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
