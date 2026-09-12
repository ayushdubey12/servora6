import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { getPublicMenuItem } from '../../lib/api';
import './ItemDetail.css';

export default function ItemDetail() {
  const { restaurantSlug, itemId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getPublicMenuItem(restaurantSlug, itemId);
        if (cancelled) return;
        setItem(data);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Item not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [restaurantSlug, itemId]);

  if (loading) {
    return (
      <div className="item-detail-page">
        <div className="container">
          <div className="menu-loading">
            <div className="menu-loading-spinner" />
            <p>Loading item...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="item-detail-page">
        <div className="container">
          <div className="item-detail-empty">
            <p>{error || 'Item not found'}</p>
            <Button variant="primary" onClick={() => navigate(`/menu/${restaurantSlug}`)}>Back to Menu</Button>
          </div>
        </div>
      </div>
    );
  }

  const itemTotal = item.price * quantity;

  return (
    <div className="item-detail-page">
      <div className="container">
        <button className="back-button" onClick={() => navigate(`/menu/${restaurantSlug}`)}>
          <Icons.ArrowLeft size={20} />
          <span>Back to Menu</span>
        </button>

        <div className="item-detail-card">
          <div className="item-detail-visual">
            <div className="item-image-placeholder">
              <Icons.UtensilsCrossed size={48} />
            </div>
            {item.isPopular && <Badge variant="tertiary">Popular</Badge>}
          </div>

          <div className="item-detail-body">
            <div className="item-detail-header">
              <div>
                <h1 className="item-detail-name">{item.name}</h1>
                <p className="item-detail-desc">{item.description}</p>
              </div>
            </div>

            <div className="item-detail-meta">
              {item.prepTime > 0 && (
                <div className="meta-item">
                  <Icons.Clock size={16} />
                  <span>{item.prepTime} min prep</span>
                </div>
              )}
              {item.calories > 0 && (
                <div className="meta-item">
                  <span className="meta-label">Calories</span>
                  <span className="meta-value">{item.calories}</span>
                </div>
              )}
            </div>

            <div className="item-detail-purchase">
              <div className="quantity-selector">
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Icons.Minus size={18} />
                </button>
                <span className="quantity-value">{quantity}</span>
                <button className="quantity-btn" onClick={() => setQuantity(q => q + 1)}>
                  <Icons.Plus size={18} />
                </button>
              </div>

              <div className="item-detail-price-block">
                <span className="item-detail-unit">₹{item.price.toFixed(0)}</span>
                {quantity > 1 && (
                  <span className="item-detail-total">Total: ₹{itemTotal.toFixed(0)}</span>
                )}
              </div>

              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => { addItem(item, quantity); navigate('/cart'); }}
                disabled={!item.isAvailable}
              >
                {item.isAvailable ? `Add to Cart — ₹${itemTotal.toFixed(0)}` : 'Unavailable'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
