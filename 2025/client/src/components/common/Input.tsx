import React, { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', containerClassName = '', ...props }, ref) => {
    const baseInputClasses = "appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none sm:text-sm transition-colors";
    const normalBorderClasses = "border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400";
    const errorBorderClasses = "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400";
    const backgroundClasses = "bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100";
    
    const inputSpecificClasses = icon ? 'pl-10' : '';

    return (
      <div className={`mb-4 ${containerClassName}`}>
        {label && (
          <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && React.isValidElement(icon) && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
              {React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 18 })}
            </div>
          )}
          <input
            ref={ref}
            className={`${baseInputClasses} ${error ? errorBorderClasses : normalBorderClasses} ${backgroundClasses} ${inputSpecificClasses} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;