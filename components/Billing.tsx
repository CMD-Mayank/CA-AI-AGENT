
import React, { useState, useEffect } from 'react';
import { ModuleContainer } from './common/ModuleContainer';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { Client, Invoice, FirmProfile, TimeLog } from '../types';
import { storageService } from '../services/storage';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ClockIcon } from './icons/ClockIcon';
import { generateInvoicePDF } from '../services/pdfGenerator';

interface BillingProps {
    client: Client;
    firmProfile?: FirmProfile;
}

const Billing: React.FC<BillingProps> = ({ client, firmProfile }) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newItem, setNewItem] = useState({ description: 'Consultancy Services', amount: 5000 });
    const [unbilledLogs, setUnbilledLogs] = useState<TimeLog[]>([]);
    
    // New Invoice State
    const [currentInvoiceItems, setCurrentInvoiceItems] = useState<{description: string, amount: number}[]>([]);
    const [importedLogIds, setImportedLogIds] = useState<string[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const loaded = await storageService.getInvoices(client.id);
            setInvoices(loaded);
            
            // Fetch unbilled time
            const logs = await storageService.getUnbilledTimeLogs(client.id);
            setUnbilledLogs(logs);
        };
        loadData();
    }, [client.id]);

    const handleAddItem = () => {
        setCurrentInvoiceItems([...currentInvoiceItems, newItem]);
        setNewItem({ description: '', amount: 0 });
    };
    
    const handleImportTime = () => {
        if (unbilledLogs.length === 0) return;
        
        const ratePerHour = 2000;
        const totalMinutes = unbilledLogs.reduce((sum, l) => sum + l.duration, 0);
        const totalAmount = Math.round((totalMinutes / 60) * ratePerHour);
        
        const timeItem = {
            description: `Professional Fees: ${Math.round(totalMinutes)} mins of billable time`,
            amount: totalAmount
        };
        
        setCurrentInvoiceItems([...currentInvoiceItems, timeItem]);
        setImportedLogIds(unbilledLogs.map(l => l.id));
        setUnbilledLogs([]);
    };

    const createInvoice = async () => {
        const total = currentInvoiceItems.reduce((sum, item) => sum + item.amount, 0);
        const newInvoice: Invoice = {
            id: Date.now().toString(),
            clientId: client.id,
            number: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
            date: new Date().toLocaleDateString(),
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            items: currentInvoiceItems,
            total: total,
            status: 'Draft'
        };

        const updated = [newInvoice, ...invoices];
        setInvoices(updated);
        await storageService.createInvoice(newInvoice);
        
        if (importedLogIds.length > 0) {
            await storageService.markTimeLogsAsBilled(importedLogIds);
        }
        
        await storageService.logActivity({
            id: Date.now().toString(),
            clientId: client.id,
            clientName: client.name,
            action: 'Invoice Created',
            timestamp: Date.now(),
            details: `Amount: ₹${total}`
        });

        setShowCreate(false);
        setCurrentInvoiceItems([]);
        setImportedLogIds([]);
    };

    const markAsSent = async (id: string) => {
        const inv = invoices.find(i => i.id === id);
        if(!inv) return;
        
        const updatedInv = { ...inv, status: 'Sent' as const };
        const updatedList = invoices.map(i => i.id === id ? updatedInv : i);
        setInvoices(updatedList);
        await storageService.updateInvoice(updatedInv);
    };
    
    const handleDownload = (inv: Invoice) => {
        const firm = storageService.getFirmProfile() || undefined;
        generateInvoicePDF(inv, firm, client);
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    return (
        <ModuleContainer title="Billing & Invoicing" description={`Manage invoices and payments for ${client.name}.`}>
            
            {!showCreate ? (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                            <div className="text-center px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <span className="block text-xs text-green-600 dark:text-green-400 font-bold uppercase">Paid</span>
                                <span className="font-bold text-green-700 dark:text-green-300">₹0</span>
                            </div>
                            <div className="text-center px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <span className="block text-xs text-yellow-600 dark:text-yellow-400 font-bold uppercase">Outstanding</span>
                                <span className="font-bold text-yellow-700 dark:text-yellow-300">
                                    {formatCurrency(invoices.reduce((acc, inv) => acc + inv.total, 0))}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowCreate(true)}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm flex items-center gap-2 transition-colors"
                        >
                            <span className="text-lg">+</span> New Invoice
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Invoice #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {invoices.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">No invoices created yet.</td>
                                    </tr>
                                )}
                                {invoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{inv.number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{inv.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-semibold">{formatCurrency(inv.total)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                inv.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                                                inv.status === 'Sent' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                            {inv.status === 'Draft' && (
                                                <button onClick={() => markAsSent(inv.id)} className="text-teal-600 hover:text-teal-900 dark:hover:text-teal-400">Mark Sent</button>
                                            )}
                                            <button 
                                                onClick={() => handleDownload(inv)}
                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" 
                                                title="Download PDF"
                                            >
                                                <DownloadIcon className="w-4 h-4"/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto animate-fade-in">
                    <Card>
                        <div className="flex justify-between items-start mb-8 border-b border-gray-100 dark:border-slate-700 pb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Invoice</h2>
                                <p className="text-gray-500 text-sm mt-1">Billed to: {client.name}</p>
                            </div>
                            <div className="text-right">
                                <h3 className="font-bold text-gray-700 dark:text-slate-200">{firmProfile?.name || 'Your Firm'}</h3>
                                <p className="text-xs text-gray-500">{firmProfile?.address}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                             {currentInvoiceItems.map((item, idx) => (
                                 <div key={idx} className="flex justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                     <span className="text-sm text-gray-700 dark:text-slate-200">{item.description}</span>
                                     <span className="text-sm font-semibold dark:text-white">{formatCurrency(item.amount)}</span>
                                 </div>
                             ))}
                             
                             {unbilledLogs.length > 0 && (
                                 <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 p-3 rounded-lg flex justify-between items-center">
                                     <div className="flex items-center gap-2">
                                         <ClockIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                                         <div>
                                            <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200">Unbilled Time Found</p>
                                            <p className="text-xs text-yellow-700 dark:text-yellow-300">{unbilledLogs.length} logs ({unbilledLogs.reduce((s,l)=>s+l.duration,0)} mins)</p>
                                         </div>
                                     </div>
                                     <button 
                                        onClick={handleImportTime}
                                        className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold px-3 py-2 rounded shadow-sm"
                                     >
                                         Import Unbilled Hours
                                     </button>
                                 </div>
                             )}

                             <div className="flex gap-3 items-end bg-gray-50 dark:bg-slate-700/30 p-4 rounded-lg border border-dashed border-gray-300 dark:border-slate-600">
                                 <div className="flex-1">
                                     <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Service Description</label>
                                     <input 
                                        type="text" 
                                        value={newItem.description} 
                                        onChange={e => setNewItem({...newItem, description: e.target.value})}
                                        className="w-full p-2 text-sm rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                                     />
                                 </div>
                                 <div className="w-32">
                                     <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Amount (₹)</label>
                                     <input 
                                        type="number" 
                                        value={newItem.amount}
                                        onChange={e => setNewItem({...newItem, amount: parseInt(e.target.value) || 0})}
                                        className="w-full p-2 text-sm rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                                     />
                                 </div>
                                 <button 
                                    onClick={handleAddItem}
                                    disabled={!newItem.description}
                                    className="bg-gray-800 hover:bg-gray-900 text-white px-3 py-2 rounded text-sm font-medium"
                                 >
                                     Add
                                 </button>
                             </div>
                        </div>

                        <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-slate-700">
                            <div className="text-xl font-bold text-gray-900 dark:text-white">
                                Total: {formatCurrency(currentInvoiceItems.reduce((s, i) => s + i.amount, 0))}
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => { setShowCreate(false); setCurrentInvoiceItems([]); }}
                                    className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <Button 
                                    onClick={createInvoice} 
                                    disabled={currentInvoiceItems.length === 0}
                                    style={{width: 'auto'}}
                                >
                                    Generate Invoice
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </ModuleContainer>
    );
};

export default Billing;
