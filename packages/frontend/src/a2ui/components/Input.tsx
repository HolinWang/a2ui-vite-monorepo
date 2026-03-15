import React from 'react';
import { useAction } from '../ActionContext';

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  required?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string | number;
  onChange?: (value: string) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  name,
  value: propValue,
  onChange,
}) => {
  const { formData, setFormField } = useAction();
  
  // 使用外部传入的 value 或表单上下文中的 value
  const currentValue = propValue ?? (name ? String(formData[name] ?? '') : '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    }
    if (name) {
      setFormField(name, type === 'number' ? Number(newValue) : newValue);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
        }`}
      />
    </div>
  );
};
