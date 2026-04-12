/**
 * AG-UI Grid 组件
 */

import React from 'react';

interface GridProps {
  columns?: number;
  className?: string;
  children?: React.ReactNode;
}

export const Grid: React.FC<GridProps> = ({
  columns = 3,
  className = '',
  children,
}) => {
  return (
    <div
      className={`grid gap-4 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
};

export default Grid;
