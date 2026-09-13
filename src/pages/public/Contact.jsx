import { useState } from 'react';
import { ServoraLogo } from '../../components/public/ServoraIcons';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    restaurant: '',
    tables: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', restaurant: '', tables: '', message: '' });
    }, 800);
  };

  return (
    <div className="nb-contact-page">
      <div className="nb-container">
        <div className="nb-contact-grid">
          {/* Left Column */}
          <div>
            <span className="nb-pill-badge" style={{ backgroundColor: '#FFCA28' }}>
              Hospitality Specialist Team
            </span>
            <h1 className="nb-h1 nb-bilingual-headline mt-3 mb-4">
              <span className="nb-hindi">बात करें —</span>
              <br />
              <span style={{ fontFamily: 'var(--nb-font)' }}>your restaurant.</span>
            </h1>
            <p className="nb-contact-sub">
              Thinking about ditching paper menus or clunky legacy POS? Book a personalized 15-minute walkthrough. We'll show you exactly how Avi handles your dining rush.
            </p>

            <div className="nb-contact-info-list">
              <div className="nb-contact-card">
                <div className="nb-contact-icon" style={{ backgroundColor: '#FF6584', color: '#FFF' }}>
                  ✉️
                </div>
                <div>
                  <h3 className="nb-contact-card-title">Hospitality Team Email</h3>
                  <p className="nb-contact-card-desc">We reply in under 2 hours on weekdays</p>
                  <a href="mailto:hello@servora.app" className="nb-contact-link">
                    hello@servora.app
                  </a>
                </div>
              </div>

              <div className="nb-contact-card">
                <div className="nb-contact-icon" style={{ backgroundColor: '#22C55E', color: '#FFF' }}>
                  📱
                </div>
                <div>
                  <h3 className="nb-contact-card-title">Direct Onboarding WhatsApp</h3>
                  <p className="nb-contact-card-desc">Quick setup questions & menu digitization help</p>
                  <span className="nb-contact-link">+91 98765 43210</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form Card */}
          <div className="nb-contact-form-container">
            <div className="nb-contact-form-card">
              <div className="flex items-center gap-3 mb-6">
                <ServoraLogo size={40} />
                <div>
                  <h3 className="font-black text-xl">Book a Demo or Ask a Question</h3>
                  <p className="text-xs font-bold text-gray-500">Free menu transcription included</p>
                </div>
              </div>

              {submitted ? (
                <div className="nb-contact-success">
                  <span className="text-4xl">🎉</span>
                  <h3 className="font-black text-2xl mt-3 mb-2">We Received Your Request!</h3>
                  <p className="text-gray-600 font-semibold mb-6">
                    Our onboarding team will reach out via email or WhatsApp within a few hours to schedule your personalized live walkthrough.
                  </p>
                  <button
                    className="nb-btn nb-btn-black"
                    onClick={() => setSubmitted(false)}
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="nb-form">
                  <div className="nb-form-group">
                    <label htmlFor="name" className="nb-label">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      required
                      placeholder="e.g. Chef Sanjay Kapoor"
                      value={formData.name}
                      onChange={handleChange}
                      className="nb-input"
                    />
                  </div>

                  <div className="nb-form-group">
                    <label htmlFor="email" className="nb-label">Work Email / Phone</label>
                    <input
                      type="text"
                      id="email"
                      required
                      placeholder="e.g. sanjay@smokehouse.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="nb-input"
                    />
                  </div>

                  <div className="nb-form-group">
                    <label htmlFor="restaurant" className="nb-label">Restaurant / Cafe Name</label>
                    <input
                      type="text"
                      id="restaurant"
                      required
                      placeholder="e.g. Smokehouse Cafe & Grill"
                      value={formData.restaurant}
                      onChange={handleChange}
                      className="nb-input"
                    />
                  </div>

                  <div className="nb-form-group">
                    <label htmlFor="tables" className="nb-label">Approximate Number of Tables</label>
                    <select
                      id="tables"
                      value={formData.tables}
                      onChange={handleChange}
                      className="nb-input"
                      required
                    >
                      <option value="">Select table count...</option>
                      <option value="1-10">1 – 10 tables (Small Cafe / QSR)</option>
                      <option value="11-25">11 – 25 tables (Full Service Bistro)</option>
                      <option value="26-50">26 – 50 tables (High-volume Restaurant)</option>
                      <option value="50+">50+ tables / Multi-location Group</option>
                    </select>
                  </div>

                  <div className="nb-form-group">
                    <label htmlFor="message" className="nb-label">Specific Needs or Questions</label>
                    <textarea
                      id="message"
                      rows="3"
                      placeholder="Tell us what POS or setup you currently use..."
                      value={formData.message}
                      onChange={handleChange}
                      className="nb-input nb-textarea"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="nb-btn nb-btn-black w-full"
                  >
                    {loading ? 'Submitting...' : 'Book My Demo →'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
