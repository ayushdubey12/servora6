import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import CustomerAuthModal from '../../components/customer/CustomerAuthModal';
import Button from '../../components/ui/Button';
import { Icons } from '../../assets/icons';
import './Checkout.css';

export default function Checkout() {
  const { items, subtotal, tax, total, tableNumber, setTableNumber, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { tables, restaurant } = useRestaurant();
  const { customer } = useCustomerAuth();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [selectedTable, setSelectedTable] = useState(tableNumber || '');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [authOpen, setAuthOpen] = useState(false);

  // Prefill the customer's name once they sign in
  useEffect(() => {
    if (customer?.name && !customerName) setCustomerName(customer.name);
  }, [customer, customerName]);

  const availableTables = useMemo(() => tables.filter(t => t.status === 'available'), [tables]);
  const estimatedPoints = Math.floor(total);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedTable) {
      setError('Please select a table');
      return;
    }
    if (!customerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await addOrder({
        restaurantId: restaurant?.id,
        tableNumber: Number(selectedTable),
        customerName,
        items: items.map(i => ({ itemId: i.id, quantity: i.quantity, name: i.name })),
        paymentMethod,
        notes,
        ...(customer ? { customerId: customer.id } : {}),
      });
      clearCart();
      navigate(`/order/${order.id}`);
    } catch (err) {
      console.error('[Checkout] Order failed:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="checkout-empty">
            <h2>Your cart is empty</h2>
            <p>Add some items before checking out.</p>
            <Button variant="primary" onClick={() => navigate('/menu/hotel-siraj')}>Browse Menu</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        <form className="checkout-form" onSubmit={handleSubmit}>
          {error && (
            <div className="checkout-error">
              {error}
            </div>
          )}

          <div className={`checkout-loyalty ${customer ? 'signed-in' : ''}`}>
            <Icons.Gift size={18} className="checkout-loyalty-icon" />
            {customer ? (
              <span className="checkout-loyalty-text">
                Signed in as <strong>{customer.name}</strong> — this order earns{' '}
                <strong>~{estimatedPoints} pts</strong>
              </span>
            ) : (
              <>
                <span className="checkout-loyalty-text">
                  Earn <strong>~{estimatedPoints} pts</strong> on this order with a free account.
                </span>
                <button type="button" className="checkout-loyalty-cta" onClick={() => setAuthOpen(true)}>
                  Sign in
                </button>
              </>
            )}
          </div>

          <div className="checkout-section">
            <label className="checkout-label">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your name"
              className="checkout-input"
              required
            />
          </div>

          <div className="checkout-section">
            <label className="checkout-label">Table Number</label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="checkout-select"
              required
            >
              <option value="">Select a table</option>
              {availableTables.map(table => (
                <option key={table.id} value={table.number}>
                  Table {table.number} ({table.seats} seats){table.section ? ` — ${table.section}` : ''}
                </option>
              ))}
            </select>
            {availableTables.length === 0 && (
              <p className="checkout-hint">No available tables at the moment.</p>
            )}
          </div>

          <div className="checkout-section">
            <label className="checkout-label">Payment Method</label>
            <div className="payment-options">
              {['card', 'cash', 'mobile'].map(method => (
                <button
                  key={method}
                  type="button"
                  className={`payment-option ${paymentMethod === method ? 'active' : ''}`}
                  onClick={() => setPaymentMethod(method)}
                >
                  {method === 'card' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
                  {method === 'cash' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
                  {method === 'mobile' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>}
                  <span className="payment-label">{method.charAt(0).toUpperCase() + method.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="checkout-section">
            <label className="checkout-label">Special Instructions</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any allergies or special requests..."
              className="checkout-textarea"
              rows={3}
            />
          </div>

          <div className="checkout-summary">
            <h3 className="checkout-summary-title">Order Summary</h3>
            <div className="checkout-items-list">
              {items.map(item => (
                <div key={item.id} className="checkout-item-row">
                  <span>{item.quantity}× {item.name}</span>
                  <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="checkout-summary-rows">
              <div className="checkout-summary-row"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
              <div className="checkout-summary-row"><span>GST (5%)</span><span>₹{tax.toFixed(0)}</span></div>
              <div className="checkout-summary-row checkout-total"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth size="lg" loading={isSubmitting}>
            Place Order — ₹{total.toFixed(0)}
          </Button>
        </form>
      </div>

      <CustomerAuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
