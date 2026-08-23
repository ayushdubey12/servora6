import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { useCustomerRestaurant } from '../../context/CustomerRestaurantContext';
import { createRazorpayOrder, verifyRazorpayPayment } from '../../lib/api';
import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import { generateReceipt } from '../../utils/receipt';
import './Payment.css';

export default function Payment() {
  const { orderId } = useParams();
  const { orders, fetchOrder } = useOrders();
  const { restaurant } = useCustomerRestaurant();
  const navigate = useNavigate();

  const [fetchedOrder, setFetchedOrder] = useState(null);
  const [paymentTimer, setPaymentTimer] = useState(300); // 5 minutes
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending | processing | success
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);

  // Fetch order via API if not in context
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

  // Razorpay payment handler
  const handleRazorpayPayment = useCallback(async () => {
    if (!order || loadingRazorpay) return;

    setLoadingRazorpay(true);
    setError(null);

    try {
      // Step 1: Create Razorpay order on backend
      const razorpayOrderData = await createRazorpayOrder(order.id);

      // Step 2: Open Razorpay Checkout
      const options = {
        key: razorpayOrderData.keyId,
        amount: razorpayOrderData.amount,
        currency: razorpayOrderData.currency,
        name: restaurant?.name || 'Servora',
        description: `Payment for Order #${String(order.id).slice(0, 8)}`,
        order_id: razorpayOrderData.razorpayOrderId,
        // Handler function — called on successful payment
        handler: async function (response) {
          // Step 3: Verify payment signature on backend
          setVerifying(true);
          try {
            const verifyResult = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order.id,
            });

            if (verifyResult.verified) {
              setPaymentStatus('success');
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } catch (verifyErr) {
            console.error('[Razorpay Verify]', verifyErr);
            setError('Payment was received but verification failed. Please contact support.');
          } finally {
            setVerifying(false);
          }
        },
        prefill: {
          name: order.customerName || '',
          contact: '',
          email: '',
        },
        notes: {
          address: restaurant?.address || '',
        },
        theme: {
          color: '#16a34a',
        },
        modal: {
          ondismiss: function () {
            setLoadingRazorpay(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        console.error('[Razorpay Payment Failed]', response.error);
        setError(response.error.description || 'Payment failed. Please try again.');
        setLoadingRazorpay(false);
      });

      rzp.open();
    } catch (err) {
      console.error('[Razorpay Error]', err);
      setError(err.message || 'Failed to initialize payment. Please try again.');
    } finally {
      setLoadingRazorpay(false);
    }
  }, [order, restaurant, loadingRazorpay]);

  if (!order) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="payment-empty">
            <Icons.AlertCircle size={48} />
            <h2>Order not found</h2>
            <p>We couldn't find the order you're trying to pay for.</p>
            <Button variant="primary" onClick={() => navigate(-1)}>Back to Menu</Button>
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
              Your payment of <strong>₹{order.total?.toFixed(0)}</strong> has been received.
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
                <span className="payment-success-amount">₹{order.total?.toFixed(0)}</span>
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
              <Button variant="ghost" fullWidth onClick={() => navigate(-1)}>
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
          <span className="payment-amount-value">₹{order.total?.toFixed(0)}</span>
        </div>

        <div className="payment-timer">
          <Icons.Clock size={14} />
          <span>Payment link expires in <strong>{formatTime(paymentTimer)}</strong></span>
        </div>

        {error && (
          <div className="payment-error-banner">
            <Icons.AlertCircle size={16} />
            <span>{error}</span>
            <button className="payment-error-close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="payment-body">
          {/* Razorpay Checkout Button */}
          <div className="payment-razorpay-section">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              loading={loadingRazorpay || verifying}
              onClick={handleRazorpayPayment}
            >
              {verifying ? 'Verifying Payment...' : loadingRazorpay ? 'Opening Payment...' : `Pay ₹${order.total?.toFixed(0)} with Razorpay`}
            </Button>
            <p className="payment-razorpay-hint">
              <Icons.Shield size={12} />
              Secured by Razorpay — Cards, UPI, Netbanking & more
            </p>
          </div>

          <div className="payment-divider">
            <span>OR</span>
          </div>

          {/* Fallback: UPI QR Code */}
          <div className="payment-qr-section">
            <div className="payment-qr-header">
              <Icons.QrCode size={18} />
              <span>Scan QR Code to Pay</span>
            </div>
            <div className="payment-qr-container">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(`upi://pay?pa=dcpayush@upi&pn=${encodeURIComponent(restaurant?.name || 'Restaurant')}&am=${order.total || 0}&cu=INR&tn=${encodeURIComponent('Payment for Order #' + String(order.id).slice(0, 8))}`)}`}
                alt="UPI QR Code"
                className="payment-qr-image"
              />
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

          <div className="payment-summary">
            <h3 className="payment-summary-title">Order Summary</h3>
            <div className="payment-summary-items">
              {(order.items || []).map((item, i) => (
                <div key={i} className="payment-summary-item">
                  <span className="payment-item-qty">{item.quantity}×</span>
                  <span className="payment-item-name">{item.menuItem?.name || item.name || 'Item'}</span>
                  <span className="payment-item-price">₹{((item.price || 0) * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="payment-summary-totals">
              <div className="payment-total-row">
                <span>Subtotal</span>
                <span>₹{order.subtotal?.toFixed(0)}</span>
              </div>
              <div className="payment-total-row">
                <span>Tax</span>
                <span>₹{order.tax?.toFixed(0)}</span>
              </div>
              <div className="payment-total-row payment-grand-total">
                <span>Total</span>
                <span>₹{order.total?.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
