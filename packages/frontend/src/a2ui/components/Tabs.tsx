import React, { useState } from 'react';

interface TabItem {
  key: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  activeKey?: string;
  children?: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeKey,
  children,
}) => {
  const [currentKey, setCurrentKey] = useState(activeKey || items[0]?.key);

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => setCurrentKey(item.key)}
              className={`
                px-4 py-2 text-sm font-medium border-b-2 transition-colors
                ${currentKey === item.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="py-4">
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return currentKey === items[index]?.key ? child : null;
          }
          return null;
        })}
      </div>
    </div>
  );
};
