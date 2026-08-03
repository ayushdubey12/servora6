import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Icons } from '../../assets/icons';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';
import './RestaurantSetup.css';

const STORAGE_KEY = 'servora-onboarding-draft';

function readDraft() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export default function RestaurantSetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', phone: '', email: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const draft = readDraft();
    if (draft.restaurant) {
      setForm(draft.restaurant);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const nextDraft = { ...readDraft(), restaurant: form };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDraft));
    try {
      await api.post('/api/onboarding/restaurant', form);
      navigate('/onboarding/branch');
    } catch (err) {
      setError(err.message || 'Unable to save restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="onboarding-page">
      <div className="onboarding-page-header animate-fade-in-up">
        <div className="onboarding-page-icon">
          <Icons.Store size={24} />
        </div>
        <h1 className="headline-md">Restaurant details</h1>
        <p className="body-md text-muted">Tell us who you are so Servora can build your operating setup.</p>
      </div>

      <Card className="onboarding-card animate-fade-in-up delay-1">
        <CardBody>
          <form onSubmit={handleSubmit} className="onboarding-form">
            <Input
              label="Restaurant name"
              placeholder="e.g. The Green Table"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
              icon={<span style={{ color: 'var(--on-surface-variant)' }}><Icons.Store size={16} /></span>}
            />
            <Textarea
              label="Description"
              placeholder="A short description of your restaurant"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
            <Input
              label="Phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              icon={<span style={{ color: 'var(--on-surface-variant)' }}><Icons.Phone size={16} /></span>}
            />
            <Input
              label="Email"
              type="email"
              placeholder="hello@restaurant.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              icon={<span style={{ color: 'var(--on-surface-variant)' }}><Icons.Mail size={16} /></span>}
            />
            <Textarea
              label="Address"
              placeholder="42 Garden Street, San Francisco, CA"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
            />
            {error && (
              <div className="onboarding-error">
                <Icons.AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            <div className="onboarding-form-actions">
              <Button variant="outline" iconLeft={Icons.ArrowLeft} as={Link} to="/onboarding">
                Back
              </Button>
              <Button type="submit" loading={loading} iconRight={Icons.ArrowRight} size="lg">
                Continue
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
