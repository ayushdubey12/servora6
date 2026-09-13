import { Link } from 'react-router-dom';
import { ServoraLogo } from './ServoraIcons';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="nb-footer">
      <div className="nb-footer-container">
        {/* Top Grid */}
        <div className="nb-footer-grid">
          {/* Brand Col */}
          <div className="nb-footer-brand-col">
            <div className="nb-footer-brand-header">
              <ServoraLogo size={36} />
              <span className="nb-brand-text">Avi</span>
            </div>
            <p className="nb-footer-tagline">
              The modern restaurant operating system. QR menus, table ordering, kitchen display, staff workflows, and live analytics — in one unified platform.
            </p>
            <div className="nb-footer-privacy-badge">
              <span className="nb-privacy-dot" />
              <span>500+ Restaurants · 99.99% Uptime</span>
            </div>
          </div>

          {/* Links 1 */}
          <div className="nb-footer-col">
            <h4 className="nb-footer-heading">Product</h4>
            <div className="nb-footer-links">
              <Link to="/features">Features Overview</Link>
              <a href="/#how-it-works">How It Works</a>
              <a href="/#demo">Interactive Menu</a>
              <Link to="/pricing">Plans & Pricing</Link>
              <Link to="/register">Start Free Trial</Link>
            </div>
          </div>

          {/* Links 2 */}
          <div className="nb-footer-col">
            <h4 className="nb-footer-heading">Company</h4>
            <div className="nb-footer-links">
              <Link to="/about">About Avi</Link>
              <a href="/about#story">Founder Story</a>
              <a href="/#faq">Restaurant FAQ</a>
              <Link to="/contact">Book a Demo</Link>
            </div>
          </div>

          {/* Links 3 - Portals */}
          <div className="nb-footer-col">
            <h4 className="nb-footer-heading">Portals</h4>
            <div className="nb-footer-links">
              <Link to="/login?portal=owner">Owner Dashboard</Link>
              <Link to="/login?portal=kitchen">Kitchen Display (KDS)</Link>
              <Link to="/login?portal=staff">Staff Portal</Link>
              <Link to="/contact">Enterprise Onboarding</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="nb-footer-bottom">
          <p className="nb-footer-copy">
            © {new Date().getFullYear()} Avi Inc. Crafted with passion for restaurant operators and hospitality teams.
          </p>
          <div className="nb-footer-legal">
            <a href="#privacy">Privacy Policy</a>
            <span className="nb-footer-sep">·</span>
            <a href="#terms">Terms of Service</a>
            <span className="nb-footer-sep">·</span>
            <Link to="/contact">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
