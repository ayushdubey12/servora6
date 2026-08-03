import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export default function Features() {
  return (
    <div className="features-page pb-24">
      {/* Header */}
      <div className="pt-32 pb-24" style={{ background: 'var(--surface-container-low)', borderBottom: '1px solid var(--outline-variant)' }}>
        <div className="container text-center">
          <h1 className="headline-lg mb-6" style={{ color: 'var(--on-surface)' }}>Features built for modern restaurants</h1>
          <p className="body-lg max-w-3xl mx-auto mb-10" style={{ color: 'var(--on-surface-variant)' }}>
            Stop switching between different apps. Servora gives you everything you need to manage your restaurant, staff, and customers in one beautiful platform.
          </p>
          <Link to="/register">
            <Button size="xl" variant="primary">Start your free trial</Button>
          </Link>
        </div>
      </div>

      {/* Feature Sections */}
      <div className="container py-24">
        {/* QR Menu */}
        <div className="grid grid-2 gap-16 items-center mb-32">
          <div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(173, 198, 255, 0.1)', color: 'var(--primary)', border: '1px solid rgba(173, 198, 255, 0.2)' }}>
              <Icons.QrCode size={24} />
            </div>
            <h2 className="headline-lg mb-4" style={{ color: 'var(--on-surface)' }}>Smart QR Menus</h2>
            <p className="body-lg mb-6" style={{ color: 'var(--on-surface-variant)' }}>
              Create beautiful, digital menus that load instantly on any device. Update prices, add specials, and mark items out of stock in real-time. No more reprinting paper menus.
            </p>
            <ul className="flex flex-col gap-3 mb-8">
              <li className="flex gap-3"><Icons.Check className="text-primary flex-shrink-0" /> <span className="body-md" style={{ color: 'var(--on-surface)' }}>Real-time updates</span></li>
              <li className="flex gap-3"><Icons.Check className="text-primary flex-shrink-0" /> <span className="body-md" style={{ color: 'var(--on-surface)' }}>High-quality imagery</span></li>
              <li className="flex gap-3"><Icons.Check className="text-primary flex-shrink-0" /> <span className="body-md" style={{ color: 'var(--on-surface)' }}>Allergen information</span></li>
            </ul>
          </div>
          <div className="rounded-3xl h-[400px] flex items-center justify-center p-8 relative overflow-hidden" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(var(--glass-blur))' }}>
             <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: 'var(--surface-container)', border: '1px solid var(--outline-variant)' }}>
               <div className="w-1/3 h-6 rounded-md" style={{ background: 'var(--surface-container-high)' }}></div>
               <div className="flex gap-4">
                 <div className="w-24 h-24 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)' }}>
                   <Icons.UtensilsCrossed size={20} className="text-muted" />
                 </div>
                 <div className="flex-1 flex flex-col gap-2">
                   <div className="w-full h-4 rounded-md" style={{ background: 'var(--surface-container-high)' }}></div>
                   <div className="w-2/3 h-4 rounded-md" style={{ background: 'var(--surface-container-high)' }}></div>
                   <div className="w-1/4 h-5 rounded-md mt-2" style={{ background: 'rgba(173, 198, 255, 0.1)', border: '1px solid rgba(173, 198, 255, 0.2)' }}></div>
                 </div>
               </div>
               <div className="flex gap-4">
                 <div className="w-24 h-24 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-container-high)', border: '1px solid var(--outline-variant)' }}>
                   <Icons.Coffee size={20} className="text-muted" />
                 </div>
                 <div className="flex-1 flex flex-col gap-2">
                   <div className="w-full h-4 rounded-md" style={{ background: 'var(--surface-container-high)' }}></div>
                   <div className="w-2/3 h-4 rounded-md" style={{ background: 'var(--surface-container-high)' }}></div>
                   <div className="w-1/4 h-5 rounded-md mt-2" style={{ background: 'rgba(173, 198, 255, 0.1)', border: '1px solid rgba(173, 198, 255, 0.2)' }}></div>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* KDS */}
        <div className="grid grid-2 gap-16 items-center mb-32 flex-row-reverse">
          <div className="order-1 md:order-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(104, 211, 255, 0.1)', color: 'var(--secondary)', border: '1px solid rgba(104, 211, 255, 0.2)' }}>
              <Icons.Monitor size={24} />
            </div>
            <h2 className="headline-lg mb-4" style={{ color: 'var(--on-surface)' }}>Kitchen Display System</h2>
            <p className="body-lg mb-6" style={{ color: 'var(--on-surface-variant)' }}>
              Replace messy paper tickets with a streamlined digital display. Track prep times, route items to specific stations, and notify staff the moment an order is ready.
            </p>
            <ul className="flex flex-col gap-3 mb-8">
              <li className="flex gap-3"><Icons.Check className="text-primary flex-shrink-0" /> <span className="body-md" style={{ color: 'var(--on-surface)' }}>Color-coded timers</span></li>
              <li className="flex gap-3"><Icons.Check className="text-primary flex-shrink-0" /> <span className="body-md" style={{ color: 'var(--on-surface)' }}>Station routing</span></li>
              <li className="flex gap-3"><Icons.Check className="text-primary flex-shrink-0" /> <span className="body-md" style={{ color: 'var(--on-surface)' }}>Course management</span></li>
            </ul>
          </div>
          <div className="rounded-3xl h-[400px] order-2 md:order-1 flex items-center justify-center p-8 relative overflow-hidden" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(var(--glass-blur))' }}>
             <div className="gap-4 p-4 flex" style={{ background: 'var(--surface-container)', border: '1px solid var(--outline-variant)' }}>
               <div className="flex-1 rounded-lg p-3 flex flex-col gap-3" style={{ background: 'var(--surface-container-high)' }}>
                 <div className="w-full h-6 rounded-md mb-2" style={{ background: 'rgba(255, 180, 171, 0.15)' }}></div>
                 <div className="w-full h-4 rounded-md" style={{ background: 'var(--surface-container)' }}></div>
                 <div className="w-3/4 h-4 rounded-md" style={{ background: 'var(--surface-container)' }}></div>
               </div>
               <div className="flex-1 rounded-lg p-3 flex flex-col gap-3" style={{ background: 'var(--surface-container-high)' }}>
                 <div className="w-full h-6 rounded-md mb-2" style={{ background: 'rgba(245, 158, 11, 0.15)' }}></div>
                 <div className="w-full h-4 rounded-md" style={{ background: 'var(--surface-container)' }}></div>
                 <div className="w-1/2 h-4 rounded-md" style={{ background: 'var(--surface-container)' }}></div>
               </div>
               <div className="flex-1 rounded-lg p-3 flex flex-col gap-3" style={{ background: 'var(--surface-container-high)' }}>
                 <div className="w-full h-6 rounded-md mb-2" style={{ background: 'rgba(74, 222, 128, 0.15)' }}></div>
                 <div className="w-full h-4 rounded-md" style={{ background: 'var(--surface-container)' }}></div>
               </div>
             </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="grid grid-2 gap-16 items-center">
          <div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(173, 198, 255, 0.1)', color: 'var(--primary)', border: '1px solid rgba(173, 198, 255, 0.2)' }}>
              <Icons.BarChart size={24} />
            </div>
            <h2 className="headline-lg mb-4" style={{ color: 'var(--on-surface)' }}>Deep Analytics</h2>
            <p className="body-lg mb-6" style={{ color: 'var(--on-surface-variant)' }}>
              Make data-driven decisions with real-time insights. Understand your peak hours, popular menu items, and staff performance at a glance.
            </p>
            <ul className="flex flex-col gap-3 mb-8">
              <li className="flex gap-3"><Icons.Check className="text-primary flex-shrink-0" /> <span className="body-md" style={{ color: 'var(--on-surface)' }}>Revenue tracking</span></li>
              <li className="flex gap-3"><Icons.Check className="text-primary flex-shrink-0" /> <span className="body-md" style={{ color: 'var(--on-surface)' }}>Item popularity</span></li>
              <li className="flex gap-3"><Icons.Check className="text-primary flex-shrink-0" /> <span className="body-md" style={{ color: 'var(--on-surface)' }}>Exportable reports</span></li>
            </ul>
          </div>
          <div className="rounded-3xl h-[400px] flex items-center justify-center p-8 relative overflow-hidden" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(var(--glass-blur))' }}>
             <div className="rounded-2xl p-6 flex flex-col justify-end" style={{ background: 'var(--surface-container)', border: '1px solid var(--outline-variant)' }}>
               <div className="w-full h-1/2 flex items-end gap-2 px-4">
                 <div className="flex-1 rounded-t-md" style={{ height: '30%', background: 'rgba(173, 198, 255, 0.15)' }}></div>
                 <div className="flex-1 rounded-t-md" style={{ height: '50%', background: 'rgba(173, 198, 255, 0.2)' }}></div>
                 <div className="flex-1 rounded-t-md" style={{ height: '40%', background: 'rgba(173, 198, 255, 0.18)' }}></div>
                 <div className="flex-1 rounded-t-md" style={{ height: '70%', background: 'rgba(173, 198, 255, 0.25)' }}></div>
                 <div className="flex-1 rounded-t-md" style={{ height: '90%', background: 'rgba(173, 198, 255, 0.3)' }}></div>
                 <div className="flex-1 rounded-t-md" style={{ height: '60%', background: 'rgba(173, 198, 255, 0.22)' }}></div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
