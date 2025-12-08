
import React, { useState, useEffect } from 'react';
import { runChatStream } from '../services/geminiService';
import { ModuleContainer } from './common/ModuleContainer';
import { Card } from './common/Card';
import { SparklesIcon } from './icons/SparklesIcon';
import { Client, ActivityLog, Task, Invoice } from '../types';
import { storageService } from '../services/storage';
import { ChartIcon } from './icons/ChartIcon';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';

interface DashboardProps {
    client: Client;
}

const Dashboard: React.FC<DashboardProps> = ({ client }) => {
    const [stats, setStats] = useState({
        totalClients: 0,
        totalDocuments: 0,
        totalBilled: 0
    });
    const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
    const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
    const [aiInsight, setAiInsight] = useState('');
    const [isLoadingInsight, setIsLoadingInsight] = useState(false);
    const [chartPoints, setChartPoints] = useState<string>('');

    useEffect(() => {
        const loadData = async () => {
            // 1. Load Real Data from Supabase
            const dashboardData = await storageService.getDashboardStats();
            setStats({
                totalClients: dashboardData.totalClients,
                totalDocuments: dashboardData.totalDocuments,
                totalBilled: dashboardData.totalBilled
            });
            setRecentActivity(dashboardData.recentActivity);
            
            // 2. Load & Sort Tasks for "Deadlines"
            const allTasks = await storageService.getTasks();
            const pendingTasks = allTasks
                .filter(t => t.status !== 'Done')
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .slice(0, 4); 
            setUpcomingTasks(pendingTasks);

            // 3. Calculate Dynamic Revenue Chart Data (Simplified for async)
            // Ideally should be a DB aggregation, but calculating client-side for demo parity
            const clients = await storageService.getClients();
            let allInvoices: Invoice[] = [];
            for (const c of clients) {
                const invs = await storageService.getInvoices(c.id);
                allInvoices = [...allInvoices, ...invs];
            }
            
            const months = 6;
            const now = new Date();
            const monthlyData = new Array(months).fill(0);
            
            allInvoices.forEach(inv => {
                const invDate = new Date(inv.date); 
                const diffMonths = (now.getFullYear() - invDate.getFullYear()) * 12 + (now.getMonth() - invDate.getMonth());
                if (diffMonths >= 0 && diffMonths < months) {
                    monthlyData[months - 1 - diffMonths] += inv.total;
                }
            });
            
            const dataToGraph = monthlyData.some(x => x > 0) ? monthlyData : [5000, 12000, 8000, 15000, 20000, 25000];
            const maxVal = Math.max(...dataToGraph);
            const points = dataToGraph.map((val, index) => `${index * 80},${100 - (val / (maxVal || 1)) * 80}`).join(' ');
            setChartPoints(points);
        };
        
        loadData();
    }, []);

    useEffect(() => {
         const fetchInsight = async () => {
            const cachedState = storageService.getModuleState('global', 'DashboardInsight');
            if (cachedState && (Date.now() - cachedState.timestamp < 3600000)) { 
                setAiInsight(cachedState.text);
                return;
            }

            setIsLoadingInsight(true);
            // Re-fetch vital stats for the prompt to be accurate
            const dashboardData = await storageService.getDashboardStats();
            
            const prompt = `
                You are a Practice Manager for a CA Firm.
                Current Stats:
                - Active Clients: ${dashboardData.totalClients}
                - Documents Generated: ${dashboardData.totalDocuments}
                - Total Revenue Billed: ₹${dashboardData.totalBilled}
                
                Provide a brief (2 sentences) strategic update or motivating insight for the Principal CA.
                Focus on growth or efficiency.
                Do not use markdown. Just plain text.
            `;

            try {
                const stream = runChatStream(prompt);
                let fullText = '';
                for await (const chunk of stream) {
                    fullText += chunk;
                }
                setAiInsight(fullText);
                storageService.saveModuleState('global', 'DashboardInsight', { text: fullText, timestamp: Date.now() });
            } catch (err) {
                setAiInsight("Practice running smoothly. Monitor upcoming deadlines.");
            } finally {
                setIsLoadingInsight(false);
            }
        };
        
        // Wait a bit for stats to populate then fetch AI
        const t = setTimeout(fetchInsight, 1000);
        return () => clearTimeout(t);
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <ModuleContainer title="Practice Overview" description="Real-time operational metrics and activity logs.">
            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-l-4 border-l-primary-500">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Active Clients</h4>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalClients}</p>
                    <p className="text-xs text-gray-500 mt-2">Managing portfolios</p>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Docs Generated</h4>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalDocuments}</p>
                    <p className="text-xs text-gray-500 mt-2">Reports & Filings</p>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Total Billed</h4>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{formatCurrency(stats.totalBilled)}</p>
                    <p className="text-xs text-gray-500 mt-2">Invoices raised</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* AI Insight */}
                <div className="lg:col-span-2 bg-gradient-to-r from-primary-50 to-white dark:from-primary-900/20 dark:to-slate-800 border border-primary-100 dark:border-primary-800/30 rounded-xl p-6 shadow-sm flex items-start gap-4">
                    <div className="p-2 bg-primary-100 dark:bg-primary-800 rounded-full text-primary-600 dark:text-primary-300 shrink-0">
                        <SparklesIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">AI Practice Assistant</h3>
                        <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                            {isLoadingInsight ? "Analyzing practice data..." : aiInsight}
                        </p>
                    </div>
                </div>

                 {/* Revenue Chart Mini - Now Dynamic */}
                 <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4 relative z-10">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-slate-200">Revenue Trend (6M)</h3>
                        <ChartIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="relative h-24">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" className="text-primary-500" stopColor="currentColor" stopOpacity="0.2" />
                                    <stop offset="100%" className="text-primary-500" stopColor="currentColor" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d={`M0,100 ${chartPoints} L400,100 Z`} fill="url(#gradient)" />
                            <polyline
                                fill="none"
                                stroke="currentColor"
                                className="text-primary-500"
                                strokeWidth="3"
                                points={chartPoints}
                                vectorEffect="non-scaling-stroke"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                        <span>6 Months Ago</span>
                        <span>Current</span>
                    </div>
                 </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Activity Feed */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Recent Activity</h3>
                         <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-gray-600 dark:text-slate-300">Real-time</span>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">No activity recorded yet.</div>
                        ) : (
                            recentActivity.map((log, idx) => (
                                <div key={idx} className="flex gap-3 pb-3 border-b border-gray-50 dark:border-slate-700 last:border-0">
                                    <div className="mt-1">
                                        <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">
                                            {log.clientName ? log.clientName : 'System'} • {log.details}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Dynamic Deadlines from Tasks */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Upcoming Deadlines</h3>
                        <ClipboardCheckIcon className="w-5 h-5 text-gray-400" />
                     </div>
                     
                     <div className="space-y-3">
                        {upcomingTasks.length === 0 ? (
                             <div className="flex flex-col items-center justify-center py-8 text-center">
                                 <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                 </div>
                                 <p className="text-sm text-gray-500 dark:text-slate-400">All caught up! No pending tasks.</p>
                             </div>
                        ) : (
                            upcomingTasks.map((task) => {
                                const dateObj = new Date(task.dueDate);
                                const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                                const day = dateObj.getDate();
                                return (
                                    <div key={task.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors group cursor-default border border-transparent hover:border-gray-100 dark:hover:border-slate-600">
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center border ${
                                            task.priority === 'High' 
                                            ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800' 
                                            : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600'
                                        }`}>
                                            <span className={`text-[10px] font-bold uppercase ${
                                                task.priority === 'High' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-slate-400'
                                            }`}>{month}</span>
                                            <span className={`text-lg font-bold leading-none ${
                                                task.priority === 'High' ? 'text-red-700 dark:text-red-300' : 'text-gray-800 dark:text-white'
                                            }`}>{day}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{task.title}</p>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                                    task.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                                }`}>{task.priority}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">{task.clientName} • {task.assignee}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                     </div>
                </div>
            </div>
        </ModuleContainer>
    );
};

export default Dashboard;
