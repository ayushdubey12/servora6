import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import './Cart.css';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, tax, total } = useCart();
  const navigate = useNavigate();

  const isEmpty = useMemo(() => items.length === 0, [items]);

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1 className="cart-title">Your Cart</h1>
          {!isEmpty && <span className="cart-item-count">{items.length} items</span>}
        </div>

        {isEmpty ? (
          <div className="cart-empty">
            <Icons.ShoppingCart size={48} />
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet.</p>
            <Button variant="primary" onClick={() => navigate('/menu/hotel-siraj')}>Browse Menu</Button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <div className="cart-item-emoji">
                      <Icons.UtensilsCrossed size={20} />
                    </div>
                    <div className="cart-item-details">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-price">₹{item.price.toFixed(0)} each</p>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <div className="quantity-selector">
                      <button className="quantity-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Icons.Minus size={14} />
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button className="quantity-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Icons.Plus size={14} />
                      </button>
                    </div>
                    <div className="cart-item-total">
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </div>
                    <button className="cart-item-remove" onClick={() => removeItem(item.id)}>
                      <Icons.Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span className="cart-summary-value">₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="cart-summary-row">
                <span>GST (5%)</span>
                <span className="cart-summary-value">₹{tax.toFixed(0)}</span>
              </div>
              <div className="cart-summary-row cart-summary-total">
                <span>Total</span>
                <span className="cart-summary-value">₹{total.toFixed(0)}</span>
              </div>
            </div>

            <Button variant="primary" fullWidth size="lg" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </Button>
            <Button variant="ghost" fullWidth onClick={() => navigate('/menu/hotel-siraj')}>
              Continue Shopping
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
