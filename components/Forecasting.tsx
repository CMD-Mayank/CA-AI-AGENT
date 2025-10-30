import React, { useState, useCallback } from 'react';
import { runChatStream } from '../services/geminiService';
import { ModuleContainer } from './common/ModuleContainer';
import { Card } from './common/Card';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { AIResponseStream } from './common/AIResponseStream';

const Forecasting: React.FC = () => {
    const [formData, setFormData] = useState({
        revenue: '500000',
        cogs: '200000',
        opex: '150000',
    });
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        setResponse('');

        const prompt = `
        Act as a senior financial analyst.
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
    }, [isLoading, formData]);


    return (
        <ModuleContainer
            title="Financial Forecasting"
            description="Generate a 6-month profit and loss forecast based on your current financials."
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card title="Enter Monthly Figures">
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
