import React from 'react';

interface RadioOption {
  label: string;
  value: string;
}

interface RadioProps {
  label?: string;
  options: RadioOption[];
  value?: string;
  name?: string;
}

export const Radio: React.FC<RadioProps> = ({
  label,
  options,
  value,
  name,
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option, index) => (
          <label key={index} className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
