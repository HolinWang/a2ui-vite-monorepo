/**
 * AG-UI Statistic 组件
 */

import React from 'react';
import type { AGUIStatisticProps } from '../types';

const statusColors = {
  success: 'text-green-600',
  warning: 'text-yellow-600',
  danger: 'text-red-600',
};

export const Statistic: React.FC<AGUIStatisticProps> = ({
  label,
  value,
  prefix = '',
  suffix = '',
  status,
  className = '',
}) => {
  const valueColor = status ? statusColors[status] : 'text-gray-900';

  return (
    <div className={`text-center ${className}`}>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${valueColor}`}>
        {prefix}
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix}
      </p>
    </div>
  );
};

export default Statistic;
