import { useState, useRef } from 'react';
import JSZip from 'jszip';
import Card, { CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Icons } from '../../assets/icons';
import { useRestaurant } from '../../context/RestaurantContext';

const QR_API = 'https://api.qrserver.com/v1/create-qr-code/';

// Fetch an image URL and return an HTMLImageElement
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// Draw a QR code on canvas with optional custom logo or initial-letter circle + label
async function createLabeledQrBlob(qrUrl, label, size = 300, brandColor = '#6366f1', logoImage = null) {
  const qrImg = await loadImage(qrUrl);
  const padding = 24;
  const labelHeight = 48;
  const canvasW = size + padding * 2;
  const canvasH = size + padding * 2 + labelHeight;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');

  // White background with rounded corners
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(0, 0, canvasW, canvasH, 16);
  ctx.fill();

  // Draw QR image
  ctx.drawImage(qrImg, padding, padding, size, size);

  // Draw logo area in center
  const logoRadius = Math.round(size * 0.14); // ~14% of QR — safe for scannability
  const cx = padding + size / 2;
  const cy = padding + size / 2;

  // White background circle (clear area for scannability)
  ctx.beginPath();
  ctx.arc(cx, cy, logoRadius + 6, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  if (logoImage) {
    // Draw custom logo image, clipped to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, logoRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Scale logo to fit inside the circle
    const imgW = logoImage.naturalWidth || logoImage.width;
    const imgH = logoImage.naturalHeight || logoImage.height;
    const imgAspect = imgW / imgH;
    let drawW, drawH;
    if (imgAspect > 1) {
      drawH = logoRadius * 2;
      drawW = drawH * imgAspect;
    } else {
      drawW = logoRadius * 2;
      drawH = drawW / imgAspect;
    }
    ctx.drawImage(logoImage, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
    ctx.restore();
  } else {
    // Default: colored circle with initial letter
    ctx.beginPath();
    ctx.arc(cx, cy, logoRadius, 0, Math.PI * 2);
    ctx.fillStyle = brandColor;
    ctx.fill();

    const initial = (label || 'S').charAt(0).toUpperCase();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(logoRadius * 1.1)}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, cx, cy + 1);
  }

  // Draw label below QR
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, canvasW / 2, padding + size + labelHeight / 2);

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

