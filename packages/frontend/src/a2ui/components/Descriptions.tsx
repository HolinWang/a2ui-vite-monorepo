import React from 'react';

interface DescriptionsItem {
  label: string;
  value: string | number | React.ReactNode;
  span?: number;
}

interface DescriptionsProps {
  items: DescriptionsItem[];
  column?: number;
  bordered?: boolean;
  className?: string;
}

export const Descriptions: React.FC<DescriptionsProps> = ({
  items,
  column = 2,
  bordered = false,
  className = ''
}) => {
  // 使用 CSS Grid 实现响应式布局
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
  };

  return (
    <div className={`${className}`}>
      <div className={`grid ${gridCols[column as keyof typeof gridCols] || 'grid-cols-2'} gap-x-4 gap-y-2`}>
        {items.map((item, index) => (
          <div
            key={index}
            className={`
              ${bordered ? 'border border-gray-200 rounded p-2' : 'py-1.5'}
              min-w-0
            `}
          >
            <span className="text-sm text-gray-500 block truncate">{item.label}</span>
            <span className="text-sm text-gray-900 font-medium block truncate">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
