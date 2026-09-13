import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ServoraLogo } from '../../components/public/ServoraIcons';
import './Pricing.css';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('yearly');

  return (
    <div className="nb-pricing-page">
      <div className="nb-container">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="nb-pill-badge" style={{ backgroundColor: '#22C55E', color: '#FFF' }}>
            Predictable & Transparent Pricing
          </span>
          <h1 className="nb-h1 nb-bilingual-headline mt-3 mb-4">
            <span className="nb-hindi">शून्य छुपी फीस.</span>
            <br />
            <span style={{ fontFamily: 'var(--nb-font)' }}>Simple plans for growing restaurants.</span>
          </h1>
          <p className="nb-pricing-sub">
            Keep 100% of your earnings. No surprise fees, no proprietary hardware locks, and free menu digitization during onboarding.
          </p>

          {/* Toggle */}
          <div className="nb-pricing-toggle-wrap">
            <button
              className={`nb-toggle-chip ${billingCycle === 'yearly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('yearly')}
            >
              Annual Billing <span className="nb-save-pill">Save 20%</span>
            </button>
            <button
              className={`nb-toggle-chip ${billingCycle === 'monthly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly Billing
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="nb-pricing-grid">
          {/* Card 1: Starter */}
          <div className="nb-pricing-card">
            <div className="nb-pricing-top">
              <span className="nb-pill-badge bg-white">Independent Cafes & QSR</span>
              <h3 className="nb-pricing-plan-name">Starter</h3>
              <p className="nb-pricing-plan-desc">
                Everything you need to launch contactless QR ordering and a digital kitchen.
              </p>
              <div className="nb-pricing-amount-row">
                <span className="nb-price-val">
                  {billingCycle === 'yearly' ? '₹1,599' : '₹1,999'}
                </span>
                <span className="nb-price-freq">/ month, billed {billingCycle}</span>
              </div>
            </div>

            <Link to="/register" className="nb-btn nb-btn-black w-full mb-8">
              Start 14-Day Free Trial
            </Link>

            <div className="nb-pricing-features">
              <p className="nb-features-heading">What's included:</p>
              <ul className="nb-feature-checklist">
                <li>✓ 1 Branch, up to 20 Tables</li>
                <li>✓ Unlimited QR Scans & Menu Browsing</li>
                <li>✓ Real-Time 86ing & Out-of-Stock Toggles</li>
                <li>✓ 1 Kitchen Display Station (KDS)</li>
                <li>✓ Contactless UPI & Card Settlements</li>
                <li>✓ Daily Sales & GST Summary Reports</li>
                <li>✓ Works on Any Tablet, Phone or Laptop</li>
              </ul>
            </div>
          </div>

          {/* Card 2: Growth / Pro */}
          <div className="nb-pricing-card nb-card-popular">
            <div className="nb-popular-ribbon">
              <span>MOST POPULAR</span>
            </div>

            <div className="nb-pricing-top">
              <span className="nb-pill-badge" style={{ backgroundColor: '#FF6584', color: '#FFF' }}>
                Full Service & Multi-Station
              </span>
              <h3 className="nb-pricing-plan-name">AI Restaurant Pro</h3>
              <p className="nb-pricing-plan-desc">
                For busy dining floors requiring multi-station routing, staff roles, and deep analytics.
              </p>
              <div className="nb-pricing-amount-row">
                <span className="nb-price-val">
                  {billingCycle === 'yearly' ? '₹3,199' : '₹3,999'}
                </span>
                <span className="nb-price-freq">/ month, billed {billingCycle}</span>
              </div>
            </div>

            <Link
              to="/register"
              className="nb-btn nb-btn-black w-full mb-8"
              style={{ backgroundColor: '#0E0E10', color: '#FFF' }}
            >
              Start 14-Day Free Trial
            </Link>

            <div className="nb-pricing-features">
              <p className="nb-features-heading">Everything in Starter, plus:</p>
              <ul className="nb-feature-checklist">
                <li>
                  <strong>✓ Unlimited Tables & Dining Sections (Patio, Bar, VIP)</strong>
                </li>
                <li>
                  <strong>✓ Multi-Station KDS (Grill, Cold, Wok, Bar, Expedite)</strong>
                </li>
                <li>
                  <strong>✓ Guest Split Billing (Equal, By Seat, or By Item)</strong>
                </li>
                <li>
                  <strong>✓ Interactive Visual Table Floor Map</strong>
                </li>
                <li>
                  <strong>✓ Role-Based Staff Logins (Manager, Server, Chef)</strong>
                </li>
                <li>
                  <strong>✓ Real-Time Margin, Peak Rush & Item Analytics</strong>
                </li>
                <li>
                  <strong>✓ Priority 24/7 Dedicated On-Call Onboarding Manager</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 100% Risk Free Guarantee */}
        <div className="nb-guarantee-box mt-16">
          <div className="flex items-center gap-4">
            <span style={{ fontSize: '32px' }}>🍽️</span>
            <div>
              <h4 className="font-extrabold text-lg">14-Day Free Trial & Free Menu Digitization</h4>
              <p className="font-semibold text-gray-700 text-sm">
                Sign up in under 60 seconds with no credit card. Our hospitality specialists will transcribe your physical menu, upload food photos, and configure your table map for free.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
