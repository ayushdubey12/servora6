import { useMemo, useState } from 'react';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { Icons } from '../../assets/icons';
import { useReservations } from '../../context/ReservationContext';
import './Reservations.css';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', variant: 'warning' },
  CONFIRMED: { label: 'Confirmed', variant: 'success' },
  COMPLETED: { label: 'Completed', variant: 'secondary' },
  CANCELLED: { label: 'Cancelled', variant: 'error' },
  NO_SHOW: { label: 'No show', variant: 'error' },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
  { key: 'NO_SHOW', label: 'No show' },
];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || { label: status, variant: 'default' };
  return <Badge variant={s.variant} size="sm" dot>{s.label}</Badge>;
}

export default function Reservations() {
  const { reservations, loading, updateReservationStatus } = useReservations();
  const [filterDate, setFilterDate] = useState(todayISO());
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = useMemo(() => {
    return reservations
      .filter(r => filterStatus === 'all' || r.status === filterStatus)
      .filter(r => filterDate === 'all' || r.date === filterDate)
      .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)));
  }, [reservations, filterStatus, filterDate]);

  const stats = useMemo(() => {
    const today = reservations.filter(r => r.date === filterDate);
    return {
      todayCount: today.length,
      pending: reservations.filter(r => r.status === 'PENDING').length,
      confirmed: today.filter(r => r.status === 'CONFIRMED').length,
      avgParty: today.length
        ? Math.round(today.reduce((s, r) => s + r.partySize, 0) / today.length * 10) / 10
        : 0,
    };
  }, [reservations, filterDate]);

  const columns = [
    { header: 'Customer', field: 'customerName', align: 'left', render: (row) => (
      <div>
        <p className="text-sm font-medium">{row.customerName}</p>
        <p className="text-xs text-muted font-mono">{row.phone || row.customer?.phone || '—'}</p>
      </div>
    )},
    { header: 'Party', field: 'partySize', align: 'center', render: (row) => (
      <span className="text-sm font-mono">{row.partySize}</span>
    )},
    { header: 'Date', field: 'date', align: 'left', render: (row) => (
      <span className="text-sm font-mono text-muted">{row.date}</span>
    )},
    { header: 'Time', field: 'time', align: 'left', render: (row) => (
      <span className="text-sm font-mono">{row.time}</span>
    )},
    { header: 'Contact', field: 'email', align: 'left', render: (row) => (
      <span className="text-sm text-muted">{row.email || row.customer?.email || '—'}</span>
    )},
    { header: 'Status', field: 'status', align: 'center', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Notes', field: 'notes', align: 'left', render: (row) => (
      <span className="text-xs text-muted" title={row.notes}>{row.notes || '—'}</span>
    )},
    { header: 'Actions', field: 'id', align: 'center', render: (row) => (
      <div className="flex items-center justify-center gap-1.5">
        {row.status === 'PENDING' && (
          <button className="res-action res-action-confirm" title="Confirm" onClick={(e) => { e.stopPropagation(); updateReservationStatus(row.id, 'CONFIRMED'); }}>
            <Icons.Check size={15} />
          </button>
        )}
        {row.status === 'CONFIRMED' && (
          <>
            <button className="res-action res-action-confirm" title="Mark completed" onClick={(e) => { e.stopPropagation(); updateReservationStatus(row.id, 'COMPLETED'); }}>
              <Icons.CheckCircle size={15} />
            </button>
            <button className="res-action res-action-no-show" title="No show" onClick={(e) => { e.stopPropagation(); updateReservationStatus(row.id, 'NO_SHOW'); }}>
              <Icons.X size={15} />
            </button>
          </>
        )}
        {['PENDING', 'CONFIRMED'].includes(row.status) && (
          <button className="res-action res-action-cancel" title="Cancel" onClick={(e) => { e.stopPropagation(); updateReservationStatus(row.id, 'CANCELLED'); }}>
            <Icons.Trash size={15} />
          </button>
        )}
      </div>
    )},
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="headline-lg">Reservations</h1>
          <p className="text-muted text-sm mt-1">Manage table bookings in real time</p>
        </div>
      </div>

      <div className="grid grid-4 gap-4">
        <Card><CardBody>
          <p className="text-xs text-muted font-mono mb-1">Bookings on {filterDate}</p>
          <p className="text-2xl font-semibold text-primary">{stats.todayCount}</p>
        </CardBody></Card>
        <Card><CardBody>
          <p className="text-xs text-muted font-mono mb-1">Pending approval</p>
          <p className="text-2xl font-semibold text-warning">{stats.pending}</p>
        </CardBody></Card>
        <Card><CardBody>
          <p className="text-xs text-muted font-mono mb-1">Confirmed today</p>
          <p className="text-2xl font-semibold text-success">{stats.confirmed}</p>
        </CardBody></Card>
        <Card><CardBody>
          <p className="text-xs text-muted font-mono mb-1">Avg party size</p>
          <p className="text-2xl font-semibold text-secondary">{stats.avgParty}</p>
        </CardBody></Card>
      </div>

      <Card>
        <CardHeader action={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilterStatus(filterStatus === f.key ? 'all' : f.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filterStatus === f.key ? 'bg-primary text-on-primary' : 'glass glass-hover text-muted'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="res-date-filter">
              <Icons.Calendar size={15} />
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value || 'all')} />
              {filterDate !== 'all' && (
                <button className="res-date-clear" onClick={() => setFilterDate('all')} title="Show all dates">
                  <Icons.X size={13} />
                </button>
              )}
            </div>
          </div>
        }>
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="text-sm font-medium">{filtered.length} reservation{filtered.length === 1 ? '' : 's'}</p>
              <p className="text-xs text-muted mt-0.5">{filterDate === 'all' ? 'All dates' : `Showing ${filterDate}`}</p>
            </div>
            {filterDate === 'all' && (
              <Button variant="secondary" size="sm" onClick={() => setFilterDate(todayISO())}>Jump to today</Button>
            )}
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted text-sm font-mono">Loading reservations…</div>
          ) : (
            <Table columns={columns} data={filtered} keyField="id" />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
