
import React, { useState, useEffect } from 'react';
import { ModuleContainer } from './common/ModuleContainer';
import { Card } from './common/Card';
import { Client, Task, TimeLog } from '../types';
import { storageService } from '../services/storage';
import { Button } from './common/Button';
import { ClockIcon } from './icons/ClockIcon';

interface TimesheetsProps {
    clients: Client[];
}

export const Timesheets: React.FC<TimesheetsProps> = ({ clients }) => {
    const [logs, setLogs] = useState<TimeLog[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    
    const [formData, setFormData] = useState({
        clientId: '',
        taskId: '',
        duration: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        billable: true
    });

    useEffect(() => {
        setLogs(storageService.getTimeLogs());
        setTasks(storageService.getTasks());
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.clientId || !formData.duration) return;

        const client = clients.find(c => c.id === formData.clientId);
        const task = tasks.find(t => t.id === formData.taskId);

        const newLog: TimeLog = {
            id: Date.now().toString(),
            clientId: formData.clientId,
            clientName: client?.name || 'Unknown',
            taskId: formData.taskId,
            taskTitle: task?.title,
            user: storageService.getUserEmail() || 'Admin',
            date: formData.date,
            duration: parseInt(formData.duration),
            description: formData.description,
            billable: formData.billable,
            billed: false
        };

        storageService.saveTimeLog(newLog);
        setLogs([newLog, ...logs]);
        
        // Reset most fields
        setFormData(prev => ({ ...prev, duration: '', description: '' }));
    };

    const totalHours = (logs.reduce((sum, l) => sum + l.duration, 0) / 60).toFixed(1);
    const billableHours = (logs.filter(l => l.billable).reduce((sum, l) => sum + l.duration, 0) / 60).toFixed(1);
    const utilization = totalHours !== '0.0' ? Math.round((parseFloat(billableHours) / parseFloat(totalHours)) * 100) : 0;

    return (
        <ModuleContainer title="Timesheets & Profitability" description="Track billable hours, staff utilization, and project costs.">
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-l-4 border-l-teal-500">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Total Hours Logged</h4>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalHours} hrs</p>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Billable Hours</h4>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{billableHours} hrs</p>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Utilization Rate</h4>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{utilization}%</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Entry Form */}
                <div className="lg:col-span-1">
                    <Card title="Log Time">
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Client</label>
                                <select 
                                    required
                                    className="w-full p-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg"
                                    value={formData.clientId}
                                    onChange={e => setFormData({...formData, clientId: e.target.value})}
                                >
                                    <option value="">Select Client</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Task (Optional)</label>
                                <select 
                                    className="w-full p-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg"
                                    value={formData.taskId}
                                    onChange={e => setFormData({...formData, taskId: e.target.value})}
                                >
                                    <option value="">General / No Task</option>
                                    {tasks.filter(t => !formData.clientId || t.clientId === formData.clientId).map(t => (
                                        <option key={t.id} value={t.id}>{t.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Date</label>
                                    <input 
                                        type="date" 
                                        required
                                        className="w-full p-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg"
                                        value={formData.date}
                                        onChange={e => setFormData({...formData, date: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Duration (Minutes)</label>
                                    <input 
                                        type="number" 
                                        required
                                        min="1"
                                        className="w-full p-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg"
                                        value={formData.duration}
                                        onChange={e => setFormData({...formData, duration: e.target.value})}
                                        placeholder="e.g. 60"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Description</label>
                                <textarea 
                                    className="w-full p-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg"
                                    rows={2}
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    placeholder="What did you work on?"
                                ></textarea>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="billable" 
                                    checked={formData.billable}
                                    onChange={e => setFormData({...formData, billable: e.target.checked})}
                                    className="h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                                />
                                <label htmlFor="billable" className="text-sm text-gray-700 dark:text-slate-300">Billable to Client</label>
                            </div>
                            <Button type="submit">Log Time</Button>
                        </form>
                    </Card>
                </div>

                {/* Logs List */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col h-[calc(100vh-24rem)]">
                    <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700 dark:text-slate-200">Time Logs</h3>
                        <div className="text-xs text-gray-500 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 px-2 py-1 rounded">
                            Latest 50 entries
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-0">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-700/50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Client/Task</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">No time logged yet.</td>
                                    </tr>
                                )}
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{log.date}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{log.clientName}</p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">{log.taskTitle || log.description || 'General'}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-bold">{log.duration} min</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {log.billable ? (
                                                log.billed ? (
                                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Billed</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">Unbilled</span>
                                                )
                                            ) : (
                                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">Non-Billable</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ModuleContainer>
    );
};
