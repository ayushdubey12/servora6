import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Icons } from '../../assets/icons';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import './CustomerAuthModal.css';

export default function CustomerAuthModal({ isOpen, onClose, onSuccess }) {
  const { login, register } = useCustomerAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setMode('login');
    setError('');
    setPassword('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const switchMode = (next) => {
    setMode(next);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && name.trim().length < 2) {
      setError('Please enter your name');
      return;
    }
    if (!email.trim() || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (mode === 'register' && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, password });
      }
      reset();
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={mode === 'login' ? 'Sign in' : 'Create your account'} maxWidth="440px">
      <div className="customer-auth">
        <div className="customer-auth-hero">
          <div className="customer-auth-hero-icon">
            <Icons.Gift size={22} />
          </div>
          <p className="customer-auth-hero-text">
            Earn <strong>1 loyalty point per ₹1</strong> on every order, track your history, and book tables faster.
          </p>
        </div>

        <div className="customer-auth-tabs">
          <button
            type="button"
            className={`customer-auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`customer-auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
          >
            Create account
          </button>
        </div>

        <form className="customer-auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          {mode === 'register' && (
            <Input
              label="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 000 0000"
            />
          )}

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'login' ? 'Your password' : 'At least 6 characters'}
            required
          />

          {error && <div className="customer-auth-error">{error}</div>}

          <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>

          {mode === 'register' && (
            <p className="customer-auth-terms">
              By creating an account you agree to our Terms of Service. Guest checkout is still available.
            </p>
          )}
        </form>
      </div>
    </Modal>
  );
}
