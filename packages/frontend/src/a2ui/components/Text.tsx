import React from 'react';

interface TextProps {
  content: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'small' | 'caption';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  align?: 'left' | 'center' | 'right';
}

export const Text: React.FC<TextProps> = ({
  content,
  variant = 'body',
  color = 'default',
  align = 'left',
}) => {
  const variantClasses = {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-bold',
    h3: 'text-xl font-semibold',
    h4: 'text-lg font-semibold',
    h5: 'text-base font-medium',
    h6: 'text-sm font-medium',
    body: 'text-base',
    small: 'text-sm',
    caption: 'text-xs',
  };

  const colorClasses = {
    default: 'text-gray-900',
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  // 根据variant选择标签
  if (variant === 'h1') return <h1 className={`${variantClasses[variant]} ${colorClasses[color]} ${alignClasses[align]}`}>{content}</h1>;
  if (variant === 'h2') return <h2 className={`${variantClasses[variant]} ${colorClasses[color]} ${alignClasses[align]}`}>{content}</h2>;
  if (variant === 'h3') return <h3 className={`${variantClasses[variant]} ${colorClasses[color]} ${alignClasses[align]}`}>{content}</h3>;
  if (variant === 'h4') return <h4 className={`${variantClasses[variant]} ${colorClasses[color]} ${alignClasses[align]}`}>{content}</h4>;
  if (variant === 'h5') return <h5 className={`${variantClasses[variant]} ${colorClasses[color]} ${alignClasses[align]}`}>{content}</h5>;
  if (variant === 'h6') return <h6 className={`${variantClasses[variant]} ${colorClasses[color]} ${alignClasses[align]}`}>{content}</h6>;

  return (
    <p className={`${variantClasses[variant]} ${colorClasses[color]} ${alignClasses[align]}`}>
      {content}
    </p>
  );
};
