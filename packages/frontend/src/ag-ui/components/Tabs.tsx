/**
 * AG-UI Tabs 组件
 */

import React, { useState } from 'react';

interface TabItem {
  key: string;
  title: string;
  content?: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultActiveKey?: string;
  className?: string;
  onChange?: (key: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultActiveKey,
  className = '',
  onChange,
}) => {
  const [activeKey, setActiveKey] = useState(defaultActiveKey || items[0]?.key);

  const handleTabClick = (key: string) => {
    setActiveKey(key);
    onChange?.(key);
  };

  const activeTab = items.find((item) => item.key === activeKey);

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => handleTabClick(item.key)}
            className={`
              px-4 py-2 text-sm font-medium transition-colors
              ${
                activeKey === item.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {item.title}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div className="p-4">
        {activeTab?.content}
      </div>
    </div>
  );
};

export default Tabs;
