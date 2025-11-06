import React from 'react';

// FIX: Add a `size` prop to support different button padding and text sizes, resolving TypeScript errors in Settings.tsx.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyles = 'rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-background-dark';
  
  const variantStyles = {
    primary: 'bg-primary dark:bg-primary-dark text-white hover:bg-opacity-90 focus:ring-primary',
    secondary: 'bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-400',
    danger: 'bg-danger text-white hover:bg-opacity-90 focus:ring-danger',
  };

  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;