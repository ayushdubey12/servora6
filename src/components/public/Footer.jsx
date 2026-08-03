import { Link } from 'react-router-dom';
import { Icons } from '../../assets/icons';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="public-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <Link to="/" className="footer-brand">
              <Icons.Logo size={28} />
              <span className="brand-name">Servora</span>
            </Link>
            <p className="footer-desc">
              The complete operating system for modern restaurants. Everything you need to manage orders, tables, and staff.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-link"><Icons.Twitter size={20} /></a>
              <a href="#" className="social-link"><Icons.Github size={20} /></a>
              <a href="#" className="social-link"><Icons.LinkedIn size={20} /></a>
            </div>
          </div>
          
          <div className="footer-links-col">
            <h4 className="footer-heading">Product</h4>
            <ul className="footer-links">
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/dashboard">KDS System</Link></li>
              <li><Link to="/dashboard">QR Menu</Link></li>
            </ul>
          </div>
          
          <div className="footer-links-col">
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>
          
          <div className="footer-links-col">
            <h4 className="footer-heading">Legal</h4>
            <ul className="footer-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Servora Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
