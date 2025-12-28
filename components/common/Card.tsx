
import React from 'react';

interface CardProps {
  title?: React.ReactNode; // Allow custom headers
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', noPadding = false }) => {
  return (
    <div className={`card-premium overflow-hidden ${className}`}>
      {title && (
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          {typeof title === 'string' ? (
             <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
          ) : (
             title
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>
        {children}
      </div>
    </div>
  );
};
