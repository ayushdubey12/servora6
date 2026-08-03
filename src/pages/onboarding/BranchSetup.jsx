import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Icons } from '../../assets/icons';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';
import './BranchSetup.css';

const STORAGE_KEY = 'servora-onboarding-draft';

function readDraft() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export default function BranchSetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const draft = readDraft();
    if (draft.branch) {
      setForm(draft.branch);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const nextDraft = { ...readDraft(), branch: form };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDraft));
    try {
      await api.post('/api/onboarding/branch', form);
      navigate('/onboarding/tables');
    } catch (err) {
      setError(err.message || 'Unable to save branch details');
    } finally {
      setLoading(false);
    }
  };

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="onboarding-page">
      <div className="onboarding-page-header animate-fade-in-up">
        <div className="onboarding-page-icon">
          <Icons.MapPin size={24} />
        </div>
        <h1 className="headline-md">Your first branch</h1>
        <p className="body-md text-muted">Set up the first location so your team can start serving immediately.</p>
      </div>

      <Card className="onboarding-card animate-fade-in-up delay-1">
        <CardBody>
          <form onSubmit={handleSubmit} className="onboarding-form">
            <Input
              label="Branch name"
              placeholder="e.g. Downtown, Marina"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
              icon={<span style={{ color: 'var(--on-surface-variant)' }}><Icons.Store size={16} /></span>}
            />
            <Textarea
              label="Branch address"
              placeholder="42 Garden Street, San Francisco, CA"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
            />
            <Input
              label="Branch phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              icon={<span style={{ color: 'var(--on-surface-variant)' }}><Icons.Phone size={16} /></span>}
            />
            {error && (
              <div className="onboarding-error">
                <Icons.AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            <div className="onboarding-form-actions">
              <Button variant="outline" iconLeft={Icons.ArrowLeft} as={Link} to="/onboarding/restaurant">
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
