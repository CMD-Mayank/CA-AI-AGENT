
import React, { useState, useEffect } from 'react';
import { ModuleContainer } from './common/ModuleContainer';
import { ActivityLog } from '../types';
import { storageService } from '../services/storage';
import { DownloadIcon } from './icons/DownloadIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

export const AuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const loadedLogs = storageService.getLogs();
        setLogs(loadedLogs);
    }, []);

    const filteredLogs = logs.filter(log => 
        log.action.toLowerCase().includes(filter.toLowerCase()) ||
        log.clientName.toLowerCase().includes(filter.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(filter.toLowerCase()))
    );

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Timestamp,Client ID,Client Name,Action,Details\n"
            + logs.map(e => `${new Date(e.timestamp).toISOString()},${e.clientId},${e.clientName},${e.action},${e.details || ''}`).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `firm_audit_log_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    return (
        <ModuleContainer 
            title="System Audit Trail" 
            description="Comprehensive log of all firm activities for compliance and liability tracking."
        >
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden h-[calc(100vh-12rem)] flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3 w-full max-w-md">
                         <div className="relative w-full">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <ShieldCheckIcon className="w-4 h-4" />
                            </span>
                            <input 
                                type="text" 
                                placeholder="Filter logs by client or action..." 
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            />
                         </div>
                    </div>
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider w-48">Timestamp</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider w-48">Actor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Client Context</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">No activity found matching your filter.</td>
                                </tr>
                            )}
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-slate-400 font-mono">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        Admin
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            log.action.includes('Delete') ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                            log.action.includes('Create') ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                            log.action.includes('Export') || log.action.includes('Download') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                        {log.clientName}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 break-all max-w-xs truncate" title={log.details}>
                                        {log.details || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </ModuleContainer>
    );
};
