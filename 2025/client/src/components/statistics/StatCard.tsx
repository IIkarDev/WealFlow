import React from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/common/Card';
import { ArrowUp, ArrowDown } from 'lucide-react'; // For trend icons

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: number; // Percentage value
    isPositive: boolean;
    period?: string; // e.g. "vs last month"
  };
  color?: 'default' | 'primary' | 'secondary' | 'accent';
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'default',
  onClick,
}) => {
  const cardColorMapping = {
    default: 'default',
    primary: 'primary',
    secondary: 'secondary',
    accent: 'accent',
  } as const;

  return (
    <Card 
      color={cardColorMapping[color]} 
      padding="md" 
      interactive={!!onClick} 
      onClick={onClick}
      className="h-full" // Ensure cards in a row have same height if needed
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
            {title}
          </p>
          <h4 className="mt-1 text-2xl lg:text-3xl font-semibold text-gray-800 dark:text-white truncate">
            {value}
          </h4>
          
          {trend && (
            <div className={`mt-2 flex items-center text-xs ${ trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
              {trend.isPositive ? <ArrowUp size={14} className="mr-0.5" /> : <ArrowDown size={14} className="mr-0.5" />}
              <span className="font-medium">{Math.abs(trend.value)}%</span>
              {trend.period && <span className="ml-1 text-gray-500 dark:text-gray-400 hidden sm:inline">{trend.period}</span>}
            </div>
          )}
        </div>
        
        <motion.div
          whileHover={onClick ? { scale: 1.1, rotate: 5 } : {}}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className={`p-2.5 sm:p-3 rounded-full 
            ${ color === 'primary' ? 'bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400'
             : color === 'secondary' ? 'bg-secondary-100 text-secondary-600 dark:bg-secondary-500/20 dark:text-secondary-400'
             : color === 'accent' ? 'bg-accent-100 text-accent-600 dark:bg-accent-500/20 dark:text-accent-400'
             : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
        >
          {icon && React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<{ size?: number; strokeWidth?: number }>, { size: 20, strokeWidth: 2 })}
        </motion.div>
      </div>
    </Card>
  );
};

export default StatCard;