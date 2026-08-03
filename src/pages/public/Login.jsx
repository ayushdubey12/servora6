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
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--background)' }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <Icons.Logo size={40} />
            <span className="headline-md" style={{ color: 'var(--on-surface)' }}>Servora</span>
          </Link>
        </div>
        <h2 className="text-center headline-lg" style={{ color: 'var(--on-surface)' }}>
          Welcome back
        </h2>
        <p className="mt-2 text-center body-md" style={{ color: 'var(--on-surface-variant)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Start your 14-day free trial
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass py-8 px-4 sm:px-10" style={{ borderRadius: 'var(--radius-2xl)', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <Input
              label="Password"
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

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
                <div className="w-full" style={{ borderTop: '1px solid var(--glass-border)' }} />
              </div>
              <div className="relative flex justify-center body-sm">
                <span className="px-2 label-sm" style={{ background: 'var(--glass-strong-bg)', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-mono)' }}>Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-2 gap-3">
              <Button variant="outline" icon={<Icons.Globe size={18} />}>
                Google
              </Button>
              <Button variant="outline" icon={<Icons.Smartphone size={18} />}>
                Apple
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
