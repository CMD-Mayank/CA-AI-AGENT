
import React, { useEffect, useState, useRef } from 'react';
import { ModuleContainer } from './common/ModuleContainer';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { storageService } from '../services/storage';
import { FirmProfile, ThemeColor } from '../types';

interface SettingsProps {
    onLogout?: () => void;
    onFirmUpdate?: (profile: FirmProfile) => void;
    currentFirmProfile?: FirmProfile;
    activeTheme: ThemeColor;
    onThemeChange: (theme: ThemeColor) => void;
    userRole?: string;
    onOpenAdmin?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout, onFirmUpdate, currentFirmProfile, activeTheme, onThemeChange, userRole, onOpenAdmin }) => {
    const [activeTab, setActiveTab] = useState<'account' | 'firm' | 'team'>('firm');
    const [email, setEmail] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [firmData, setFirmData] = useState<FirmProfile>({
        name: '',
        frn: '',
        address: '',
        website: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const init = async () => {
            const userEmail = await storageService.getUserEmail();
            if (userEmail) setEmail(userEmail);
            
            if (currentFirmProfile) {
                setFirmData(currentFirmProfile);
            } else {
                setFirmData({
                    name: 'Apex Associates & Co.',
                    frn: '105678W',
                    address: '101, Corporate Park, Nariman Point, Mumbai - 400021',
                    website: 'www.apex-ca.com'
                });
            }
        };
        init();
    }, [currentFirmProfile]);
    
    const handleFirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFirmData({...firmData, [e.target.name]: e.target.value});
    }

    const handleSaveFirm = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            if (onFirmUpdate) onFirmUpdate(firmData);
            setIsSaving(false);
        }, 800);
    }
    
    const handleClearData = () => {
        if(confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
            storageService.clearMessages();
            window.location.reload();
        }
    }

    const handleBackup = () => {
        const data = storageService.createBackup();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ca-agent-backup-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleRestoreClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const content = ev.target?.result as string;
                if (content) {
                    const success = storageService.restoreBackup(content);
                    if (success) {
                        alert('Backup restored successfully. The application will reload.');
                        window.location.reload();
                    } else {
                        alert('Failed to restore backup. Invalid file format.');
                    }
                }
            };
            reader.readAsText(file);
        }
    };
    
    const themes: {id: ThemeColor, label: string, color: string}[] = [
        { id: 'teal', label: 'Classic Teal', color: '#0d9488' },
        { id: 'blue', label: 'Corporate Blue', color: '#2563eb' },
        { id: 'indigo', label: 'Modern Indigo', color: '#4f46e5' },
        { id: 'violet', label: 'Royal Violet', color: '#7c3aed' },
        { id: 'rose', label: 'Energetic Rose', color: '#e11d48' },
        { id: 'orange', label: 'Warm Orange', color: '#ea580c' },
    ];

    return (
        <ModuleContainer 
            title="Settings & Administration" 
            description="Manage firm identity, subscription, and team access."
        >
            <div className="flex border-b border-gray-200 dark:border-slate-700 mb-6 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('firm')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'firm' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
                >
                    Firm Profile
                    {activeTab === 'firm' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('team')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'team' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
                >
                    Team Management
                    {activeTab === 'team' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('account')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'account' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
                >
                    My Account
                    {activeTab === 'account' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400"></div>}
                </button>
            </div>

            <div className="max-w-3xl space-y-6">
                {activeTab === 'account' && (
                    <div className="space-y-6 animate-fade-in">
                        <Card title="User Profile">
                             <div className="flex items-center gap-4 mb-6">
                                <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-300 text-lg font-bold">
                                    {email ? email[0].toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{email || 'User'}</p>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">Role: {userRole || 'Staff'}</p>
                                </div>
                             </div>
                             <div className="flex gap-3">
                                 {onLogout && (
                                     <button 
                                        onClick={onLogout}
                                        className="text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 bg-red-50 px-4 py-2 rounded-lg transition-colors"
                                     >
                                         Sign Out
                                     </button>
                                 )}
                                 {userRole === 'super_admin' && onOpenAdmin && (
                                     <button 
                                        onClick={onOpenAdmin}
                                        className="text-sm font-medium text-white bg-gray-900 px-4 py-2 rounded-lg hover:bg-black transition-colors"
                                     >
                                         Open Super Admin Console
                                     </button>
                                 )}
                             </div>
                        </Card>
                        {/* Other account settings... */}
                    </div>
                )}
                
                {/* Keep existing tabs... */}
                {activeTab === 'firm' && (
                    <div className="space-y-6 animate-fade-in">
                         <Card title="Firm Identity (White-Labeling)">
                            <form onSubmit={handleSaveFirm} className="space-y-4">
                                <Input 
                                    label="Firm Name" 
                                    name="name" 
                                    value={firmData.name} 
                                    onChange={handleFirmChange} 
                                />
                                <Input 
                                    label="Firm Registration Number (FRN)" 
                                    name="frn" 
                                    value={firmData.frn} 
                                    onChange={handleFirmChange} 
                                />
                                <Input 
                                    label="Registered Address" 
                                    name="address" 
                                    value={firmData.address} 
                                    onChange={handleFirmChange} 
                                />
                                <div className="pt-2">
                                    <Button type="submit" isLoading={isSaving}>Save Firm Profile</Button>
                                </div>
                            </form>
                         </Card>
                         
                         <Card title="Appearance & Branding">
                             <div className="space-y-6">
                                <div>
                                     <p className="font-medium text-gray-800 dark:text-white mb-3">Color Theme</p>
                                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                         {themes.map(theme => (
                                             <button
                                                key={theme.id}
                                                onClick={() => onThemeChange(theme.id)}
                                                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                                                    activeTheme === theme.id 
                                                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-400 ring-1 ring-primary-500' 
                                                    : 'border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                                                }`}
                                             >
                                                 <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: theme.color }}></div>
                                                 <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{theme.label}</span>
                                             </button>
                                         ))}
                                     </div>
                                </div>
                             </div>
                         </Card>
                    </div>
                )}
            </div>
        </ModuleContainer>
    );
};

export default Settings;
