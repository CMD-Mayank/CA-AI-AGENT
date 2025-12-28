
import React, { useEffect, useState, useRef } from 'react';
import { ModuleContainer } from './common/ModuleContainer';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { storageService } from '../services/storage';
import { FirmProfile, ThemeColor, CloudSyncSettings } from '../types';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { GlobeIcon } from './icons/GlobeIcon';

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
    const [activeTab, setActiveTab] = useState<'account' | 'firm' | 'security' | 'cloud'>('firm');
    const [email, setEmail] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [firmData, setFirmData] = useState<FirmProfile>({
        name: '',
        frn: '',
        address: '',
        website: '',
        cloudSync: {
            enabled: false,
            encryptionKey: '',
            serverEndpoint: 'https://api.auditera.io/v1/sync',
            autoSync: true
        }
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

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
                    website: 'www.apex-ca.com',
                    cloudSync: {
                        enabled: false,
                        encryptionKey: Math.random().toString(36).substring(2, 15).toUpperCase(),
                        serverEndpoint: 'https://api.auditera.io/v1/sync',
                        autoSync: true
                    }
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
    
    const handleSyncToggle = () => {
        const updated = {
            ...firmData,
            cloudSync: {
                ...firmData.cloudSync!,
                enabled: !firmData.cloudSync?.enabled
            }
        };
        setFirmData(updated);
        if (onFirmUpdate) onFirmUpdate(updated);
    };

    const handleManualSync = async () => {
        setIsSyncing(true);
        const result = await storageService.syncData();
        if (result.success) {
            setFirmData(prev => ({
                ...prev,
                cloudSync: { ...prev.cloudSync!, lastSyncedAt: result.timestamp }
            }));
        }
        setIsSyncing(false);
    };

    const handleBackup = () => {
        const data = storageService.createBackup();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AuditEra-Export-${new Date().toISOString().slice(0,10)}.json`;
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
                        alert('Database synced successfully.');
                        window.location.reload();
                    } else {
                        alert('Sync failed. Invalid package.');
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
            title="Settings" 
            description="Practice configurations and security management."
        >
            <div className="flex border-b border-gray-200 dark:border-slate-800 mb-6 overflow-x-auto scrollbar-none">
                <button 
                    onClick={() => setActiveTab('firm')}
                    className={`pb-3 px-4 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'firm' ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 hover:text-gray-900 dark:text-slate-400'}`}
                >
                    Firm Identity
                    {activeTab === 'firm' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 dark:bg-teal-400"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('cloud')}
                    className={`pb-3 px-4 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'cloud' ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 hover:text-gray-900 dark:text-slate-400'}`}
                >
                    Cloud Architecture
                    {activeTab === 'cloud' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 dark:bg-teal-400"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('security')}
                    className={`pb-3 px-4 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'security' ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 hover:text-gray-900 dark:text-slate-400'}`}
                >
                    Security & Data
                    {activeTab === 'security' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 dark:bg-teal-400"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('account')}
                    className={`pb-3 px-4 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'account' ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 hover:text-gray-900 dark:text-slate-400'}`}
                >
                    My Account
                    {activeTab === 'account' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 dark:bg-teal-400"></div>}
                </button>
            </div>

            <div className="max-w-3xl space-y-6">
                {activeTab === 'firm' && (
                    <div className="space-y-6 animate-fade-in">
                         <Card title="White-Label Identity">
                            <form onSubmit={handleSaveFirm} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Firm Name" name="name" value={firmData.name} onChange={handleFirmChange} />
                                    <Input label="FRN (Firm Reg No)" name="frn" value={firmData.frn} onChange={handleFirmChange} />
                                </div>
                                <Input label="Full Office Address" name="address" value={firmData.address} onChange={handleFirmChange} />
                                <div className="pt-2">
                                    <Button type="submit" isLoading={isSaving}>Update Profile</Button>
                                </div>
                            </form>
                         </Card>
                         
                         <Card title="Interface & Branding">
                             <div className="space-y-6">
                                <div>
                                     <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Color Palette</p>
                                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                         {themes.map(theme => (
                                             <button
                                                key={theme.id}
                                                onClick={() => onThemeChange(theme.id)}
                                                className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                                                    activeTheme === theme.id 
                                                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/10' 
                                                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                                }`}
                                             >
                                                 <div className="w-5 h-5 rounded-md shadow-sm" style={{ backgroundColor: theme.color }}></div>
                                                 <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">{theme.label}</span>
                                             </button>
                                         ))}
                                     </div>
                                </div>
                             </div>
                         </Card>
                    </div>
                )}

                {activeTab === 'cloud' && (
                    <div className="space-y-6 animate-fade-in">
                        <Card title="Remote Infrastructure Control">
                            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-start gap-4 mb-6">
                                <GlobeIcon className="w-6 h-6 text-blue-600 mt-1" />
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Hybrid Cloud Deployment</h4>
                                    <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 leading-relaxed">
                                        Enable Cloud Sync to allow multiple partners and articles to access the practice environment. Data is encrypted locally before being transmitted to the private kernel.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                                    <div>
                                        <h5 className="text-sm font-bold">Cloud Operating Mode</h5>
                                        <p className="text-xs text-gray-500 mt-0.5">{firmData.cloudSync?.enabled ? 'Remote Kernel Active' : 'Sovereign Local Mode'}</p>
                                    </div>
                                    <button 
                                        onClick={handleSyncToggle}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                            firmData.cloudSync?.enabled 
                                            ? 'bg-red-500 text-white' 
                                            : 'bg-teal-600 text-white'
                                        }`}
                                    >
                                        {firmData.cloudSync?.enabled ? 'Disable' : 'Enable'}
                                    </button>
                                </div>

                                {firmData.cloudSync?.enabled && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Private Encryption Key (Hardware Bound)</label>
                                            <div className="flex gap-2">
                                                <input readOnly value={firmData.cloudSync?.encryptionKey} className="flex-1 bg-white dark:bg-black p-2 rounded border border-zinc-200 dark:border-zinc-800 font-mono text-xs" />
                                                <button className="text-teal-600 font-bold text-xs">Regenerate</button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                            <div>
                                                <p className="text-xs font-bold text-zinc-500">Last Successful Sync</p>
                                                <p className="text-sm font-mono mt-1">
                                                    {firmData.cloudSync?.lastSyncedAt 
                                                        ? new Date(firmData.cloudSync.lastSyncedAt).toLocaleString() 
                                                        : 'Never Synchronized'}
                                                </p>
                                            </div>
                                            <Button onClick={handleManualSync} isLoading={isSyncing} style={{width: 'auto', paddingLeft: '2rem', paddingRight: '2rem'}}>
                                                Force Sync
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="space-y-6 animate-fade-in">
                        <Card title="Data Sovereignty">
                            <div className="p-4 bg-teal-500/5 border border-teal-500/20 rounded-2xl flex items-start gap-4 mb-6">
                                <ShieldCheckIcon className="w-6 h-6 text-teal-600 mt-1" />
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Audit-Grade Privacy</h4>
                                    <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 leading-relaxed">
                                        AuditEra uses <strong>Local-First Encryption</strong>. Your client files, PAN data, and chat history never touch our servers. You own the keys, you own the data.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                                    <div>
                                        <h5 className="text-sm font-bold">Master Practice Export</h5>
                                        <p className="text-xs text-gray-500 mt-0.5">Generate a secure encrypted JSON backup.</p>
                                    </div>
                                    <button onClick={handleBackup} className="p-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl hover:scale-105 transition-transform">
                                        <DownloadIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                                    <div>
                                        <h5 className="text-sm font-bold">Sync Practice Data</h5>
                                        <p className="text-xs text-gray-500 mt-0.5">Import data from another device or backup.</p>
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".json" />
                                    <button onClick={handleRestoreClick} className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800">
                                        Import
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
                
                {activeTab === 'account' && (
                    <div className="space-y-6 animate-fade-in">
                        <Card title="User Identity">
                             <div className="flex items-center gap-4 mb-6">
                                <div className="h-14 w-14 rounded-2xl bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-black text-xl font-bold">
                                    {email ? email[0].toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{email || 'Administrator'}</p>
                                    <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Level: {userRole || 'Principal Partner'}</p>
                                </div>
                             </div>
                             <div className="flex gap-3">
                                 {onLogout && (
                                     <button 
                                        onClick={onLogout}
                                        className="text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 px-6 py-3 rounded-xl border border-red-100 dark:border-red-900/30 transition-all"
                                     >
                                         Sign Out
                                     </button>
                                 )}
                             </div>
                        </Card>
                    </div>
                )}
            </div>
        </ModuleContainer>
    );
};

export default Settings;
