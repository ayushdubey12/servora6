import { useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useCustomerRestaurant } from '../context/CustomerRestaurantContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import CartButton from '../components/customer/CartButton';
import CustomerAuthModal from '../components/customer/CustomerAuthModal';
import { Icons } from '../assets/icons';
import './CustomerLayout.css';

export default function CustomerLayout() {
  const { restaurant } = useCustomerRestaurant();
  const { customer } = useCustomerAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();
  const { restaurantSlug } = useParams();

  const menuPath = restaurantSlug ? `/menu/${restaurantSlug}` : '/';

  return (
    <div className="customer-layout">
      <header className="customer-header">
        <div className="container">
          <div className="customer-header-inner">
            <button className="customer-brand" onClick={() => navigate(menuPath)}>
              <span className="customer-brand-dot" />
              <h1 className="customer-restaurant-name">{restaurant?.name || 'Menu'}</h1>
            </button>

            <nav className="customer-nav">
              <button className="customer-nav-link" onClick={() => navigate('/reserve')}>
                <Icons.Calendar size={16} />
                <span>Book a table</span>
              </button>

              {customer ? (
                <button className="customer-account-chip" onClick={() => navigate('/account')}>
                  <span className="customer-account-avatar">{customer.name?.charAt(0)?.toUpperCase() || 'G'}</span>
                  <span className="customer-account-meta">
                    <span className="customer-account-name">{customer.name}</span>
                    <span className="customer-account-points">
                      <Icons.Gift size={11} /> {customer.points ?? 0} pts
                    </span>
                  </span>
                </button>
              ) : (
                <button className="customer-nav-link customer-signin" onClick={() => setAuthOpen(true)}>
                  <Icons.User size={16} />
                  <span>Sign in</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="customer-main">
        <Outlet />
      </main>

      <CartButton />
      <CustomerAuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
