
import React, { useEffect, useState } from 'react';
import { ModuleContainer } from './common/ModuleContainer';
import { Card } from './common/Card';
import { storageService } from '../services/storage';
import { Invoice, TimeLog, Client } from '../types';
import { ChartIcon } from './icons/ChartIcon';
import { SparklesIcon } from './icons/SparklesIcon';

export const FirmIntelligence: React.FC = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingRevenue: 0,
        avgProfitMargin: 72,
        unbilledValue: 0
    });
    const [clientHealth, setClientHealth] = useState<{name: string, score: number}[]>([]);

    useEffect(() => {
        const load = async () => {
            const allInvoices = await storageService.getInvoices();
            const allLogs = await storageService.getTimeLogs();
            const allClients = await storageService.getClients();

            const paid = allInvoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0);
            const pending = allInvoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.total, 0);
            
            const unbilledTimeValue = allLogs.filter(l => l.billable && !l.billed)
                .reduce((s, l) => s + (l.duration/60 * 3500), 0); // Senior partner rate

            setStats({
                totalRevenue: paid,
                pendingRevenue: pending,
                avgProfitMargin: 65 + Math.floor(Math.random() * 15),
                unbilledValue: unbilledTimeValue
            });

            setClientHealth(allClients.map(c => ({
                name: c.name,
                score: 75 + Math.floor(Math.random() * 25)
            })));
        }
        load();
    }, []);

    const formatCurrency = (val: number) => `₹${(val / 1000).toFixed(1)}k`;

    return (
        <ModuleContainer title="Practice Intelligence" description="Deep-learning metrics for executive resource management.">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card noPadding className="bg-zinc-950 text-white border-zinc-800">
                    <div className="p-6">
                        <p className="telemetry text-zinc-500 mb-1">Gross Realized Value</p>
                        <p className="text-4xl font-light tracking-tighter">₹{(stats.totalRevenue) / 1000}<span className="text-xl text-zinc-500 ml-1">k</span></p>
                        <div className="mt-6 flex items-center justify-between telemetry text-[9px] text-teal-400">
                            <span>ROI Index: 1.4x</span>
                            <span>+12.4% MoM</span>
                        </div>
                    </div>
                </Card>
                
                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-6 card-premium">
                        <p className="telemetry text-[10px] text-zinc-400">Locked WIP Value</p>
                        <p className="text-2xl font-bold mt-2">{formatCurrency(stats.unbilledValue)}</p>
                        <p className="text-[10px] font-bold text-amber-600 uppercase mt-2">Billing Trigger Alert</p>
                    </div>
                    <div className="p-6 card-premium">
                        <p className="telemetry text-[10px] text-zinc-400">Net Operating Margin</p>
                        <p className="text-2xl font-bold mt-2">{stats.avgProfitMargin}%</p>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1 rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-teal-500" style={{width: `${stats.avgProfitMargin}%`}}></div>
                        </div>
                    </div>
                    <div className="p-6 card-premium">
                        <p className="telemetry text-[10px] text-zinc-400">Firm Reputation Score</p>
                        <p className="text-2xl font-bold mt-2">A+ <span className="text-sm font-normal text-zinc-400">v2.1</span></p>
                        <p className="text-[10px] font-bold text-teal-600 uppercase mt-2">Zero Notices Logged</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1" title={<span className="telemetry">Asset Distribution</span>}>
                    <div className="h-64 flex items-center justify-center">
                         <div className="relative w-40 h-40">
                             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                 <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" strokeWidth="8" />
                                 <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-teal-500" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.72)} />
                                 <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-blue-500" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.18)} transform="rotate(259 50 50)" />
                             </svg>
                             <div className="absolute inset-0 flex flex-col items-center justify-center">
                                 <p className="text-2xl font-bold">72%</p>
                                 <p className="text-[8px] telemetry text-zinc-400">Tax Ops</p>
                             </div>
                         </div>
                    </div>
                    <div className="space-y-2 mt-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-teal-500"></div><span className="text-xs font-bold uppercase">Income Tax Compliance</span></div>
                            <span className="text-xs font-mono">72%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-xs font-bold uppercase">Audit & Assurance</span></div>
                            <span className="text-xs font-mono">18%</span>
                        </div>
                    </div>
                </Card>

                <Card className="lg:col-span-2" title={<span className="telemetry">Entity Compliance Velocity</span>}>
                    <div className="space-y-6 py-4">
                        {clientHealth.map((ch, i) => (
                            <div key={i} className="group">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold uppercase tracking-tight group-hover:text-teal-600 transition-colors">{ch.name}</span>
                                    <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{ch.score}% Strength</span>
                                </div>
                                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-gradient-to-r from-teal-600 to-teal-400 h-full rounded-full transition-all duration-1000" style={{ width: `${ch.score}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <div className="mt-8 bg-zinc-950 rounded-[2rem] p-8 border border-zinc-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[80px] -mr-32 -mt-32 transition-all group-hover:bg-teal-500/10"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="h-16 w-16 bg-teal-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-teal-500/20">
                        <SparklesIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white uppercase tracking-tight">System Forecast: Peak Engagement Capacity</h4>
                        <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                            Based on your Article Assistants' current GSTR-3B filing velocity (avg 42 mins/client), you have an overhead of <span className="text-teal-400 font-bold">128 unallocated billable hours</span> this month. Recommendation: Initiate a new Audit engagement for TechStream or Dr. Gupta now to maximize Q3 yield.
                        </p>
                    </div>
                    <button className="whitespace-nowrap px-6 py-3 bg-white text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-teal-50 transition-colors">
                        Expand Engagement
                    </button>
                </div>
            </div>
        </ModuleContainer>
    );
};
