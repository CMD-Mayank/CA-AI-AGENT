
import React, { useEffect, useState } from 'react';
import { ModuleContainer } from './common/ModuleContainer';
import { Card } from './common/Card';
import { StaffMember } from '../types';
import { storageService } from '../services/storage';
import { UserIcon } from './icons/UserIcon';
import { ChartIcon } from './icons/ChartIcon';

export const TeamManagement: React.FC = () => {
    const [staff, setStaff] = useState<StaffMember[]>([]);

    useEffect(() => {
        const load = async () => {
            setStaff(await storageService.getStaff());
        }
        load();
    }, []);

    return (
        <ModuleContainer title="Team & Human Assets" description="Manage firm partners, managers, and articles. Track utilization telemetry.">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card noPadding className="border-l-4 border-l-teal-500">
                    <div className="p-5">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total HC</p>
                        <p className="text-3xl font-bold">{staff.length} Nodes</p>
                    </div>
                </Card>
                <Card noPadding className="border-l-4 border-l-blue-500">
                    <div className="p-5">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Avg Utilization</p>
                        <p className="text-3xl font-bold">78%</p>
                    </div>
                </Card>
                <Card noPadding className="border-l-4 border-l-purple-500">
                    <div className="p-5">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Engagements</p>
                        <p className="text-3xl font-bold">24</p>
                    </div>
                </Card>
                <Card noPadding className="border-l-4 border-l-orange-500">
                    <div className="p-5">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Open Deliverables</p>
                        <p className="text-3xl font-bold">42</p>
                    </div>
                </Card>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Staff Member</th>
                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Role</th>
                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Capacity</th>
                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Utilization</th>
                            <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {staff.map(member => (
                            <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-xs uppercase">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{member.name}</p>
                                            <p className="text-[10px] text-gray-500 font-mono">{member.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-slate-700 rounded-full font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-slate-600">
                                        {member.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">
                                    {member.activeTasks} Active
                                </td>
                                <td className="px-6 py-4">
                                    <div className="w-full max-w-[100px]">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-bold">{member.utilization}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${member.utilization > 90 ? 'bg-red-500' : member.utilization > 70 ? 'bg-amber-500' : 'bg-teal-500'}`}
                                                style={{ width: `${member.utilization}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${member.status === 'Online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{member.status}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </ModuleContainer>
    );
};
