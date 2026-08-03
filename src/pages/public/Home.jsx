import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { Icons } from '../../assets/icons';
import './Home.css';

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content text-center">
            <div className="hero-badge animate-fade-in-down">
              <span className="badge-new">New</span>
              <span>Introducing AI-powered KDS</span>
              <Icons.ArrowRight size={14} />
            </div>
            <h1 className="hero-title animate-fade-in-up">
              The modern operating system<br />for your restaurant.
            </h1>
            <p className="hero-subtitle animate-fade-in-up delay-1">
              From QR menus to kitchen display systems, Servora gives you everything you need to run your restaurant efficiently, delight customers, and boost your bottom line.
            </p>
            <div className="hero-actions animate-fade-in-up delay-2">
              <Link to="/register">
                <Button size="xl" variant="primary">Start for free</Button>
              </Link>
              <Link to="/contact">
                <Button size="xl" variant="outline">Book a demo</Button>
              </Link>
            </div>
            <p className="hero-note animate-fade-in delay-3">No credit card required. 14-day free trial.</p>
          </div>

          <div className="hero-image-wrapper animate-scale-in delay-4">
            <div className="mockup mockup-laptop">
              <div className="mockup-header">
                <span className="mockup-dot red"></span>
                <span className="mockup-dot yellow"></span>
                <span className="mockup-dot green"></span>
              </div>
              <div className="mockup-body flex items-center justify-center p-8">
                <div className="w-full h-full rounded-lg flex" style={{ background: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)' }}>
                  <div className="w-48 border-r flex items-center justify-center hidden md:flex" style={{ borderColor: 'var(--outline-variant)', background: 'var(--surface-container-low)' }}>
                    <span className="label-md text-muted">NAV</span>
                  </div>
                  <div className="flex-1 p-6 flex flex-col gap-4">
                    <div className="h-10 w-full rounded-md" style={{ background: 'var(--surface-container-high)' }}></div>
                    <div className="flex gap-4">
                      <div className="h-24 flex-1 rounded-md flex items-center justify-center" style={{ background: 'rgba(173, 198, 255, 0.08)', border: '1px solid rgba(173, 198, 255, 0.15)' }}>
                        <span className="label-sm text-primary">KDS</span>
                      </div>
                      <div className="h-24 flex-1 rounded-md flex items-center justify-center" style={{ background: 'rgba(173, 198, 255, 0.08)', border: '1px solid rgba(173, 198, 255, 0.15)' }}>
                        <span className="label-sm text-primary">QR</span>
                      </div>
                      <div className="h-24 flex-1 rounded-md flex items-center justify-center" style={{ background: 'rgba(173, 198, 255, 0.08)', border: '1px solid rgba(173, 198, 255, 0.15)' }}>
                        <span className="label-sm text-primary">PAY</span>
                      </div>
                    </div>
                    <div className="flex gap-4 flex-1">
                      <div className="flex-[2] rounded-md flex items-center justify-center" style={{ background: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)' }}>
                        <span className="label-sm text-muted">ANALYTICS</span>
                      </div>
                      <div className="flex-1 rounded-md flex items-center justify-center" style={{ background: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)' }}>
                        <span className="label-sm text-muted">ORDERS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="headline-lg mb-4" style={{ color: 'var(--on-surface)' }}>Everything you need to succeed</h2>
            <p className="body-lg" style={{ color: 'var(--on-surface-variant)' }}>Stop juggling multiple apps. Servora unifies your entire restaurant operation into one beautiful, easy-to-use platform.</p>
          </div>

          <div className="grid grid-3 gap-8">
            <FeatureCard
              icon={<Icons.QrCode size={24} />}
              title="Smart QR Menus"
              desc="Beautiful, fast digital menus that increase order size and eliminate printing costs."
            />
            <FeatureCard
              icon={<Icons.Activity size={24} />}
              title="Live Order Tracking"
              desc="Customers track their orders in real-time, reducing anxiety and questions for staff."
            />
            <FeatureCard
              icon={<Icons.Monitor size={24} />}
              title="Kitchen Display System"
              desc="Streamline your kitchen with a digital ticket system that tracks prep times."
            />
            <FeatureCard
              icon={<Icons.Users size={24} />}
              title="Staff Management"
              desc="Assign tables, track performance, and manage shifts with ease."
            />
            <FeatureCard
              icon={<Icons.BarChart size={24} />}
              title="Deep Analytics"
              desc="Understand your business with detailed insights into sales, popular items, and peak hours."
            />
            <FeatureCard
              icon={<Icons.CreditCard size={24} />}
              title="Seamless Payments"
              desc="Accept all major credit cards, Apple Pay, and Google Pay securely."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="grid grid-2 items-center gap-16">
            <div>
              <h2 className="headline-lg mb-6" style={{ color: 'var(--on-surface)' }}>A magical experience for your guests</h2>
              <div className="flex flex-col gap-6">
                <Step number="1" title="Scan" desc="Guests scan the QR code on their table to view your beautiful digital menu instantly." />
                <Step number="2" title="Order" desc="They browse, customize, and place their orders right from their phone without waiting." />
                <Step number="3" title="Enjoy" desc="Orders hit the kitchen instantly. Guests enjoy their food and pay when they're ready." />
              </div>
            </div>
            <div className="relative h-[600px] flex justify-center items-center">
              <div className="mockup-phone">
                <div className="mockup-phone-notch"></div>
                <div className="mockup-phone-screen flex flex-col">
                  <div className="h-48 w-full p-6 flex items-end" style={{ background: 'var(--primary-container)' }}>
                    <h3 className="text-2xl font-bold" style={{ color: 'var(--on-primary)' }}>The Green Table</h3>
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-4">
                    <div className="h-6 w-32 rounded-md" style={{ background: 'var(--surface-container-high)' }}></div>
                    <div className="flex gap-4 mb-4">
                      <div className="w-20 h-20 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)' }}>
                        <Icons.UtensilsCrossed size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="h-4 w-full rounded-md mb-2" style={{ background: 'var(--surface-container-high)' }}></div>
                        <div className="h-4 w-2/3 rounded-md" style={{ background: 'var(--surface-container-high)' }}></div>
                      </div>
                    </div>
                    <div className="flex gap-4 mb-4">
                      <div className="w-20 h-20 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)' }}>
                        <Icons.Coffee size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="h-4 w-full rounded-md mb-2" style={{ background: 'var(--surface-container-high)' }}></div>
                        <div className="h-4 w-2/3 rounded-md" style={{ background: 'var(--surface-container-high)' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2 className="headline-lg mb-6" style={{ color: 'var(--on-surface)' }}>Ready to transform your restaurant?</h2>
          <p className="body-lg mb-10 max-w-2xl mx-auto" style={{ color: 'var(--on-surface-variant)' }}>Join thousands of restaurants already using Servora to grow their business and delight customers.</p>
          <div className="flex justify-center gap-4">
            <Link to="/register">
              <Button size="xl" variant="primary">Start your free trial</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        {icon}
      </div>
      <h3 className="headline-md mb-3" style={{ color: 'var(--on-surface)' }}>{title}</h3>
      <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>{desc}</p>
    </div>
  );
}

function Step({ number, title, desc }) {
  return (
    <div className="flex gap-6">
      <div className="step-number">
        {number}
      </div>
      <div>
        <h4 className="headline-md mb-2" style={{ color: 'var(--on-surface)' }}>{title}</h4>
        <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>{desc}</p>
      </div>
    </div>
  );
}
