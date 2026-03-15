import React from 'react';
import { useAction } from '../ActionContext';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  multiple?: boolean;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  placeholder,
  multiple = false,
  name,
  value: propValue,
  onChange,
}) => {
  const { formData, setFormField } = useAction();
  
  // 使用外部传入的 value 或表单上下文中的 value
  const currentValue = propValue ?? (name ? String(formData[name] ?? '') : '');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    }
    if (name) {
      setFormField(name, newValue);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        name={name}
        value={currentValue}
        onChange={handleChange}
        multiple={multiple}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
