import React from 'react';

interface StatisticProps {
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  status?: 'default' | 'success' | 'warning' | 'error';
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  className?: string;
}

export const Statistic: React.FC<StatisticProps> = ({
  label,
  value,
  prefix,
  suffix,
  status = 'default',
  trend,
  trendValue,
  className = ''
}) => {
  const statusStyles = {
    default: {
      value: 'text-gray-900',
      icon: null
    },
    success: {
      value: 'text-green-600',
      icon: (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
          正常
        </span>
      )
    },
    warning: {
      value: 'text-orange-500',
      icon: (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
          警告
        </span>
      )
    },
    error: {
      value: 'text-red-600',
      icon: (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
          异常
        </span>
      )
    }
  };

  const styles = statusStyles[status];

  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-sm text-gray-500 mb-1">{label}</span>
      <div className="flex items-baseline gap-1 flex-wrap">
        {prefix && <span className="text-base text-gray-600">{prefix}</span>}
        <span className={`text-xl font-semibold ${styles.value}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
        {trendValue && (
          <span className={`text-xs ml-1 ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
            {trendValue}
          </span>
        )}
        {styles.icon}
      </div>
    </div>
  );
};
