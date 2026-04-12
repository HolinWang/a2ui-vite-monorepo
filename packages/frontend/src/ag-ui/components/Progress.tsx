/**
 * AG-UI Progress 组件
 */

import React from 'react';

interface ProgressProps {
  percent?: number;
  showText?: boolean;
  status?: 'success' | 'normal' | 'exception';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusColors = {
  success: 'bg-green-500',
  normal: 'bg-blue-500',
  exception: 'bg-red-500',
};

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export const Progress: React.FC<ProgressProps> = ({
  percent = 0,
  showText = true,
  status = 'normal',
  size = 'md',
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full transition-all duration-300 ${statusColors[status]}`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      {showText && (
        <p className="text-sm text-gray-600 mt-1 text-right">
          {Math.round(percent)}%
        </p>
      )}
    </div>
  );
};

export default Progress;
