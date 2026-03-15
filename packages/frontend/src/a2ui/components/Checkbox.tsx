import React from 'react';

interface CheckboxProps {
  label: string;
  checked?: boolean;
  name?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked = false,
  name,
}) => {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
};
