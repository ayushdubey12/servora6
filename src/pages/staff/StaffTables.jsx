import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurant } from '../../context/RestaurantContext';
import { useOrders } from '../../context/OrderContext';
import { Icons } from '../../assets/icons';
import Button from '../../components/ui/Button';
import './StaffTables.css';

const STATUS_COLORS = {
  available: { bg: 'rgba(74, 222, 128, 0.1)', border: 'var(--success)', text: 'var(--success)', label: 'Available' },
  occupied: { bg: 'rgba(255, 181, 149, 0.1)', border: 'var(--tertiary)', text: 'var(--tertiary)', label: 'Occupied' },
  reserved: { bg: 'rgba(104, 211, 255, 0.1)', border: 'var(--secondary)', text: 'var(--secondary)', label: 'Reserved' },
  cleaning: { bg: 'rgba(245, 158, 11, 0.1)', border: 'var(--warning)', text: 'var(--warning)', label: 'Cleaning' },
};

export default function StaffTables() {
  const { tables, updateTableStatus } = useRestaurant();
  const { orders } = useOrders();
  const navigate = useNavigate();

  const tablesByStatus = useMemo(() => {
    const grouped = {};
    tables.forEach(table => {
      if (!grouped[table.status]) grouped[table.status] = [];
      grouped[table.status].push(table);
    });
    return grouped;
  }, [tables]);

  const stats = useMemo(() => {
    return {
      total: tables.length,
      available: tables.filter(t => t.status === 'available').length,
      occupied: tables.filter(t => t.status === 'occupied').length,
      reserved: tables.filter(t => t.status === 'reserved').length,
      cleaning: tables.filter(t => t.status === 'cleaning').length,
    };
  }, [tables]);

  const getTableOrder = (tableId) => orders.find(o => o.table === tableId || o.tableId === tableId);

  return (
    <div className="staff-tables">
      <div className="container">
        <div className="staff-tables-header">
          <div>
            <h1 className="staff-tables-title">Tables</h1>
            <p className="staff-tables-summary">
              {stats.available} available · {stats.occupied} occupied · {stats.reserved} reserved
            </p>
          </div>
        </div>

        <div className="tables-status-legend">
          {Object.entries(STATUS_COLORS).map(([status, config]) => (
            <div key={status} className="legend-item">
              <span className="legend-dot" style={{ background: config.border }} />
              <span className="legend-label">{config.label}</span>
              <span className="legend-count">{stats[status] || 0}</span>
            </div>
          ))}
        </div>

        {Object.entries(tablesByStatus).map(([status, statusTables]) => (
          <div key={status} className="tables-section">
            <h2 className="tables-section-title">
              <span className="tables-section-dot" style={{ background: STATUS_COLORS[status]?.border }} />
              {STATUS_COLORS[status]?.label || status}
              <span className="tables-section-count">{statusTables.length}</span>
            </h2>
            <div className="tables-grid">
              {statusTables.map(table => {
                const tableOrder = getTableOrder(table.id);
                return (
                  <div
                    key={table.id}
                    className={`table-card status-${table.status}`}
                    style={{ borderLeftColor: STATUS_COLORS[table.status]?.border }}
                  >
                    <div className="table-card-top">
                      <span className="table-number">{table.number}</span>
                      <span className="table-section">{table.section}</span>
                    </div>
                    <div className="table-card-meta">
                      <span className="table-seats">
                        <Icons.Users size={12} />
                        {table.seats}
                      </span>
                    </div>
                    {tableOrder && (
                      <div className="table-order-info">
                        <span className="table-order-id">#{tableOrder.id.replace('ord_', '')}</span>
                        <span className="table-order-status" style={{ color: STATUS_COLORS[tableOrder.status]?.text }}>
                          {tableOrder.status}
                        </span>
                      </div>
                    )}
                    {table.status === 'occupied' && !tableOrder && (
                      <div className="table-card-actions">
                        <Button variant="ghost" size="sm" onClick={() => updateTableStatus(table.id, 'available')}>
                          Free
                        </Button>
                      </div>
                    )}
                    {table.status === 'cleaning' && (
                      <div className="table-card-actions">
                        <Button variant="ghost" size="sm" onClick={() => updateTableStatus(table.id, 'available')}>
                          Mark Clean
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
