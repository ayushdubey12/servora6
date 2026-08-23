import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCustomerRestaurant } from '../../context/CustomerRestaurantContext';
import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import { getPublicMenu } from '../../lib/api';
import './MenuPage.css';

export default function MenuPage() {
  const { restaurantSlug } = useParams();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table');
  const navigate = useNavigate();
  const { items: cartItems, addItem, updateQuantity, removeItem, setTableNumber } = useCart();
  const { setRestaurantData } = useCustomerRestaurant();

  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItemId, setAddedItemId] = useState(null);
  const [floatingItem, setFloatingItem] = useState(null);

  // Fetch menu data by slug from URL
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getPublicMenu(restaurantSlug);
        if (cancelled) return;
        setRestaurant(data.restaurant);
        setCategories(data.categories);
        setMenuItems(data.menuItems);
        // Populate the customer restaurant context for other pages (layout, checkout, etc.)
        setRestaurantData(data);
        if (data.categories.length > 0) {
          setActiveCategory(data.categories[0].id);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Restaurant not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [restaurantSlug, setRestaurantData]);

  // Store table number in cart context for checkout
  useEffect(() => {
    if (tableNumber) {
      setTableNumber(tableNumber);
    }
  }, [tableNumber, setTableNumber]);

  // Sync activeCategory when categories load
  useEffect(() => {
    if (categories.length > 0 && !categories.find(c => c.id === activeCategory)) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  // Add-to-cart with animation
  const handleAddItem = useCallback((item, e) => {
    e.stopPropagation();
    addItem(item, 1);

    // Trigger stepper pop animation
    setAddedItemId(item.id);
    setTimeout(() => setAddedItemId(null), 400);

    // Fly-to-cart animation — use the clicked element's position
    const rect = e.currentTarget.getBoundingClientRect();
    setFloatingItem({
      id: item.id,
      name: item.name,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    setTimeout(() => setFloatingItem(null), 600);
  }, [addItem]);

  const menuByCategory = useMemo(() => {
    const result = {};
    categories.forEach(cat => {
      result[cat.id] = menuItems.filter(item => item.categoryId === cat.id);
    });
    return result;
  }, [categories, menuItems]);

  const currentItems = activeCategory ? (menuByCategory[activeCategory] || []) : [];
  const filteredItems = searchQuery
    ? currentItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : currentItems;

  const categoryCounts = useMemo(() => {
    const counts = {};
    categories.forEach(cat => {
      counts[cat.id] = (menuItems.filter(i => i.categoryId === cat.id && i.isAvailable)).length;
    });
    return counts;
  }, [categories, menuItems]);

  // Loading state
  if (loading) {
    return (
      <div className="menu-page">
        <div className="container">
          <div className="menu-loading">
            <div className="menu-loading-spinner" />
            <p>Loading menu...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="menu-page">
        <div className="container">
          <div className="menu-empty">
            <Icons.Search size={32} />
            <p>{error}</p>
            <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginTop: '8px' }}>
              Please check the QR code or ask your server for the correct link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <div className="container">
        <div className="menu-header">
          <div>
            <h1 className="menu-title">{restaurant?.name || 'Menu'}</h1>
            <p className="menu-subtitle">
              {tableNumber ? `Table ${tableNumber} — Browse and order directly` : 'Browse our carefully crafted dishes'}
            </p>
          </div>
        </div>

        <div className="menu-search">
          <div className="search-input-wrapper">
            <Icons.Search size={18} />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="menu-categories">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-chip ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
              <span className="category-count">{categoryCounts[cat.id] || 0}</span>
            </button>
          ))}
        </div>

        {tableNumber && (
          <div className="table-banner">
            <Icons.MapPin size={18} />
            <span>You are seated at <strong>Table {tableNumber}</strong></span>
          </div>
        )}

        <div className="menu-items-grid">
          {filteredItems.length === 0 ? (
            <div className="menu-empty">
              <Icons.Search size={32} />
              <p>No items found</p>
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className="menu-item-card" onClick={() => navigate(`/menu/${restaurantSlug}/item/${item.id}`)}>
                <div className="menu-item-content">
                  <div className="menu-item-header">
                    <div>
                      <div className="menu-item-name-row">
                        <h3 className="menu-item-name">{item.name}</h3>
                        {item.isPopular && <span className="popular-badge">Popular</span>}
                      </div>
                      <p className="menu-item-desc">{item.description}</p>
                    </div>
                    <span className="menu-item-price">₹{item.price.toFixed(0)}</span>
                  </div>
                  <div className="menu-item-footer">
                    <div className="menu-item-meta">
                      <span className="menu-item-prep">
                        <Icons.Clock size={12} />
                        {item.prepTime} min
                      </span>
                      {item.calories > 0 && <span className="menu-item-cal">{item.calories} cal</span>}
                    </div>
                    {(() => {
                      if (!item.isAvailable) {
                        return (
                          <Button size="sm" variant="primary" disabled>
                            Unavailable
                          </Button>
                        );
                      }
                      const cartItem = cartItems.find(ci => ci.id === item.id);
                      const qty = cartItem?.quantity || 0;
                      if (qty === 0) {
                        return (
                          <Button
                            size="sm"
                            variant="primary"
                            className={addedItemId === item.id ? 'btn-add-pop' : ''}
                            onClick={(e) => handleAddItem(item, e)}
                          >
                            Add
                          </Button>
                        );
                      }                        return (
                          <div className="qty-stepper" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="qty-btn qty-minus"
                              onClick={() => qty === 1 ? removeItem(item.id) : updateQuantity(item.id, qty - 1)}
                            >
                              −
                            </button>
                            <span className="qty-value">{qty}</span>
                            <button
                              className="qty-btn qty-plus"
                              onClick={() => updateQuantity(item.id, qty + 1)}
                            >
                              +
                            </button>
                          </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating add-to-cart animation */}
      {floatingItem && (
        <div
          className="add-fly"
          style={{ left: floatingItem.x, top: floatingItem.y }}
        >
          <div className="add-fly-bubble">
            <Icons.Check size={14} />
            <span>+1</span>
          </div>
        </div>
      )}
    </div>
  );
}
