/**
 * AG-UI Text 组件
 */

import React from 'react';

interface TextProps {
  content?: string;
  type?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  className?: string;
  children?: React.ReactNode;
}

const typeClasses = {
  h1: 'text-3xl font-bold',
  h2: 'text-2xl font-bold',
  h3: 'text-xl font-semibold',
  h4: 'text-lg font-medium',
  p: 'text-base',
  span: 'text-base',
};

export const Text: React.FC<TextProps> = ({
  content,
  type = 'p',
  className = '',
  children,
}) => {
  const Component = type;
  return (
    <Component className={`${typeClasses[type]} text-gray-900 ${className}`}>
      {content || children}
    </Component>
  );
};

export default Text;
