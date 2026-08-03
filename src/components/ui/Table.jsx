import './Table.css';

export default function Table({ columns, data, keyField = 'id', onRowClick, className = '' }) {
  return (
    <div className={`table-container ${className}`}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={col.align ? `text-${col.align}` : ''}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={row[keyField] || rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                className={onRowClick ? 'table-row-clickable' : ''}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={col.align ? `text-${col.align}` : ''}>
                    {col.render ? col.render(row, rowIndex) : row[col.field]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
