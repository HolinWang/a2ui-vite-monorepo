import React from 'react';

interface GridProps {
  columns?: number;
  gap?: number | string;
  children?: React.ReactNode;
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  columns = 2,
  gap = 4,
  children,
  className = ''
}) => {
  // 响应式网格：小屏幕单列，大屏幕多列
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-4'
  };

  const gapClass = typeof gap === 'number' ? `gap-${gap}` : `gap-[${gap}]`;

  return (
    <div className={`grid ${gridCols[columns as keyof typeof gridCols] || 'grid-cols-2'} ${gapClass} ${className}`}>
      {children}
    </div>
  );
};
