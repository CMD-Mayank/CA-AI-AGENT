
import React from 'react';

interface LogoProps {
  className?: string;
  textClassName?: string;
  showText?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "w-8 h-8", 
  textClassName = "text-xl", 
  showText = true,
  theme = 'auto'
}) => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`relative ${className} flex-shrink-0`}>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Outer Shield/Hexagon Base */}
          <path 
            d="M16 2.5L3.5 9V23L16 29.5L28.5 23V9L16 2.5Z" 
            className="stroke-teal-600 dark:stroke-teal-400" 
            strokeWidth="2.5" 
            strokeLinejoin="round" 
          />
          
          {/* Internal Structure - Abstract 'A' / Digital Node */}
          <path 
            d="M16 10V22" 
            className="stroke-teal-600 dark:stroke-teal-400" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
          <path 
            d="M11 17H21" 
            className="stroke-teal-600 dark:stroke-teal-400" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
          
          {/* AI Spark/Dot */}
          <circle cx="16" cy="7" r="1.5" className="fill-teal-600 dark:fill-teal-400" />
          
          {/* Bottom Anchor */}
          <circle cx="16" cy="25" r="1.5" className="fill-teal-600 dark:fill-teal-400" />
        </svg>
      </div>
      
      {showText && (
        <span className={`font-extrabold tracking-tight ${textClassName} text-gray-900 dark:text-white`}>
          AuditEra
        </span>
      )}
    </div>
  );
};
