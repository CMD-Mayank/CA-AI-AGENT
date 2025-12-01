
import React, { useState, useEffect, useRef } from 'react';
import { View, Client, Task } from '../types';
import { storageService } from '../services/storage';
import { SearchIcon } from './icons/SearchIcon';
import { BellIcon } from './icons/BellIcon';
import { UserIcon } from './icons/UserIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SunIcon } from './icons/SunIcon';
import { LockIcon } from './icons/LockIcon';
import { MenuIcon } from './icons/MenuIcon';

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
    
    // Notifications
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Task[]>([]);
    const notifRef = useRef<HTMLDivElement>(null);

    // Update time for professional feel
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Close search/notifs on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Load Notifications (Urgent Tasks)
    useEffect(() => {
        const allTasks = storageService.getTasks();
        // Filter tasks due in next 3 days
        const now = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3);
        
        const urgent = allTasks.filter(t => {
            if(t.status === 'Done') return false;
            const d = new Date(t.dueDate);
            return d <= threeDaysFromNow;
        });
        setNotifications(urgent);
    }, [activeView]); // Refresh on view change

    // Search Logic
    useEffect(() => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const newResults: {type: string, label: string, action: () => void}[] = [];

        // Search Clients
        clients.forEach(client => {
            if (client.name.toLowerCase().includes(query) || client.pan.toLowerCase().includes(query)) {
                newResults.push({
                    type: 'Client',
                    label: client.name,
                    action: () => onClientSelect(client)
                });
            }
        });

        // Search Views (Navigation)
        Object.values(View).forEach(view => {
            if (view.toLowerCase().includes(query)) {
                newResults.push({
                    type: 'Navigate',
                    label: `Go to ${view}`,
                    action: () => onViewSelect(view)
                });
            }
        });
        
        // Search Documents (Simple title match)
        const docs = storageService.getAllDocuments();
        docs.forEach(doc => {
             if (doc.title.toLowerCase().includes(query)) {
                newResults.push({
                    type: 'Document',
                    label: doc.title,
                    action: () => {
                        // Find client context first
                        const client = clients.find(c => c.id === doc.clientId);
                        if(client) {
                            onClientSelect(client);
                            onViewSelect(View.Documents);
                        }
                    }
                });
            }
        });

        setResults(newResults.slice(0, 6)); // Limit to 6 results
        setShowResults(true);
    }, [searchQuery, clients, onClientSelect, onViewSelect]);

    const handleResultClick = (action: () => void) => {
        action();
        setSearchQuery('');
        setShowResults(false);
    };

    return (
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 h-16 px-4 lg:px-6 flex items-center justify-between shrink-0 z-20 relative transition-colors duration-200">
            
            {/* Mobile Menu & Brand */}
            <div className="flex items-center gap-3 lg:hidden">
                <button 
                    onClick={onMenuToggle}
                    className="p-2 -ml-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                    <MenuIcon className="w-6 h-6" />
                </button>
                <span className="font-bold text-gray-800 dark:text-white text-lg truncate max-w-[150px]">
                    CA Agent
                </span>
            </div>

            {/* Search Bar (Command Center) */}
            <div className="flex-1 max-w-xl relative mx-4" ref={searchRef}>
                <div className="relative hidden md:block">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <SearchIcon />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search clients, reports, or commands (Ctrl+K)" 
                        className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery && setShowResults(true)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-xs text-gray-400 border border-gray-200 dark:border-slate-700 rounded px-1.5 py-0.5">⌘K</span>
                    </div>
                </div>
                
                {/* Mobile Search Icon (Placeholder functionality) */}
                <button className="md:hidden p-2 text-gray-500 dark:text-slate-400">
                    <SearchIcon />
                </button>

                {/* Search Results Dropdown */}
                {showResults && results.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden py-2 animate-fade-in z-30">
                        {results.map((res, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleResultClick(res.action)}
                                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3 group transition-colors"
                            >
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase w-16 text-center shrink-0 ${
                                    res.type === 'Client' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                                    res.type === 'Navigate' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                                    'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                                }`}>
                                    {res.type}
                                </span>
                                <span className="text-sm text-gray-700 dark:text-slate-200 font-medium group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate">
                                    {res.label}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 lg:gap-6">
                {/* Date Display (Pro Feature) */}
                <div className="hidden lg:block text-right">
                    <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-sm font-mono font-medium text-gray-700 dark:text-slate-300">
                        {currentTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 hidden lg:block"></div>

                {/* Theme Toggle */}
                <button 
                    onClick={toggleTheme}
                    className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {darkMode ? <SunIcon /> : <MoonIcon />}
                </button>
                
                {/* Lock Screen */}
                <button 
                    onClick={onLock}
                    className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Lock Session"
                >
                    <LockIcon />
                </button>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <BellIcon />
                        {notifications.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                        )}
                    </button>
                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden z-30">
                            <div className="p-3 border-b border-gray-100 dark:border-slate-700 font-semibold text-sm bg-gray-50 dark:bg-slate-700/50">
                                Notifications ({notifications.length})
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-gray-500">No urgent alerts.</div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} className="p-3 border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <p className="text-xs font-bold text-gray-800 dark:text-white">{n.title}</p>
                                            <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">Due: {n.dueDate} • {n.clientName}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-sm">
                        <UserIcon className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </header>
    );
};