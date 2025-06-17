import React from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  color?: 'default' | 'primary' | 'secondary' | 'accent';
  padding?: 'none' | 'sm' | 'md' | 'lg'; // Added padding option
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  interactive = false,
  color = 'default',
  padding = 'md',
}) => {
  const colorStyles = {
    default: 'bg-white dark:bg-gray-800',
    primary: 'bg-primary-50 dark:bg-primary-900/20', // Adjusted dark mode opacity
    secondary: 'bg-secondary-50 dark:bg-secondary-900/20',
    accent: 'bg-accent-50 dark:bg-accent-900/20',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const cardClasses = `rounded-xl shadow-card overflow-hidden ${colorStyles[color]} ${paddingStyles[padding]} ${
    interactive ? 'cursor-pointer transition-all duration-200 ease-in-out' : ''
  } ${className}`;

  if (interactive) {
    return (
      <motion.div
        className={cardClasses}
        onClick={onClick}
        whileHover={{ y: -4, boxShadow: "0 10px 20px -3px rgba(0, 0, 0, 0.07), 0 4px 8px -2px rgba(0, 0, 0, 0.04)" }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={cardClasses}>{children}</div>;
};

export default Card;
