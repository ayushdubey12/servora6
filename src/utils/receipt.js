import { jsPDF } from 'jspdf';

/**
 * Generate a professional restaurant receipt PDF
 * @param {Object} order - Order object with items, totals, etc.
 * @param {Object} restaurant - Restaurant info (name, address, phone)
 */
export function generateReceipt(order, restaurant) {
  const doc = new jsPDF({ unit: 'mm', format: [80, 200] }); // Receipt-width format
  const w = 80; // page width
  const margin = 8;
  let y = 10;

  const line = (yy, dash = true) => {
    doc.setFontSize(8);
    doc.setTextColor(180);
    doc.text(dash ? '- - - - - - - - - - - - - - - -' : '═══════════════════════════════', margin, yy);
    return yy + 4;
  };

  // ── Header ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30);
  const name = restaurant?.name || 'Hotel Siraj';
  const nameWidth = doc.getTextWidth(name);
  doc.text(name, (w - nameWidth) / 2, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120);
  const addr = restaurant?.address || 'Hyderabad, India';
  const addrWidth = doc.getTextWidth(addr);
  doc.text(addr, (w - addrWidth) / 2, y);
  y += 4;
  const phone = restaurant?.phone || '+91 40 2345 6789';
  const phoneWidth = doc.getTextWidth(phone);
  doc.text(phone, (w - phoneWidth) / 2, y);
  y += 6;

  y = line(y);
  y += 2;

  // ── Order Info ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30);
  doc.text('RECEIPT', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(80);

  const orderId = `#${String(order.id).slice(0, 8)}`;
  doc.text(`Order: ${orderId}`, margin, y);
  y += 3.5;
  doc.text(`Table: ${order.tableNumber}`, margin, y);
  y += 3.5;
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, margin, y);
  y += 3.5;
  doc.text(`Time: ${new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, margin, y);
  y += 3.5;
  if (order.customerName) {
    doc.text(`Customer: ${order.customerName}`, margin, y);
    y += 3.5;
  }

  y += 2;
  y = line(y);
  y += 2;

  // ── Items ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30);
  doc.text('ITEMS', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(50);

  (order.items || []).forEach(item => {
    const itemName = item.menuItem?.name || item.name || 'Item';
    const qty = item.quantity;
    const price = (item.price || 0) * qty;
    const itemLine = `${qty}x ${itemName}`;
    
    doc.text(itemLine, margin, y);
    doc.text(`₹${price.toFixed(0)}`, w - margin - doc.getTextWidth(`₹${price.toFixed(0)}`), y);
    y += 4;
  });

  y += 1;
  y = line(y);
  y += 2;

  // ── Totals ──
  doc.setFontSize(7);
  doc.setTextColor(80);

  const addTotalRow = (label, value, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(bold ? 30 : 80);
    doc.text(label, margin, y);
    doc.text(value, w - margin - doc.getTextWidth(value), y);
    y += 4;
  };

  addTotalRow('Subtotal', `₹${order.subtotal?.toFixed(0) || 0}`);
  addTotalRow('GST (5%)', `₹${order.tax?.toFixed(0) || 0}`);

  y += 1;
  y = line(y, false);
  y += 1;

  doc.setFontSize(9);
  addTotalRow('TOTAL', `₹${order.total?.toFixed(0) || 0}`, true);

  y += 2;
  y = line(y);
  y += 2;

  // ── Payment Info ──
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100);
  doc.text('Payment: UPI', margin, y);
  y += 3.5;
  doc.text(`Status: PAID`, margin, y);
  y += 6;

  // ── Footer ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(140);
  const thankYou = 'Thank you for dining with us!';
  const thankWidth = doc.getTextWidth(thankYou);
  doc.text(thankYou, (w - thankWidth) / 2, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(170);
  const powered = 'Powered by Servora';
  const poweredWidth = doc.getTextWidth(powered);
  doc.text(powered, (w - poweredWidth) / 2, y);

  // Save
  doc.save(`receipt-${orderId}.pdf`);
}
