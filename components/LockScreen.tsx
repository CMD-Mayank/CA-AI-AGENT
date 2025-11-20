
import React, { useState } from 'react';
import { LockIcon } from './icons/LockIcon';

interface LockScreenProps {
    onUnlock: () => void;
    userEmail: string;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock, userEmail }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // For demo, any password works
        if (password.length > 0) {
            onUnlock();
        } else {
            setError(true);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-gray-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center border border-gray-200 dark:border-slate-700">
                <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg text-white">
                    <LockIcon className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Session Locked</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-8">Enter password to resume session for<br/><strong>{userEmail}</strong></p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(false); }}
                        className={`w-full p-3 text-center text-lg tracking-widest rounded-lg border bg-gray-50 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                            error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 dark:border-slate-600'
                        }`}
                        placeholder="••••••••"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold shadow-lg transition-colors"
                    >
                        Unlock
                    </button>
                </form>
            </div>
            <p className="mt-8 text-gray-500 text-xs">Protected by CA AI Agent Security</p>
        </div>
    );
};
