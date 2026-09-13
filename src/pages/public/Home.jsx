import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import PhoneMockup from '../../components/public/PhoneMockup';
import {
  ServoraLogo,
  QrScanIcon,
  GoogleMapsIcon,
  InstagramFoodIcon,
  DeliveryBagIcon,
  UpiPaymentIcon,
  WhatsAppOrderIcon,
  PosTerminalIcon,
  PinkZigZag,
  BlueSquiggle,
  PurpleCross,
  PinkSparkle,
} from '../../components/public/ServoraIcons';
import './Home.css';

export default function Home() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const menuItems = [
    {
      id: 1,
      title: 'Truffle Mushroom Woodfired Pizza',
      category: 'mains',
      price: '₹590',
      tag: 'Chef Pick',
      type: 'VEG',
      color: '#FFCA28',
    },
    {
      id: 2,
      title: 'Smoked Butter Chicken & Naan',
      category: 'mains',
      price: '₹480',
      tag: 'Bestseller',
      type: 'NON-VEG',
      color: '#FF6584',
    },
    {
      id: 3,
      title: 'Crispy Avocado & Edamame Crostini',
      category: 'starters',
      price: '₹340',
      tag: 'Vegan',
      type: 'VEG',
      color: '#22C55E',
    },
    {
      id: 4,
      title: 'Wild Berry Hibiscus Craft Mocktail',
      category: 'drinks',
      price: '₹260',
      tag: 'Craft Bar',
      type: 'VEG',
      color: '#8B5CF6',
    },
  ];

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const faqs = [
    {
      q: 'Do customers need to download an app?',
      a: 'No. Customers scan the table QR code with their phone camera. The menu opens immediately in their mobile browser.',
    },
    {
      q: 'Does it work with standard tablets and phones?',
      a: 'Yes. AI Restaurant runs on iPads, Android tablets, and phones you already own with zero proprietary hardware required.',
    },
    {
      q: 'Can customers split bills and pay via UPI?',
      a: 'Yes. Diners can split bills evenly or by individual items, and pay via UPI (Google Pay, PhonePe), card, or Apple Pay.',
    },
    {
      q: 'How fast can we go live?',
      a: 'Most restaurants launch in under 24 hours. Our team digitizes your menu and configures your table layout for free.',
    },
  ];

  return (
    <div className="nb-home">
      {/* ═══ 1. HERO SECTION ═══ */}
      <section className="nb-hero">
        <div className="nb-hero-container">
          {/* Left: Headline & CTAs */}
          <div className="nb-hero-content">
            <motion.div
              className="nb-hero-headline-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="nb-hero-title nb-bilingual-headline">
                स्कैन करें.{' '}<br />
                <span style={{ fontFamily: 'var(--nb-font)' }}>Serve it faster.</span>
              </h1>
            </motion.div>

            <motion.p
              className="nb-hero-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Digital QR menus, kitchen display routing, and instant checkout — built to survive the Friday night rush.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="nb-hero-store-buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Link to="/register" className="nb-btn nb-btn-black" style={{ padding: '13px 26px', fontSize: '15.5px' }}>
                Start 14-Day Free Trial →
              </Link>
              <a href="#demo" className="nb-btn nb-btn-yellow" style={{ padding: '13px 22px', fontSize: '15px' }}>
                Live Demo ↓
              </a>
            </motion.div>

            <motion.p
              className="nb-hero-microcopy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              No credit card needed · Free menu setup · Live in 24h
            </motion.p>
          </div>

          {/* Right: Phone Mockup with Radiating Channels */}
          <div className="nb-hero-visual-stage">
            <div className="nb-blob-yellow" />
            <div className="nb-blob-pink" />
            <div className="nb-blob-purple" />

            {/* Doodles */}
            <div className="nb-doodle-zigzag nb-floating">
              <PinkZigZag />
            </div>
            <div className="nb-doodle-squiggle nb-floating-delayed">
              <BlueSquiggle />
            </div>
            <div className="nb-doodle-cross">
              <PurpleCross />
            </div>
            <div className="nb-doodle-sparkle">
              <PinkSparkle />
            </div>

            {/* Floating Channels */}
            <div className="nb-radiating-apps hide-mobile">
              <div className="nb-floating-app nb-app-tiktok" title="QR Menus">
                <QrScanIcon size={28} />
              </div>
              <div className="nb-floating-app nb-app-ig" title="Google Maps">
                <GoogleMapsIcon size={28} />
              </div>
              <div className="nb-floating-app nb-app-yt" title="Instagram">
                <InstagramFoodIcon size={28} />
              </div>
              <div className="nb-floating-app nb-app-safari" title="Takeout">
                <DeliveryBagIcon size={28} />
              </div>
              <div className="nb-floating-app nb-app-chrome" title="UPI Pay">
                <UpiPaymentIcon size={28} />
              </div>
              <div className="nb-floating-app nb-app-messages" title="WhatsApp">
                <WhatsAppOrderIcon size={28} />
              </div>
              <div className="nb-floating-app nb-app-link" title="Card POS">
                <PosTerminalIcon size={28} />
              </div>

              <svg className="nb-radiating-svg" viewBox="0 0 320 380" fill="none">
                <path d="M40 40 Q 160 140 280 180" stroke="#0E0E10" strokeWidth="2.5" strokeDasharray="5 5" />
                <path d="M120 20 Q 180 120 280 180" stroke="#0E0E10" strokeWidth="2.5" strokeDasharray="5 5" />
                <path d="M20 120 Q 140 160 280 180" stroke="#0E0E10" strokeWidth="2.5" strokeDasharray="5 5" />
                <path d="M110 130 Q 190 170 280 180" stroke="#0E0E10" strokeWidth="2.5" strokeDasharray="5 5" />
                <path d="M20 200 Q 150 200 280 180" stroke="#0E0E10" strokeWidth="2.5" strokeDasharray="5 5" />
                <path d="M90 240 Q 180 210 280 180" stroke="#0E0E10" strokeWidth="2.5" strokeDasharray="5 5" />
                <path d="M40 300 Q 160 250 280 180" stroke="#0E0E10" strokeWidth="2.5" strokeDasharray="5 5" />
                <polygon points="280,172 295,180 280,188" fill="#0E0E10" />
              </svg>
            </div>

            <div className="nb-hero-phone-wrapper">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 2. SHOWCASE 3-CARD SECTION ═══ */}
      <section className="nb-showcase-section" id="how-it-works">
        <div className="nb-container">
          <div className="nb-section-title-wrap text-center">
            <h2 className="nb-showcase-heading nb-bilingual-headline">
              <span className="nb-hindi">स्कैन.</span>{' '}
              <span style={{ fontFamily: 'var(--nb-font)' }}>Cook.</span>{' '}
              <span className="nb-hindi">बिल करो.</span>
            </h2>
            <small className="nb-hindi-sublabel" style={{ fontFamily: 'var(--nb-font)', color: 'var(--nb-text-muted)', fontSize: '0.95rem', letterSpacing: 0, display: 'block', marginBottom: 4 }}>
              Three seamless steps. Zero dining friction.
            </small>
          </div>

          <div className="nb-showcase-grid">
            {/* Card 1 */}
            <div className="nb-showcase-card">
              <div className="nb-showcase-inner-visual">
                <div className="nb-mini-mockup-share">
                  <div className="nb-share-header">
                    <div className="nb-share-thumb" style={{ background: '#FFCA28' }} />
                    <div className="nb-share-meta">
                      <span className="nb-share-title">Table 04 · Live Menu 🍕</span>
                      <span className="nb-share-domain">servora.menu</span>
                    </div>
                  </div>

                  <div className="nb-share-contacts">
                    {['Guest 1', 'Guest 2', 'Guest 3'].map((name, i) => (
                      <div key={i} className="nb-share-contact-item">
                        <div className="nb-share-avatar">{name.split(' ')[1]}</div>
                        <span className="nb-share-name">{name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="nb-share-app-row">
                    <div className="nb-share-app-chip">
                      <QrScanIcon size={24} />
                      <span>QR Scan</span>
                    </div>
                    <div className="nb-share-app-chip nb-share-tuckii-highlight">
                      <ServoraLogo size={28} />
                      <span className="font-bold">AI Restaurant</span>
                    </div>
                  </div>

                  <div className="nb-share-action-list">
                    <div className="nb-share-action-row">2x Truffle Mushroom Pizza</div>
                  </div>
                </div>
              </div>

              <div className="nb-showcase-card-footer">
                <span className="nb-badge-num nb-badge-pink">01</span>
                <div className="nb-showcase-text">
                  <h3 className="nb-showcase-card-title">Scan from table</h3>
                  <p className="nb-showcase-card-desc">Diners scan the table QR code and order directly in their browser.</p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="nb-showcase-card">
              <div className="nb-showcase-inner-visual">
                <div className="nb-mini-mockup-organize">
                  <div className="nb-mini-folders-row">
                    <div className="nb-mini-folder-tab tab-yellow">
                      <span>🔥 Grill</span>
                      <span className="nb-tab-count">3 orders</span>
                    </div>
                    <div className="nb-mini-folder-tab tab-blue">
                      <span>🥗 Salad</span>
                      <span className="nb-tab-count">2 orders</span>
                    </div>
                  </div>

                  <div className="nb-mini-cards-cluster">
                    <div className="nb-mini-item-card">
                      <div className="nb-mini-tag">Table 04 · Dine-In</div>
                      <p className="nb-mini-item-title">2x Butter Chicken · 03m elapsed</p>
                    </div>
                  </div>

                  <div className="nb-mini-action-popup" style={{ top: 110 }}>
                    <div className="nb-popup-item">✓ Mark Ready</div>
                  </div>

                  <div className="nb-mini-bulk-bar">
                    <span>Prep: 3</span>
                    <span>Ready: 2</span>
                    <span>Bump Ticket</span>
                  </div>
                </div>
              </div>

              <div className="nb-showcase-card-footer">
                <span className="nb-badge-num nb-badge-pink">02</span>
                <div className="nb-showcase-text">
                  <h3 className="nb-showcase-card-title">Digital Kitchen routing</h3>
                  <p className="nb-showcase-card-desc">Tickets route straight to prep stations with color-coded status.</p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="nb-showcase-card">
              <div className="nb-showcase-inner-visual">
                <div className="nb-mini-mockup-search">
                  <div className="nb-search-bar-sim">
                    <span>Table 04 · Total: ₹1,450</span>
                  </div>

                  <div className="nb-sim-filters">
                    <span className="nb-sim-chip active">UPI</span>
                    <span className="nb-sim-chip">Split Bill</span>
                    <span className="nb-sim-chip">Card</span>
                  </div>

                  <div className="nb-sim-results-grid">
                    <div className="nb-sim-card">
                      <div className="nb-sim-card-banner banner-1" style={{ height: 40 }} />
                      <span className="nb-sim-card-title">Today's Revenue</span>
                      <span className="nb-sim-card-time">₹48,500 (127 orders)</span>
                    </div>
                  </div>

                  <div className="nb-found-badge">
                    <span>SETTLED IN SECONDS</span>
                  </div>
                </div>
              </div>

              <div className="nb-showcase-card-footer">
                <span className="nb-badge-num nb-badge-pink">03</span>
                <div className="nb-showcase-text">
                  <h3 className="nb-showcase-card-title">Instant split billing</h3>
                  <p className="nb-showcase-card-desc">Guests split bills evenly or by item and pay via UPI or card.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. INTERACTIVE MENU DEMO ═══ */}
      <section className="nb-section nb-demo-section" id="demo">
        <div className="nb-container" style={{ maxWidth: 900 }}>
          <div className="text-center mb-8">
            <span className="nb-pill-badge" style={{ backgroundColor: '#FFD54F' }}>
              Interactive Demo
            </span>
            <h2 className="nb-h2 mt-2 mb-1">Instant Table Menu</h2>
            <p className="nb-section-sub">Search or tap a category to test how fast guests can order.</p>
          </div>

          <div className="nb-demo-card" style={{ padding: '24px 28px' }}>
            <div className="nb-demo-toolbar" style={{ gap: 12, marginBottom: 20 }}>
              <div className="nb-demo-input-wrap" style={{ padding: '10px 16px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E0E10" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search dishes (e.g. pizza, chicken, mocktail)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="nb-demo-input"
                  style={{ fontSize: 15 }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="nb-demo-clear-btn">
                    ✕
                  </button>
                )}
              </div>

              <div className="nb-demo-filter-pills">
                {[
                  { id: 'all', label: 'All Dishes' },
                  { id: 'starters', label: 'Starters' },
                  { id: 'mains', label: 'Mains' },
                  { id: 'drinks', label: 'Drinks' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    className={`nb-filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                    style={{ padding: '6px 14px', fontSize: 13 }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="nb-demo-results-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              {filteredItems.map((item) => (
                <div key={item.id} className="nb-demo-item-card" style={{ minHeight: 'auto', padding: 14 }}>
                  <div className="nb-item-top" style={{ marginBottom: 6 }}>
                    <span className="nb-item-source-badge" style={{ backgroundColor: item.color, color: item.color === '#FFCA28' ? '#000' : '#FFF', fontSize: 10 }}>
                      {item.tag}
                    </span>
                    <span className="nb-item-tag">{item.type}</span>
                  </div>
                  <h4 className="nb-item-title" style={{ fontSize: 14.5, marginBottom: 8 }}>{item.title}</h4>
                  <div className="nb-item-bottom" style={{ paddingTop: 6 }}>
                    <span className="font-black text-black" style={{ fontSize: 15 }}>{item.price}</span>
                    <button className="nb-pill-badge" style={{ background: '#FFCA28', cursor: 'pointer', border: '1.5px solid #000', fontSize: 11 }}>
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4. FAQ ═══ */}
      <section className="nb-section nb-faq-section" id="faq" style={{ padding: '60px 0 90px' }}>
        <div className="nb-container" style={{ maxWidth: 760 }}>
          <div className="text-center mb-8">
            <h2 className="nb-h2 mb-2">Common Questions</h2>
          </div>

          <div className="nb-faq-list">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`nb-faq-card ${activeFaq === i ? 'open' : ''}`}
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                style={{ padding: '14px 20px' }}
              >
                <div className="nb-faq-question" style={{ fontSize: 15.5 }}>
                  <span>{faq.q}</span>
                  <div className="nb-faq-icon" style={{ width: 24, height: 24, fontSize: 16 }}>
                    {activeFaq === i ? '−' : '+'}
                  </div>
                </div>
                {activeFaq === i && (
                  <div className="nb-faq-answer" style={{ fontSize: 14.5 }}>
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. CTA BANNER ═══ */}
      <section className="nb-section nb-cta-banner-section" style={{ padding: '0 0 80px' }}>
        <div className="nb-container">
          <div className="nb-cta-banner" style={{ padding: '48px 32px' }}>
            <span className="nb-pill-badge" style={{ backgroundColor: '#FFFFFF' }}>
              14-Day Free Trial
            </span>
            <h2 className="nb-cta-title nb-bilingual-headline" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)' }}>
              <span className="nb-hindi-yellow">डाइनिंग रश</span>{' '}
              <span style={{ fontFamily: 'var(--nb-font)', color: '#0E0E10' }}>speed up करें?</span>
            </h2>
            <p className="nb-cta-desc" style={{ marginBottom: 24 }}>
              Setup takes less than 24 hours. Free menu digitization included.
            </p>
            <div className="nb-cta-buttons">
              <Link to="/register" className="nb-btn nb-btn-black" style={{ padding: '13px 26px' }}>
                Start Free Trial
              </Link>
              <Link to="/contact" className="nb-btn nb-btn-white" style={{ padding: '13px 22px' }}>
                Book Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
