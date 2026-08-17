import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import { generateReceipt } from '../../utils/receipt';
import './Payment.css';

const UPI_ID = 'dcpayush@upi';

export default function Payment() {
  const { orderId } = useParams();
  const { orders, updateOrderStatus, fetchOrder } = useOrders();
  const { restaurant } = useRestaurant();
  const navigate = useNavigate();

  const [fetchedOrder, setFetchedOrder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [paymentTimer, setPaymentTimer] = useState(300); // 5 minutes
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending | processing | success
  const [verifying, setVerifying] = useState(false);

  // Fetch order via Supabase if not in context
  useEffect(() => {
    if (!orderId) return;
    fetchOrder(orderId).then(order => {
      if (order) setFetchedOrder(order);
    });
  }, [orderId, fetchOrder]);

  const order = orders.find(o => o.id === orderId) || fetchedOrder;

  // Countdown timer
  useEffect(() => {
    if (paymentTimer <= 0 || paymentStatus === 'success') return;
    const interval = setInterval(() => {
      setPaymentTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentTimer, paymentStatus]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleCopyUpi = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = UPI_ID;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const handleMarkPaid = useCallback(async () => {
    setVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      await updateOrderStatus(orderId, 'PAID');
      setPaymentStatus('success');
    } catch (err) {
      console.error('Failed to mark as paid:', err);
    } finally {
      setVerifying(false);
    }
  }, [orderId, updateOrderStatus]);

  const upiDeepLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(restaurant?.name || 'Restaurant')}&am=${order?.total || 0}&cu=INR`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiDeepLink)}`;

  if (!order) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="payment-empty">
            <Icons.AlertCircle size={48} />
            <h2>Order not found</h2>
            <p>We couldn't find the order you're trying to pay for.</p>
            <Button variant="primary" onClick={() => navigate('/menu/hotel-siraj')}>Back to Menu</Button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="payment-success-card">
            <div className="payment-success-icon">
              <Icons.CheckCircle size={64} />
            </div>
            <h1 className="payment-success-title">Payment Successful!</h1>
            <p className="payment-success-subtitle">
              Your payment of <strong>${order.total?.toFixed(0)}</strong> has been received.
            </p>
            <div className="payment-success-details">
              <div className="payment-success-row">
                <span>Order ID</span>
                <span className="payment-mono">#{String(order.id).slice(0, 8)}</span>
              </div>
              <div className="payment-success-row">
                <span>Table</span>
                <span>Table {order.tableNumber}</span>
              </div>
              <div className="payment-success-row">
                <span>Amount Paid</span>
                <span className="payment-success-amount">${order.total?.toFixed(0)}</span>
              </div>
            </div>
            <div className="payment-success-actions">
              <Button variant="primary" fullWidth size="lg" onClick={() => generateReceipt(order, restaurant)}>
                <Icons.Download size={16} />
                Download Receipt
              </Button>
              <Button variant="secondary" fullWidth size="lg" onClick={() => navigate(`/order/${order.id}`)}>
                View Order
              </Button>
              <Button variant="ghost" fullWidth onClick={() => navigate('/menu/hotel-siraj')}>
                Order More
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-header">
          <button className="payment-back" onClick={() => navigate(`/order/${order.id}`)}>
            <Icons.ArrowLeft size={20} />
          </button>
          <div className="payment-header-content">
            <h1 className="payment-title">Complete Payment</h1>
            <p className="payment-subtitle">Order #{String(order.id).slice(0, 8)} · Table {order.tableNumber}</p>
          </div>
        </div>

        <div className="payment-amount-banner">
          <span className="payment-amount-label">Amount to Pay</span>
          <span className="payment-amount-value">${order.total?.toFixed(0)}</span>
        </div>

        <div className="payment-timer">
          <Icons.Clock size={14} />
          <span>Payment link expires in <strong>{formatTime(paymentTimer)}</strong></span>
        </div>

        <div className="payment-body">
          <div className="payment-qr-section">
            <div className="payment-qr-header">
              <Icons.QrCode size={18} />
              <span>Scan QR Code to Pay</span>
            </div>
            <div className="payment-qr-container">
              <img src={qrUrl} alt="UPI QR Code" className="payment-qr-image" />
            </div>
            <div className="payment-qr-hint">
              Open any UPI app and scan this code
            </div>
            <div className="payment-apps">
              <div className="payment-app">Google Pay</div>
              <div className="payment-app">PhonePe</div>
              <div className="payment-app">Paytm</div>
              <div className="payment-app">BHIM</div>
            </div>
          </div>

          <div className="payment-divider">
            <span>OR</span>
          </div>

          <div className="payment-upi-section">
            <div className="payment-upi-header">
              <Icons.Clipboard size={16} />
              <span>Pay using UPI ID</span>
            </div>
            <div className="payment-upi-input-row">
              <div className="payment-upi-display">
                <span className="payment-upi-text">{UPI_ID}</span>
              </div>
              <button className={`payment-copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopyUpi}>
                {copied ? (
                  <>
                    <Icons.Check size={14} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Icons.Clipboard size={14} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <a href={upiDeepLink} className="payment-upi-open" target="_blank" rel="noopener noreferrer">
              <Icons.Smartphone size={16} />
              <span>Open in UPI App</span>
              <Icons.ArrowRight size={14} />
            </a>
            <p className="payment-upi-hint">
              Or copy the UPI ID and paste it in your UPI app to pay
            </p>
          </div>

          <div className="payment-summary">
            <h3 className="payment-summary-title">Order Summary</h3>
            <div className="payment-summary-items">
              {(order.items || []).map((item, i) => (
                <div key={i} className="payment-summary-item">
                  <span className="payment-item-qty">{item.quantity}×</span>
                  <span className="payment-item-name">{item.menuItem?.name || item.name || 'Item'}</span>
                  <span className="payment-item-price">${((item.price || 0) * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="payment-summary-totals">
              <div className="payment-total-row">
                <span>Subtotal</span>
                <span>${order.subtotal?.toFixed(0)}</span>
              </div>
              <div className="payment-total-row">
                <span>Tax</span>
                <span>${order.tax?.toFixed(0)}</span>
              </div>
              <div className="payment-total-row payment-grand-total">
                <span>Total</span>
                <span>${order.total?.toFixed(0)}</span>
              </div>
            </div>
          </div>

          <div className="payment-actions">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              loading={verifying}
              onClick={handleMarkPaid}
            >
              {verifying ? 'Verifying Payment...' : 'I\'ve Completed the Payment'}
            </Button>
            <p className="payment-notice">
              <Icons.Shield size={12} />
              Click the button above after completing the UPI payment. We'll verify and confirm your order.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
