
import React, { useState } from 'react';
import { ModuleContainer } from './common/ModuleContainer';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { storageService } from '../services/storage';

export const HelpSupport: React.FC = () => {
    const [ticket, setTicket] = useState({ subject: '', message: '' });
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            setSent(true);
            setTicket({ subject: '', message: '' });
            
            // Log for demo
            storageService.logActivity({
                id: Date.now().toString(),
                clientId: 'SYSTEM',
                clientName: 'AuditEra Support',
                action: 'Support Ticket',
                timestamp: Date.now(),
                details: 'User submitted a help request'
            });
        }, 1500);
    };

    const FAQs = [
        { q: "How do I add a new client?", a: "Go to the Sidebar dropdown, click '+ NEW', and fill in the entity details (PAN, Type, Industry)." },
        { q: "Is my data secure?", a: "Yes. AuditEra runs locally in your browser. Data is stored in your device's encrypted local storage. We recommend using the Backup feature in Settings weekly." },
        { q: "How do I generate a PDF invoice?", a: "Navigate to the Billing module, create an invoice, and click the Download icon in the actions column." },
        { q: "Can I import Tally data?", a: "Yes. In the Tax Filing and Forecasting modules, use the 'Smart Import' button to simulate data ingestion from CSV/XML." },
    ];

    const shortcuts = [
        { keys: ["⌘/Ctrl", "K"], action: "Open Command Center (Global Search)" },
        { keys: ["Esc"], action: "Close Modals / Sidebar" },
        { keys: ["Enter"], action: "Send Chat Message" },
    ];

    return (
        <ModuleContainer 
            title="Help Center" 
            description="Documentation, tutorials, and premium support for AuditEra users."
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <div className="space-y-6">
                    <Card title="Frequently Asked Questions">
                        <div className="space-y-4">
                            {FAQs.map((faq, i) => (
                                <div key={i} className="border-b border-gray-100 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-1">{faq.q}</h4>
                                    <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="Keyboard Shortcuts">
                        <div className="space-y-3">
                            {shortcuts.map((s, i) => (
                                <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
                                    <span className="text-sm text-gray-700 dark:text-slate-300">{s.action}</span>
                                    <div className="flex gap-1">
                                        {s.keys.map((k, j) => (
                                            <kbd key={j} className="px-2 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded text-xs font-mono font-bold text-gray-500 dark:text-slate-400 shadow-sm">
                                                {k}
                                            </kbd>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card title="Video Tutorials">
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                "Getting Started with AuditEra",
                                "Generating Tax Reports",
                                "Managing Staff Timesheets"
                            ].map((title, i) => (
                                <div key={i} className="group relative aspect-video bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all">
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center z-10">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white ml-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="absolute bottom-3 left-3 text-white text-sm font-medium shadow-black drop-shadow-md">
                                        {title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="Contact Enterprise Support">
                        {sent ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h3 className="text-gray-900 dark:text-white font-bold">Ticket Created!</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Ref ID: #{Math.floor(Math.random()*10000)}</p>
                                <button onClick={() => setSent(false)} className="mt-4 text-primary-600 text-sm font-medium hover:underline">Send another</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSend} className="space-y-4">
                                <Input 
                                    label="Subject" 
                                    value={ticket.subject} 
                                    onChange={e => setTicket({...ticket, subject: e.target.value})}
                                    placeholder="e.g. Issue with billing PDF"
                                    required
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Message</label>
                                    <textarea 
                                        rows={4}
                                        className="w-full p-3 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white"
                                        placeholder="Describe your issue..."
                                        value={ticket.message}
                                        onChange={e => setTicket({...ticket, message: e.target.value})}
                                        required
                                    ></textarea>
                                </div>
                                <Button type="submit" isLoading={isSending}>Submit Ticket</Button>
                            </form>
                        )}
                    </Card>
                </div>
            </div>
        </ModuleContainer>
    );
};
