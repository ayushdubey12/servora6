import { motion } from "motion/react";
import Card, { CardBody } from './Card';
import { Icons } from '../../assets/icons';
import './Stat.css';

export default function Stat({ title, value, trend, trendValue, icon, className = '' }) {
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <Card className={`stat-card ${className}`}>
        <CardBody className="stat-body">
          <div className="stat-content">
            <motion.p 
              className="stat-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {title}
            </motion.p>
            <motion.h3 
              className="stat-value"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
            >
              {value}
            </motion.h3>
            
            {trend && (
              <motion.div 
                className={`stat-trend ${isPositive ? 'trend-up' : ''} ${isNegative ? 'trend-down' : ''}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {isPositive && <Icons.TrendingUp size={16} />}
                {isNegative && <Icons.TrendingDown size={16} />}
                <span>{trendValue}</span>
              </motion.div>
            )}
          </div>
          
          {icon && (
            <motion.div 
              className="stat-icon-wrapper"
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
            >
              {icon}
            </motion.div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}
