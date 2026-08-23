import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createCategory, createMenuItem } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../assets/icons';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';
import './MenuSetup.css';

const STORAGE_KEY = 'servora-onboarding-draft';

function readDraft() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export default function MenuSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    categoryName: 'Signature',
    itemName: 'House special',
    description: 'A great first dish',
    price: '18',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const draft = readDraft();
    if (draft.menu) {
      setForm(draft.menu);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const nextDraft = { ...readDraft(), menu: form };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDraft));
    try {
      if (user?.restaurantId) {
        const slug = form.categoryName.toLowerCase().replace(/\s+/g, '-');

        // Create category
        const category = await createCategory({
          name: form.categoryName,
          slug,
          restaurantId: user.restaurantId,
          sortOrder: 0,
        });

        // Create menu item (price in paise)
        await createMenuItem({
          name: form.itemName,
          description: form.description,
          price: Math.round(Number(form.price) * 100),
          isVeg: true,
          isAvailable: true,
          restaurantId: user.restaurantId,
          categoryId: category.id,
        });
      }
      navigate('/onboarding/payments');
    } catch (err) {
      navigate('/onboarding/payments');
    } finally {
      setLoading(false);
    }
  };

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="onboarding-page">
      <div className="onboarding-page-header animate-fade-in-up">
        <div className="onboarding-page-icon">
          <Icons.UtensilsCrossed size={24} />
        </div>
        <h1 className="headline-md">Menu import</h1>
        <p className="body-md text-muted">Add a starter category and a first menu item so your digital menu is ready.</p>
      </div>

      <Card className="onboarding-card animate-fade-in-up delay-1">
        <CardBody>
          <form onSubmit={handleSubmit} className="onboarding-form">
            <Input
              label="Category name"
              placeholder="e.g. Starters"
              value={form.categoryName}
              onChange={(e) => update('categoryName', e.target.value)}
              required
              icon={<span style={{ color: 'var(--on-surface-variant)' }}><Icons.Tag size={16} /></span>}
            />
            <Input
              label="Menu item name"
              placeholder="e.g. Truffle Burrata"
              value={form.itemName}
              onChange={(e) => update('itemName', e.target.value)}
              required
              icon={<span style={{ color: 'var(--on-surface-variant)' }}><Icons.ChefHat size={16} /></span>}
            />
            <Textarea
              label="Description"
              placeholder="Describe the dish..."
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
            <Input
              label="Price"
              type="number"
              step="0.01"
              min="0"
              placeholder="18.00"
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              required
              icon={<span style={{ color: 'var(--on-surface-variant)' }}><Icons.DollarSign size={16} /></span>}
            />
            {error && (
              <div className="onboarding-error">
                <Icons.AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            <div className="onboarding-form-actions">
              <Button variant="outline" iconLeft={Icons.ArrowLeft} as={Link} to="/onboarding/tables">
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
