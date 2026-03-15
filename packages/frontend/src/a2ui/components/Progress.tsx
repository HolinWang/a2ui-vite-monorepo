import React from 'react';

interface ProgressProps {
  percent: number;
  status?: 'normal' | 'success' | 'error';
  showLabel?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  percent,
  status = 'normal',
  showLabel = true,
}) => {
  const clampedPercent = Math.min(100, Math.max(0, percent));

  const statusColors = {
    normal: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        {showLabel && (
          <span className="text-sm text-gray-600">{clampedPercent}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${statusColors[status]} transition-all duration-300 rounded-full`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </div>
  );
};
