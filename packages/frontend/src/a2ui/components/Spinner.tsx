import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  label,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Loader2 className={`${sizeClasses[size]} text-blue-500 animate-spin`} />
      {label && <span className="text-sm text-gray-600">{label}</span>}
    </div>
  );
};
