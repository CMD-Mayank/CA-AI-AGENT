
import React, { useState, useEffect } from 'react';
import { Client, Task, Invoice, ClientDocument, View } from '../types';
import { storageService } from '../services/storage';
import { Card } from './common/Card';
import { ModuleContainer } from './common/ModuleContainer';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { BuildingIcon } from './icons/BuildingIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface ClientOverviewProps {
    client: Client;
    onChangeView: (view: View) => void;
}

export const ClientOverview: React.FC<ClientOverviewProps> = ({ client, onChangeView }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [docs, setDocs] = useState<ClientDocument[]>([]);
    
    useEffect(() => {
        const loadData = async () => {
            const allTasks = await storageService.getTasks();
            setTasks(allTasks.filter(t => t.clientId === client.id && t.status !== 'Done'));
            setInvoices(await storageService.getInvoices(client.id));
            setDocs(await storageService.getDocumentsForClient(client.id));
        };
        loadData();
    }, [client.id]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    const outstandingAmount = invoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + i.total, 0);

    return (
        <ModuleContainer title="Entity 360° Console" description="Centralized intelligence hub for the client engagement.">
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl flex items-center justify-center text-3xl font-extrabold text-white shadow-lg shadow-teal-500/20 rotate-3">
                        {client.name.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tighter uppercase">{client.name}</h2>
                            <span className={`w-3 h-3 rounded-full ${client.kycStatus === 'Verified' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-amber-500'}`}></span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-slate-400 mt-2 font-bold uppercase tracking-widest">
                            <span className="bg-gray-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200">{client.type}</span>
                            <span className="flex items-center gap-1.5"><BuildingIcon className="w-3.5 h-3.5" /> {client.industry}</span>
                            <span className="flex items-center gap-1.5 font-mono bg-teal-500/10 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded-md border border-teal-500/20">{client.pan}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 relative z-10">
                    <button 
                        onClick={() => onChangeView(View.Advisory)}
                        className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-teal-600/20"
                    >
                        Advisory Session
                    </button>
                    <button 
                        onClick={() => onChangeView(View.Workflows)}
                        className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                    >
                        Deploy SOP
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="hover:scale-[1.02] transition-transform cursor-pointer border-l-4 border-l-orange-500" onClick={() => onChangeView(View.Tasks)}>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Backlog</p>
                            <p className="text-3xl font-extrabold mt-1">{tasks.length}</p>
                            <p className="text-[10px] text-orange-600 font-bold mt-2">DUE SOON</p>
                        </Card>
                        <Card className="hover:scale-[1.02] transition-transform cursor-pointer border-l-4 border-l-blue-500" onClick={() => onChangeView(View.Documents)}>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Vault Balance</p>
                            <p className="text-3xl font-extrabold mt-1">{docs.length} Files</p>
                            <p className="text-[10px] text-blue-600 font-bold mt-2">SECURE STORAGE</p>
                        </Card>
                        <Card className="hover:scale-[1.02] transition-transform cursor-pointer border-l-4 border-l-green-500" onClick={() => onChangeView(View.Billing)}>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Unrealized Revenue</p>
                            <p className="text-3xl font-extrabold mt-1">{formatCurrency(outstandingAmount)}</p>
                            <p className="text-[10px] text-green-600 font-bold mt-2">OUTSTANDING</p>
                        </Card>
                    </div>

                    <Card title={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Live Compliance Matrix</span>}>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            {[
                                { label: 'GST Returns', status: 'Filed', color: 'text-green-500' },
                                { label: 'TDS Payments', status: 'Due Today', color: 'text-amber-500' },
                                { label: 'ROC Compliance', status: 'Verified', color: 'text-green-500' },
                                { label: 'Income Tax', status: 'Adv. Tax Pending', color: 'text-red-500' }
                            ].map((item, i) => (
                                <div key={i} className="text-center p-3 rounded-2xl bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">{item.label}</p>
                                    <p className={`text-xs font-bold uppercase tracking-tighter ${item.color}`}>{item.status}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Engagement Roadmap" noPadding>
                            <div className="p-4 space-y-4">
                                {tasks.slice(0, 3).map(t => (
                                    <div key={t.id} className="flex gap-4 group">
                                        <div className="flex flex-col items-center">
                                            <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5"></div>
                                            <div className="flex-1 w-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                                        </div>
                                        <div className="pb-4">
                                            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tighter">{t.title}</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Due: {t.dueDate}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                        <Card title="Permanent File Sync" noPadding>
                             <div className="p-4 space-y-3">
                                {docs.slice(0, 3).map(d => (
                                    <div key={d.id} className="flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors cursor-pointer" onClick={() => onChangeView(View.Documents)}>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <DocumentIcon className="w-4 h-4 text-gray-400 shrink-0" />
                                            <p className="text-xs font-bold text-gray-700 dark:text-zinc-300 truncate uppercase tracking-tighter">{d.title}</p>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(d.createdAt).getFullYear()}</span>
                                    </div>
                                ))}
                                <button onClick={() => onChangeView(View.KYC)} className="w-full text-center text-[10px] font-bold text-teal-600 uppercase tracking-widest mt-2 hover:underline">View Full KYC Vault</button>
                             </div>
                        </Card>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="bg-zinc-950 border-zinc-800 text-white relative overflow-hidden" noPadding>
                        <div className="p-6 relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <SparklesIcon className="w-5 h-5 text-teal-400" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400/80">Kernel Insights</span>
                            </div>
                            <p className="text-sm font-medium leading-relaxed italic text-zinc-300">
                                "The high TDS-receivable balance indicates a potential cash-flow bottleneck. Suggest applying for a Nil/Lower TDS Certificate (Form 13) to improve liquidity."
                            </p>
                            <div className="mt-6 pt-6 border-t border-zinc-800">
                                <button 
                                    onClick={() => onChangeView(View.Advisory)}
                                    className="w-full py-3 bg-white text-zinc-950 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-teal-50 transition-colors"
                                >
                                    Draft Strategy Memo
                                </button>
                            </div>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl"></div>
                    </Card>

                    <Card title="Onboarding Stats">
                         <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                                    <span>KYC Completion</span>
                                    <span>75%</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-teal-500 h-full rounded-full" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                                <ShieldCheckIcon className="w-5 h-5 text-amber-500" />
                                <div>
                                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">KYC Action Required</p>
                                    <p className="text-xs font-medium text-amber-900 dark:text-amber-200 mt-0.5">Director PAN missing signature.</p>
                                </div>
                            </div>
                         </div>
                    </Card>
                    
                    <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-blue-500/10">
                        <div className="flex items-center gap-2 mb-2">
                             <BuildingIcon className="w-4 h-4 text-blue-100" />
                             <span className="text-[10px] font-bold uppercase tracking-widest text-blue-100">Portal Sync</span>
                        </div>
                        <h4 className="text-lg font-bold tracking-tighter uppercase mb-4 leading-tight">Live Ledger Connectivity</h4>
                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-blue-100/70">
                                <span>GST Cash Ledger</span>
                                <span>₹45,200</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-blue-100/70">
                                <span>GST Credit Ledger</span>
                                <span>₹1,25,000</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => onChangeView(View.Portal)}
                            className="w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-white/20"
                        >
                            Sync Portals
                        </button>
                    </div>
                </div>
            </div>
        </ModuleContainer>
    );
};
