import React, { useState } from 'react';
import './PhoneMockup.css';

export default function PhoneMockup({ className = '' }) {
  const [activeTab, setActiveTab] = useState(null);
  const [orderAdded, setOrderAdded] = useState(false);

  const collections = [
    {
      id: 'table4',
      title: 'Table 04 (Dine-In)',
      tabColor: '#A3A3A3',
      iconBg: '#9E9E9E',
      links: '3 items',
      subText: '₹1,450',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E0E10" strokeWidth="2.5">
          <path d="M18 2h-3a2 2 0 0 0-2 2v16h4V4a2 2 0 0 0-2-2z" />
          <path d="M6 2v18" />
          <path d="M3 6h6" />
        </svg>
      ),
    },
    {
      id: 'kds',
      title: 'Kitchen Prep',
      tabColor: '#22C55E',
      iconBg: '#22C55E',
      links: '14 tickets',
      subText: 'Avg 9m',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E0E10" strokeWidth="2.5">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
    {
      id: 'specials',
      title: "Chef's Specials",
      tabColor: '#FFCA28',
      iconBg: '#FFD54F',
      links: '8 items',
      subText: 'Live Menu',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E0E10" strokeWidth="2.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      id: 'bar',
      title: 'Bar & Mocktails',
      tabColor: '#84CC16',
      iconBg: '#A3E635',
      links: '9 orders',
      subText: 'Patio & Deck',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E0E10" strokeWidth="2.5">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
        </svg>
      ),
    },
    {
      id: 'takeout',
      title: 'Takeout & Delivery',
      tabColor: '#FF6584',
      iconBg: '#FF6584',
      links: '6 orders',
      subText: 'Ready to pack',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E0E10" strokeWidth="2.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18" />
          <path d="M15 9h3" />
          <path d="M15 15h3" />
        </svg>
      ),
    },
    {
      id: 'vip',
      title: 'VIP Lounge',
      tabColor: '#8B5CF6',
      iconBg: '#A78BFA',
      links: '5 tables',
      badge: 'NEW',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E0E10" strokeWidth="2.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
  ];

  const handleQuickAction = () => {
    setOrderAdded(true);
    setTimeout(() => setOrderAdded(false), 2000);
  };

  return (
    <div className={`nb-phone-chassis ${className}`}>
      {/* Top phone bezel status */}
      <div className="nb-phone-top-status">
        <span className="nb-status-time">09:27</span>
        <div className="nb-status-notch" />
        <div className="nb-status-indicators">
          {/* Signal bars */}
          <svg width="15" height="12" viewBox="0 0 15 12" fill="#0E0E10">
            <rect x="0" y="9" width="2.5" height="3" rx="0.5" />
            <rect x="4" y="6" width="2.5" height="6" rx="0.5" />
            <rect x="8" y="3" width="2.5" height="9" rx="0.5" />
            <rect x="12" y="0" width="2.5" height="12" rx="0.5" />
          </svg>
          {/* Battery pill */}
          <div className="nb-battery-pill">
            <span className="nb-battery-level">87</span>
          </div>
        </div>
      </div>

      {/* Screen Inner */}
      <div className="nb-phone-screen">
        {/* Navigation Bar inside Phone */}
        <div className="nb-phone-header">
          <button className="nb-phone-icon-btn" title="Restaurant Settings" aria-label="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E0E10" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>

          <div className="nb-phone-header-right">
            <button className="nb-phone-icon-btn" title="Floor Map" aria-label="Floor Map">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E0E10" strokeWidth="2.5">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
            <button className="nb-phone-icon-btn" title="Search Orders" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E0E10" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </div>

        {/* Hero inside phone */}
        <div className="nb-phone-headline">
          <h2>Order now.</h2>
          <h2>Serve anytime.</h2>
        </div>

        {/* Quick Order Input Bar */}
        <div className="nb-phone-save-bar">
          <div className="nb-phone-input-box" onClick={handleQuickAction}>
            <span className="nb-phone-hash">#</span>
            <span className="nb-phone-placeholder">
              {orderAdded ? '✓ Order sent to kitchen!' : 'Table 4 · 2x Butter Chicken'}
            </span>
            <button className="nb-phone-copy-btn" aria-label="Order info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0E0E10" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </button>
          </div>
          <button className="nb-phone-add-btn" onClick={handleQuickAction} title="Send order" aria-label="Send order">
            +
          </button>
        </div>

        {/* Collections / Sections Title */}
        <div className="nb-phone-section-title">
          Live Service Sections
        </div>

        {/* Folder Cards Grid */}
        <div className="nb-phone-grid">
          {collections.map((col) => (
            <div
              key={col.id}
              className={`nb-phone-folder-card ${activeTab === col.id ? 'active' : ''}`}
              onClick={() => setActiveTab(col.id === activeTab ? null : col.id)}
            >
              {/* Folder tab */}
              <div
                className="nb-phone-tab"
                style={{ backgroundColor: col.tabColor }}
              >
                <span className="nb-tab-line" />
              </div>

              {/* Folder main body */}
              <div className="nb-phone-folder-inner">
                <div className="nb-phone-card-top">
                  <div className="nb-folder-icon-box" style={{ backgroundColor: col.iconBg }}>
                    {col.icon}
                  </div>
                  <div className="nb-folder-counts">
                    <span className="nb-count-links">{col.links}</span>
                    {col.subText && <span className="nb-count-sub">{col.subText}</span>}
                    {col.badge && <span className="nb-badge-pill-new">{col.badge}</span>}
                  </div>
                </div>
                <div className="nb-folder-card-title">{col.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
