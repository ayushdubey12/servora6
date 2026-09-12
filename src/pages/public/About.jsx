import Button from '../../components/ui/Button';
import { Icons } from '../../assets/icons';

export default function About() {
  return (
    <div className="about-page pb-24">
      {/* Hero Section */}
      <div className="pt-32 pb-24" style={{ background: 'var(--surface-container-low)', borderBottom: '1px solid var(--outline-variant)' }}>
        <div className="container text-center max-w-4xl mx-auto">
          <h1 className="headline-lg mb-6" style={{ color: 'var(--on-surface)' }}>Empowering restaurants to do more</h1>
          <p className="body-lg mb-10" style={{ color: 'var(--on-surface-variant)' }}>
            We believe that running a restaurant shouldn't mean wrestling with technology. Our mission is to build beautiful, intuitive tools that let you focus on what you do best: serving great food and creating memorable experiences.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="container py-24">
        <div className="grid grid-3 gap-8">
          <div className="text-center p-8 glass">
            <h3 className="display mb-2" style={{ color: 'var(--primary)', fontSize: '48px' }}>10k+</h3>
            <p className="body-md font-medium" style={{ color: 'var(--on-surface-variant)' }}>Restaurants</p>
          </div>
          <div className="text-center p-8 glass">
            <h3 className="display mb-2" style={{ color: 'var(--primary)', fontSize: '48px' }}>50M+</h3>
            <p className="body-md font-medium" style={{ color: 'var(--on-surface-variant)' }}>Orders Processed</p>
          </div>
          <div className="text-center p-8 glass">
            <h3 className="display mb-2" style={{ color: 'var(--primary)', fontSize: '48px' }}>99.9%</h3>
            <p className="body-md font-medium" style={{ color: 'var(--on-surface-variant)' }}>Uptime SLA</p>
          </div>
        </div>
      </div>

      {/* Story */}
      <div className="container pb-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="headline-lg mb-6" style={{ color: 'var(--on-surface)' }}>Our Story</h2>
          <div className="flex flex-col gap-6">
            <p className="body-lg" style={{ color: 'var(--on-surface-variant)' }}>
              Servora was born out of frustration. Our founders grew up in the restaurant industry and saw firsthand how disconnected systems, clunky interfaces, and unreliable hardware made running a restaurant harder than it needed to be.
            </p>
            <p className="body-lg" style={{ color: 'var(--on-surface-variant)' }}>
              In 2024, they decided to build something better. A single, unified platform that handles everything from the moment a guest scans a menu to the final payment, seamlessly connecting the front of house with the kitchen.
            </p>
            <p className="body-lg" style={{ color: 'var(--on-surface-variant)' }}>
              Today, Servora powers thousands of independent restaurants, cafes, and multi-location groups around the world. We're proud to be the silent partner helping them operate more efficiently and increase their profit margins.
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="py-24" style={{ background: 'var(--surface-container-low)', borderTop: '1px solid var(--outline-variant)' }}>
        <div className="container">
          <h2 className="headline-lg mb-12 text-center" style={{ color: 'var(--on-surface)' }}>Our Core Values</h2>
          <div className="grid grid-3 gap-8">
            <div className="glass p-8">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(173, 198, 255, 0.1)', color: 'var(--primary)', border: '1px solid rgba(173, 198, 255, 0.2)' }}>
                <Icons.Heart size={24} />
              </div>
              <h3 className="headline-md mb-3" style={{ color: 'var(--on-surface)' }}>Customer First</h3>
              <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>Every feature we build starts with solving a real problem for restaurant operators and their guests.</p>
            </div>
            <div className="glass p-8">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(104, 211, 255, 0.1)', color: 'var(--secondary)', border: '1px solid rgba(104, 211, 255, 0.2)' }}>
                <Icons.Zap size={24} />
              </div>
              <h3 className="headline-md mb-3" style={{ color: 'var(--on-surface)' }}>Simplicity</h3>
              <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>Complex operations don't need complex software. We obsess over keeping our interfaces clean and intuitive.</p>
            </div>
            <div className="glass p-8">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(173, 198, 255, 0.1)', color: 'var(--primary)', border: '1px solid rgba(173, 198, 255, 0.2)' }}>
                <Icons.Shield size={24} />
              </div>
              <h3 className="headline-md mb-3" style={{ color: 'var(--on-surface)' }}>Reliability</h3>
              <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>During a dinner rush, your system can't go down. We engineer for maximum uptime and resilience.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container py-24 text-center">
        <h2 className="headline-lg mb-6" style={{ color: 'var(--on-surface)' }}>Join our growing team</h2>
        <p className="body-lg max-w-2xl mx-auto mb-8" style={{ color: 'var(--on-surface-variant)' }}>We're always looking for talented engineers, designers, and customer success specialists who are passionate about hospitality.</p>
        <Button size="xl" variant="outline">View open roles</Button>
      </div>
    </div>
  );
}
