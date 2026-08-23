import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import CustomerAuthModal from '../../components/customer/CustomerAuthModal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Icons } from '../../assets/icons';
import './Account.css';

const TIERS = [
  { name: 'Bronze', min: 0 },
  { name: 'Silver', min: 200 },
  { name: 'Gold', min: 500 },
  { name: 'Platinum', min: 1000 },
];

function tierFor(points) {
  let current = TIERS[0];
  let next = null;
  for (let i = 0; i < TIERS.length; i++) {
    if (points >= TIERS[i].min) {
      current = TIERS[i];
      next = TIERS[i + 1] || null;
    }
  }
  return { current, next };
}

const ORDER_STATUS = {
  PENDING: { label: 'Pending', variant: 'warning' },
  ACCEPTED: { label: 'Accepted', variant: 'primary' },
  PREPARING: { label: 'Preparing', variant: 'primary' },
  READY: { label: 'Ready', variant: 'secondary' },
  SERVED: { label: 'Served', variant: 'success' },
  PAYMENT_PENDING: { label: 'Payment pending', variant: 'warning' },
  PAID: { label: 'Paid', variant: 'success' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'error' },
};

const RES_STATUS = {
  PENDING: { label: 'Pending', variant: 'warning' },
  CONFIRMED: { label: 'Confirmed', variant: 'success' },
  COMPLETED: { label: 'Completed', variant: 'secondary' },
  CANCELLED: { label: 'Cancelled', variant: 'error' },
  NO_SHOW: { label: 'No show', variant: 'error' },
};

function statusBadge(status, map) {
  const s = map[status] || { label: status, variant: 'default' };
  return <Badge variant={s.variant} size="sm" dot>{s.label}</Badge>;
}

export default function Account() {
  const { customer, token, loading, logout, refresh } = useCustomerAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      refresh().finally(() => setRefreshing(false));
    } else {
      setRefreshing(false);
    }
  }, [token, refresh]);

  const handleSignOut = () => {
    logout();
    navigate('/menu/hotel-siraj');
  };

  if (loading || refreshing) {
    return (
      <div className="account-page">
        <div className="container">
          <div className="account-loading">Loading your account…</div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="account-page">
        <div className="container">
          <div className="account-gate">
            <div className="account-gate-icon"><Icons.User size={40} /></div>
            <h2>Sign in to your account</h2>
            <p>Track your orders, earn loyalty points, and manage your reservations.</p>
            <Button variant="primary" onClick={() => setAuthOpen(true)}>Sign in / Create account</Button>
            <Button variant="ghost" onClick={() => navigate('/menu/hotel-siraj')}>Back to menu</Button>
          </div>
        </div>
      </div>
    );
  }

  const { current, next } = tierFor(customer.points || 0);
  const pointsToNext = next ? next.min - (customer.points || 0) : 0;
  const progressPct = next
    ? Math.min(100, Math.round(((customer.points || 0) - current.min) / (next.min - current.min) * 100))
    : 100;
  const orders = customer.orders || [];
  const reservations = customer.reservations || [];
  const upcoming = reservations.filter(r => ['PENDING', 'CONFIRMED'].includes(r.status));
  const totalPointsEarned = orders.reduce((s, o) => s + (o.pointsEarned || 0), 0);

  return (
    <div className="account-page">
      <div className="container">
        <div className="account-header">
          <div className="account-identity">
            <div className="account-avatar">{customer.name?.charAt(0)?.toUpperCase() || 'G'}</div>
            <div>
              <h1 className="account-name">{customer.name}</h1>
              <p className="account-email">{customer.email}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>Sign out</Button>
        </div>

        {/* Loyalty summary */}
        <div className="account-loyalty-card">
          <div className="account-loyalty-top">
            <div className="account-tier">
              <span className="account-tier-icon"><Icons.Award size={22} /></span>
              <div>
                <p className="account-tier-label">Membership</p>
                <p className="account-tier-name">{current.name} Member</p>
              </div>
            </div>
            <div className="account-points-big">
              <span className="account-points-number">{customer.points ?? 0}</span>
              <span className="account-points-unit">pts</span>
            </div>
          </div>

          {next && (
            <div className="account-tier-progress">
              <div className="account-tier-progress-track">
                <div className="account-tier-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="account-tier-progress-label">
                <Icons.Gift size={13} /> {pointsToNext} pts to <strong>{next.name}</strong> tier
              </p>
            </div>
          )}
        </div>

        <div className="account-stats">
          <div className="account-stat">
            <p className="account-stat-value">{orders.length}</p>
            <p className="account-stat-label">Orders</p>
          </div>
          <div className="account-stat">
            <p className="account-stat-value">{upcoming.length}</p>
            <p className="account-stat-label">Upcoming visits</p>
          </div>
          <div className="account-stat">
            <p className="account-stat-value">₹{(customer.totalSpent ?? 0).toFixed(0)}</p>
            <p className="account-stat-label">Total spent</p>
          </div>
          <div className="account-stat">
            <p className="account-stat-value">{customer.visitCount ?? 0}</p>
            <p className="account-stat-label">Visits</p>
          </div>
        </div>

        {/* Reservations */}
        <section className="account-section">
          <div className="account-section-head">
            <h2 className="account-section-title">My reservations</h2>
            <button className="account-section-action" onClick={() => navigate('/reserve')}>
              <Icons.Plus size={14} /> Book a table
            </button>
          </div>

          {reservations.length === 0 ? (
            <div className="account-empty">
              <Icons.Calendar size={28} />
              <p>No reservations yet — book a table for your next visit.</p>
            </div>
          ) : (
            <div className="account-reservation-list">
              {reservations.map(r => (
                <div key={r.id} className="account-reservation-row">
                  <div className="account-reservation-date">
                    <span className="account-reservation-day">{r.date.slice(8)}</span>
                    <span className="account-reservation-month">{new Date(`${r.date}T00:00:00`).toLocaleString('en', { month: 'short' })}</span>
                  </div>
                  <div className="account-reservation-info">
                    <p className="account-reservation-title">
                      {r.partySize} {r.partySize === 1 ? 'guest' : 'guests'} · {r.time}
                    </p>
                    {r.notes && <p className="account-reservation-note">{r.notes}</p>}
                  </div>
                  {statusBadge(r.status, RES_STATUS)}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Order history */}
        <section className="account-section">
          <div className="account-section-head">
            <h2 className="account-section-title">Order history</h2>
          </div>

          {orders.length === 0 ? (
            <div className="account-empty">
              <Icons.Receipt size={28} />
              <p>No orders yet — sign in when you order to earn points.</p>
            </div>
          ) : (
            <div className="account-order-list">
              {orders.map(o => (
                <div key={o.id} className="account-order-row" onClick={() => navigate(`/order/${o.id}`)}>
                  <div className="account-order-id">
                    <p className="account-order-title">Order #{String(o.id).slice(0, 8)}</p>
                    <p className="account-order-meta">
                      {new Date(o.createdAt).toLocaleDateString()} · Table {o.tableNumber}
                    </p>
                  </div>
                  <div className="account-order-right">
                    {o.pointsEarned > 0 && (
                      <span className="account-order-points"><Icons.Gift size={12} /> +{o.pointsEarned} pts</span>
                    )}
                    {statusBadge(o.status, ORDER_STATUS)}
                    <span className="account-order-total">₹{o.total?.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPointsEarned > 0 && (
            <p className="account-footnote">
              You've earned <strong>{totalPointsEarned} pts</strong> across all your orders — points are credited as soon as an order is placed.
            </p>
          )}
        </section>
      </div>

      <CustomerAuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
