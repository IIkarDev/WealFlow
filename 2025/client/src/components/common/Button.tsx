import React from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react'; // Added for a consistent loader

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ComponentPropsWithoutRef<typeof motion.button> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children?: ReactNode; // Made children optional for icon buttons
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-400 dark:bg-primary-600 dark:hover:bg-primary-500',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white focus:ring-secondary-400 dark:bg-secondary-600 dark:hover:bg-secondary-500',
    accent: 'bg-accent-500 hover:bg-accent-600 text-white focus:ring-accent-400 dark:bg-accent-600 dark:hover:bg-accent-500',
    outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-primary-400',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-primary-400',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400 dark:bg-red-600 dark:hover:bg-red-500',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
    icon: 'p-2', // For icon-only buttons
  };

  const currentVariantStyle = variantStyles[variant] || variantStyles.primary;
  const currentSizeStyle = sizeStyles[size] || sizeStyles.md;

  const buttonClasses = `${baseStyles} ${currentVariantStyle} ${currentSizeStyle} ${className}`;

  const iconContent = icon && !isLoading ? (
    <span className={`${children && (iconPosition === 'left' ? 'mr-2' : 'ml-2')}`}>
      {icon}
    </span>
  ) : null;

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      className={buttonClasses}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin h-4 w-4 text-current" />
      ) : (
        <>
          {iconPosition === 'left' && iconContent}
          {children}
          {iconPosition === 'right' && iconContent}
        </>
      )}
    </motion.button>
  );
};

export default Button;
