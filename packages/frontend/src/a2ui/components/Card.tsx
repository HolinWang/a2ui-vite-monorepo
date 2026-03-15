import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'highlight' | 'warning' | 'success';
  children?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  padding = 'md',
  shadow = 'md',
  variant = 'default',
  children,
  className = '',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
  };

  const variantStyles = {
    default: {
      container: 'bg-white border-gray-200',
      header: 'border-gray-200',
      title: 'text-gray-900',
      subtitle: 'text-gray-500'
    },
    highlight: {
      container: 'bg-blue-50 border-blue-200',
      header: 'border-blue-200',
      title: 'text-blue-900',
      subtitle: 'text-blue-600'
    },
    warning: {
      container: 'bg-orange-50 border-orange-200',
      header: 'border-orange-200',
      title: 'text-orange-900',
      subtitle: 'text-orange-600'
    },
    success: {
      container: 'bg-green-50 border-green-200',
      header: 'border-green-200',
      title: 'text-green-900',
      subtitle: 'text-green-600'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={`rounded-lg border ${shadowClasses[shadow]} ${styles.container} ${className}`}>
      {(title || subtitle) && (
        <div className={`border-b ${styles.header} ${paddingClasses[padding]}`}>
          {title && <h3 className={`text-lg font-semibold ${styles.title}`}>{title}</h3>}
          {subtitle && <p className={`text-sm mt-1 ${styles.subtitle}`}>{subtitle}</p>}
        </div>
      )}
      <div className={paddingClasses[padding]}>
        {children}
      </div>
    </div>
  );
};
