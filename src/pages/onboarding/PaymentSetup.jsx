import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { updateRestaurant } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../assets/icons';
import Input, { Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';
import './PaymentSetup.css';

const STORAGE_KEY = 'servora-onboarding-draft';

function readDraft() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

const PAYMENT_OPTIONS = [
  { value: 'counter', label: 'Counter payment — Cash or card at the counter' },
  { value: 'online', label: 'Online payment — Integrated payment gateway' },
  { value: 'qr', label: 'QR payment — Scan to pay' },
];

export default function PaymentSetup() {
  const navigate = useNavigate();
  const { user, restaurant } = useAuth();
  const [form, setForm] = useState({ provider: 'counter', notes: 'Cash or card at the counter' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const draft = readDraft();
    if (draft.payments) {
      setForm(draft.payments);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const nextDraft = { ...readDraft(), payments: form };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDraft));
    try {
      if (user?.restaurantId) {
        const currentSettings = restaurant?.settings || {};
        await updateRestaurant(user.restaurantId, {
          settings: JSON.stringify({
            ...currentSettings,
            payment: {
              provider: form.provider,
              notes: form.notes,
            },
          }),
        });
      }
      navigate('/onboarding/waiters');
    } catch (err) {
      navigate('/onboarding/waiters');
    } finally {
      setLoading(false);
    }
  };

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="onboarding-page">
      <div className="onboarding-page-header animate-fade-in-up">
        <div className="onboarding-page-icon">
          <Icons.CreditCard size={24} />
        </div>
        <h1 className="headline-md">Payments</h1>
        <p className="body-md text-muted">Choose the payment flow you want to start with.</p>
      </div>

      <Card className="onboarding-card animate-fade-in-up delay-1">
        <CardBody>
          <form onSubmit={handleSubmit} className="onboarding-form">
            <Select
              label="Payment provider"
              options={PAYMENT_OPTIONS}
              value={form.provider}
              onChange={(e) => update('provider', e.target.value)}
            />
            <Input
              label="Payment notes"
              placeholder="Any instructions for your team..."
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
            />
            {error && (
              <div className="onboarding-error">
                <Icons.AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            <div className="onboarding-form-actions">
              <Button variant="outline" iconLeft={Icons.ArrowLeft} as={Link} to="/onboarding/menu">
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
