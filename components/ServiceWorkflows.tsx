
import React, { useEffect, useState } from 'react';
import { ModuleContainer } from './common/ModuleContainer';
import { Card } from './common/Card';
import { ServiceTemplate } from '../types';
import { storageService } from '../services/storage';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';

export const ServiceWorkflows: React.FC = () => {
    const [templates, setTemplates] = useState<ServiceTemplate[]>([]);

    useEffect(() => {
        const load = async () => {
            setTemplates(await storageService.getTemplates());
        }
        load();
    }, []);

    return (
        <ModuleContainer title="Service Blueprint Kernel" description="Pre-defined operational flows for standardized firm output. Deploy these to clients.">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {templates.map(tpl => (
                    <Card key={tpl.id} title={
                        <div className="flex items-center justify-between w-full">
                            <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-tighter">{tpl.title}</h4>
                            <span className="text-[10px] font-bold bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded border border-teal-100 dark:border-teal-800">
                                {tpl.category}
                            </span>
                        </div>
                    }>
                        <div className="space-y-4">
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Standard Operating Procedure ({tpl.estimatedHours} Hours Budgeted)</p>
                            <div className="space-y-2">
                                {tpl.steps.map((step, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/30 rounded-xl border border-gray-100 dark:border-slate-700 group hover:border-teal-500 transition-colors">
                                        <div className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 flex items-center justify-center text-[10px] font-bold text-gray-400 group-hover:text-teal-500">
                                            {idx + 1}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">{step}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                                    Deploy to Client
                                </button>
                                <button className="px-4 py-2.5 bg-zinc-100 dark:bg-slate-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold uppercase tracking-widest">
                                    Modify SOP
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
                
                <button className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 hover:border-teal-500 hover:bg-teal-50/10 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-teal-900 transition-colors">
                        <span className="text-2xl font-bold text-gray-400 group-hover:text-teal-600">+</span>
                    </div>
                    <span className="text-sm font-bold text-gray-500 group-hover:text-teal-600 uppercase tracking-widest">Architect New Workflow</span>
                </button>
            </div>
        </ModuleContainer>
    );
};
