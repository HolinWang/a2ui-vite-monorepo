/**
 * AG-UI Tag 组件
 */

import React from 'react';

interface TagProps {
  text?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  className?: string;
  children?: React.ReactNode;
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  purple: 'bg-purple-100 text-purple-800',
  gray: 'bg-gray-100 text-gray-800',
};

export const Tag: React.FC<TagProps> = ({
  text,
  color = 'blue',
  className = '',
  children,
}) => {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-1 rounded text-xs font-medium
        ${colorClasses[color]}
        ${className}
      `}
    >
      {text || children}
    </span>
  );
};

export default Tag;
