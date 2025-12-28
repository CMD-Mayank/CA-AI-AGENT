
import React, { useState, useEffect, useRef } from 'react';
import { View, Client, Task, FirmProfile } from '../types';
import { storageService } from '../services/storage';
import { SearchIcon } from './icons/SearchIcon';
import { BellIcon } from './icons/BellIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SunIcon } from './icons/SunIcon';
import { LockIcon } from './icons/LockIcon';
import { MenuIcon } from './icons/MenuIcon';
import { GlobeIcon } from './icons/GlobeIcon';

interface GlobalHeaderProps {
    clients: Client[];
    onClientSelect: (client: Client) => void;
    onViewSelect: (view: View) => void;
    activeView: View;
    selectedClient: Client | null;
    darkMode: boolean;
    toggleTheme: () => void;
    onLock: () => void;
    onMenuToggle: () => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ clients, onClientSelect, onViewSelect, activeView, selectedClient, darkMode, toggleTheme, onLock, onMenuToggle }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState<{type: string, label: string, action: () => void}[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [firmProfile, setFirmProfile] = useState<FirmProfile | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        setFirmProfile(storageService.getFirmProfile());
        return () => clearInterval(timer);
    }, [activeView]);

    useEffect(() => {
        const performSearch = async () => {
             if (!searchQuery.trim()) {
                 setResults([]);
                 return;
             }
            const query = searchQuery.toLowerCase();
            const newResults: {type: string, label: string, action: () => void}[] = [];
            
            clients.forEach(client => {
                if (client.name.toLowerCase().includes(query) || client.pan.toLowerCase().includes(query)) {
                    newResults.push({ type: 'Entity', label: client.name, action: () => onClientSelect(client) });
                }
            });
            Object.values(View).forEach(view => {
                if (view.toLowerCase().includes(query)) {
                    newResults.push({ type: 'Route', label: `Jump to ${view}`, action: () => onViewSelect(view) });
                }
            });
            setResults(newResults.slice(0, 6));
            setShowResults(true);
        }
        performSearch();
    }, [searchQuery, clients]);

    return (
        <header className="h-16 px-6 lg:px-12 flex items-center justify-between shrink-0 z-30 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-6">
                <button onClick={onMenuToggle} className="lg:hidden p-2 text-zinc-500">
                    <MenuIcon className="w-5 h-5" />
                </button>
                <div className="hidden lg:flex items-center gap-3">
                    <span className="telemetry text-zinc-400">Node_ID:</span>
                    <span className="text-xs font-bold tracking-tighter text-zinc-900 dark:text-zinc-100">AUDITERA_PRO_HKG</span>
                </div>
            </div>

            <div className="flex-1 max-w-xl relative mx-8" ref={searchRef}>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                        <SearchIcon className="w-4 h-4" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search entities, files, or workflows... (⌘K)" 
                        className="w-full bg-zinc-100 dark:bg-zinc-900/50 border border-transparent focus:border-teal-500/30 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-4 focus:ring-teal-500/5 transition-all outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {showResults && results.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden py-2 z-50">
                        {results.map((res, idx) => (
                            <button 
                                key={idx}
                                onClick={() => { res.action(); setShowResults(false); setSearchQuery(''); }}
                                className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-4 group"
                            >
                                <span className="telemetry text-[9px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">{res.type}</span>
                                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{res.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 lg:gap-5">
                <div className="hidden md:flex flex-col items-end mr-2">
                    <p className="text-[10px] telemetry text-zinc-500">{currentTime.toLocaleTimeString([], { hour12: false })}</p>
                    <p className="text-[9px] telemetry text-teal-600 font-bold">Encrypted Connection</p>
                </div>

                <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block"></div>

                <div className="flex items-center gap-1">
                    <button onClick={toggleTheme} className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors">
                        {darkMode ? <SunIcon className="w-4 h-4 text-zinc-400" /> : <MoonIcon className="w-4 h-4 text-zinc-500" />}
                    </button>
                    <button onClick={onLock} className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors">
                        <LockIcon className="w-4 h-4 text-zinc-400" />
                    </button>
                </div>

                <div className="h-10 w-10 rounded-2xl bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-black font-black text-xs shadow-xl border border-white/10">
                    {firmProfile?.name?.[0].toUpperCase() || 'A'}
                </div>
            </div>
        </header>
    );
};
