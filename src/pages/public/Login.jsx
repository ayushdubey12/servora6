import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, roleHome } from '../../context/AuthContext';
import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loggedInUser = await login(email, password);
      navigate(roleHome(loggedInUser?.role));
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4" style={{ background: 'var(--background)' }}>
      <div className="w-full" style={{ maxWidth: '400px' }}>
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-3">
            <Icons.Logo size={44} />
            <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.01em' }}>Servora</span>
          </Link>
        </div>
        <h2 className="text-center" style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 600, color: 'var(--on-surface)', lineHeight: '36px', marginBottom: '8px' }}>
          Welcome back
        </h2>
        <p className="text-center" style={{ color: 'var(--on-surface-variant)', fontSize: '16px', fontWeight: 500 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Start your 14-day free trial
          </Link>
        </p>
      </div>

      <div className="w-full" style={{ maxWidth: '400px', marginTop: '32px' }}>
        <div style={{ background: '#ffffff', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', padding: '32px 24px', boxShadow: '0px 12px 32px rgba(0,0,0,0.04)' }}>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@hotelsiraj.in"
            />

            <Input
              label="Password"
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
            />

            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-lg)', background: 'var(--primary-fixed)', border: '1px solid var(--primary-container)', fontSize: '13px', color: 'var(--on-primary-fixed-variant)', fontWeight: 500 }}>
              <strong>Demo credentials:</strong> owner@hotelsiraj.in / password123
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded"
                  style={{ accentColor: 'var(--primary)' }}
                />
                <label htmlFor="remember-me" className="ml-2 body-sm" style={{ color: 'var(--on-surface)' }}>
                  Remember me
                </label>
              </div>

              <div className="body-sm">
                <a href="#" className="font-medium text-primary hover:underline">
                  Forgot your password?
                </a>
              </div>
            </div>

            {error && <p className="body-sm" style={{ color: 'var(--error)', fontFamily: 'var(--font-mono)' }}>{error}</p>}

            <div>
              <Button type="submit" fullWidth size="lg" loading={loading}>
                Sign in
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: '1px solid var(--outline-variant)' }} />
              </div>
              <div className="relative flex justify-center">
                <span className="px-2" style={{ background: '#ffffff', color: 'var(--on-surface-variant)', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>Email & password authentication</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
