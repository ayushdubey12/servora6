import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import './Complete.css';

export default function Complete() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get('/api/onboarding/status');
        setSummary(response);
        await api.post('/api/onboarding/complete', { notes: 'Completed from onboarding' });
      } catch (err) {
        setError(err.message || 'Unable to complete onboarding');
      }
    }
    load();
  }, []);

  return (
    <div className="onboarding-complete animate-fade-in-up">
      <div className="onboarding-complete-icon">
        <Icons.CheckCircle size={56} />
      </div>
      <h1 className="headline-lg">Setup complete</h1>
      <p className="body-lg text-muted" style={{ textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
        Your restaurant is now ready to operate with Servora.
      </p>

      {summary && (
        <Card className="onboarding-summary-card">
          <div className="onboarding-summary-row">
            <span className="label-sm text-muted">Restaurant</span>
            <span className="body-md font-medium">{summary?.restaurant || 'Configured'}</span>
          </div>
          <div className="onboarding-summary-row">
            <span className="label-sm text-muted">Branch</span>
            <span className="body-md font-medium">{summary?.branch || 'Configured'}</span>
          </div>
          <div className="onboarding-summary-row">
            <span className="label-sm text-muted">Tables</span>
            <span className="body-md font-medium">{summary?.tables || 'Ready'}</span>
          </div>
          <div className="onboarding-summary-row">
            <span className="label-sm text-muted">Menu</span>
            <span className="body-md font-medium">{summary?.menu || 'Loaded'}</span>
          </div>
          <div className="onboarding-summary-row">
            <span className="label-sm text-muted">Payments</span>
            <span className="body-md font-medium">{summary?.payments || 'Configured'}</span>
          </div>
        </Card>
      )}

      {error && (
        <div className="onboarding-error">
          <Icons.AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <Button as={Link} to="/dashboard" size="xl" iconRight={Icons.ArrowRight}>
        Go to dashboard
      </Button>
    </div>
  );
}
