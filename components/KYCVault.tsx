
import React, { useState } from 'react';
import { ModuleContainer } from './common/ModuleContainer';
import { Card } from './common/Card';
import { Client } from '../types';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface KYCVaultProps {
    clients: Client[];
}

export const KYCVault: React.FC<KYCVaultProps> = ({ clients }) => {
    const [selectedClient, setSelectedClient] = useState<Client | null>(clients[0] || null);

    const kycDocs = [
        { type: 'PAN Card', status: 'Verified', date: '2024-01-15' },
        { type: 'Aadhaar Card / DL', status: 'Verified', date: '2024-01-15' },
        { type: 'COI / Partnership Deed', status: 'Verified', date: '2024-01-20' },
        { type: 'Utility Bill (Address Proof)', status: 'Expired', date: '2023-06-10' },
        { type: 'Director / Partner KYC', status: 'Pending', date: '-' },
    ];

    return (
        <ModuleContainer title="KYC & Permanent File Vault" description="Regulatory identity management. Ensures 100% compliance with AML and KYC norms.">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Client Selector */}
                <div className="lg:col-span-1 space-y-2">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">Active Entities</p>
                    {clients.map(client => (
                        <button 
                            key={client.id}
                            onClick={() => setSelectedClient(client)}
                            className={`w-full text-left p-3 rounded-xl transition-all border ${
                                selectedClient?.id === client.id 
                                ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-500 dark:border-teal-500 shadow-sm' 
                                : 'bg-white dark:bg-slate-800 border-transparent hover:bg-gray-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tighter truncate">{client.name}</p>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-[10px] text-gray-500 font-mono">{client.pan}</span>
                                <span className={`w-2 h-2 rounded-full ${client.kycStatus === 'Verified' ? 'bg-green-500' : 'bg-amber-500'}`} />
                            </div>
                        </button>
                    ))}
                </div>

                {/* KYC Details */}
                <div className="lg:col-span-3">
                    {selectedClient ? (
                        <Card title={
                            <div className="flex items-center justify-between w-full">
                                <h3 className="font-bold uppercase tracking-widest text-xs">KYC Audit Trail: {selectedClient.name}</h3>
                                <button className="text-[10px] font-bold text-teal-600 uppercase hover:underline">Upload Master Files</button>
                            </div>
                        }>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 bg-teal-500/5 border border-teal-500/20 rounded-2xl">
                                        <p className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest">Compliance Status</p>
                                        <p className="text-xl font-bold mt-1">{selectedClient.kycStatus || 'Incomplete'}</p>
                                    </div>
                                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                                        <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest">Next Review Date</p>
                                        <p className="text-xl font-bold mt-1">14 Jan 2025</p>
                                    </div>
                                </div>

                                <div className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {kycDocs.map((doc, idx) => (
                                        <div key={idx} className="py-4 flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                                                    doc.status === 'Verified' ? 'bg-green-50 border-green-100 text-green-600' :
                                                    doc.status === 'Expired' ? 'bg-red-50 border-red-100 text-red-600' :
                                                    'bg-gray-50 border-gray-200 text-gray-400'
                                                }`}>
                                                    <ShieldCheckIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tighter">{doc.type}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Last Updated: {doc.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${
                                                    doc.status === 'Verified' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    doc.status === 'Expired' ? 'bg-red-100 text-red-700 border-red-200' :
                                                    'bg-gray-100 text-gray-600 border-gray-200'
                                                }`}>
                                                    {doc.status}
                                                </span>
                                                <button className="p-2 text-gray-400 hover:text-teal-600 transition-colors opacity-0 group-hover:opacity-100">
                                                    <DownloadIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl">
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Select an Entity to view Vault</p>
                        </div>
                    )}
                </div>
            </div>
        </ModuleContainer>
    );
};
