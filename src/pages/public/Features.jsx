import React from 'react';
import { Link } from 'react-router-dom';
import {
  QrScanIcon,
  UpiPaymentIcon,
  PosTerminalIcon,
} from '../../components/public/ServoraIcons';
import './Features.css';

export default function Features() {
  const featureList = [
    {
      badge: '01',
      badgeColor: '#FF6584',
      title: 'Smart QR Menus',
      desc: 'Instant digital menus in any guest browser. Update prices, add specials, or mark items 86 (sold out) in 1 tap.',
      highlight: 'Zero app download required',
      preview: (
        <div className="nb-feat-preview-box">
          <div className="nb-feat-share-row">
            <QrScanIcon size={26} />
            <span className="font-bold">→</span>
            <span className="bg-white border-2 border-black rounded-lg px-2.5 py-1 font-bold text-xs">
              Table 04 Menu
            </span>
            <span className="font-bold">→</span>
            <span className="bg-green-100 border-2 border-black rounded-lg px-2 py-0.5 font-bold text-xs text-green-800">
              Live in 0.4s
            </span>
          </div>
        </div>
      ),
    },
    {
      badge: '02',
      badgeColor: '#FFCA28',
      title: 'Digital Kitchen Display',
      desc: 'Replace noisy paper printers. Orders route automatically to prep stations (Grill, Salad, Bar) with live elapsed timers.',
      highlight: '35% faster ticket turnaround',
      preview: (
        <div className="nb-feat-preview-box">
          <div className="flex gap-2 justify-center">
            <div className="nb-mini-folder-tab tab-yellow">🔥 Grill: 3</div>
            <div className="nb-mini-folder-tab tab-blue">🥗 Cold: 2</div>
            <div className="nb-mini-folder-tab tab-green">🍸 Bar: 4</div>
          </div>
        </div>
      ),
    },
    {
      badge: '03',
      badgeColor: '#22C55E',
      title: 'Table & Floor Map',
      desc: 'Interactive floor map of your dining room and patio. Track table occupancy, order status, and turn times at a glance.',
      highlight: 'Turn tables 18% faster',
      preview: (
        <div className="nb-feat-preview-box flex justify-around items-center font-bold text-xs">
          <span className="px-2 py-1 bg-green-100 border border-black rounded">T1: Seated</span>
          <span className="px-2 py-1 bg-yellow-100 border border-black rounded">T2: Food Ready</span>
          <span className="px-2 py-1 bg-blue-100 border border-black rounded">T3: Billed</span>
        </div>
      ),
    },
    {
      badge: '04',
      badgeColor: '#8B5CF6',
      title: 'Split Bills & Instant Pay',
      desc: 'Guests split table bills evenly or by item directly from their phones with UPI, Apple Pay, and auto-generated GST invoices.',
      highlight: 'No card machine waiting',
      preview: (
        <div className="nb-feat-preview-box text-center p-2">
          <div className="inline-flex gap-2 items-center bg-white border-2 border-black rounded-full px-3 py-1 font-bold text-xs">
            <UpiPaymentIcon size={16} />
            <PosTerminalIcon size={16} />
            <span>UPI, Card & Apple Pay</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="nb-features-page">
      <div className="nb-container">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="nb-pill-badge" style={{ backgroundColor: '#FFCA28' }}>
            Core Capabilities
          </span>
          <h1 className="nb-h1 nb-bilingual-headline mt-2 mb-3">
            <span className="nb-hindi">सरल tools.</span><br />
            <span className="nb-hindi">तेज़ service.</span>
          </h1>
          <p className="nb-features-sub">Everything your restaurant needs to operate smoothly during peak hours.</p>
        </div>

        {/* Features Grid */}
        <div className="nb-features-grid" style={{ maxWidth: 960, margin: '0 auto' }}>
          {featureList.map((feat, i) => (
            <div key={i} className="nb-feature-card" style={{ padding: 22 }}>
              <div className="nb-feature-top" style={{ marginBottom: 12 }}>
                <span
                  className="nb-badge-num"
                  style={{
                    backgroundColor: feat.badgeColor,
                    color: feat.badgeColor === '#FFCA28' ? '#000' : '#FFF',
                    width: 32,
                    height: 32,
                    fontSize: 14,
                  }}
                >
                  {feat.badge}
                </span>
                <span className="nb-feature-highlight" style={{ fontSize: 11 }}>{feat.highlight}</span>
              </div>

              <h3 className="nb-feature-title" style={{ fontSize: 19, marginBottom: 6 }}>{feat.title}</h3>
              <p className="nb-feature-desc" style={{ fontSize: 14, marginBottom: 14 }}>{feat.desc}</p>

              <div className="nb-feature-preview-wrap">{feat.preview}</div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="nb-cta-banner mt-16" style={{ padding: '40px 24px' }}>
          <h2 className="nb-cta-title" style={{ fontSize: '2rem' }}>Ready to run a faster dining room?</h2>
          <p className="nb-cta-desc" style={{ marginBottom: 20 }}>Try AI Restaurant free for 14 days. No credit card required.</p>
          <div className="nb-cta-buttons">
            <Link to="/register" className="nb-btn nb-btn-black">
              Start Free Trial
            </Link>
            <Link to="/pricing" className="nb-btn nb-btn-white">
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
