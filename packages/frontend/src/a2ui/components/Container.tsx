import React from 'react';

interface ContainerProps {
  children?: React.ReactNode;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-4 w-full min-w-0 ${className}`}>
      {children}
    </div>
  );
};
