
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, ...props }) => {
  // Use the passed id or fallback to name for the label association
  const inputId = props.id || props.name;

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
        {label}
      </label>
      <input
        id={inputId}
        {...props}
        className="w-full p-3 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none shadow-sm placeholder-gray-400 dark:placeholder-slate-500"
      />
    </div>
  );
};
