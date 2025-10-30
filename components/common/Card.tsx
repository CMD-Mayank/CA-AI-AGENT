import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4">{title}</h3>}
      {children}
    </div>
  );
};
