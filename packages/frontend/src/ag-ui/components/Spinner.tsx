/**
 * AG-UI Spinner 组件
 */

import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  return (
    <div
      className={`
        ${sizeClasses[size]}
        border-2 border-gray-200 border-t-blue-500 rounded-full
        animate-spin
        ${className}
      `}
    />
  );
};

export default Spinner;
