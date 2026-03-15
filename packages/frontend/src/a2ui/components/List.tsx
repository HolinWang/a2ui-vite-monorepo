import React from 'react';

interface ListProps {
  dataSource?: any[];
  renderItem?: string;
  bordered?: boolean;
  children?: React.ReactNode;
}

export const List: React.FC<ListProps> = ({
  dataSource,
  renderItem,
  bordered = false,
  children,
}) => {
  return (
    <ul className={`space-y-2 ${bordered ? 'border border-gray-200 rounded-lg p-2' : ''}`}>
      {dataSource ? (
        dataSource.map((item, index) => (
          <li key={index} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
            <span className="text-blue-500 mt-1">•</span>
            <span className="text-gray-700">
              {renderItem
                ? renderItem.replace(/\{(\w+)\}/g, (_, key) => item[key] || '')
                : typeof item === 'string' ? item : JSON.stringify(item)}
            </span>
          </li>
        ))
      ) : (
        children
      )}
    </ul>
  );
};
