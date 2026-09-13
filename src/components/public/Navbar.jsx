import { Link, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ServoraLogo } from './ServoraIcons';
import './Navbar.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'How it works', path: '/#how-it-works' },
    { name: 'Live Menu Demo', path: '/#demo' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`nb-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nb-navbar-container">
        {/* Brand */}
        <Link to="/" className="nb-navbar-brand">
          <ServoraLogo size={36} />
          <span className="nb-brand-text" style={{ fontFamily: 'var(--nb-font-display)', letterSpacing: '-0.02em' }}>
AI Restaurant
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="nb-navbar-links hide-mobile">
          {navLinks.map((link) => (
            link.path.startsWith('/#') ? (
              <a
                key={link.name}
                href={link.path}
                className="nb-nav-link"
              >
                {link.name}
              </a>
            ) : (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) => `nb-nav-link ${isActive ? 'active' : ''}`}
              >
                {link.name}
              </NavLink>
            )
          ))}
        </div>

        {/* Actions */}
        <div className="nb-navbar-actions hide-mobile">
          <Link to="/login" className="nb-nav-login">
            Log in
          </Link>
          <Link to="/register" className="nb-btn nb-btn-black nb-nav-cta">
            Start Free Trial
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="nb-mobile-toggle show-mobile-only"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0E0E10" strokeWidth="2.5" strokeLinecap="round">
            {isMobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="nb-mobile-menu show-mobile-only">
          {navLinks.map((link) => (
            link.path.startsWith('/#') ? (
              <a
                key={link.name}
                href={link.path}
                className="nb-mobile-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.path}
                className="nb-mobile-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            )
          ))}
          <div className="nb-mobile-divider" />
          <Link
            to="/login"
            className="nb-mobile-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="nb-btn nb-btn-black"
            style={{ width: '100%', marginTop: '8px' }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Start Free Trial
          </Link>
        </div>
      )}
    </nav>
  );
}
