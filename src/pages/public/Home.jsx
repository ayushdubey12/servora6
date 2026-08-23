import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './Home.css';

/* ─── Scroll Reveal ─── */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('reveal-hidden');
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.sr').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─── Counter Animation ─── */
function useCounter(end, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * end));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);
  return [count, ref];
}

function MetricCard({ value, suffix, label }) {
  const [count, ref] = useCounter(value);
  return (
    <div className="hp-metric" ref={ref}>
      <span className="hp-metric-value">{count}{suffix}</span>
      <span className="hp-metric-label">{label}</span>
    </div>
  );
}

export default function Home() {
  useScrollReveal();

  const [activeFaq, setActiveFaq] = useState(null);

  const steps = [
    { num: '01', title: 'Scan QR', desc: 'Customer scans a QR code on their table. The menu opens instantly in their browser — no app download.' },
    { num: '02', title: 'Place Order', desc: 'Browse your full menu with photos, descriptions, and prices. Order directly from the phone.' },
    { num: '03', title: 'Kitchen Prep', desc: 'Orders appear on the Kitchen Display instantly. Color-coded tickets route to the right prep station.' },
    { num: '04', title: 'Serve & Pay', desc: 'Staff is notified when the order is ready. Customer pays from the table — UPI, card, or wallet.' },
  ];

  const features = [
    { icon: '📱', title: 'QR Menus', desc: 'Digital menus that update in real-time. Customers scan, browse, and order from their tables.' },
    { icon: '🖥️', title: 'Kitchen Display', desc: 'Digital tickets replace paper. Orders route to prep stations with color-coded prioritization.' },
    { icon: '👥', title: 'Staff Management', desc: 'Scheduling, attendance tracking, payroll processing, and performance monitoring in one place.' },
    { icon: '📊', title: 'Live Analytics', desc: 'Revenue trends, peak hours, best sellers, staff efficiency — every metric, always live.' },
    { icon: '💳', title: 'Payments', desc: 'Cards, UPI, wallets. Split bills, generate GST invoices, reconcile automatically.' },
    { icon: '📋', title: 'Reservations', desc: 'Table management with floor plans, booking windows, waitlists, and auto confirmations.' },
  ];

  const testimonials = [
    {
      company: 'Hotel Siraj', location: 'Hyderabad', type: 'Fine Dining',
      quote: 'Our average table turnaround improved by 35% in the first month. The kitchen display system alone was worth the switch.',
      metric: '35% faster turnaround', staff: '12 staff', since: 'Since Jan 2026',
    },
    {
      company: 'Cafe Mocha', location: 'Bangalore', type: 'Quick Service',
      quote: 'Average order value went up 18% because customers actually see the full menu with photos. The QR menu was a game-changer.',
      metric: '18% higher orders', staff: '8 staff', since: 'Since Mar 2026',
    },
    {
      company: 'Spice Garden', location: 'Mumbai', type: 'Family Restaurant',
      quote: 'The reservation system transformed our weekend rush. We used to turn away 20+ tables on Friday nights. Now we handle double.',
      metric: '2x weekend capacity', staff: '15 staff', since: 'Since Nov 2025',
    },
  ];

  const faqs = [
    { q: 'How long does setup take?', a: 'Most restaurants are live within 24–48 hours. Our onboarding team handles menu setup, staff training, and payment integration.' },
    { q: 'Do I need special hardware?', a: 'No. Servora works on any device — phones, tablets, laptops. For the kitchen display, a tablet or monitor works perfectly.' },
    { q: 'Can customers order without an app?', a: 'Yes. Customers scan a QR code with their phone camera. The menu opens in their browser — no download needed.' },
    { q: 'What payment methods are supported?', a: 'UPI, credit/debit cards, digital wallets, and contactless. GST-compliant invoicing is automatic.' },
    { q: 'Can I try before committing?', a: 'Yes. Free 14-day trial with full access. No credit card required to start.' },
  ];

  return (
    <div className="hp">

      {/* ═══ HERO ═══ */}
      <section className="hp-hero">
        <div className="hp-hero-bg" />
        <div className="hp-hero-inner">
          <div className="hp-hero-badge">
            <span className="hp-badge-dot" />
            Trusted by 500+ restaurants across India
          </div>
          <h1 className="hp-hero-title">
            The modern operating system for your restaurant.
          </h1>
          <p className="hp-hero-sub">
            From smart QR menus and Kitchen Display Systems to deep analytics and seamless payments — Servora gives you everything you need to run faster, serve better, and grow smarter.
          </p>
          <div className="hp-hero-ctas">
            <Link to="/register" className="hp-btn-primary btn-shimmer">
              Start Free Trial
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
            <Link to="/login" className="hp-btn-secondary">Sign In</Link>
          </div>
          <div className="hp-hero-proof">
            <span>Free 14-day trial</span>
            <span className="hp-proof-sep">·</span>
            <span>No credit card required</span>
            <span className="hp-proof-sep">·</span>
            <span>Setup in 24 hours</span>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="hp-hero-preview sr">
          <div className="hp-preview-frame">
            <div className="hp-preview-topbar">
              <div className="hp-preview-dots">
                <span /><span /><span />
              </div>
              <span className="hp-preview-title">Servora Dashboard</span>
              <span className="hp-preview-status"><span className="hp-badge-dot" /> Live</span>
            </div>
            <div className="hp-preview-body">
              <div className="hp-preview-sidebar">
                {['Dashboard', 'Orders', 'Menu', 'Tables', 'Staff', 'Analytics'].map((item, i) => (
                  <div key={i} className={`hp-preview-nav ${i === 0 ? 'active' : ''}`}>{item}</div>
                ))}
              </div>
              <div className="hp-preview-content">
                <div className="hp-preview-stats">
                  <div className="hp-preview-stat">
                    <span className="hp-preview-stat-label">Today's Revenue</span>
                    <span className="hp-preview-stat-value">₹48,500</span>
                  </div>
                  <div className="hp-preview-stat">
                    <span className="hp-preview-stat-label">Orders</span>
                    <span className="hp-preview-stat-value">127</span>
                  </div>
                  <div className="hp-preview-stat">
                    <span className="hp-preview-stat-label">Avg Order</span>
                    <span className="hp-preview-stat-value">₹382</span>
                  </div>
                </div>
                <div className="hp-preview-chart">
                  {[40, 65, 50, 80, 95, 70, 55].map((h, i) => (
                    <div key={i} className="hp-preview-bar" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="hp-section">
        <div className="hp-container">
          <div className="hp-section-header sr">
            <span className="hp-eyebrow">How It Works</span>
            <h2 className="hp-section-title">From scan to serve.</h2>
            <p className="hp-section-sub">Every step runs through Servora — no gaps, no delays.</p>
          </div>
          <div className="hp-steps sr">
            {steps.map((step, i) => (
              <div key={i} className="hp-step">
                <span className="hp-step-num">{step.num}</span>
                <h3 className="hp-step-title">{step.title}</h3>
                <p className="hp-step-desc">{step.desc}</p>
                {i < steps.length - 1 && <div className="hp-step-line" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="hp-section hp-features">
        <div className="hp-container">
          <div className="hp-section-header sr">
            <span className="hp-eyebrow">Features</span>
            <h2 className="hp-section-title">Everything you need.</h2>
            <p className="hp-section-sub">One unified system your entire team can use.</p>
          </div>
          <div className="hp-features-grid sr">
            {features.map((feat, i) => (
              <div key={i} className="hp-feature-card">
                <span className="hp-feature-icon">{feat.icon}</span>
                <h3 className="hp-feature-title">{feat.title}</h3>
                <p className="hp-feature-desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHY SERVORA ═══ */}
      <section className="hp-section hp-why">
        <div className="hp-container">
          <div className="hp-section-header sr">
            <span className="hp-eyebrow">Why Servora</span>
            <h2 className="hp-section-title">Stop juggling tools.<br/>Start running smarter.</h2>
          </div>
          <div className="hp-why-grid sr">
            {[
              { before: 'Paper tickets get lost, orders get mixed up', after: 'Digital flow from table to kitchen to payment — zero paper, zero confusion' },
              { before: '5 different tools for menu, orders, payments, staff', after: 'One system. No data silos, no switching between apps' },
              { before: 'No idea what is selling or which staff is performing', after: 'Real-time dashboards for revenue, peak hours, and staff metrics' },
            ].map((item, i) => (
              <div key={i} className="hp-why-card">
                <div className="hp-why-before">
                  <span className="hp-why-label">Without Servora</span>
                  <p>{item.before}</p>
                </div>
                <div className="hp-why-arrow">→</div>
                <div className="hp-why-after">
                  <span className="hp-why-label hp-why-label-after">With Servora</span>
                  <p>{item.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="hp-section hp-testimonials">
        <div className="hp-container">
          <div className="hp-section-header sr">
            <span className="hp-eyebrow">Restaurants That Run on Servora</span>
            <h2 className="hp-section-title">Real results from real restaurants.</h2>
          </div>
          <div className="hp-testimonials-grid sr">
            {testimonials.map((t, i) => (
              <div key={i} className="hp-testimonial-card">
                <div className="hp-testimonial-top">
                  <div>
                    <span className="hp-testimonial-type">{t.type}</span>
                    <span className="hp-testimonial-location">{t.location}</span>
                  </div>
                  <span className="hp-testimonial-metric">{t.metric}</span>
                </div>
                <h3 className="hp-testimonial-company">{t.company}</h3>
                <p className="hp-testimonial-quote">"{t.quote}"</p>
                <div className="hp-testimonial-meta">
                  <span>{t.staff}</span>
                  <span>{t.since}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ METRICS ═══ */}
      <section className="hp-section hp-metrics">
        <div className="hp-container">
          <div className="hp-section-header sr">
            <span className="hp-eyebrow">Proven Results</span>
            <h2 className="hp-section-title">Numbers that speak.</h2>
          </div>
          <div className="hp-metrics-row sr">
            <MetricCard value={35} suffix="%" label="Faster Table Turnaround" />
            <MetricCard value={18} suffix="%" label="Higher Average Order" />
            <MetricCard value={40} suffix="% less" label="Time on Admin Tasks" />
            <MetricCard value={99} suffix="%" label="Platform Uptime" />
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="hp-section hp-faq">
        <div className="hp-container hp-faq-container">
          <div className="hp-section-header sr">
            <span className="hp-eyebrow">FAQ</span>
            <h2 className="hp-section-title">Got questions?</h2>
          </div>
          <div className="hp-faq-list sr">
            {faqs.map((faq, i) => (
              <div key={i} className={`hp-faq-item ${activeFaq === i ? 'open' : ''}`}>
                <button className="hp-faq-q" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className="hp-faq-icon">{activeFaq === i ? '−' : '+'}</span>
                </button>
                {activeFaq === i && (
                  <div className="hp-faq-a"><p>{faq.a}</p></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="hp-section hp-cta">
        <div className="hp-container">
          <div className="hp-cta-box sr">
            <h2 className="hp-cta-title">Ready to run your restaurant smarter?</h2>
            <p className="hp-cta-sub">Join 500+ restaurants using Servora. Start your free trial today.</p>
            <div className="hp-cta-buttons">
              <Link to="/register" className="hp-btn-primary btn-shimmer">
                Start Free Trial
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
              <Link to="/login" className="hp-btn-secondary">Sign In</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
