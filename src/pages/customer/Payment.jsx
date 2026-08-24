import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { useCustomerRestaurant } from '../../context/CustomerRestaurantContext';
import { createRazorpayOrder, verifyRazorpayPayment, getUpiIntent, getPublicOrderStatus } from '../../lib/api';
import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import { generateReceipt } from '../../utils/receipt';
import QRCode from 'qrcode';
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

  // Direct UPI (BHIM) state
  const [upiIntent, setUpiIntent] = useState(null); // { vpa, payeeName, amount, shortCode, deepLink }
  const [upiQrDataUrl, setUpiQrDataUrl] = useState(null);
  const [loadingUpi, setLoadingUpi] = useState(false);
  const [showUpiPanel, setShowUpiPanel] = useState(false);
  const pollRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  // Fetch order via API if not in context
  useEffect(() => {
    if (!orderId) return;
    fetchOrder(orderId).then(order => {
      if (order) setFetchedOrder(order);
    });
  }, [orderId, fetchOrder]);

  const order = orders.find(o => o.id === orderId) || fetchedOrder;

  const handleUpiPayment = useCallback(async () => {
    if (!order || loadingUpi) return;
    setLoadingUpi(true);
    setError(null);
    try {
      const intent = await getUpiIntent(order.id);
      setUpiIntent(intent);
      setShowUpiPanel(true);

      const qr = await QRCode.toDataURL(intent.deepLink, { width: 280, margin: 1 });
      setUpiQrDataUrl(qr);

      // Mobile: jump straight into the UPI app with everything pre-filled
      window.location.href = intent.deepLink;

      // Poll order status every 3s — webhook flips it to paid server-side
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const status = await getPublicOrderStatus(order.id);
          if (status.paid) {
            stopPolling();
            setPaymentStatus('success');
          }
        } catch { /* transient — keep polling */ }
      }, 3000);
    } catch (err) {
      console.error('[UPI Intent]', err);
      setError(err.message || 'Could not start UPI payment. Please try again.');
    } finally {
      setLoadingUpi(false);
    }
  }, [order, loadingUpi, stopPolling]);

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

          {/* Direct UPI (BHIM) — no gateway */}
          <div className="payment-qr-section">
            {!showUpiPanel ? (
              <>
                <Button
                  variant="secondary"
                  fullWidth
                  size="lg"
                  loading={loadingUpi}
                  onClick={handleUpiPayment}
                >
                  <Icons.QrCode size={16} />
                  Pay via UPI — {restaurant?.name || 'Restaurant'}
                </Button>
                <p className="payment-qr-hint">
                  Pays directly from your UPI app — GPay, PhonePe, Paytm & BHIM
                </p>
              </>
            ) : (
              <>
                <div className="payment-qr-header">
                  <Icons.QrCode size={18} />
                  <span>Pay ₹{upiIntent?.amount?.toFixed(2)} to {upiIntent?.payeeName}</span>
                </div>
                {upiQrDataUrl && (
                  <div className="payment-qr-container">
                    <img src={upiQrDataUrl} alt="UPI QR Code" className="payment-qr-image" />
                  </div>
                )}
                <div className="payment-qr-hint">
                  Scan, or tap below to open your UPI app · Code <strong>{upiIntent?.shortCode}</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Button variant="primary" fullWidth onClick={() => window.location.href = upiIntent?.deepLink}>
                    Open UPI App
                  </Button>
                  <Button variant="ghost" fullWidth onClick={() => { stopPolling(); setShowUpiPanel(false); }}>
                    Use a different method
                  </Button>
                </div>
                <div className="payment-timer" style={{ marginTop: 8 }}>
                  <Icons.Clock size={14} />
                  <span>Waiting for payment — this page updates automatically</span>
                </div>
              </>
            )}
            <div className="payment-apps">
              <div className="payment-app">BHIM</div>
              <div className="payment-app">Google Pay</div>
              <div className="payment-app">PhonePe</div>
              <div className="payment-app">Paytm</div>
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
