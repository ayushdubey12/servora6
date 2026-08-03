import { useState } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { Icons } from '../../assets/icons';
import { useRestaurant } from '../../context/RestaurantContext';
import { branches } from '../../data/mockData';

export default function QRCodes() {
  const { restaurant } = useRestaurant();
  const [selectedBranch, setSelectedBranch] = useState(branches[0]?.id || '');
  const [qrSize, setQrSize] = useState(200);
  const [showPreview, setShowPreview] = useState(false);

  const qrData = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return `${window.location.origin}/menu/${restaurant.slug}?branch=${branchId}`;
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrData(selectedBranch))}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="headline-lg">QR Codes</h1>
        <p className="text-muted text-sm mt-1">Generate and download QR codes for each branch table</p>
      </div>

      <div className="grid grid-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle subtitle="Select a branch to generate QR">Branch Selection</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-4">
              <div>
                <label className="input-label">Branch</label>
                <div className="input-wrapper">
                  <select className="input-field input-select" value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <span className="input-select-arrow"><Icons.ChevronDown size={16} /></span>
                </div>
              </div>
              <div>
                <label className="input-label">QR Size</label>
                <div className="input-wrapper">
                  <input type="number" className="input-field" value={qrSize} onChange={e => setQrSize(Number(e.target.value))} min={100} max={500} step={10} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="primary" icon={<Icons.QrCode size={16} />} onClick={() => setShowPreview(true)}>Preview QR</Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle subtitle={`QR for ${branches.find(b => b.id === selectedBranch)?.name || 'branch'}`}>QR Preview</CardTitle>
          </CardHeader>
          <CardBody className="flex items-center justify-center">
            <div className="glass rounded-xl p-6 flex flex-col items-center gap-4">
              <img src={qrUrl} alt="QR Code" className="rounded-lg" style={{ width: qrSize, height: qrSize }} />
              <p className="text-xs text-muted font-mono text-center break-all" style={{ maxWidth: qrSize }}>{qrData(selectedBranch)}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle subtitle="All branches">Branch Overview</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-3 gap-4">
            {branches.map(branch => (
              <div key={branch.id} className="glass glass-hover rounded-lg p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{branch.name}</p>
                  <Badge variant={branch.status === 'active' ? 'success' : 'warning'} size="sm">{branch.status}</Badge>
                </div>
                <p className="text-xs text-muted">{branch.address}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="secondary" size="sm" onClick={() => { setSelectedBranch(branch.id); setShowPreview(true); }} icon={<Icons.QrCode size={14} />}>View QR</Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title={`QR Code — ${branches.find(b => b.id === selectedBranch)?.name}`} maxWidth="500px" footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowPreview(false)}>Close</Button>
          <a href={qrUrl} download={`qr-${selectedBranch}.png`} target="_blank" rel="noopener noreferrer"><Button variant="primary" icon={<Icons.Download size={16} />}>Download</Button></a>
        </div>
      }>
        <div className="flex flex-col items-center gap-4">
          <img src={qrUrl} alt="QR Code" className="rounded-lg" style={{ width: 250, height: 250 }} />
          <p className="text-xs text-muted font-mono text-center">{qrData(selectedBranch)}</p>
        </div>
      </Modal>
    </div>
  );
}
