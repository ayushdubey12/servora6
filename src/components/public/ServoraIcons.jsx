import React from 'react';

// Servora Mascot / Logo in Neo-Brutalist styling (Chef cloche with friendly eyes & smile)
export function ServoraLogo({ size = 38, className = '' }) {
  return (
    <div
      className={`servora-logo-wrapper ${className}`}
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
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.75} height={size * 0.75} viewBox="0 0 32 32" fill="none">
        {/* Cloche dome */}
        <path
          d="M6 22C6 14 10 10 16 10C22 10 26 14 26 22H6Z"
          fill="#FFF9C4"
          stroke="#0E0E10"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Cloche top handle */}
        <circle cx="16" cy="7" r="2.5" fill="#FFCA28" stroke="#0E0E10" strokeWidth="2.5" />
        {/* Plate tray */}
        <rect x="4" y="22" width="24" height="4" rx="2" fill="#FFCA28" stroke="#0E0E10" strokeWidth="2.5" />
        {/* Friendly eyes */}
        <circle cx="13" cy="17" r="1.5" fill="#0E0E10" />
        <circle cx="19" cy="17" r="1.5" fill="#0E0E10" />
      </svg>
    </div>
  );
}

// Radiating restaurant channel icons
export function QrScanIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0E0E10" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" fill="#FFCA28" />
      <rect x="14" y="3" width="7" height="7" rx="1" fill="#84CC16" />
      <rect x="3" y="14" width="7" height="7" rx="1" fill="#38BDF8" />
      <path d="M14 14h3v3h-3z" fill="#0E0E10" />
      <path d="M20 14v3h-3" />
      <path d="M14 20h6" />
    </svg>
  );
}

export function GoogleMapsIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#EA4335" />
      <path d="M12 4C9.24 4 7 6.24 7 9C7 12.75 12 19 12 19C12 19 17 12.75 17 9C17 6.24 14.76 4 12 4ZM12 11C10.9 11 10 10.1 10 9C10 7.9 10.9 7 12 7C13.1 7 14 7.9 14 9C14 10.1 13.1 11 12 11Z" fill="#FFFFFF" />
    </svg>
  );
}

export function InstagramFoodIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig-grad-food" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FED373" />
          <stop offset="0.25" stopColor="#F15245" />
          <stop offset="0.6" stopColor="#D92E7F" />
          <stop offset="1" stopColor="#9B36B7" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-grad-food)" />
      <rect x="5.5" y="5.5" width="13" height="13" rx="4" stroke="#FFFFFF" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.2" stroke="#FFFFFF" strokeWidth="1.8" />
      <circle cx="15.8" cy="8.2" r="0.9" fill="#FFFFFF" />
    </svg>
  );
}

export function DeliveryBagIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#FC8019" />
      <path d="M6 9H18L19 20H5L6 9Z" fill="#FFFFFF" />
      <path d="M9 9V7C9 5.34 10.34 4 12 4C13.66 4 15 5.34 15 7V9" stroke="#FC8019" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function UpiPaymentIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#0E8A16" />
      <path d="M12 4V20M7 8L17 16M17 8L7 16" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function WhatsAppOrderIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#25D366" />
      <path d="M17.5 14.3C17.2 14.1 15.8 13.4 15.6 13.3C15.4 13.2 15.2 13.2 15 13.5C14.8 13.8 14.2 14.5 14 14.7C13.8 14.9 13.6 14.9 13.3 14.7C13 14.5 12.1 14.2 11 13.2C10.2 12.5 9.6 11.6 9.4 11.3C9.2 11 9.4 10.8 9.5 10.7C9.6 10.6 9.8 10.4 9.9 10.2C10 10.1 10.1 10 10.2 9.8C10.3 9.6 10.2 9.4 10.1 9.3C10 9.2 9.4 7.7 9.1 7C8.9 6.4 8.6 6.5 8.5 6.5H8C7.8 6.5 7.5 6.6 7.3 6.8C7.1 7 6.4 7.7 6.4 9.1C6.4 10.5 7.4 11.9 7.6 12.1C7.8 12.3 9.6 15.1 12.4 16.3C14.7 17.3 15.2 17.1 15.7 17C16.3 16.9 17.6 16.2 17.9 15.4C18.2 14.6 18.2 13.9 18.1 13.7C18 13.6 17.8 13.5 17.5 14.3Z" fill="#FFFFFF" />
    </svg>
  );
}

export function PosTerminalIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#4F46E5" />
      <rect x="6" y="5" width="12" height="14" rx="2" stroke="#FFFFFF" strokeWidth="1.8" />
      <rect x="8" y="7" width="8" height="4" rx="1" fill="#FFFFFF" />
      <circle cx="9" cy="14" r="1" fill="#FFFFFF" />
      <circle cx="12" cy="14" r="1" fill="#FFFFFF" />
      <circle cx="15" cy="14" r="1" fill="#FFFFFF" />
    </svg>
  );
}

// Vector Doodles
export function PinkZigZag({ width = 44, height = 24 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 44 24" fill="none">
      <path d="M3 18L13 6L23 18L33 6L41 18" stroke="#FF6584" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BlueSquiggle({ width = 48, height = 20 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 48 20" fill="none">
      <path d="M4 14C10 6 14 6 20 14C26 22 30 6 44 10" stroke="#8B5CF6" strokeWidth="3.5" strokeLinecap="round" />
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
      <path d="M11 1C11 6.5 15.5 11 21 11C15.5 11 11 15.5 11 21C11 15.5 6.5 11 1 11C6.5 11 11 6.5 11 1Z" fill="#FF6584" />
    </svg>
  );
}

export function YellowStar({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L14.8 8.2L21.5 9L16.4 13.6L17.8 20.2L12 16.8L6.2 20.2L7.6 13.6L2.5 9L9.2 8.2L12 2Z" fill="#FFCA28" stroke="#0E0E10" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
