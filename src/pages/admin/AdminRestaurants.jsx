import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icons } from '../../assets/icons';
import { getAdminRestaurants, getAdminRestaurantDetail, updateAdminRestaurant, createAdminSubscription } from '../../lib/api';
import './AdminRestaurants.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAdminRestaurants()
      .then(setRestaurants)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="headline-lg">Restaurants</h1>
            <p className="body-md text-muted">{restaurants.length} restaurants on the platform</p>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="search-input-wrapper" style={{ maxWidth: 320 }}>
            <Icons.Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search restaurants..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="admin-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <p className="text-muted">Loading restaurants...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <Icons.Store size={40} style={{ color: 'var(--outline)', marginBottom: 'var(--space-3)' }} />
              <p className="text-muted">No restaurants found</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Restaurant</th>
                  <th>Slug</th>
                  <th>Plan</th>
                  <th>Orders</th>
                  <th>Customers</th>
                  <th>Revenue</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} onClick={() => navigate(`/admin/restaurants/${r.id}`)} style={{ cursor: 'pointer' }}>
                    <td className="font-medium">{r.name}</td>
                    <td className="text-muted">{r.slug}</td>
                    <td>
                      <span className={`plan-badge plan-${r.subscription?.plan || 'none'}`}>
                        {r.subscription?.plan || 'No plan'}
                      </span>
                    </td>
                    <td>{r._count?.orders || 0}</td>
                    <td>{r._count?.customers || 0}</td>
                    <td className="font-medium">{formatCurrency(r.totalRevenue || 0)}</td>
                    <td className="text-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Icons.ChevronRight size={16} style={{ color: 'var(--outline)' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminRestaurantDetail() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [subPlan, setSubPlan] = useState('basic');
  const [subSetupFee, setSubSetupFee] = useState(25000);
  const [subAnnualFee, setSubAnnualFee] = useState(15000);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    getAdminRestaurantDetail(id)
      .then(data => {
        setRestaurant(data);
        setEditData({ name: data.name, description: data.description || '', phone: data.phone || '', email: data.email || '', address: data.address || '' });
        if (data.subscriptions?.[0]) {
          setSubPlan(data.subscriptions[0].plan);
          setSubSetupFee(data.subscriptions[0].setupFee);
          setSubAnnualFee(data.subscriptions[0].annualFee);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try {
      await updateAdminRestaurant(id, editData);
      setRestaurant({ ...restaurant, ...editData });
      setEditMode(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubSave = async () => {
    try {
      await createAdminSubscription(id, { plan: subPlan, setupFee: subSetupFee, annualFee: subAnnualFee });
      const updated = await getAdminRestaurantDetail(id);
      setRestaurant(updated);
      alert('Subscription updated');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="admin-page"><p className="text-muted">Loading...</p></div>;
  if (!restaurant) return <div className="admin-page"><p className="text-muted">Restaurant not found</p></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/restaurants')}>
            <Icons.ArrowLeft size={16} /> Back
          </button>
          <div>
            <h1 className="headline-lg">{restaurant.name}</h1>
            <p className="body-md text-muted">/{restaurant.slug}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon primary"><Icons.ShoppingCart size={22} /></div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Orders</div>
            <div className="admin-stat-value">{restaurant._count?.orders || 0}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon success"><Icons.DollarSign size={22} /></div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Revenue</div>
            <div className="admin-stat-value">{formatCurrency(restaurant.totalRevenue || 0)}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon warning"><Icons.Users size={22} /></div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Customers</div>
            <div className="admin-stat-value">{restaurant._count?.customers || 0}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon info"><Icons.UtensilsCrossed size={22} /></div>
          <div className="admin-stat-content">
            <div className="admin-stat-label">Menu Items</div>
            <div className="admin-stat-value">{restaurant._count?.menuItems || 0}</div>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        {/* Details */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Restaurant Details</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(!editMode)}>
              {editMode ? 'Cancel' : <><Icons.Pencil size={14} /> Edit</>}
            </button>
          </div>
          <div className="admin-card-body">
            {editMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="field">
                  <label className="label">Name</label>
                  <input className="input" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                </div>
                <div className="field">
                  <label className="label">Description</label>
                  <textarea className="input" rows={2} value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} />
                </div>
                <div className="field">
                  <label className="label">Phone</label>
                  <input className="input" value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
                </div>
                <div className="field">
                  <label className="label">Email</label>
                  <input className="input" value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} />
                </div>
                <div className="field">
                  <label className="label">Address</label>
                  <textarea className="input" rows={2} value={editData.address} onChange={e => setEditData({ ...editData, address: e.target.value })} />
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleSave}>Save Changes</button>
              </div>
            ) : (
              <div className="admin-detail-grid">
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Phone</span>
                  <span className="admin-detail-value">{restaurant.phone || '—'}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Email</span>
                  <span className="admin-detail-value">{restaurant.email || '—'}</span>
                </div>
                <div className="admin-detail-item" style={{ gridColumn: '1 / -1' }}>
                  <span className="admin-detail-label">Address</span>
                  <span className="admin-detail-value">{restaurant.address || '—'}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Created</span>
                  <span className="admin-detail-value">{new Date(restaurant.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Tables</span>
                  <span className="admin-detail-value">{restaurant._count?.tables || 0}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subscription */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Subscription</h3>
          </div>
          <div className="admin-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="field">
                <label className="label">Plan</label>
                <select className="input" value={subPlan} onChange={e => setSubPlan(e.target.value)}>
                  <option value="basic">Basic — ₹25k setup + ₹15k/yr</option>
                  <option value="premium">Premium — ₹50k setup + ₹35k/yr</option>
                </select>
              </div>
              <div className="field">
                <label className="label">Setup Fee (₹)</label>
                <input className="input" type="number" value={subSetupFee} onChange={e => setSubSetupFee(Number(e.target.value))} />
              </div>
              <div className="field">
                <label className="label">Annual Fee (₹)</label>
                <input className="input" type="number" value={subAnnualFee} onChange={e => setSubAnnualFee(Number(e.target.value))} />
              </div>
              {restaurant.subscriptions?.[0] && (
                <div className="admin-detail-grid">
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Status</span>
                    <span className="admin-detail-value">
                      <span className={`status-badge status-${restaurant.subscriptions[0].status === 'active' ? 'completed' : 'cancelled'}`}>
                        {restaurant.subscriptions[0].status}
                      </span>
                    </span>
                  </div>
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Next Billing</span>
                    <span className="admin-detail-value">
                      {restaurant.subscriptions[0].nextBillingDate
                        ? new Date(restaurant.subscriptions[0].nextBillingDate).toLocaleDateString()
                        : '—'}
                    </span>
                  </div>
                </div>
              )}
              <button className="btn btn-primary btn-sm" onClick={handleSubSave}>Save Subscription</button>
            </div>
          </div>
        </div>
      </div>

      {/* Staff */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Staff ({restaurant.users?.length || 0})</h3>
        </div>
        <div className="admin-card-body" style={{ padding: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {(restaurant.users || []).map(u => (
                <tr key={u.id}>
                  <td className="font-medium">{u.name}</td>
                  <td className="text-muted">{u.email}</td>
                  <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                  <td className="text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Recent Orders</h3>
        </div>
        <div className="admin-card-body" style={{ padding: 0 }}>
          {(!restaurant.recentOrders || restaurant.recentOrders.length === 0) ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <p className="text-muted">No orders yet</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Table</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {restaurant.recentOrders.map(o => (
                  <tr key={o.id}>
                    <td>Table {o.tableNumber}</td>
                    <td>{o.customerName}</td>
                    <td><span className={`status-badge status-${o.status?.toLowerCase()}`}>{o.status}</span></td>
                    <td className="font-medium">{formatCurrency(o.total)}</td>
                    <td className="text-muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
