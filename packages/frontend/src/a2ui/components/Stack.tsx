import React from 'react';

interface StackProps {
  direction?: 'horizontal' | 'vertical';
  gap?: 'none' | 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch';
  children?: React.ReactNode;
}

export const Stack: React.FC<StackProps> = ({
  direction = 'vertical',
  gap = 'md',
  align = 'stretch',
  children,
}) => {
  const directionClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col',
  };

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  return (
    <div className={`flex ${directionClasses[direction]} ${gapClasses[gap]} ${alignClasses[align]}`}>
      {children}
    </div>
  );
};
