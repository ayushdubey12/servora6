import { useState } from 'react';
import Card, { CardHeader, CardTitle, CardBody, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { Icons } from '../../assets/icons';
import { useRestaurant } from '../../context/RestaurantContext';
import { restaurant as initialRestaurant, branches } from '../../data/mockData';

export default function Settings() {
  const { restaurant } = useRestaurant();
  const [form, setForm] = useState({ ...initialRestaurant });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const dayLabels = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="headline-lg">Settings</h1>
        <p className="text-muted text-sm mt-1">Manage your restaurant profile and preferences</p>
      </div>

      <Card>
        <CardHeader><CardTitle subtitle="Basic restaurant information">Profile</CardTitle></CardHeader>
        <CardBody>
          <div className="flex flex-col gap-4">
            <div className="grid grid-2 gap-4">
              <Input label="Restaurant Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input label="Cuisine Type" value={form.cuisine} onChange={e => setForm({ ...form, cuisine: e.target.value })} />
            </div>
            <Input label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-2 gap-4">
              <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} icon={<Icons.Phone size={16} />} />
              <Input label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} icon={<Icons.Mail size={16} />} />
            </div>
            <Input label="Website" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
            <Input label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} icon={<Icons.MapPin size={16} />} />
          </div>
        </CardBody>
        <CardFooter>
          <div className="flex items-center justify-between">
            {saved && <span className="text-sm text-success">Settings saved successfully</span>}
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => setForm({ ...initialRestaurant })}>Reset</Button>
              <Button variant="primary" onClick={handleSave} icon={<Icons.Save size={16} />}>Save Changes</Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader><CardTitle subtitle="Operating hours for each day">Opening Hours</CardTitle></CardHeader>
        <CardBody>
          <div className="flex flex-col gap-3">
            {days.map(day => (
              <div key={day} className="flex items-center gap-4">
                <span className="text-sm font-medium w-24">{dayLabels[day]}</span>
                <div className="flex items-center gap-2">
                  <input type="time" className="input-field text-sm" value={form.openingHours[day].open} onChange={e => setForm({ ...form, openingHours: { ...form.openingHours, [day]: { ...form.openingHours[day], open: e.target.value } } })} />
                  <span className="text-muted">—</span>
                  <input type="time" className="input-field text-sm" value={form.openingHours[day].close} onChange={e => setForm({ ...form, openingHours: { ...form.openingHours, [day]: { ...form.openingHours[day], close: e.target.value } } })} />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
        <CardFooter>
          <Button variant="primary" onClick={handleSave}>Update Hours</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader><CardTitle subtitle="Manage your restaurant branches">Branches</CardTitle></CardHeader>
        <CardBody>
          <div className="flex flex-col gap-3">
            {branches.map(branch => (
              <div key={branch.id} className="glass rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{branch.name}</p>
                  <p className="text-xs text-muted">{branch.address}</p>
                  <p className="text-xs text-muted font-mono mt-1">{branch.tables} tables</p>
                </div>
                <Badge variant={branch.status === 'active' ? 'success' : 'warning'} size="sm">{branch.status}</Badge>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
