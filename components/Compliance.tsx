
import React, { useState, useCallback, useEffect } from 'react';
import { runChatStream } from '../services/geminiService';
import { ModuleContainer } from './common/ModuleContainer';
import { Card } from './common/Card';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { AIResponseStream } from './common/AIResponseStream';
import { Client } from '../types';
import { storageService } from '../services/storage';

interface ComplianceProps {
    client: Client;
}

const Compliance: React.FC<ComplianceProps> = ({ client }) => {
    const [formData, setFormData] = useState({
        gstr1: '5000000',
        gstr3b: '4850000',
    });
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const savedState = storageService.getModuleState(client.id, 'Compliance');
        if (savedState) {
            if (savedState.formData) setFormData(savedState.formData);
            if (savedState.response) setResponse(savedState.response);
        } else {
             setFormData({ gstr1: '5000000', gstr3b: '4850000' });
             setResponse('');
        }
    }, [client.id]);

    useEffect(() => {
         const timeout = setTimeout(() => {
            if(formData.gstr1 !== '5000000' || response) {
                storageService.saveModuleState(client.id, 'Compliance', { formData, response });
            }
        }, 1000);
        return () => clearTimeout(timeout);
    }, [formData, response, client.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        setResponse('');

        const prompt = `
        Act as an expert Indian GST practitioner for Client: ${client.name}.
        A business has the following figures for a specific tax period:
        - Total Taxable Turnover as per GSTR-1: ₹${formData.gstr1}
        - Total Taxable Turnover as per GSTR-3B: ₹${formData.gstr3b}

        Analyze this situation in detail.
        1. Identify the discrepancy amount.
        2. Explain the potential reasons for such a mismatch.
        3. Describe the serious implications and consequences, including potential notices (like DRC-01B), interest, and penalties.
        4. Provide a clear, step-by-step action plan for the business to reconcile the difference and ensure future compliance.
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
            title="GST, TDS & ROC Compliance"
            description={`Compliance check and notice drafting for ${client.name}.`}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card title="GST Reconciliation Checker">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input label="Turnover as per GSTR-1 (₹)" name="gstr1" type="number" value={formData.gstr1} onChange={handleChange} required />
                            <Input label="Turnover as per GSTR-3B (₹)" name="gstr3b" type="number" value={formData.gstr3b} onChange={handleChange} required />
                            <div className="pt-2">
                                <Button type="submit" isLoading={isLoading}>
                                    Analyze Discrepancy
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

export default Compliance;
