import React from 'react';

interface StockInputFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  labelFor: string;
  label: string;
  placeholder?: string;
  loading?: boolean;
}

export const StockInputField = ({
  value,
  onChange,
  labelFor,
  label,
  placeholder,
  loading,
}: StockInputFieldProps) => {
  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="w-1/3">
          <label htmlFor={labelFor} className="text-md">
            {label}
          </label>
        </div>
        <div className="w-2/3">
          <input
            disabled={loading}
            id={labelFor}
            name={labelFor}
            type="text"
            className="placeholder:text-xs placeholder:font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 w-full"
            placeholder={placeholder ? placeholder : ''}
            value={value}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
};
