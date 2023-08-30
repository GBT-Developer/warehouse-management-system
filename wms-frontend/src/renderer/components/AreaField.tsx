import React from 'react';

interface StockInputFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  labelFor: string;
  label: string;
  maxLength: number;
  rows: number;
  placeholder: string;
  loading?: boolean;
  additionalStyle?: string;
}

export const AreaField = ({
  value,
  onChange,
  labelFor,
  label,
  maxLength,
  rows,
  placeholder,
  loading,
  additionalStyle,
}: StockInputFieldProps) => {
  return (
    <div>
      <div className="flex py-2">
        <div className="w-1/3 py-1.5">
          <label htmlFor={labelFor} className="text-md">
            {label}
          </label>
        </div>
        <div className="w-2/3">
          <textarea
            style={{ resize: 'none' }}
            disabled={loading}
            id={labelFor}
            name={labelFor}
            rows={rows}
            maxLength={maxLength}
            className={`placeholder:text-xs placeholder:font-light bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 w-full ${
              additionalStyle ?? ''
            }`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
};
