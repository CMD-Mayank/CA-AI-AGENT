
import React, { useState, useEffect } from 'react';
import { runChatStream } from '../services/geminiService';
import { ModuleContainer } from './common/ModuleContainer';
import { Card } from './common/Card';
import { SparklesIcon } from './icons/SparklesIcon';
import { Client, ActivityLog, Task, FirmProfile } from '../types';
import { storageService } from '../services/storage';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { ChartIcon } from './icons/ChartIcon';

interface DashboardProps {
    client: Client;
}

const Dashboard: React.FC<DashboardProps> = ({ client }) => {
    const [stats, setStats] = useState({ totalClients: 0, totalDocuments: 0, totalBilled: 0 });
    const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
    const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
    const [aiInsight, setAiInsight] = useState('');
    const [sysStatus, setSysStatus] = useState('OPTIMAL');

    useEffect(() => {
        const loadData = async () => {
            const dashboardData = await storageService.getDashboardStats();
            setStats({
                totalClients: dashboardData.totalClients,
                totalDocuments: dashboardData.totalDocuments,
                totalBilled: dashboardData.totalBilled
            });
            setRecentActivity(dashboardData.recentActivity);
            
            const allTasks = await storageService.getTasks();
            setUpcomingTasks(allTasks.filter(t => t.status !== 'Done')
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .slice(0, 5));
        };
        loadData();
    }, []);

    useEffect(() => {
        const fetchInsight = async () => {
           try {
               const stream = runChatStream("Generate a 1-sentence hyper-technical business strategy insight for a CA Managing Partner based on current market dynamics like MSME payment rules or GST trends.");
               let fullText = '';
               for await (const chunk of stream) fullText += chunk;
               setAiInsight(fullText);
           } catch (err) { setAiInsight("Structural liquidity is the bedrock of practice scalability."); }
       };
       fetchInsight();
    }, []);

    return (
        <ModuleContainer title="Executive Terminal" description="System telemetry and sovereign environment status.">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                {/* Global Health Monitor */}
                <Card className="md:col-span-4 bg-zinc-950 text-white border-zinc-800 animate-beam" noPadding>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="telemetry text-zinc-500 mb-1">Practice Yield</p>
                                <p className="text-4xl font-light tracking-tighter">₹{(stats.totalBilled / 100000).toFixed(2)}<span className="text-xl text-zinc-500 ml-1">L</span></p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                                <ChartIcon className="w-5 h-5 text-teal-400" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <p className="telemetry text-[9px] text-zinc-500">Utilization</p>
                                <p className="text-lg font-bold">84.2%</p>
                            </div>
                            <div className="flex-1">
                                <p className="telemetry text-[9px] text-zinc-500">Risk Delta</p>
                                <p className="text-lg font-bold text-emerald-400">-2.1%</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* AI Insight Bar */}
                <div className="md:col-span-8 flex flex-col gap-4">
                    <div className="bg-teal-500/5 border border-teal-500/20 rounded-2xl p-5 flex items-start gap-4">
                        <div className="p-2 bg-teal-500 rounded-lg shadow-lg shadow-teal-500/20 shrink-0">
                            <SparklesIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-teal-700 dark:text-teal-400 mb-1">Strategy Core v3.0</h4>
                            <p className="text-sm font-medium leading-relaxed italic text-[var(--text-secondary)]">
                                {aiInsight || "Calibrating strategy kernels..."}
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 card-premium flex flex-col justify-between">
                            <p className="telemetry text-[10px] text-[var(--text-tertiary)]">Environment</p>
                            <p className="text-sm font-bold flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                SOVEREIGN
                            </p>
                        </div>
                        <div className="p-4 card-premium flex flex-col justify-between">
                            <p className="telemetry text-[10px] text-[var(--text-tertiary)]">Data Sync</p>
                            <p className="text-sm font-bold flex items-center gap-2 mt-1">
                                <ShieldCheckIcon className="w-4 h-4 text-teal-500" />
                                AES-256-GCM
                            </p>
                        </div>
                        <div className="p-4 card-premium flex flex-col justify-between">
                            <p className="telemetry text-[10px] text-[var(--text-tertiary)]">Latency</p>
                            <p className="text-sm font-bold mt-1">0.04ms <span className="font-normal text-gray-400">(LOCAL)</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Workflow Radar */}
                <div className="lg:col-span-2">
                    <Card title={
                        <div className="flex justify-between items-center w-full">
                            <span className="telemetry">Operational Interrupts</span>
                            <span className="text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded uppercase">{upcomingTasks.length} Pending</span>
                        </div>
                    } noPadding>
                        <div className="divide-y divide-[var(--border-subtle)]">
                            {upcomingTasks.map(task => (
                                <div key={task.id} className="p-5 hover:bg-[var(--bg-surface-hover)] transition-all group flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-zinc-300'}`}></div>
                                        <div>
                                            <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-teal-600 transition-colors">{task.title}</p>
                                            <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mt-0.5">{task.clientName} • {task.assignee}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-mono font-bold">{task.dueDate}</p>
                                        <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-widest mt-0.5">Deadline</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Audit Trail */}
                <div className="lg:col-span-1">
                    <Card title={<span className="telemetry">Hardware Audit Log</span>} noPadding>
                        <div className="p-5 space-y-6">
                            {recentActivity.slice(0, 4).map((log, i) => (
                                <div key={i} className="flex gap-4 relative">
                                    <div className="flex flex-col items-center shrink-0">
                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500 ring-4 ring-teal-500/10"></div>
                                        {i !== 3 && <div className="w-px h-full bg-[var(--border-subtle)] mt-2"></div>}
                                    </div>
                                    <div className="pb-4">
                                        <p className="text-[10px] telemetry text-zinc-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                        <p className="text-xs font-bold mt-1 uppercase tracking-tight">{log.action}</p>
                                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">{log.details}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </ModuleContainer>
    );
};

export default Dashboard;
