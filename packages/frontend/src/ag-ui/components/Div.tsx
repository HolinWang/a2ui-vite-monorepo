/**
 * AG-UI Div 组件
 */

import React from 'react';

interface DivProps {
  className?: string;
  children?: React.ReactNode;
}

export const Div: React.FC<DivProps> = ({
  className = '',
  children,
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default Div;
