import React from 'react';

// Tuckii Bookmark Mascot with playful face & thick stroke
export function TuckiiLogo({ size = 38, className = '' }) {
  return (
    <div
      className={`tuckii-logo-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        backgroundColor: '#FFCA28',
        borderRadius: '12px',
        border: '2.5px solid #0E0E10',
        boxShadow: '3px 3px 0px #0E0E10',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0
      }}
    >
      <svg width={size * 0.75} height={size * 0.75} viewBox="0 0 32 32" fill="none">
        {/* Bookmark ribbon */}
        <path
          d="M7 4H25C26.1046 4 27 4.89543 27 6V28L16 22L5 28V6C5 4.89543 5.89543 4 7 4Z"
          fill="#FFD54F"
          stroke="#0E0E10"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Eyes */}
        <circle cx="11" cy="11" r="1.8" fill="#0E0E10" />
        <circle cx="21" cy="11" r="1.8" fill="#0E0E10" />
        {/* Smile */}
        <path
          d="M12.5 16C13.5 18 18.5 18 19.5 16"
          stroke="#0E0E10"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// App icons radiating into phone mockup
export function TikTokIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#0E0E10" />
      <path
        d="M16.5 7.5C15.5 7.5 14.5 6.8 14.2 5.5H11.5V15.2C11.3 16.3 10.3 17 9.2 16.8C8.1 16.6 7.4 15.6 7.6 14.5C7.8 13.5 8.7 12.8 9.8 12.8C10.1 12.8 10.4 12.9 10.7 13V10.2C10.3 10.1 9.9 10.1 9.5 10.1C6.7 10.1 4.5 12.3 4.5 15.1C4.5 17.9 6.7 20.1 9.5 20.1C12.3 20.1 14.5 17.9 14.5 15.1V9.6C15.7 10.4 17.1 10.7 18.5 10.7V7.9C17.7 7.9 17 7.6 16.5 7.5Z"
        fill="#FFFFFF"
      />
      <path
        d="M14.5 9.6V15.1C14.5 17.9 12.3 20.1 9.5 20.1C8.2 20.1 7.1 19.6 6.3 18.8C7.1 19.3 8.1 19.6 9.2 19.6C11.8 19.6 14 17.4 14 14.8V9.3C15.3 10.2 16.9 10.5 18.5 10.5V10C17.1 10 15.7 9.7 14.5 9.6Z"
        fill="#25F4EE"
        opacity="0.8"
      />
    </svg>
  );
}

export function InstagramIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig-grad" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FED373" />
          <stop offset="0.25" stopColor="#F15245" />
          <stop offset="0.6" stopColor="#D92E7F" />
          <stop offset="1" stopColor="#9B36B7" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
      <rect x="5.5" y="5.5" width="13" height="13" rx="4" stroke="#FFFFFF" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.2" stroke="#FFFFFF" strokeWidth="1.8" />
      <circle cx="15.8" cy="8.2" r="0.9" fill="#FFFFFF" />
    </svg>
  );
}

export function YouTubeIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#FF0000" />
      <path d="M16 12L10 8.5V15.5L16 12Z" fill="#FFFFFF" />
    </svg>
  );
}

export function SafariIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#0284C7" />
      <circle cx="12" cy="12" r="8" stroke="#FFFFFF" strokeWidth="1.5" />
      <polygon points="12,6 14.5,12 12,18 9.5,12" fill="#FFFFFF" />
      <polygon points="12,6 14.5,12 12,12" fill="#EF4444" />
    </svg>
  );
}

export function ChromeIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#FFFFFF" stroke="#0E0E10" strokeWidth="1" />
      <circle cx="12" cy="12" r="4.5" fill="#2563EB" />
      <path d="M12 7.5H20.5C18.8 4.7 15.6 3 12 3C8.4 3 5.2 4.7 3.5 7.5L7.8 15L12 7.5Z" fill="#EF4444" />
      <path d="M3.5 7.5C2.5 9.1 2 11 2 13C2 17.5 5 21.3 9.2 22.5L13.5 15L7.8 15C5.8 15 4.1 13.9 3.5 12.2L3.5 7.5Z" fill="#22C55E" />
      <path d="M12 16.5C10.2 16.5 8.7 15.3 8.1 13.7L3.8 6.2C5.5 4.3 8 3 10.8 3C15.8 3 19.9 7 20 12H12.2L12 16.5Z" fill="#EAB308" opacity="0.9" />
    </svg>
  );
}

export function MessagesIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#22C55E" />
      <path
        d="M17 11C17 14.3 14.3 16.5 11.5 16.5C10.5 16.5 9.5 16.2 8.6 15.7L6 16.5L6.9 14.1C6.3 13.2 6 12.1 6 11C6 7.7 8.7 5.5 11.5 5.5C14.3 5.5 17 7.7 17 11Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function LinkChainIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#64748B" />
      <path
        d="M10 13C10.4 14.1 11.3 15 12.5 15H15C16.7 15 18 13.7 18 12C18 10.3 16.7 9 15 9H12.5"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 11C13.6 9.9 12.7 9 11.5 9H9C7.3 9 6 10.3 6 12C6 13.7 7.3 15 9 15H11.5"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Playful Vector Doodles
export function PinkZigZag({ width = 44, height = 24 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 44 24" fill="none">
      <path
        d="M3 18L13 6L23 18L33 6L41 18"
        stroke="#FF6584"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BlueSquiggle({ width = 48, height = 20 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 48 20" fill="none">
      <path
        d="M4 14C10 6 14 6 20 14C26 22 30 6 44 10"
        stroke="#8B5CF6"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PurpleCross({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 2V18M2 10H18" stroke="#8B5CF6" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export function PinkSparkle({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <path
        d="M11 1C11 6.5 15.5 11 21 11C15.5 11 11 15.5 11 21C11 15.5 6.5 11 1 11C6.5 11 11 6.5 11 1Z"
        fill="#FF6584"
      />
    </svg>
  );
}

export function YellowStar({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L14.8 8.2L21.5 9L16.4 13.6L17.8 20.2L12 16.8L6.2 20.2L7.6 13.6L2.5 9L9.2 8.2L12 2Z"
        fill="#FFCA28"
        stroke="#0E0E10"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