export default function QRCodes() {
  const { restaurant } = useRestaurant();
  const [qrSize, setQrSize] = useState(300);
  const [showPreview, setShowPreview] = useState(false);
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [logoImage, setLogoImage] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const slug = restaurant?.slug || 'hotel-siraj';
  const restaurantName = restaurant?.name || 'Hotel Siraj';
  const menuUrl = `${window.location.origin}/menu/${slug}`;
  const qrUrl = `${QR_API}?size=${qrSize}x${qrSize}&data=${encodeURIComponent(menuUrl)}`;

  const tableQrUrl = (tableNum) => {
    const url = `${window.location.origin}/menu/${slug}?table=${tableNum}`;
    return `${QR_API}?size=300x300&data=${encodeURIComponent(url)}`;
  };

  // Handle logo file upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setLogoPreview(dataUrl);
      // Pre-load as an Image for canvas drawing
      const img = new Image();
      img.onload = () => setLogoImage(img);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoImage(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Download a single labeled QR as PNG
  const downloadLabeledQr = async (qrUrl, filename, label) => {
    try {
      const blob = await createLabeledQrBlob(qrUrl, label, 300, '#6366f1', logoImage);
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(qrUrl, '_blank');
    }
  };

  // Bulk download: create labeled QRs and zip them
  const handleBulkDownload = async () => {
    setBulkDownloading(true);
    try {
      const zip = new JSZip();
      const tableFolder = zip.folder('table-qr-codes');

      // Main menu QR
      const menuBlob = await createLabeledQrBlob(
        `${QR_API}?size=500x500&data=${encodeURIComponent(menuUrl)}`,
        restaurantName,
        500,
        '#6366f1',
        logoImage
      );
      tableFolder.file('menu-qr.png', menuBlob);

      // Table QRs
      const tableNums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      for (const num of tableNums) {
        const blob = await createLabeledQrBlob(
          `${QR_API}?size=500x500&data=${encodeURIComponent(`${window.location.origin}/menu/${slug}?table=${num}`)}`,
          `Table ${num}`,
          500,
          '#6366f1',
          logoImage
        );
        tableFolder.file(`table-${num}-qr.png`, blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const blobUrl = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'qr-codes.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Bulk download failed:', err);
    } finally {
      setBulkDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="headline-lg">QR Codes</h1>
          <p className="text-muted text-sm mt-1">Generate and download QR codes for your restaurant menu</p>
        </div>
        <Button
          variant="primary"
          icon={<Icons.Download size={16} />}
          loading={bulkDownloading}
          onClick={handleBulkDownload}
        >
          Download All (ZIP)
        </Button>
      </div>

      <div className="grid grid-2 gap-6">
        {/* Generator */}
        <Card>
          <CardHeader>
            <CardTitle subtitle="Customize your QR code">QR Settings</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-5">
              {/* QR Size */}
              <div>
                <label className="input-label">QR Size</label>
                <div className="input-wrapper">
                  <input type="number" className="input-field" value={qrSize} onChange={e => setQrSize(Number(e.target.value))} min={100} max={500} step={10} />
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="input-label">Center Logo (optional)</label>
                <p className="text-xs text-muted mb-2">Upload a logo to brand your QR codes. Recommended: square image, at least 200×200px.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                  id="logo-upload"
                />
                {logoPreview ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)' }}>
                    <img src={logoPreview} alt="Logo preview" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Custom logo uploaded</p>
                      <p className="text-xs text-muted">Applied to all QR downloads</p>
                    </div>
                    <button
                      onClick={handleRemoveLogo}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{ background: 'var(--error-container)', color: 'var(--error)', border: 'none', cursor: 'pointer' }}
                    >
                      <Icons.X size={12} /> Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 w-full p-3 rounded-lg text-sm font-medium"
                    style={{ background: 'var(--surface-container-lowest)', border: '2px dashed var(--outline-variant)', color: 'var(--on-surface-variant)', cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--outline-variant)'; e.currentTarget.style.color = 'var(--on-surface-variant)'; }}
                  >
                    <Icons.Upload size={16} />
                    Click to upload logo
                  </button>
                )}
              </div>

              {/* Preview Button */}
              <Button variant="primary" icon={<Icons.QrCode size={16} />} onClick={() => setShowPreview(true)}>
                Preview QR
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Preview with download */}
        <Card>
          <CardHeader>
            <CardTitle subtitle="Scan to view menu">QR Preview</CardTitle>
          </CardHeader>
          <CardBody className="flex items-center justify-center">
            <div className="rounded-xl p-6 flex flex-col items-center gap-4" style={{ background: '#ffffff', border: '1px solid var(--outline-variant)' }}>
              <img src={qrUrl} alt="QR Code" className="rounded-lg" style={{ width: qrSize, height: qrSize }} />
              <p className="text-sm font-semibold text-center" style={{ color: 'var(--on-surface)' }}>{restaurantName}</p>
              <p className="text-xs text-muted font-mono text-center break-all" style={{ maxWidth: qrSize }}>{menuUrl}</p>
              {logoPreview && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'var(--primary-fixed)', border: '1px solid var(--primary-fixed-dim)' }}>
                  <img src={logoPreview} alt="" style={{ width: 16, height: 16, borderRadius: 4, objectFit: 'cover' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Custom logo will be applied on download</span>
                </div>
              )}
              <Button
                variant="primary"
                size="sm"
                icon={<Icons.Download size={14} />}
                onClick={() => downloadLabeledQr(qrUrl, `qr-menu-${slug}.png`, restaurantName)}
              >
                Download QR
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Table QR Codes */}
      <Card>
        <CardHeader>
          <CardTitle subtitle="Print QR codes for each table — each includes the table number label">Table QR Codes</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(tableNum => (
              <div key={tableNum} className="rounded-lg p-4 flex flex-col items-center gap-3" style={{ background: '#ffffff', border: '1px solid var(--outline-variant)' }}>
                <img
                  src={tableQrUrl(tableNum)}
                  alt={`Table ${tableNum} QR`}
                  style={{ width: 120, height: 120 }}
                  className="rounded"
                />
                <p className="text-sm font-semibold">Table {tableNum}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Icons.Download size={14} />}
                  onClick={() => downloadLabeledQr(tableQrUrl(tableNum), `qr-table-${tableNum}.png`, `Table ${tableNum}`)}
                >
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="QR Code — Menu"
        maxWidth="500px"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowPreview(false)}>Close</Button>
            <Button
              variant="primary"
              icon={<Icons.Download size={16} />}
              onClick={() => downloadLabeledQr(qrUrl, `qr-menu-${slug}.png`, restaurantName)}
            >
              Download
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-4">
          <img src={qrUrl} alt="QR Code" className="rounded-lg" style={{ width: 280, height: 280 }} />
          <p className="text-sm font-semibold">{restaurantName}</p>
          <p className="text-xs text-muted font-mono text-center">{menuUrl}</p>
          {logoPreview && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'var(--primary-fixed)', border: '1px solid var(--primary-fixed-dim)' }}>
              <img src={logoPreview} alt="" style={{ width: 16, height: 16, borderRadius: 4, objectFit: 'cover' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Custom logo will appear in center</span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
