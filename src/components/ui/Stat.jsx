import Card, { CardBody } from './Card';
import { Icons } from '../../assets/icons';
import './Stat.css';

export default function Stat({ title, value, trend, trendValue, icon, className = '' }) {
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';
  
  return (
    <Card className={`stat-card ${className}`}>
      <CardBody className="stat-body">
        <div className="stat-content">
          <p className="stat-title">{title}</p>
          <h3 className="stat-value">{value}</h3>
          
          {trend && (
            <div className={`stat-trend ${isPositive ? 'trend-up' : ''} ${isNegative ? 'trend-down' : ''}`}>
              {isPositive && <Icons.TrendingUp size={16} />}
              {isNegative && <Icons.TrendingDown size={16} />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="stat-icon-wrapper">
            {icon}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
