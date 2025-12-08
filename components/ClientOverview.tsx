
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

interface ClientOverviewProps {
    client: Client;
    onChangeView: (view: View) => void;
}

export const ClientOverview: React.FC<ClientOverviewProps> = ({ client, onChangeView }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [docs, setDocs] = useState<ClientDocument[]>([]);
    
    // In a real app, this state would come from the PortalSync module or shared storage
    // Simulating "Connected" state for demo visual
    const [portalStatus, setPortalStatus] = useState('Connected'); 
    
    useEffect(() => {
        const loadData = async () => {
            // Load Client Specific Data
            const allTasks = await storageService.getTasks();
            setTasks(allTasks.filter(t => t.clientId === client.id && t.status !== 'Done'));
            
            const clientInvoices = await storageService.getInvoices(client.id);
            setInvoices(clientInvoices);

            const clientDocs = await storageService.getDocumentsForClient(client.id);
            setDocs(clientDocs.slice(0, 3));
        };
        loadData();
    }, [client.id]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    const outstandingAmount = invoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + i.total, 0);

    return (
        <ModuleContainer title="Client Overview" description="360° view of client activities, compliance, and financials.">
            
            {/* Header Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center text-2xl font-bold text-teal-700 dark:text-teal-300">
                        {client.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{client.name}</h2>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-slate-400 mt-1">
                            <span className="bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">{client.type}</span>
                            <span>•</span>
                            <span>{client.industry}</span>
                            <span>•</span>
                            <span className="font-mono">{client.pan}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => onChangeView(View.Billing)}
                        className="px-4 py-2 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-lg text-sm font-medium hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"
                    >
                        New Invoice
                    </button>
                    <button 
                        onClick={() => onChangeView(View.Tasks)}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        Add Task
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Stats */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/10 dark:to-slate-800 border-orange-100 dark:border-orange-900/20">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase">Pending Tasks</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{tasks.length}</p>
                            </div>
                            <ClipboardCheckIcon className="w-5 h-5 text-orange-400" />
                        </div>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-slate-800 border-blue-100 dark:border-blue-900/20">
                         <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Documents</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{docs.length}</p>
                            </div>
                            <DocumentIcon className="w-5 h-5 text-blue-400" />
                        </div>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/10 dark:to-slate-800 border-green-100 dark:border-green-900/20">
                         <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Outstanding</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(outstandingAmount)}</p>
                            </div>
                            <CreditCardIcon className="w-5 h-5 text-green-400" />
                        </div>
                    </Card>
                </div>

                {/* AI Assistant Quick Prompt */}
                <div className="lg:row-span-2 flex flex-col gap-6">
                    <div className="bg-teal-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden flex-1">
                        <SparklesIcon className="w-12 h-12 absolute -top-2 -right-2 text-teal-500 opacity-50" />
                        <h3 className="font-bold text-lg mb-2 relative z-10">Advisory Copilot</h3>
                        <p className="text-teal-100 text-sm mb-6 relative z-10">
                            Need to draft a notice response or check compliance for {client.name}?
                        </p>
                        <button 
                            onClick={() => onChangeView(View.Advisory)}
                            className="w-full bg-white text-teal-800 font-semibold py-2.5 rounded-lg shadow hover:bg-teal-50 transition-colors relative z-10"
                        >
                            Start Chat Session
                        </button>
                    </div>

                    {/* Portal Status Widget (New) */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <BuildingIcon className="w-4 h-4 text-gray-400" /> Live Portal Status
                            </h4>
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">GST Return Status</span>
                                <span className="text-green-600 font-medium">Filed</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Cash Ledger</span>
                                <span className="text-gray-800 dark:text-white font-medium">₹45,200</span>
                            </div>
                            <button 
                                onClick={() => onChangeView(View.Portal)}
                                className="w-full mt-2 text-xs text-primary-600 font-bold hover:underline text-center"
                            >
                                View Live Ledgers &rarr;
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="lg:col-span-1">
                    <Card title="Priority Action Items">
                        <div className="space-y-3">
                            {tasks.length === 0 ? (
                                <p className="text-sm text-gray-500">No pending tasks for this client.</p>
                            ) : (
                                tasks.slice(0,4).map(task => (
                                    <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded transition-colors">
                                        <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">Due: {task.dueDate}</p>
                                        </div>
                                        <span className="text-xs bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-slate-300">{task.status}</span>
                                    </div>
                                ))
                            )}
                        </div>
                         {tasks.length > 4 && (
                             <button onClick={() => onChangeView(View.Tasks)} className="text-xs text-teal-600 mt-3 font-medium hover:underline">View all tasks</button>
                         )}
                    </Card>
                </div>

                {/* Recent Documents */}
                 <div className="lg:col-span-1">
                    <Card title="Recent Files">
                        <div className="space-y-3">
                            {docs.length === 0 ? (
                                <p className="text-sm text-gray-500">No documents generated.</p>
                            ) : (
                                docs.map(doc => (
                                    <div key={doc.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded transition-colors cursor-pointer" onClick={() => onChangeView(View.Documents)}>
                                        <DocumentIcon className="w-5 h-5 text-gray-400" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.title}</p>
                                            <p className="text-[10px] text-gray-400">{new Date(doc.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </ModuleContainer>
    );
};
