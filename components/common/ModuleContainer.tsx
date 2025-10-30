import React from 'react';

interface ModuleContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const ModuleContainer: React.FC<ModuleContainerProps> = ({ title, description, children }) => {
  return (
    <div className="p-4 md:p-8 h-full">
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{title}</h1>
            <p className="mt-2 text-gray-500 dark:text-slate-400 max-w-2xl">{description}</p>
        </header>
        {children}
    </div>
  );
};
