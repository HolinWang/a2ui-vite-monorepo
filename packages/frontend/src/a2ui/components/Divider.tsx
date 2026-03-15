import React from 'react';

interface DividerProps {
  title?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  title,
  className = ''
}) => {
  if (title) {
    return (
      <div className={`flex items-center gap-4 my-4 ${className}`}>
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm text-gray-400 font-medium">{title}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
    );
  }

  return <div className={`h-px bg-gray-200 my-4 ${className}`} />;
};
