
import React, { useEffect, useState, useRef } from 'react';
import { ModuleContainer } from './common/ModuleContainer';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { storageService } from '../services/storage';
import { FirmProfile } from '../types';

interface SettingsProps {
    onLogout?: () => void;
    onFirmUpdate?: (profile: FirmProfile) => void;
    currentFirmProfile?: FirmProfile;
}

const Settings: React.FC<SettingsProps> = ({ onLogout, onFirmUpdate, currentFirmProfile }) => {
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
        const userEmail = storageService.getUserEmail();
        if (userEmail) setEmail(userEmail);
        
        if (currentFirmProfile) {
            setFirmData(currentFirmProfile);
        } else {
            // Default for demo
            setFirmData({
                name: 'Apex Associates & Co.',
                frn: '105678W',
                address: '101, Corporate Park, Nariman Point, Mumbai - 400021',
                website: 'www.apex-ca.com'
            });
        }
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

    return (
        <ModuleContainer 
            title="Settings & Administration" 
            description="Manage firm identity, subscription, and team access."
        >
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-slate-700 mb-6">
                <button 
                    onClick={() => setActiveTab('firm')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'firm' ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
                >
                    Firm Profile
                    {activeTab === 'firm' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 dark:bg-teal-400"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('team')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'team' ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
                >
                    Team Management
                    {activeTab === 'team' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 dark:bg-teal-400"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('account')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'account' ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
                >
                    My Account
                    {activeTab === 'account' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 dark:bg-teal-400"></div>}
                </button>
            </div>

            <div className="max-w-3xl space-y-6">
                
                {activeTab === 'firm' && (
                    <div className="space-y-6 animate-fade-in">
                         <Card title="Firm Identity (White-Labeling)">
                            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                                Configure your firm's details. These will appear on the Sidebar and on all generated reports sent to clients.
                            </p>
                            <form onSubmit={handleSaveFirm} className="space-y-4">
                                <Input 
                                    label="Firm Name" 
                                    name="name" 
                                    value={firmData.name} 
                                    onChange={handleFirmChange} 
                                    placeholder="e.g. Mehta & Associates"
                                />
                                <Input 
                                    label="Firm Registration Number (FRN)" 
                                    name="frn" 
                                    value={firmData.frn} 
                                    onChange={handleFirmChange} 
                                    placeholder="e.g. 102345W"
                                />
                                <Input 
                                    label="Registered Address" 
                                    name="address" 
                                    value={firmData.address} 
                                    onChange={handleFirmChange} 
                                    placeholder="Full office address"
                                />
                                <div className="pt-2">
                                    <Button type="submit" isLoading={isSaving}>Save Firm Profile</Button>
                                </div>
                            </form>
                         </Card>
                         
                         <Card title="Report Settings">
                             <div className="flex items-center justify-between py-2">
                                 <div>
                                     <p className="font-medium text-gray-800 dark:text-white">Auto-Header on Reports</p>
                                     <p className="text-xs text-gray-500">Automatically add Firm Name & FRN to exported documents.</p>
                                 </div>
                                 <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-teal-600 right-6 border-gray-300"/>
                                    <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer checked:bg-teal-600"></label>
                                </div>
                             </div>
                         </Card>
                    </div>
                )}

                {activeTab === 'team' && (
                     <div className="space-y-6 animate-fade-in">
                         <Card title="Partners & Staff">
                             <div className="flex justify-between items-center mb-4">
                                 <h4 className="text-sm font-medium text-gray-500">Active Users (3/5)</h4>
                                 <button className="text-teal-600 text-sm font-semibold hover:underline">+ Invite Member</button>
                             </div>
                             <div className="space-y-3">
                                 {[
                                     { name: 'Rajesh Mehta', role: 'Managing Partner', status: 'Active', img: 'RM' },
                                     { name: 'Suman Singh', role: 'Senior Associate', status: 'Active', img: 'SS' },
                                     { name: 'Amit Patel', role: 'Articled Assistant', status: 'Invited', img: 'AP' },
                                 ].map((member, i) => (
                                     <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-700">
                                         <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                                                 {member.img}
                                             </div>
                                             <div>
                                                 <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                                                 <p className="text-xs text-gray-500 dark:text-slate-400">{member.role}</p>
                                             </div>
                                         </div>
                                         <span className={`text-xs px-2 py-1 rounded-full ${member.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                             {member.status}
                                         </span>
                                     </div>
                                 ))}
                             </div>
                         </Card>
                     </div>
                )}

                {activeTab === 'account' && (
                    <div className="space-y-6 animate-fade-in">
                        <Card title="User Profile">
                             <div className="flex items-center gap-4 mb-6">
                                <div className="h-12 w-12 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-700 dark:text-teal-300 text-lg font-bold">
                                    {email ? email[0].toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{email || 'User'}</p>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">Role: Admin</p>
                                </div>
                             </div>
                             {onLogout && (
                                 <button 
                                    onClick={onLogout}
                                    className="text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 bg-red-50 px-4 py-2 rounded-lg transition-colors"
                                 >
                                     Sign Out
                                 </button>
                             )}
                        </Card>

                         <Card title="Disaster Recovery & Backup">
                             <p className="text-sm text-gray-500 mb-4">
                                 Since this application runs securely on your local device, we recommend taking regular backups of your firm's data.
                             </p>
                             <div className="flex gap-4">
                                 <button 
                                     onClick={handleBackup}
                                     className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                 >
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                     Download Full Backup
                                 </button>
                                 <button 
                                     onClick={handleRestoreClick}
                                     className="flex-1 flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                 >
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                     Restore from File
                                 </button>
                                 <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".json"
                                    className="hidden"
                                 />
                             </div>
                         </Card>

                        <Card title="Data Management">
                            <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">
                                This application stores your firm's chat history locally on this device. 
                            </p>
                            <button 
                                onClick={handleClearData}
                                className="text-gray-600 hover:text-gray-700 text-sm font-medium border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors"
                            >
                                Clear Local Cache
                            </button>
                        </Card>
                    </div>
                )}
            </div>
        </ModuleContainer>
    );
};

export default Settings;
