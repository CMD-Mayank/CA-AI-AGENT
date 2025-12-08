
import React, { useEffect, useState } from 'react';
import { ModuleContainer } from './common/ModuleContainer';
import { Firm } from '../types';

export const SuperAdminDashboard: React.FC = () => {
    // In local mode, this just shows a static list or nothing
    const [firms, setFirms] = useState<Firm[]>([]);

    useEffect(() => {
        // Mock data for display
        setFirms([
            { id: '1', name: 'Demo Firm A', subscription_status: 'active', created_at: new Date().toISOString() },
            { id: '2', name: 'Demo Firm B', subscription_status: 'trial', created_at: new Date().toISOString() }
        ]);
    }, []);

    return (
        <ModuleContainer 
            title="Super Admin Console" 
            description="Manage registered CA firms and subscriptions."
        >
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700 dark:text-slate-200">Registered Firms (Local Mock)</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Firm Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                            {firms.map((firm) => (
                                <tr key={firm.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{firm.name}</div>
                                        <div className="text-xs text-gray-500">{firm.frn || 'No FRN'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                                        {firm.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                            firm.subscription_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {firm.subscription_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                                        {new Date(firm.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">Note: In Local Mode, this dashboard only shows mock data as there is no central database connected.</p>
        </ModuleContainer>
    );
};
