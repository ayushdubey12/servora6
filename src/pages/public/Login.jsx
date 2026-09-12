import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, roleHome } from '../../context/AuthContext';
import { ServoraLogo } from '../../components/public/ServoraIcons';

// Playful Neo-Brutalist Vector Avatars with bold 2.5px strokes
const OwnerAvatar = () => (
  <div style={{ width: 44, height: 44, borderRadius: 12, border: '2px solid #0E0E10', background: '#FFCA28', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2px 2px 0 #0E0E10' }}>
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      {/* Head */}
      <circle cx="16" cy="14" r="8" fill="#FFF9C4" stroke="#0E0E10" strokeWidth="2" />
      {/* Crown / Cap */}
      <path d="M10 9L13 11L16 8L19 11L22 9V12H10V9Z" fill="#FFCA28" stroke="#0E0E10" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Eyes & Smile */}
      <circle cx="13" cy="14" r="1.3" fill="#0E0E10" />
      <circle cx="19" cy="14" r="1.3" fill="#0E0E10" />
      <path d="M14 17C14.8 18.2 17.2 18.2 18 17" stroke="#0E0E10" strokeWidth="1.6" strokeLinecap="round" />
      {/* Suit Collar / Tie */}
      <path d="M11 25C11 22 13.2 20 16 20C18.8 20 21 22 21 25" fill="#FFFFFF" stroke="#0E0E10" strokeWidth="2" />
      <polygon points="16,21 17.5,25 16,27 14.5,25" fill="#EF4444" stroke="#0E0E10" strokeWidth="1.2" />
    </svg>
  </div>
);

const ChefAvatar = () => (
  <div style={{ width: 44, height: 44, borderRadius: 12, border: '2px solid #0E0E10', background: '#FF6584', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2px 2px 0 #0E0E10' }}>
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      {/* Head */}
      <circle cx="16" cy="16" r="7.5" fill="#FFE4E9" stroke="#0E0E10" strokeWidth="2" />
      {/* Puffy Chef Hat */}
      <path d="M10 13C8 13 8 9 11 8C11 6 15 5 16 7C18 5 21 6 21 8C24 9 24 13 22 13H10Z" fill="#FFFFFF" stroke="#0E0E10" strokeWidth="2" strokeLinejoin="round" />
      <rect x="10" y="12" width="12" height="3" rx="1" fill="#FFFFFF" stroke="#0E0E10" strokeWidth="1.8" />
      {/* Eyes & Mustache */}
      <circle cx="13" cy="16" r="1.2" fill="#0E0E10" />
      <circle cx="19" cy="16" r="1.2" fill="#0E0E10" />
      <path d="M13 19C14.5 20.5 15.5 19 16 19.2C16.5 19 17.5 20.5 19 19" stroke="#0E0E10" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  </div>
);

const WaiterAvatar = () => (
  <div style={{ width: 44, height: 44, borderRadius: 12, border: '2px solid #0E0E10', background: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2px 2px 0 #0E0E10' }}>
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      {/* Head */}
      <circle cx="16" cy="14" r="7.5" fill="#E0F2FE" stroke="#0E0E10" strokeWidth="2" />
      {/* Eyes with wink */}
      <circle cx="13.5" cy="14" r="1.2" fill="#0E0E10" />
      <path d="M17.5 14L19.5 14" stroke="#0E0E10" strokeWidth="1.8" strokeLinecap="round" />
      {/* Smile */}
      <path d="M14 17.5C14.8 18.5 17.2 18.5 18 17.5" stroke="#0E0E10" strokeWidth="1.6" strokeLinecap="round" />
      {/* Bowtie */}
      <path d="M12 23L16 25L12 27V23Z" fill="#0E0E10" />
      <path d="M20 23L16 25L20 27V23Z" fill="#0E0E10" />
      <circle cx="16" cy="25" r="1.5" fill="#FFCA28" />
    </svg>
  </div>
);

const PORTALS = {
  owner: {
    title: 'Owner Portal',
    subtitle: 'Manage tables, revenue & staff',
    allowedRoles: ['owner'],
    demoEmail: 'owner@hotelsiraj.in',
    demoPass: 'password123',
    label: 'Owner',
    avatar: <OwnerAvatar />,
  },
  kitchen: {
    title: 'Kitchen Display (KDS)',
    subtitle: 'Live kitchen tickets & prep stations',
    allowedRoles: ['chef'],
    demoEmail: 'chef@hotelsiraj.in',
    demoPass: 'password123',
    label: 'Kitchen',
    avatar: <ChefAvatar />,
  },
  staff: {
    title: 'Staff Portal',
    subtitle: 'Server orders & table status',
    allowedRoles: ['waiter'],
    demoEmail: 'waiter@hotelsiraj.in',
    demoPass: 'password123',
    label: 'Staff',
    avatar: <WaiterAvatar />,
  },
};

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPortal = searchParams.get('portal');
  const [activePortal, setActivePortal] = useState(
    PORTALS[initialPortal] ? initialPortal : 'owner'
  );
  const [email, setEmail] = useState(PORTALS[activePortal].demoEmail);
  const [password, setPassword] = useState(PORTALS[activePortal].demoPass);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const portal = PORTALS[activePortal];

  const handlePortalChange = (key) => {
    setActivePortal(key);
    setError('');
    setEmail(PORTALS[key].demoEmail);
    setPassword(PORTALS[key].demoPass);
    if (key === 'owner') {
      searchParams.delete('portal');
    } else {
      searchParams.set('portal', key);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loggedInUser = await login(email, password, portal.allowedRoles);
      navigate(roleHome(loggedInUser?.role));
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--nb-bg, #FAF6EE)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        fontFamily: 'var(--nb-font)',
      }}
    >
      {/* Brand Header */}
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24, textDecoration: 'none' }}>
        <ServoraLogo size={42} />
        <span style={{ fontSize: 28, fontWeight: 900, color: '#0E0E10', letterSpacing: '-0.03em' }}>Servora</span>
      </Link>

      {/* Main Neo-Brutalist Login Box */}
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#FFFFFF',
          border: '3px solid #0E0E10',
          borderRadius: 28,
          boxShadow: '6px 6px 0px #0E0E10',
          padding: '32px 28px',
        }}
      >
        {/* Portal Switcher Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            marginBottom: 24,
          }}
        >
          {Object.entries(PORTALS).map(([key, p]) => {
            const isActive = activePortal === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handlePortalChange(key)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 6px',
                  borderRadius: 16,
                  border: isActive ? '2.5px solid #0E0E10' : '2px solid transparent',
                  background: isActive ? '#FFF9C4' : '#F7F7F7',
                  boxShadow: isActive ? '3px 3px 0px #0E0E10' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  transform: isActive ? 'translate(-1px, -1px)' : 'none',
                }}
              >
                {p.avatar}
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0E0E10' }}>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Portal Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0E0E10', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            {portal.title}
          </h2>
          <p style={{ fontSize: 13.5, color: '#666', fontWeight: 600, margin: 0 }}>
            {portal.subtitle}
          </p>
        </div>

        {/* 1-Click Demo Fill Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FAF6EE',
            border: '2px dashed #0E0E10',
            borderRadius: 12,
            padding: '8px 12px',
            marginBottom: 20,
            fontSize: 12.5,
            fontWeight: 700,
          }}
        >
          <span>🔑 Demo: <strong>{portal.demoEmail}</strong></span>
          <span style={{ fontSize: 11, background: '#0E0E10', color: '#FFF', borderRadius: 6, padding: '2px 6px' }}>Auto-filled</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="email" style={{ fontSize: 13, fontWeight: 800, color: '#0E0E10' }}>Email Address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={portal.demoEmail}
              style={{
                border: '2px solid #0E0E10',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 14.5,
                fontWeight: 600,
                outline: 'none',
                backgroundColor: '#FAFAFA',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password" style={{ fontSize: 13, fontWeight: 800, color: '#0E0E10' }}>Password</label>
              <a href="#" style={{ fontSize: 12, fontWeight: 700, color: '#666', textDecoration: 'underline' }}>Forgot?</a>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                border: '2px solid #0E0E10',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 14.5,
                fontWeight: 600,
                outline: 'none',
                backgroundColor: '#FAFAFA',
              }}
            />
          </div>

          {error && (
            <div style={{ background: '#FEE2E2', border: '2px solid #EF4444', borderRadius: 10, padding: '8px 12px', fontSize: 13, fontWeight: 700, color: '#B91C1C' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="nb-btn nb-btn-black"
            style={{ width: '100%', marginTop: 6, padding: '12px', fontSize: 15 }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        {/* Bottom Switcher */}
        {activePortal === 'owner' ? (
          <p style={{ textAlign: 'center', fontSize: 13.5, fontWeight: 700, color: '#555', marginTop: 20, marginBottom: 0 }}>
            Need a restaurant account?{' '}
            <Link to="/register" style={{ color: '#0E0E10', fontWeight: 900, textDecoration: 'underline' }}>
              Start 14-day trial
            </Link>
          </p>
        ) : (
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#777', marginTop: 20, marginBottom: 0 }}>
            Staff and Kitchen logins are provisioned by your restaurant owner.
          </p>
        )}
      </div>
    </div>
  );
}
