import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../assets/icons';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';
import './TableSetup.css';

const STORAGE_KEY = 'servora-onboarding-draft';

function readDraft() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export default function TableSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ tableCount: '4', seatsPerTable: '4' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const draft = readDraft();
    if (draft.tables) {
      setForm(draft.tables);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const nextDraft = { ...readDraft(), tables: form };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDraft));
    try {
      if (user?.restaurantId) {
        const tableCount = Number(form.tableCount);
        const seatsPerTable = Number(form.seatsPerTable);

        // Delete existing tables for this restaurant, then insert new ones
        await supabase.from('tables').delete().eq('restaurant_id', user.restaurantId);

        const tables = Array.from({ length: tableCount }, (_, index) => ({
          restaurant_id: user.restaurantId,
          number: index + 1,
          seats: seatsPerTable,
          status: 'available',
        }));

        await supabase.from('tables').insert(tables);
      }
      navigate('/onboarding/menu');
    } catch (err) {
      navigate('/onboarding/menu');
    } finally {
      setLoading(false);
    }
  };

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="onboarding-page">
      <div className="onboarding-page-header animate-fade-in-up">
        <div className="onboarding-page-icon">
          <Icons.Table size={24} />
        </div>
        <h1 className="headline-md">Table setup</h1>
        <p className="body-md text-muted">Create the initial table layout for your dining room.</p>
      </div>

      <Card className="onboarding-card animate-fade-in-up delay-1">
        <CardBody>
          <form onSubmit={handleSubmit} className="onboarding-form">
            <Input
              label="Number of tables"
              type="number"
              min="1"
              max="50"
              placeholder="e.g. 8"
              value={form.tableCount}
              onChange={(e) => update('tableCount', e.target.value)}
              required
              hint="You can add more later from the dashboard."
              icon={<span style={{ color: 'var(--on-surface-variant)' }}><Icons.Grid size={16} /></span>}
            />
            <Input
              label="Seats per table"
              type="number"
              min="1"
              max="20"
              placeholder="e.g. 4"
              value={form.seatsPerTable}
              onChange={(e) => update('seatsPerTable', e.target.value)}
              required
              hint="This will be applied to all tables by default."
              icon={<span style={{ color: 'var(--on-surface-variant)' }}><Icons.Users size={16} /></span>}
            />
            {error && (
              <div className="onboarding-error">
                <Icons.AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            <div className="onboarding-form-actions">
              <Button variant="outline" iconLeft={Icons.ArrowLeft} as={Link} to="/onboarding/branch">
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
