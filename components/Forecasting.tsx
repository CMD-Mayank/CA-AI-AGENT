
import React, { useState, useCallback, useEffect } from 'react';
import { runChatStream } from '../services/geminiService';
import { ModuleContainer } from './common/ModuleContainer';
import { Card } from './common/Card';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { AIResponseStream } from './common/AIResponseStream';
import { Client } from '../types';
import { storageService } from '../services/storage';
import { CloudUploadIcon } from './icons/CloudUploadIcon';

interface ForecastingProps {
    client: Client;
}

const Forecasting: React.FC<ForecastingProps> = ({ client }) => {
    const [formData, setFormData] = useState({
        revenue: '500000',
        cogs: '200000',
        opex: '150000',
    });
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    
    useEffect(() => {
        const savedState = storageService.getModuleState(client.id, 'Forecasting');
        if (savedState) {
            if (savedState.formData) setFormData(savedState.formData);
            if (savedState.response) setResponse(savedState.response);
        } else {
             setFormData({ revenue: '500000', cogs: '200000', opex: '150000' });
             setResponse('');
        }
    }, [client.id]);

    useEffect(() => {
         const timeout = setTimeout(() => {
             if(formData.revenue !== '500000' || response) {
                 storageService.saveModuleState(client.id, 'Forecasting', { formData, response });
             }
        }, 1000);
        return () => clearTimeout(timeout);
    }, [formData, response, client.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImport = () => {
        setIsImporting(true);
        // Simulate import from CSV
        setTimeout(() => {
             const importedData = {
                revenue: (Math.floor(Math.random() * 800000) + 500000).toString(),
                cogs: (Math.floor(Math.random() * 300000) + 150000).toString(),
                opex: (Math.floor(Math.random() * 200000) + 100000).toString(),
            };
            setFormData(importedData);
            setIsImporting(false);
            
            storageService.logActivity({
              id: Date.now().toString(),
              clientId: client.id,
              clientName: client.name,
              action: 'Data Import',
              timestamp: Date.now(),
              details: 'Imported historical data for forecasting'
          });
        }, 1500);
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        setResponse('');

        const prompt = `
        Act as a senior financial analyst for Client: ${client.name} (${client.industry}).
        A business provides the following current monthly financial data:
        - Monthly Revenue: ₹${formData.revenue}
        - Monthly Cost of Goods Sold (COGS): ₹${formData.cogs}
        - Monthly Operating Expenses (OPEX): ₹${formData.opex}

        Based on these figures, perform the following tasks:
        1. Assume a conservative monthly revenue growth of 2% and a 1% monthly increase in both COGS and OPEX.
        2. Generate a 6-month Profit and Loss (P&L) forecast.
        3. Present the forecast in a clean markdown table with columns for: Month, Revenue, COGS, Gross Profit, OPEX, and Net Profit.
        4. After the table, provide 2-3 key strategic insights or observations based on the forecast.
        Format the response using clear headings and markdown.
        `;

        try {
            const stream = runChatStream(prompt);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setResponse(fullResponse);
            }
        } catch (error) {
            setResponse('An error occurred while communicating with the AI. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, formData, client]);


    return (
        <ModuleContainer
            title="Financial Forecasting"
            description={`Generate projected financials for ${client.name}.`}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Monthly Data</h3>
                            <button 
                                onClick={handleImport}
                                disabled={isImporting}
                                className="text-xs flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:text-teal-800 border border-teal-100 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded transition-colors"
                            >
                                {isImporting ? (
                                    <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></span>
                                ) : (
                                    <CloudUploadIcon className="w-3 h-3" />
                                )}
                                Import CSV
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input label="Monthly Revenue (₹)" name="revenue" type="number" value={formData.revenue} onChange={handleChange} required />
                            <Input label="Monthly COGS (₹)" name="cogs" type="number" value={formData.cogs} onChange={handleChange} required />
                            <Input label="Monthly Operating Expenses (₹)" name="opex" type="number" value={formData.opex} onChange={handleChange} required />
                            <div className="pt-2">
                                <Button type="submit" isLoading={isLoading}>
                                    Generate Forecast
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <AIResponseStream response={response} isLoading={isLoading} />
                </div>
            </div>
        </ModuleContainer>
    );
};

export default Forecasting;
