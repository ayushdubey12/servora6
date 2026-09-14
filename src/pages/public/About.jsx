import React from 'react';
import { Link } from 'react-router-dom';
import { ServoraLogo } from '../../components/public/ServoraIcons';
import './About.css';

export default function About() {
  return (
    <div className="nb-about-page">
      <div className="nb-about-container">
        {/* Header */}
        <div className="nb-about-header">
          <h1 className="nb-about-title nb-bilingual-headline">About Echovera</h1>
          <small className="nb-hindi-sublabel" style={{ textAlign: 'left' }}>हमारे बारे में— रेस्तरां के लिए, रेस्तरां द्वारा।</small>
          <p className="nb-about-byline">By the Founders · Built for operators & chefs</p>
        </div>

        {/* Lead Callout Card */}
        <div className="nb-callout-card mb-12">
          <p className="nb-callout-text">
            We built Echovera after watching restaurant teams battle jammed ticket printers, clunky legacy terminals, and split-bill chaos during Saturday night rushes. This is why it exists.
          </p>
        </div>

        {/* Numbered Sections */}
        <div className="nb-about-sections">
          {/* Section 1 */}
          <div className="nb-about-section-item">
            <div className="nb-section-badge-header">
              <span className="nb-badge-num">1</span>
              <h2 className="nb-about-section-title">Why we built Echovera</h2>
            </div>
            <div className="nb-about-section-body">
              <p>
                Restaurants run on tight margins and high energy. Yet most hospitality software still looks like 2004 — locking owners into expensive $3,000 terminals and multi-year fee contracts.
              </p>
              <p>
                We believed independent operators deserved software that feels as fast, light, and intuitive as an iPhone.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="nb-about-section-item">
            <div className="nb-section-badge-header">
              <span className="nb-badge-num">2</span>
              <h2 className="nb-about-section-title">What Echovera is</h2>
            </div>
            <div className="nb-about-section-body">
              <p>
                Echovera is a <strong>unified restaurant operating platform</strong>. Guests scan table QR codes to browse and order in seconds. Orders route instantly to digital kitchen displays, and bills settle directly from phones.
              </p>
              <p>
                Your front of house, kitchen line, and checkout stay completely in sync with zero hardware lock-in.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="nb-about-section-item">
            <div className="nb-section-badge-header">
              <span className="nb-badge-num">3</span>
              <h2 className="nb-about-section-title">Our operating rules</h2>
            </div>
            <div className="nb-about-section-body">
              <ul className="nb-about-principles-list">
                <li>
                  <strong>⚡ Instant guest access:</strong> No app downloads or account logins for diners. Ever.
                </li>
                <li>
                  <strong>📱 Any device:</strong> Runs smoothly on iPads, Android tablets, or phones you already own.
                </li>
                <li>
                  <strong>💸 Transparent pricing:</strong> Simple monthly plans with zero hidden transaction cuts.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div className="nb-about-cta-card mt-16">
          <div className="nb-cta-inner">
            <ServoraLogo size={48} />
            <div>
              <h3 className="nb-h3 mb-1">Try Echovera on your floor</h3>
              <p className="font-semibold text-gray-700 text-sm">
                14-day free trial. Setup takes under 24 hours.
              </p>
            </div>
          </div>
          <div className="nb-cta-btn-group">
            <Link to="/register" className="nb-btn nb-btn-black">
              Start Free Trial
            </Link>
            <Link to="/contact" className="nb-btn nb-btn-white">
              Talk to Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
