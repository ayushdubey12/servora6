import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRestaurant } from '../../context/RestaurantContext';
import { useCart } from '../../context/CartContext';
import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import './MenuPage.css';

export default function MenuPage() {
  const { restaurantSlug } = useParams();
  const { categories, getMenuByCategory, getCategoryName } = useRestaurant();
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const menuByCategory = useMemo(() => {
    const result = {};
    categories.forEach(cat => {
      result[cat.id] = getMenuByCategory(cat.id);
    });
    return result;
  }, [categories, getMenuByCategory]);

  const currentItems = activeCategory ? (menuByCategory[activeCategory] || []) : [];
  const filteredItems = searchQuery
    ? currentItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentItems;

  const categoryCounts = useMemo(() => {
    const counts = {};
    categories.forEach(cat => {
      counts[cat.id] = getMenuByCategory(cat.id).filter(i => i.isAvailable).length;
    });
    return counts;
  }, [categories, getMenuByCategory]);

  return (
    <div className="menu-page">
      <div className="container">
        <div className="menu-header">
          <div>
            <h1 className="menu-title">Menu</h1>
            <p className="menu-subtitle">Browse our carefully crafted dishes</p>
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
                    <span className="menu-item-price">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="menu-item-footer">
                    <div className="menu-item-meta">
                      <span className="menu-item-prep">
                        <Icons.Clock size={12} />
                        {item.prepTime} min
                      </span>
                      <span className="menu-item-cal">{item.calories} cal</span>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={(e) => { e.stopPropagation(); addItem(item, 1); }}
                      disabled={!item.isAvailable}
                    >
                      {item.isAvailable ? 'Add' : 'Unavailable'}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
