/**
 * AG-UI Card 组件
 */

import React from 'react';
import type { AGUICardProps } from '../types';

export const Card: React.FC<AGUICardProps> = ({
  title,
  bordered = true,
  hoverable = false,
  className = '',
  children,
}) => {
  return (
    <div
      className={`
        bg-white rounded-lg shadow
        ${bordered ? 'border border-gray-200' : ''}
        ${hoverable ? 'hover:shadow-md transition-shadow duration-200' : ''}
        ${className}
      `}
    >
      {title && (
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};

export default Card;
