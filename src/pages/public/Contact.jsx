import { useState } from 'react';
import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    restaurant: '',
    message: ''
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
      setFormData({ name: '', email: '', restaurant: '', message: '' });
    }, 1000);
  };

  return (
    <div className="contact-page py-24 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="container max-w-5xl">
        <div className="grid grid-2 gap-16">
          {/* Left Column */}
          <div>
            <h1 className="headline-lg mb-6" style={{ color: 'var(--on-surface)' }}>Get in touch</h1>
            <p className="body-lg mb-10" style={{ color: 'var(--on-surface-variant)' }}>
              Have questions about Servora? We're here to help. Fill out the form and our team will get back to you within 24 hours.
            </p>

            <div className="flex flex-col gap-8 mb-12">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-primary flex-shrink-0" style={{ background: 'var(--primary-fixed)', border: '1px solid var(--primary-fixed-dim)' }}>
                  <Icons.Mail size={24} />
                </div>
                <div>
                  <h3 className="headline-md mb-1" style={{ color: 'var(--on-surface)' }}>Email us</h3>
                  <p className="body-md mb-2" style={{ color: 'var(--on-surface-variant)' }}>Our friendly team is here to help.</p>
                  <a href="mailto:hello.servora@gmail.com" className="body-md font-medium" style={{ color: 'var(--primary)' }}>hello.servora@gmail.com</a>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-primary flex-shrink-0" style={{ background: 'var(--primary-fixed)', border: '1px solid var(--primary-fixed-dim)' }}>
                  <Icons.MapPin size={24} />
                </div>
                <div>
                  <h3 className="headline-md mb-1" style={{ color: 'var(--on-surface)' }}>Visit us</h3>
                  <p className="body-md mb-2" style={{ color: 'var(--on-surface-variant)' }}>Come say hello at our office HQ.</p>
                  <p className="body-md font-medium" style={{ color: 'var(--on-surface)' }}>Jaipur, Rajasthan, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="glass p-8" style={{ borderRadius: 'var(--radius-2xl)' }}>
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(74, 222, 128, 0.1)', color: 'var(--success)', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                  <Icons.Check size={32} />
                </div>
                <h3 className="headline-md mb-4" style={{ color: 'var(--on-surface)' }}>Message Sent!</h3>
                <p className="body-md mb-8" style={{ color: 'var(--on-surface-variant)' }}>Thanks for reaching out. A member of our team will get back to you shortly.</p>
                <Button onClick={() => setSubmitted(false)} variant="outline">Send another message</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <Input
                  label="Full Name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                />

                <Input
                  label="Email Address"
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@restaurant.com"
                />

                <Input
                  label="Restaurant Name"
                  id="restaurant"
                  value={formData.restaurant}
                  onChange={handleChange}
                  placeholder="Hotel Siraj"
                />

                <div className="input-group">
                  <label htmlFor="message" className="input-label">How can we help?</label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    className="input-field input-textarea"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your restaurant..."
                  ></textarea>
                </div>

                <Button type="submit" size="lg" loading={loading} className="mt-2">
                  Send Message
                </Button>

                <p className="label-sm text-center mt-4" style={{ color: 'var(--on-surface-variant)' }}>
                  By submitting this form, you agree to our Privacy Policy.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
