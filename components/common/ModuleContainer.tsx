
import React from 'react';

interface ModuleContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const ModuleContainer: React.FC<ModuleContainerProps> = ({ title, description, children }) => {
  return (
    <div className="p-6 md:p-12 h-full max-w-[1600px] mx-auto animate-fade-in">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">{title}</h1>
                <p className="mt-2 text-sm font-medium text-[var(--text-secondary)] max-w-2xl uppercase tracking-widest opacity-70">{description}</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="telemetry bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Firm Core: Active
                </div>
            </div>
        </header>
        {children}
    </div>
  );
};
