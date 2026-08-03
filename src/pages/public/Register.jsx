import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    restaurantName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        restaurantName: formData.restaurantName,
      });
      navigate('/onboarding');
    } catch (err) {
      setError(err.message || 'Registration failed');
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
          Start your free trial
        </h2>
        <p className="mt-2 text-center body-md" style={{ color: 'var(--on-surface-variant)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="glass py-8 px-4 sm:px-10" style={{ borderRadius: 'var(--radius-2xl)', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="grid grid-2 gap-4">
              <Input
                label="First name"
                id="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
              />
              <Input
                label="Last name"
                id="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Work email"
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@restaurant.com"
            />

            <Input
              label="Restaurant name"
              id="restaurantName"
              required
              value={formData.restaurantName}
              onChange={handleChange}
              placeholder="The Green Table"
            />

            <Input
              label="Password"
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              hint="Must be at least 8 characters long."
            />

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded"
                style={{ accentColor: 'var(--primary)' }}
              />
              <label htmlFor="terms" className="ml-2 body-sm" style={{ color: 'var(--on-surface)' }}>
                I agree to the{' '}
                <a href="#" className="font-medium text-primary hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium text-primary hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {error && <p className="body-sm" style={{ color: 'var(--error)', fontFamily: 'var(--font-mono)' }}>{error}</p>}

            <div>
              <Button type="submit" fullWidth size="lg" loading={loading}>
                Create account
              </Button>
            </div>
          </form>
        </div>
        <p className="text-center body-sm mt-6" style={{ color: 'var(--on-surface-variant)' }}>
          No credit card required. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
