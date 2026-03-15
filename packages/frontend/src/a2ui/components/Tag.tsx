import React from 'react';

interface TagProps {
  color?: 'blue' | 'green' | 'orange' | 'red' | 'default';
  text?: string;  // 支持 text 属性
  children?: React.ReactNode;  // 也支持 children
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  color = 'default',
  text,
  children,
  className = ''
}) => {
  const colorStyles = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    default: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const content = text || children;

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border
        ${colorStyles[color]}
        ${className}
      `}
    >
      {content}
    </span>
  );
};
