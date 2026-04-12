/**
 * AG-UI Divider 组件
 */

import React from 'react';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  className = '',
}) => {
  if (orientation === 'vertical') {
    return (
      <div
        className={`w-px h-full bg-gray-200 mx-2 ${className}`}
      />
    );
  }

  return (
    <hr className={`border-gray-200 my-4 ${className}`} />
  );
};

export default Divider;
