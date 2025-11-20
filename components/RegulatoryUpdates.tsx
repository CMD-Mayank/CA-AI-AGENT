
import React, { useState } from 'react';
import { ModuleContainer } from './common/ModuleContainer';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { runChatStream } from '../services/geminiService';
import { AIResponseStream } from './common/AIResponseStream';

// Mock Data for Demonstrating a Live Feed
const UPDATES = [
    {
        id: '1',
        date: '2024-10-24',
        category: 'GST',
        title: 'Notification No. 56/2024 - Central Tax',
        summary: 'Extension of due date for filing GSTR-9 and GSTR-9C for FY 2023-24.',
        impactLevel: 'High'
    },
    {
        id: '2',
        date: '2024-10-22',
        category: 'Income Tax',
        title: 'CBDT Circular No. 13/2024',
        summary: 'Clarification regarding applicability of Section 43B(h) for payments to MSMEs.',
        impactLevel: 'Critical'
    },
    {
        id: '3',
        date: '2024-10-20',
        category: 'MCA',
        title: 'Companies (Accounts) Amendment Rules, 2024',
        summary: 'New disclosure requirements for CSR spending in Board Report.',
        impactLevel: 'Medium'
    }
];

export const RegulatoryUpdates: React.FC = () => {
    const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>(null);
    const [analysisText, setAnalysisText] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const analyzeImpact = async (update: typeof UPDATES[0]) => {
        setActiveAnalysisId(update.id);
        setIsAnalyzing(true);
        setAnalysisText('');

        const prompt = `
            You are a Senior Tax Partner. Analyze this regulatory update:
            "${update.title}: ${update.summary}"

            Explain the practical implications for my clients, specifically:
            1. Manufacturing & Trading entities (MSME context)
            2. Service Providers
            
            Provide a brief, bulleted "Action Plan" for the firm to ensure compliance.
        `;

        try {
            const stream = runChatStream(prompt);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setAnalysisText(fullResponse);
            }
        } catch (error) {
            setAnalysisText("Error generating analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <ModuleContainer 
            title="Knowledge Bank" 
            description="Live regulatory updates, circulars, and AI-powered impact analysis."
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Feed Column */}
                <div className="lg:col-span-2 space-y-4">
                    {UPDATES.map(update => (
                        <div key={update.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                                    update.category === 'GST' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                    update.category === 'Income Tax' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                }`}>
                                    {update.category}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-slate-400">{update.date}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{update.title}</h3>
                            <p className="text-gray-600 dark:text-slate-300 text-sm mb-4">{update.summary}</p>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${
                                        update.impactLevel === 'Critical' ? 'bg-red-500' : 'bg-yellow-500'
                                    }`}></span>
                                    <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Impact: {update.impactLevel}</span>
                                </div>
                                <button 
                                    onClick={() => analyzeImpact(update)}
                                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-sm font-semibold flex items-center gap-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    Analyze Impact
                                </button>
                            </div>
                            
                            {activeAnalysisId === update.id && (
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 animate-fade-in">
                                    <AIResponseStream response={analysisText} isLoading={isAnalyzing} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    <Card title="Quick References">
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="#" className="flex items-center justify-between text-gray-600 dark:text-slate-300 hover:text-teal-600">
                                    <span>Cost Inflation Index (CII)</span>
                                    <span className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">348</span>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center justify-between text-gray-600 dark:text-slate-300 hover:text-teal-600">
                                    <span>Gold Rate (24k)</span>
                                    <span className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">₹76,500</span>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center justify-between text-gray-600 dark:text-slate-300 hover:text-teal-600">
                                    <span>USD / INR</span>
                                    <span className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">₹83.45</span>
                                </a>
                            </li>
                        </ul>
                    </Card>
                    
                    <div className="bg-gradient-to-br from-teal-800 to-teal-900 rounded-xl p-6 text-white shadow-lg">
                        <h3 className="font-bold text-lg mb-2">Compliance Calendar</h3>
                        <p className="text-teal-100 text-sm mb-4">Subscribe to get automated email alerts for due dates.</p>
                        <button className="w-full bg-white text-teal-900 font-semibold py-2 rounded-lg text-sm hover:bg-teal-50 transition-colors">
                            Sync with Google Calendar
                        </button>
                    </div>
                </div>
            </div>
        </ModuleContainer>
    );
};
