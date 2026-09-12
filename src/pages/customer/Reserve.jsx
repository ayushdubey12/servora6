import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReservations } from '../../context/ReservationContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import CustomerAuthModal from '../../components/customer/CustomerAuthModal';
import Button from '../../components/ui/Button';
import { Icons } from '../../assets/icons';
import './Reserve.css';

const TIME_SLOTS = (() => {
  const slots = [];
  for (let h = 11; h <= 21; h++) {
    for (const m of [0, 30]) {
      if (h === 21 && m === 30) break;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
})();

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Reserve() {
  const { createReservation } = useReservations();
  const { customer } = useCustomerAuth();
  const navigate = useNavigate();

  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState('19:00');
  const [partySize, setPartySize] = useState(2);
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);

  const minDate = useMemo(() => todayISO(), []);
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!date || !time) {
      setError('Please pick a date and time');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    try {
      const reservation = await createReservation({
        customerId: customer?.id || undefined,
        customerName: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        partySize: Number(partySize),
        date,
        time,
        notes: notes.trim() || undefined,
      });
      setConfirmed(reservation);
    } catch (err) {
      setError(err.message || 'Failed to book. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <div className="reserve-page">
        <div className="container">
          <div className="reserve-success">
            <div className="reserve-success-icon"><Icons.CheckCircle size={44} /></div>
            <h2 className="reserve-success-title">Reservation requested!</h2>
            <p className="reserve-success-sub">
              We've sent your request for {confirmed.partySize} {confirmed.partySize === 1 ? 'guest' : 'guests'} on{' '}
              <strong>{new Date(`${confirmed.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</strong>{' '}
              at <strong>{confirmed.time}</strong>. You'll see it once it's confirmed.
            </p>

            <div className="reserve-success-card">
              <div className="reserve-success-row">
                <span>Party</span>
                <strong>{confirmed.partySize} {confirmed.partySize === 1 ? 'guest' : 'guests'}</strong>
              </div>
              <div className="reserve-success-row">
                <span>Name</span>
                <strong>{confirmed.customerName}</strong>
              </div>
              <div className="reserve-success-row">
                <span>Date</span>
                <strong>{confirmed.date}</strong>
              </div>
              <div className="reserve-success-row">
                <span>Time</span>
                <strong>{confirmed.time}</strong>
              </div>
              {confirmed.notes && (
                <div className="reserve-success-row">
                  <span>Notes</span>
                  <strong>{confirmed.notes}</strong>
                </div>
              )}
            </div>

            <div className="reserve-success-actions">
              {customer && (
                <Button variant="primary" onClick={() => navigate('/account')}>View my reservations</Button>
              )}
              <Button variant="ghost" onClick={() => navigate('/menu/hotel-siraj')}>Back to menu</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reserve-page">
      <div className="container">
        <div className="reserve-header">
          <h1 className="reserve-title">Book a table</h1>
          <p className="reserve-subtitle">Reserve your spot — we'll confirm as soon as possible.</p>
        </div>

        <form className="reserve-form" onSubmit={handleSubmit}>
          {error && <div className="reserve-error">{error}</div>}

          {customer && (
            <div className="reserve-member">
              <Icons.Gift size={16} />
              <span>Booking as <strong>{customer.name}</strong> — linked to your account</span>
            </div>
          )}

          <div className="reserve-section">
            <label className="reserve-label">Date</label>
            <input
              type="date"
              className="reserve-input"
              value={date}
              min={minDate}
              max={maxDate}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="reserve-section">
            <label className="reserve-label">Time</label>
            <div className="reserve-slots">
              {TIME_SLOTS.map(slot => (
                <button
                  key={slot}
                  type="button"
                  className={`reserve-slot ${time === slot ? 'active' : ''}`}
                  onClick={() => setTime(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="reserve-section">
            <label className="reserve-label">Party size</label>
            <div className="reserve-guests">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <button
                  key={n}
                  type="button"
                  className={`reserve-guest ${Number(partySize) === n ? 'active' : ''}`}
                  onClick={() => setPartySize(n)}
                >
                  {n}
                </button>
              ))}
              {[9, 10, 11, 12].map(n => (
                <button
                  key={n}
                  type="button"
                  className={`reserve-guest ${Number(partySize) === n ? 'active' : ''}`}
                  onClick={() => setPartySize(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="reserve-grid-2">
            <div className="reserve-section">
              <label className="reserve-label">Name</label>
              <input
                type="text"
                className="reserve-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div className="reserve-section">
              <label className="reserve-label">Phone</label>
              <input
                type="tel"
                className="reserve-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 0000"
              />
            </div>
          </div>

          <div className="reserve-section">
            <label className="reserve-label">Email <span className="reserve-optional">(optional)</span></label>
            <input
              type="email"
              className="reserve-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="reserve-section">
            <label className="reserve-label">Special requests <span className="reserve-optional">(optional)</span></label>
            <textarea
              className="reserve-input reserve-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Window seat, birthday cake, high chair…"
              rows={3}
            />
          </div>

          {!customer && (
            <p className="reserve-signin-hint">
              <Icons.Gift size={13} />
              <span>
                Have an account?{' '}
                <button type="button" className="reserve-signin-link" onClick={() => setAuthOpen(true)}>Sign in</button>{' '}
                to link this booking to your profile.
              </span>
            </p>
          )}

          <Button type="submit" variant="primary" fullWidth size="lg" loading={submitting}>
            Request reservation
          </Button>
        </form>
      </div>

      <CustomerAuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
