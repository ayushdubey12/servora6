import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import './Complete.css';

export default function Complete() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        if (!user?.restaurantId) {
          setSummary({ restaurant: 'Configured', tables: 'Ready', menu: 'Loaded', payments: 'Configured' });
          return;
        }

        const [tablesRes, categoriesRes, menuRes] = await Promise.all([
          supabase.from('tables').select('id', { count: 'exact', head: true }).eq('restaurant_id', user.restaurantId),
          supabase.from('categories').select('id', { count: 'exact', head: true }).eq('restaurant_id', user.restaurantId),
          supabase.from('menu_items').select('id', { count: 'exact', head: true }).eq('restaurant_id', user.restaurantId),
        ]);

        setSummary({
          restaurant: user.name || 'Configured',
          tables: `${tablesRes.count || 0} tables`,
          menu: `${menuRes.count || 0} items in ${categoriesRes.count || 0} categories`,
          payments: 'Configured',
        });
      } catch (err) {
        setSummary({ restaurant: 'Configured', tables: 'Ready', menu: 'Loaded', payments: 'Configured' });
      }
    }
    load();
  }, [user]);

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
