import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './Home.css';

/* ─── Scroll Reveal Observer ─── */
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
    }, { root: null, rootMargin: '0px', threshold: 0.1 });
    document.querySelectorAll('.sr').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─── Counter Animation Hook ─── */
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
    <div className="metric-card" ref={ref}>
      <span className="metric-value">{count}{suffix}</span>
      <span className="metric-label">{label}</span>
    </div>
  );
}

export default function Home() {
  useScrollReveal();

  const [activeKdsTicket, setActiveKdsTicket] = useState(0);
  const [activeMenuTab, setActiveMenuTab] = useState(0);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const kdsTickets = [
    { table: 'T7', items: 'Biryani x2, Naan x3, Raita', time: '8m', status: 'preparing', priority: 'high' },
    { table: 'T3', items: 'Butter Chicken, Rice, Lassi', time: '3m', status: 'ready', priority: 'normal' },
    { table: 'T12', items: 'Paneer Tikka x3, Roti x4', time: '15m', status: 'new', priority: 'normal' },
    { table: 'T1', items: 'Chicken 65, Fried Rice, Coke', time: '6m', status: 'preparing', priority: 'high' },
  ];

  const menuCategories = ['All', 'Biryani', 'Starters', 'Mains', 'Breads', 'Desserts'];

  const menuItems = [
    { name: 'Hyderabadi Chicken Biryani', price: '₹320', category: 'Biryani', popular: true },
    { name: 'Mutton Dum Biryani', price: '₹380', category: 'Biryani', popular: true },
    { name: 'Butter Chicken', price: '₹280', category: 'Mains', popular: false },
    { name: 'Paneer Tikka Masala', price: '₹220', category: 'Mains', popular: true },
    { name: 'Chicken 65', price: '₹180', category: 'Starters', popular: false },
    { name: 'Garlic Naan', price: '₹40', category: 'Breads', popular: false },
  ];

  const filteredMenu = activeMenuTab === 0
    ? menuItems
    : menuItems.filter(item => item.category === menuCategories[activeMenuTab]);

  const features = [
    { icon: '📱', title: 'Smart QR Menus', desc: 'Digital menus that update in real-time. Customers scan, browse, and order directly from their tables — no app downloads required.', detail: 'Multi-language support, photo menus, instant price updates' },
    { icon: '🖥️', title: 'Kitchen Display System', desc: 'Digital tickets replace paper. Orders route to prep stations automatically with color-coded prioritization and real-time tracking.', detail: 'Station routing, prep timers, expo view, audio alerts' },
    { icon: '👥', title: 'Staff Management', desc: 'Manage shifts, track attendance, handle payroll. Biometric integration and one-click processing keep your team organized.', detail: 'Scheduling, attendance, payroll, performance tracking' },
    { icon: '📊', title: 'Deep Analytics', desc: 'Sales trends, inventory usage, peak hours, staff efficiency — every metric that matters, always live and actionable.', detail: 'Revenue forecasting, waste tracking, custom reports' },
    { icon: '💳', title: 'Seamless Payments', desc: 'Cards, UPI, wallets, contactless. Split bills, generate GST invoices, manage refunds — all integrated and reconciled.', detail: 'UPI, cards, wallets, split bills, GST invoicing' },
    { icon: '📋', title: 'Reservations', desc: 'Table management with floor plans, booking windows, waitlists, and automatic confirmations sent to customers.', detail: 'Floor plans, waitlist, auto-confirmations, online booking' },
  ];

  const staffMembers = [
    { name: 'Rahul Kumar', role: 'Waiter', status: 'Active', tables: 4, initials: 'RK' },
    { name: 'Vikram Singh', role: 'Waiter', status: 'Active', tables: 3, initials: 'VS' },
    { name: 'Chef Imran', role: 'Head Chef', status: 'On Duty', tables: null, initials: 'CI' },
    { name: 'Priya Patel', role: 'Manager', status: 'Active', tables: null, initials: 'PP' },
  ];

  const orderFlow = [
    { step: '1', label: 'Scan QR', desc: 'Customer scans table QR code with phone camera' },
    { step: '2', label: 'Browse Menu', desc: 'Explores full digital menu with photos and descriptions' },
    { step: '3', label: 'Place Order', desc: 'Orders sent directly to kitchen — no waiter needed' },
    { step: '4', label: 'Kitchen Prep', desc: 'KDS tickets route to the right prep station automatically' },
    { step: '5', label: 'Serve', desc: 'Staff notified when order is ready for table delivery' },
    { step: '6', label: 'Pay', desc: 'Contactless payment from the table — UPI, card, or wallet' },
  ];

  const problemPoints = [
    { problem: 'Paper tickets get lost, orders get mixed up, customers wait too long.', solution: 'Every order flows digitally from table to kitchen to payment — zero paper, zero confusion.' },
    { problem: 'You have 5 different tools for menu, orders, payments, staff, and analytics.', solution: 'One system handles everything. No data silos, no switching between apps, no double entry.' },
    { problem: 'You have no idea what is selling, when peak hours are, or which staff is performing.', solution: 'Real-time dashboards show revenue, peak hours, best sellers, staff performance, and waste.' },
    { problem: 'Customers complain about slow service and have no way to track their order.', solution: 'QR menus let customers order instantly. They can track their order status in real-time.' },
  ];

  const restaurantTypes = [
    { name: 'Fine Dining', desc: 'Multi-course service, wine pairing, ambiance control', features: ['Table management', 'Course timing', 'Wine inventory'] },
    { name: 'Quick Service', desc: 'Fast turnover, takeaway, delivery integration', features: ['Quick ordering', 'Takeaway tracking', 'Delivery sync'] },
    { name: 'Cafe & Bistro', desc: 'Casual ordering, loyalty programs, daily specials', features: ['QR ordering', 'Loyalty points', 'Daily menu updates'] },
    { name: 'Cloud Kitchen', desc: 'Multiple brands, delivery-first, kitchen optimization', features: ['Multi-brand menus', 'Delivery integration', 'Kitchen routing'] },
    { name: 'Bar & Pub', desc: 'Tab management, happy hours, live inventory', features: ['Tab tracking', 'Happy hour pricing', 'Live stock'] },
    { name: 'Buffet & Events', desc: 'Fixed pricing, event bookings, bulk orders', features: ['Event scheduling', 'Bulk ordering', 'Package deals'] },
  ];

  const testimonials = [
    { company: 'Hotel Siraj', type: 'Fine Dining', location: 'Hyderabad', quote: 'We went from paper tickets and chaos to complete kitchen visibility in one week. Our average table turnaround improved by 35% in the first month. The kitchen display system alone was worth the switch.', metric: '35% faster table turnaround', detail: 'Before Servora, we used handwritten tickets and had 3-4 order errors per day. Now we have zero. The kitchen staff loves the display system, and our customers are happier than ever.', staff: '12 staff onboarded', since: 'Using since Jan 2026' },
    { company: 'Cafe Mocha', type: 'Quick Service', location: 'Bangalore', quote: 'Our customers love ordering from their phones. Average order value went up 18% because they actually see the full menu with photos. The QR menu was a game-changer for us.', metric: '18% higher average order', detail: 'We were losing customers because they could not see our full menu. Now with photos and descriptions, they order more items. The analytics help us optimize our menu every week.', staff: '8 staff onboarded', since: 'Using since Mar 2026' },
    { company: 'Spice Garden', type: 'Family Restaurant', location: 'Mumbai', quote: 'The reservation system and table management transformed our weekend rush. We used to turn away 20+ tables on Friday nights. Now we handle double the volume.', metric: '2x weekend capacity', detail: 'Floor plan view lets us optimize seating. Waitlist management means no customer walks away. The auto-confirmation texts reduced no-shows by 60%.', staff: '15 staff onboarded', since: 'Using since Nov 2025' },
  ];

  const faqs = [
    { q: 'How long does it take to set up Servora?', a: 'Most restaurants are live within 24-48 hours. Our onboarding team helps you set up your menu, tables, staff, and payments. We also provide training for your team.' },
    { q: 'Do I need special hardware?', a: 'Servora works on any device — phones, tablets, laptops, or desktops. For the Kitchen Display System, a tablet or monitor in the kitchen works perfectly. No expensive hardware required.' },
    { q: 'Can customers order without downloading an app?', a: 'Yes! Customers simply scan a QR code on their table with their phone camera. The menu opens directly in their browser — no app download needed. Works on iOS and Android.' },
    { q: 'What payment methods are supported?', a: 'We support UPI (Google Pay, PhonePe, Paytm), credit/debit cards, digital wallets, and contactless payments. GST-compliant invoicing is automatic.' },
    { q: 'Is my data safe?', a: 'Absolutely. All data is encrypted and stored securely. We use industry-standard security practices. Your restaurant data is never shared with third parties.' },
    { q: 'Can I try Servora before committing?', a: 'Yes! We offer a free trial so you can experience the full platform. No credit card required to start. See the difference in your first week.' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveKdsTicket(prev => (prev + 1) % kdsTickets.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [kdsTickets.length]);

  useEffect(() => {
    const handleScroll = () => setShowStickyCta(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-page">

      {/* ═══════ HERO — SCROLL-DRIVEN FADE ═══════ */}
      <section className="hero-scroll-group">
        <div className="hero-scroll-tall">
          <div className="hero-scroll-pin">
            <div className="hero-bg-grid" />
            <div className="hero-glow" />
            <div className="hero-3d-scene">
              <div className="shape-3d cube-1"><div className="cube-face front" /><div className="cube-face back" /><div className="cube-face left" /><div className="cube-face right" /><div className="cube-face top" /><div className="cube-face bottom" /></div>
              <div className="shape-3d sphere-1" />
              <div className="shape-3d torus-1" />
            </div>
            <div className="hero-scroll-content">
              <div className="hero-badge"><span className="hero-badge-dot" />Trusted by 500+ restaurants across India</div>
              <h1 className="hero-title">The modern operating system for your restaurant.</h1>
              <p className="hero-subtitle">From smart QR menus and Kitchen Display Systems to deep analytics and seamless payments — Servora gives you everything you need to run faster, serve better, and grow smarter. One platform. Zero complexity.</p>
              <div className="hero-ctas">
                <Link to="/register" className="hero-cta-primary btn-shimmer">Start Free Trial<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></Link>
                <Link to="/contact" className="hero-cta-secondary">Book a Demo</Link>
              </div>
              <div className="hero-proof">
                <span className="hero-proof-item">Free 14-day trial</span>
                <span className="hero-proof-divider">|</span>
                <span className="hero-proof-item">No credit card required</span>
                <span className="hero-proof-divider">|</span>
                <span className="hero-proof-item">Setup in 24 hours</span>
              </div>
            </div>
          </div>
          <div className="hero-scroll-panel">
            <div className="hero-panel-inner">
              <h2>Everything you need.<br />One platform.</h2>
              <p>Servora connects your QR menus, kitchen display, staff management, analytics, and payments into a single, seamless system. No more switching between apps. No more data silos. Just one platform that runs your entire restaurant.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CHAPTER CROSSFADE — SCROLL STORY ═══════ */}
      <section className="chapter-scroll-group">
        <div className="chapter-scroll-tall">
          <div className="chapter-scroll-pin">
            <p className="chapter-scroll-hint" aria-hidden="true">scroll — three chapters, one timeline</p>
            <div className="chapter-stack">
              <h2 className="chapter-line" style={{ '--from': 'cover 2%', '--to': 'cover 38%' }}>Start with a scan.</h2>
              <h2 className="chapter-line" style={{ '--from': 'cover 33%', '--to': 'cover 69%' }}>Run with clarity.</h2>
              <h2 className="chapter-line" style={{ '--from': 'cover 64%', '--to': 'cover 100%' }}>Grow without limits.</h2>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ TRUST STRIP ═══════ */}
      <section className="trust-strip sr">
        <div className="trust-container">
          <p className="trust-label">Trusted by forward-thinking restaurants</p>
          <div className="trust-logos">
            {['Hotel Siraj', 'Cafe Mocha', 'Spice Garden', 'Urban Bites', 'The Curry House', 'Green Leaf', 'Tandoori Nights'].map((name, i) => (
              <span key={i} className="trust-logo">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ WHY SERVORA — PROBLEM/SOLUTION ═══════ */}
      <section className="section why-section">
        <div className="section-container">
          <div className="section-header sr">
            <span className="section-eyebrow">Why Servora</span>
            <h2 className="section-title">Restaurant operations are chaotic.<br />Servora brings order.</h2>
            <p className="section-subtitle">Every restaurant faces the same problems — lost orders, disconnected tools, no visibility, and unhappy customers. Servora solves all of them with one unified platform.</p>
          </div>
          <div className="problem-solution-grid sr delay-100">
            {problemPoints.map((ps, i) => (
              <div key={i} className="ps-card">
                <div className="ps-problem">
                  <span className="ps-label ps-label-problem">The Problem</span>
                  <p className="ps-text">{ps.problem}</p>
                </div>
                <div className="ps-arrow">→</div>
                <div className="ps-solution">
                  <span className="ps-label ps-label-solution">The Solution</span>
                  <p className="ps-text">{ps.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ ORDER FLOW ═══════ */}
      <section className="section order-flow-section">
        <div className="section-container">
          <div className="section-header sr">
            <span className="section-eyebrow">How It Works</span>
            <h2 className="section-title">From scan to serve.<br />One connected flow.</h2>
            <p className="section-subtitle">Every step — from the moment a customer sits down to the final payment — runs through Servora. No gaps. No delays. No confusion.</p>
          </div>
          <div className="order-flow-track sr delay-100">
            {orderFlow.map((item, i) => (
              <div key={i} className="order-flow-step">
                <div className="order-flow-num">{item.step}</div>
                <div className="order-flow-content">
                  <h4 className="order-flow-label">{item.label}</h4>
                  <p className="order-flow-desc">{item.desc}</p>
                </div>
                {i < orderFlow.length - 1 && <div className="order-flow-line" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES GRID ═══════ */}
      <section className="section features-section" id="features">
        <div className="section-container">
          <div className="section-header sr">
            <span className="section-eyebrow">Features</span>
            <h2 className="section-title">Everything you need<br />to run your restaurant.</h2>
            <p className="section-subtitle">Built for speed, reliability, and growth. No disconnected tools — one unified system that your entire team can use.</p>
          </div>
          <div className="features-grid sr delay-100">
            {features.map((feat, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{feat.icon}</div>
                <h3 className="feature-name">{feat.title}</h3>
                <p className="feature-desc">{feat.desc}</p>
                <span className="feature-detail">{feat.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ QR MENU FEATURE ═══════ */}
      <section className="section feature-showcase-section">
        <div className="section-container">
          <div className="showcase-layout sr">
            <div className="showcase-visual">
              <div className="menu-mockup">
                <div className="menu-phone-frame">
                  <div className="menu-phone-notch" />
                  <div className="menu-phone-screen">
                    <div className="menu-header-bar"><span className="menu-brand">Hotel Siraj</span><span className="menu-table">Table 7</span></div>
                    <div className="menu-tabs">
                      {menuCategories.slice(0, 4).map((cat, i) => (
                        <span key={i} className={`menu-tab ${activeMenuTab === i ? 'active' : ''}`} onClick={() => setActiveMenuTab(i)}>{cat}</span>
                      ))}
                    </div>
                    <div className="menu-items-list">
                      {filteredMenu.map((item, i) => (
                        <div key={i} className="menu-item-row">
                          <div className="menu-item-info"><span className="menu-item-name">{item.name}</span><span className="menu-item-price">{item.price}</span></div>
                          {item.popular && <span className="menu-item-badge">Popular</span>}
                        </div>
                      ))}
                    </div>
                    <div className="menu-cart-bar"><span>2 items</span><span className="menu-cart-total">₹640</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="showcase-content">
              <span className="section-eyebrow">Smart QR Menus</span>
              <h2 className="section-title">Customers scan.<br />They order.<br />You serve.</h2>
              <p className="section-subtitle">No app downloads. No waiters with notepads. Customers scan a QR code on their table, browse your full menu with photos and descriptions, and order directly. Orders appear in your kitchen instantly — reducing wait times and eliminating order errors.</p>
              <div className="showcase-features">
                {['Real-time menu updates — change prices, mark items sold out instantly', 'High-quality photos and descriptions for every dish', 'Multi-language support for diverse clientele', 'Automatic order routing to kitchen display system', 'Direct payment from the table — no waiting for the bill', 'Customer order tracking — they see when their food is being prepared'].map((feat, i) => (
                  <div key={i} className="showcase-feat"><div className="showcase-feat-check"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><span>{feat}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ KDS FEATURE ═══════ */}
      <section className="section feature-showcase-section reverse">
        <div className="section-container">
          <div className="showcase-layout sr">
            <div className="showcase-content">
              <span className="section-eyebrow">Kitchen Display System</span>
              <h2 className="section-title">Eliminate paper tickets.<br />Run the kitchen digitally.</h2>
              <p className="section-subtitle">Orders flow from QR menus straight to the kitchen display. Color-coded tickets show what is new, what is being prepared, and what is ready. Prep time tracking helps you identify bottlenecks. Your kitchen runs like a well-oiled machine.</p>
              <div className="showcase-features">
                {['Color-coded order prioritization — new, preparing, ready at a glance', 'Custom routing to specific prep stations (grill, tandoor, cold)', 'Real-time prep time analytics per dish — identify slow items', 'Expo view for order assembly and quality check before serving', 'Audio alerts for rush orders and VIP tables', 'Historical data to optimize kitchen layout and staffing'].map((feat, i) => (
                  <div key={i} className="showcase-feat"><div className="showcase-feat-check"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><span>{feat}</span></div>
                ))}
              </div>
            </div>
            <div className="showcase-visual">
              <div className="kds-mockup">
                <div className="kds-header-bar"><span className="kds-title">Kitchen Display</span><span className="kds-live-badge"><span className="kds-live-dot" /> Live</span></div>
                <div className="kds-tickets-grid">
                  {kdsTickets.map((ticket, i) => (
                    <div key={i} className={`kds-ticket-card ${ticket.status} ${i === activeKdsTicket ? 'active-ticket' : ''}`}>
                      <div className="kds-ticket-top"><span className="kds-ticket-table">{ticket.table}</span><span className={`kds-ticket-time ${ticket.status}`}>{ticket.time}</span></div>
                      <span className="kds-ticket-items">{ticket.items}</span>
                      <div className="kds-ticket-bottom"><span className={`kds-ticket-status ${ticket.status}`}>{ticket.status}</span>{ticket.priority === 'high' && <span className="kds-ticket-priority">Rush</span>}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ STAFF MANAGEMENT ═══════ */}
      <section className="section feature-showcase-section">
        <div className="section-container">
          <div className="showcase-layout sr">
            <div className="showcase-visual">
              <div className="staff-mockup">
                <div className="staff-header-bar"><span className="staff-mock-title">Staff Management</span><span className="staff-mock-count">4 On Duty</span></div>
                <div className="staff-list">
                  {staffMembers.map((member, i) => (
                    <div key={i} className="staff-row">
                      <div className="staff-avatar" style={{ background: i === 2 ? 'rgba(47, 158, 68, 0.1)' : 'rgba(232, 89, 12, 0.08)' }}>
                        <span style={{ color: i === 2 ? '#2F9E44' : 'var(--primary)' }}>{member.initials}</span>
                      </div>
                      <div className="staff-info"><span className="staff-name">{member.name}</span><span className="staff-role">{member.role}</span></div>
                      <div className="staff-meta">
                        {member.tables !== null && <span className="staff-tables">{member.tables} tables</span>}
                        <span className={`staff-status ${member.status === 'On Duty' ? 'on-duty' : 'active'}`}>{member.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="showcase-content">
              <span className="section-eyebrow">Staff Management</span>
              <h2 className="section-title">Keep your team<br />organized and paid.</h2>
              <p className="section-subtitle">Your restaurant is only as good as your team. Servora helps you schedule shifts, track attendance, process payroll, and monitor performance — so you can focus on delivering great experiences instead of managing spreadsheets.</p>
              <div className="showcase-features">
                {['Automated shift scheduling with conflict detection and swap requests', 'Biometric attendance tracking integration for accurate timekeeping', 'One-click payroll processing — calculate wages, deductions, and bonuses', 'Performance tracking per staff member — orders handled, ratings, speed', 'Role-based access control for waiters, chefs, managers, and owners', 'Mobile app for staff to view schedules, request days off, and clock in'].map((feat, i) => (
                  <div key={i} className="showcase-feat"><div className="showcase-feat-check"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><span>{feat}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ ANALYTICS ═══════ */}
      <section className="section analytics-section">
        <div className="section-container">
          <div className="section-header sr">
            <span className="section-eyebrow">Analytics & Reporting</span>
            <h2 className="section-title">Know your numbers.<br />In real-time.</h2>
            <p className="section-subtitle">Revenue trends, peak hours, best sellers, staff efficiency, inventory usage, customer patterns — every metric that matters, always live. Make data-driven decisions instead of guessing.</p>
          </div>
          <div className="analytics-grid sr delay-100">
            <div className="analytics-card">
              <div className="analytics-card-header"><span className="analytics-card-title">Revenue This Week</span><span className="analytics-card-badge">+12%</span></div>
              <div className="analytics-chart">
                {[{ day: 'Mon', value: 40 }, { day: 'Tue', value: 65 }, { day: 'Wed', value: 50 }, { day: 'Thu', value: 80 }, { day: 'Fri', value: 95 }, { day: 'Sat', value: 70 }, { day: 'Sun', value: 55 }].map((d, i) => (
                  <div key={i} className="chart-bar-group"><div className="chart-bar" style={{ height: `${d.value}%` }} /><span className="chart-bar-label">{d.day}</span></div>
                ))}
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-card-header"><span className="analytics-card-title">Peak Hours</span></div>
              <div className="peak-hours-grid">
                {[{ hour: '11 AM', intensity: 0.3 }, { hour: '12 PM', intensity: 0.7 }, { hour: '1 PM', intensity: 1.0 }, { hour: '2 PM', intensity: 0.5 }, { hour: '7 PM', intensity: 0.6 }, { hour: '8 PM', intensity: 0.9 }, { hour: '9 PM', intensity: 0.8 }, { hour: '10 PM', intensity: 0.4 }].map((h, i) => (
                  <div key={i} className="peak-hour-item"><div className="peak-hour-bar" style={{ opacity: h.intensity }} /><span className="peak-hour-label">{h.hour}</span></div>
                ))}
              </div>
            </div>
            <div className="analytics-card analytics-card-stats">
              {[{ label: 'Avg Order Value', value: '₹485', change: '+8%' }, { label: 'Table Turnover', value: '2.4x', change: '+0.3' }, { label: 'Waste Reduction', value: '22%', change: '' }, { label: 'Customer Return Rate', value: '64%', change: '+5%' }].map((stat, i) => (
                <div key={i} className="analytics-stat"><span className="analytics-stat-label">{stat.label}</span><span className="analytics-stat-value">{stat.value}</span>{stat.change && <span className="analytics-stat-change">{stat.change}</span>}</div>
              ))}
            </div>
          </div>
          <div className="analytics-detail-row sr delay-200">
            <div className="analytics-detail-card">
              <h4>Inventory Tracking</h4>
              <p>Track ingredient usage in real-time. Get alerts when stock is low. Reduce waste by 22% with smart reorder suggestions based on historical consumption patterns.</p>
            </div>
            <div className="analytics-detail-card">
              <h4>Staff Performance</h4>
              <p>See which staff members handle the most orders, get the best customer ratings, and work the most efficient shifts. Reward top performers and coach underperformers.</p>
            </div>
            <div className="analytics-detail-card">
              <h4>Customer Insights</h4>
              <p>Understand your customers — favorite dishes, visit frequency, average spend, peak times. Use this data to create targeted promotions and loyalty programs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ PAYMENTS ═══════ */}
      <section className="section feature-showcase-section reverse">
        <div className="section-container">
          <div className="showcase-layout sr">
            <div className="showcase-content">
              <span className="section-eyebrow">Payments & Billing</span>
              <h2 className="section-title">Accept any payment.<br />Instantly reconciled.</h2>
              <p className="section-subtitle">Cards, UPI, wallets, contactless — every payment method your customers use. Split bills by item or percentage, generate GST-compliant invoices, manage refunds with a complete audit trail. End-of-day reconciliation happens automatically.</p>
              <div className="showcase-features">
                {['UPI, cards, wallets, and contactless — all major payment methods accepted', 'Automatic bill splitting by item, percentage, or custom amounts', 'GST-compliant invoice generation with your restaurant branding', 'Real-time payment reconciliation — match every transaction instantly', 'Refund management with full audit trail and manager approval', 'Daily, weekly, and monthly financial reports auto-generated'].map((feat, i) => (
                  <div key={i} className="showcase-feat"><div className="showcase-feat-check"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><span>{feat}</span></div>
                ))}
              </div>
            </div>
            <div className="showcase-visual">
              <div className="payments-mockup">
                <div className="payment-receipt">
                  <div className="receipt-header"><span className="receipt-brand">Hotel Siraj</span><span className="receipt-date">Aug 15, 2026</span></div>
                  <div className="receipt-items">
                    {[{ name: 'Chicken Biryani x2', price: '₹640' }, { name: 'Butter Chicken', price: '₹280' }, { name: 'Garlic Naan x3', price: '₹120' }, { name: 'Lassi x2', price: '₹120' }].map((item, i) => (
                      <div key={i} className="receipt-item"><span>{item.name}</span><span>{item.price}</span></div>
                    ))}
                  </div>
                  <div className="receipt-divider" />
                  <div className="receipt-total"><span>Total</span><span>₹1,160</span></div>
                  <div className="receipt-payment-method"><span>Paid via</span><span className="receipt-upi">UPI — Google Pay</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ BUILT FOR EVERY RESTAURANT TYPE ═══════ */}
      <section className="section restaurant-types-section">
        <div className="section-container">
          <div className="section-header sr">
            <span className="section-eyebrow">For Every Concept</span>
            <h2 className="section-title">One platform.<br />Every type of restaurant.</h2>
            <p className="section-subtitle">Whether you run a fine dining establishment or a cloud kitchen, Servora adapts to your concept, menu, and workflow.</p>
          </div>
          <div className="restaurant-types-grid sr delay-100">
            {restaurantTypes.map((rt, i) => (
              <div key={i} className="restaurant-type-card">
                <h3 className="rt-name">{rt.name}</h3>
                <p className="rt-desc">{rt.desc}</p>
                <div className="rt-features">
                  {rt.features.map((f, j) => (
                    <span key={j} className="rt-feature-tag">{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ METRICS ═══════ */}
      <section className="section metrics-section">
        <div className="section-container">
          <div className="section-header sr">
            <span className="section-eyebrow">Proven Results</span>
            <h2 className="section-title">Numbers that speak<br />for themselves.</h2>
            <p className="section-subtitle">Restaurants using Servora see measurable improvements across every metric that matters.</p>
          </div>
          <div className="metrics-row sr delay-200">
            <MetricCard value={35} suffix="%" label="Faster Table Turnaround" />
            <MetricCard value={18} suffix="%" label="Higher Average Order Value" />
            <MetricCard value={40} suffix="%" label="Less Time on Admin Tasks" />
            <MetricCard value={99} suffix="%" label="Platform Uptime Guaranteed" />
          </div>
          <div className="metrics-detail-row sr delay-300">
            {[{ icon: '⚡', title: 'Setup in 24 Hours', desc: 'From signup to live operations in one day. Our onboarding team handles menu setup, staff training, and payment integration.' }, { icon: '🔒', title: 'Bank-Grade Security', desc: 'All data encrypted at rest and in transit. PCI-DSS compliant payment processing. Your restaurant data is never shared.' }, { icon: '🌏', title: 'Works Everywhere', desc: 'Any device, any browser, any internet connection. Offline mode keeps your kitchen running even if WiFi drops.' }].map((item, i) => (
              <div key={i} className="metrics-detail-card">
                <span className="metrics-detail-icon">{item.icon}</span>
                <h4 className="metrics-detail-title">{item.title}</h4>
                <p className="metrics-detail-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="section testimonials-section">
        <div className="section-container">
          <div className="section-header sr">
            <span className="section-eyebrow">Customer Success</span>
            <h2 className="section-title">Restaurants that run<br />on Servora.</h2>
            <p className="section-subtitle">Real results from real restaurants. See how Servora transformed their operations.</p>
          </div>
          <div className="testimonials-grid sr delay-100">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-header">
                  <div><span className="testimonial-type">{t.type}</span><span className="testimonial-location">{t.location}</span></div>
                  <span className="testimonial-metric">{t.metric}</span>
                </div>
                <h3 className="testimonial-company">{t.company}</h3>
                <blockquote className="testimonial-quote">"{t.quote}"</blockquote>
                <p className="testimonial-detail">{t.detail}</p>
                <div className="testimonial-meta">
                  <span>{t.staff}</span>
                  <span>{t.since}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="section faq-section">
        <div className="section-container">
          <div className="section-header sr">
            <span className="section-eyebrow">FAQ</span>
            <h2 className="section-title">Got questions?<br />We have answers.</h2>
          </div>
          <div className="faq-list sr delay-100">
            {faqs.map((faq, i) => (
              <div key={i} className={`faq-item ${activeFaq === i ? 'open' : ''}`} onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                <div className="faq-question">
                  <span>{faq.q}</span>
                  <span className="faq-toggle">{activeFaq === i ? '−' : '+'}</span>
                </div>
                {activeFaq === i && <div className="faq-answer"><p>{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="section final-cta-section">
        <div className="section-container">
          <div className="final-cta sr">
            <div className="final-cta-glow" />
            <h2 className="final-cta-title">Ready to run your restaurant smarter?</h2>
            <p className="final-cta-subtitle">Join 500+ restaurants that use Servora to streamline operations, delight customers, and grow their bottom line. Start your free trial today — no credit card required.</p>
            <div className="final-cta-buttons">
              <Link to="/register" className="final-cta-primary btn-shimmer">Start Free Trial<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></Link>
              <Link to="/contact" className="final-cta-secondary">Book a Demo</Link>
            </div>
            <div className="final-cta-proof">
              <span>Free 14-day trial</span>
              <span>No credit card required</span>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ STICKY CTA ═══════ */}
      <div className={`sticky-cta ${showStickyCta ? 'visible' : ''}`}>
        <Link to="/register" className="sticky-cta-btn">Start Free Trial</Link>
      </div>

    </div>
  );
}
