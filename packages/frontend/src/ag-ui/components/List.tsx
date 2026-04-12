/**
 * AG-UI List 组件
 */

import React from 'react';

interface ListItem {
  key?: string;
  content?: React.ReactNode;
}

interface ListProps {
  items?: ListItem[];
  className?: string;
  renderItem?: (item: ListItem, index: number) => React.ReactNode;
  children?: React.ReactNode;
}

export const List: React.FC<ListProps> = ({
  items = [],
  className = '',
  renderItem,
  children,
}) => {
  if (children) {
    return (
      <ul className={`space-y-2 ${className}`}>
        {children}
      </ul>
    );
  }

  return (
    <ul className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <li key={item.key || index}>
          {renderItem ? renderItem(item, index) : item.content}
        </li>
      ))}
    </ul>
  );
};

export default List;
