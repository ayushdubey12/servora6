import { Link, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Icons } from '../../assets/icons';
import Button from '../ui/Button';
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`public-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <Icons.Logo size={32} />
            <span className="brand-name">Servora</span>
          </Link>

          {/* Desktop Nav */}
          <div className="navbar-links hide-mobile">
            {navLinks.map((link) => (
              <NavLink 
                key={link.name} 
                to={link.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          <div className="navbar-actions hide-mobile">
            <Link to="/login" className="nav-link">Log in</Link>
            <Link to="/register">
              <Button variant="primary" size="sm">Start Free Trial</Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-btn show-mobile-only" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <Icons.X size={24} /> : <Icons.Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-overlay show-mobile-only">
          <div className="mobile-nav-links">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className="mobile-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="mobile-nav-divider"></div>
            <Link 
              to="/login"
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Log in
            </Link>
            <Link 
              to="/register"
              className="mobile-nav-link text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
