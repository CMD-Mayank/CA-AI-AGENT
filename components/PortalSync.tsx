import React, { useState, useEffect } from 'react';
import { ModuleContainer } from './common/ModuleContainer';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { Client, View } from '../types';
import { storageService } from '../services/storage';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { BuildingIcon } from './icons/BuildingIcon';

interface PortalSyncProps {
    client: Client;
    onDraftReply: (prompt: string) => void;
}

type PortalType = 'GSTN' | 'ITD' | 'MCA';

export const PortalSync: React.FC<PortalSyncProps> = ({ client, onDraftReply }) => {
    const [activeTab, setActiveTab] = useState<PortalType>('GSTN');
    const [status, setStatus] = useState<Record<PortalType, 'Disconnected' | 'Connecting' | 'Connected'>>({
        GSTN: 'Disconnected',
        ITD: 'Disconnected',
        MCA: 'Disconnected'
    });
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    
    // Mock Data States
    const [ledgers, setLedgers] = useState<{name: string, balance: number}[]>([]);
    const [notices, setNotices] = useState<{id: string, title: string, date: string, severity: 'High' | 'Medium'}[]>([]);

    const handleConnect = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(prev => ({...prev, [activeTab]: 'Connecting'}));
        
        setTimeout(() => {
            setStatus(prev => ({...prev, [activeTab]: 'Connected'}));
            setCredentials({ username: '', password: '' });
            
            // Mock Fetch Data
            if (activeTab === 'GSTN') {
                setLedgers([
                    { name: 'Electronic Cash Ledger', balance: 45200 },
                    { name: 'Electronic Credit Ledger (IGST)', balance: 125000 },
                    { name: 'Electronic Credit Ledger (CGST)', balance: 12000 },
                    { name: 'Electronic Credit Ledger (SGST)', balance: 12000 },
                ]);
                setNotices([
                    { id: '1', title: 'Notice for Excess ITC Claimed (DRC-01B)', date: '2024-10-15', severity: 'High' },
                    { id: '2', title: 'Late Fee for GSTR-3B Sep 23', date: '2023-11-22', severity: 'Medium' },
                ]);
            } else if (activeTab === 'ITD') {
                 setLedgers([
                    { name: 'Tax Refund Pending', balance: 25000 },
                    { name: 'Outstanding Demand (AY 2022-23)', balance: 14500 },
                ]);
                 setNotices([
                    { id: '3', title: 'Defective Return Notice u/s 139(9)', date: '2024-08-10', severity: 'High' },
                ]);
            }

            storageService.logActivity({
                id: Date.now().toString(),
                clientId: client.id,
                clientName: client.name,
                action: 'Portal Connected',
                timestamp: Date.now(),
                details: `Synced with ${activeTab} Portal`
            });
        }, 2000);
    };

    const handleDisconnect = () => {
        setStatus(prev => ({...prev, [activeTab]: 'Disconnected'}));
        setLedgers([]);
        setNotices([]);
    };

    const handleAutoDraft = (notice: typeof notices[0]) => {
        const prompt = `I have received a notice from the ${activeTab} portal.
        Notice Title: ${notice.title}
        Date: ${notice.date}
        Client: ${client.name} (${client.pan})

        Please analyze this notice type and draft a formal reply or appeal letter. 
        Cite relevant sections of the Act and suggest necessary attachments.`;
        
        onDraftReply(prompt);
    };

    return (
        <ModuleContainer 
            title="Government Portal Sync" 
            description={`Live integration with government servers for ${client.name}. Fetch ledgers, returns, and notices in real-time.`}
        >
             <div className="flex border-b border-gray-200 dark:border-slate-700 mb-6 overflow-x-auto">
                {(['GSTN', 'ITD', 'MCA'] as PortalType[]).map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 px-6 text-sm font-bold transition-colors relative whitespace-nowrap flex items-center gap-2 ${activeTab === tab ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
                    >
                        {tab === 'GSTN' ? 'GST Portal' : tab === 'ITD' ? 'Income Tax' : 'MCA / ROC'}
                        {status[tab] === 'Connected' && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                        {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400"></div>}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Connection Card */}
                <div className="lg:col-span-1">
                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-900 dark:text-white">Connection Status</h3>
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                status[activeTab] === 'Connected' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'
                            }`}>
                                {status[activeTab]}
                            </span>
                        </div>

                        {status[activeTab] === 'Connected' ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                    <ShieldCheckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-800 dark:text-white">Live Sync Active</h4>
                                <p className="text-sm text-gray-500 mb-6">Last synced: Just now</p>
                                <Button onClick={handleDisconnect} style={{backgroundColor: '#ef4444'}}>Disconnect Session</Button>
                            </div>
                        ) : (
                            <form onSubmit={handleConnect} className="space-y-4">
                                <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">
                                    Enter credentials for <strong>{client.pan}</strong> to fetch real-time data.
                                </p>
                                <Input 
                                    label="Username" 
                                    value={credentials.username}
                                    onChange={e => setCredentials({...credentials, username: e.target.value})}
                                    placeholder="e.g. GSTUSER123"
                                    required={status[activeTab] === 'Disconnected'}
                                />
                                <Input 
                                    label="Password" 
                                    type="password"
                                    value={credentials.password}
                                    onChange={e => setCredentials({...credentials, password: e.target.value})}
                                    placeholder="••••••••"
                                    required={status[activeTab] === 'Disconnected'}
                                />
                                <Button type="submit" isLoading={status[activeTab] === 'Connecting'}>
                                    {status[activeTab] === 'Connecting' ? 'Authenticating...' : 'Secure Connect'}
                                </Button>
                                <p className="text-[10px] text-center text-gray-400 mt-2 flex items-center justify-center gap-1">
                                    <ShieldCheckIcon className="w-3 h-3" /> 256-bit Encrypted Tunnel
                                </p>
                            </form>
                        )}
                    </Card>
                </div>

                {/* Live Data Dashboard */}
                {status[activeTab] === 'Connected' && (
                    <div className="lg:col-span-2 space-y-6 animate-fade-in">
                        {/* Ledgers */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {ledgers.map((item, i) => (
                                <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col justify-between h-28">
                                    <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">{item.name}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.balance)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Notices / Action Items */}
                        <Card title="Pending Actions & Notices">
                            <div className="space-y-3">
                                {notices.length === 0 ? (
                                    <p className="text-sm text-gray-500">No pending notices found.</p>
                                ) : (
                                    notices.map(notice => (
                                        <div key={notice.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded">
                                                        {notice.severity} Priority
                                                    </span>
                                                    <span className="text-xs text-gray-500">{notice.date}</span>
                                                </div>
                                                <h4 className="text-sm font-bold text-gray-800 dark:text-white">{notice.title}</h4>
                                            </div>
                                            <button 
                                                onClick={() => handleAutoDraft(notice)}
                                                className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-xs font-bold text-primary-700 dark:text-primary-400 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <SparklesIcon className="w-3 h-3" />
                                                Auto-Draft Reply
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>
                )}
                
                {status[activeTab] !== 'Connected' && (
                    <div className="lg:col-span-2 flex items-center justify-center bg-gray-50 dark:bg-slate-800/50 border border-dashed border-gray-300 dark:border-slate-700 rounded-xl">
                        <div className="text-center text-gray-400 p-12">
                            <BuildingIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p>Connect to the {activeTab} portal to view live data.</p>
                        </div>
                    </div>
                )}
            </div>
        </ModuleContainer>
    );
};