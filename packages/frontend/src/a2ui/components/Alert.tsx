import React from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  message: string;
  showIcon?: boolean;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  message,
  showIcon = true,
  className = ''
}) => {
  const config = {
    info: {
      icon: <Info className="w-4 h-4" />,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      iconColor: 'text-blue-500'
    },
    success: {
      icon: <CheckCircle className="w-4 h-4" />,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      iconColor: 'text-green-500'
    },
    warning: {
      icon: <AlertTriangle className="w-4 h-4" />,
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      iconColor: 'text-orange-500'
    },
    error: {
      icon: <XCircle className="w-4 h-4" />,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      iconColor: 'text-red-500'
    }
  };

  const { icon, bg, border, text, iconColor } = config[type];

  return (
    <div
      className={`
        flex items-center gap-2 px-4 py-3 rounded-lg border
        ${bg} ${border}
        ${className}
      `}
    >
      {showIcon && <span className={iconColor}>{icon}</span>}
      <span className={`text-sm ${text}`}>{message}</span>
    </div>
  );
};
