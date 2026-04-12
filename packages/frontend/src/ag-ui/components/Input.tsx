/**
 * AG-UI Input 组件
 */

import React from 'react';

interface InputProps {
  placeholder?: string;
  value?: string;
  type?: 'text' | 'number' | 'email' | 'password';
  disabled?: boolean;
  className?: string;
  onChange?: (value: string) => void;
}

export const Input: React.FC<InputProps> = ({
  placeholder = '',
  value = '',
  type = 'text',
  disabled = false,
  className = '',
  onChange,
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      className={`
        w-full px-3 py-2 border border-gray-300 rounded-md
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        disabled:bg-gray-100 disabled:cursor-not-allowed
        ${className}
      `}
    />
  );
};

export default Input;
