import React, { useState, useEffect } from 'react';
import { runChatStream } from '../services/geminiService';
import { ModuleContainer } from './common/ModuleContainer';
import { Card } from './common/Card';
import { SparklesIcon } from './icons/SparklesIcon';

interface KPI {
    metric: string;
    value: string;
    change: string;
}

interface Alert {
    title: string;
    severity: 'High' | 'Medium' | 'Low';
}

const Dashboard: React.FC = () => {
    const [kpis, setKpis] = useState<KPI[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            const prompt = `
                Generate a summary dashboard for a mid-sized Indian enterprise for the current quarter.
                Provide the response as a single, clean JSON object.
                The JSON object should have two keys: "kpis" and "alerts".
                - "kpis": An array of 4 objects, each with "metric" (e.g., 'Revenue Growth'), "value" (e.g., '₹1.2 Cr'), and "change" (e.g., '+5.2%').
                - "alerts": An array of 3 objects, each with "title" (e.g., 'Advance Tax Payment Due') and "severity" ('High', 'Medium', or 'Low').
                Do not include any markdown formatting or introductory text.
            `;

            try {
                let fullResponse = '';
                const stream = runChatStream(prompt);
                for await (const chunk of stream) {
                    fullResponse += chunk;
                }
                
                // Clean the response to ensure it's valid JSON
                const jsonString = fullResponse.replace(/```json|```/g, '').trim();
                const data = JSON.parse(jsonString);
                
                if (data.kpis && data.alerts) {
                    setKpis(data.kpis);
                    setAlerts(data.alerts);
                }

            } catch (error) {
                console.error("Failed to parse dashboard data:", error);
                // Set some fallback data on error
                setKpis([
                    { metric: 'Error', value: 'N/A', change: 'N/A' }
                ]);
                 setAlerts([
                    { title: 'Failed to load AI data', severity: 'High' }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getSeverityColor = (severity: Alert['severity']) => {
        switch (severity) {
            case 'High': return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-500/50';
            case 'Medium': return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border-yellow-500/50';
            case 'Low': return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-blue-500/50';
            default: return 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300';
        }
    };
    
    if (isLoading) {
        return (
             <ModuleContainer title="Dashboard" description="A real-time overview of your financial health and compliance status.">
                 <div className="text-center py-16">
                    <SparklesIcon className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">Generating AI-powered dashboard...</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Please wait a moment.</p>
                </div>
            </ModuleContainer>
        )
    }

    return (
        <ModuleContainer title="Dashboard" description="A real-time overview of your financial health and compliance status.">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {kpis.map((kpi, index) => (
                    <Card key={index}>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">{kpi.metric}</h4>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{kpi.value}</p>
                        <p className={`text-sm font-semibold mt-1 ${kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{kpi.change}</p>
                    </Card>
                ))}
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Compliance Alerts</h3>
             <div className="space-y-4">
                 {alerts.map((alert, index) => (
                    <div key={index} className={`p-4 rounded-lg flex items-center border-l-4 ${getSeverityColor(alert.severity)}`}>
                        <div className="flex-shrink-0">
                             <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${getSeverityColor(alert.severity)}`}>{alert.severity[0]}</span>
                        </div>
                        <div className="ml-4">
                            <p className="font-semibold">{alert.title}</p>
                        </div>
                    </div>
                ))}
            </div>
        </ModuleContainer>
    );
};

export default Dashboard;
