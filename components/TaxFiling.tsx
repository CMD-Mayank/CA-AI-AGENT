import React, { useState, useCallback } from 'react';
import { runChatStream } from '../services/geminiService';
import { ModuleContainer } from './common/ModuleContainer';
import { Card } from './common/Card';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { AIResponseStream } from './common/AIResponseStream';

const TaxFiling: React.FC = () => {
  const [formData, setFormData] = useState({
    income: '1800000',
    deductions80c: '150000',
    deductions80d: '25000',
    hra: '100000',
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
      Act as an expert Indian Chartered Accountant for the Assessment Year 2024-25 (Financial Year 2023-24).
      Calculate the income tax liability based on the following details:
      - Gross Salary Income: ₹${formData.income}
      - 80C Deductions (e.g., PPF, ELSS): ₹${formData.deductions80c}
      - 80D Deductions (Medical Insurance): ₹${formData.deductions80d}
      - HRA Exemption Claimed: ₹${formData.hra}

      Provide a detailed, step-by-step breakdown of the calculation under BOTH the Old Tax Regime and the New Tax Regime.
      Conclude with a clear recommendation on which regime is more beneficial and state the total tax savings.
      Format the entire response using clear headings and markdown.
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
      title="Tax Filing & Optimization"
      description="Calculate your tax liability under both old and new regimes to find the most beneficial option."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card title="Enter Your Financials">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Annual Salary Income (₹)" name="income" type="number" value={formData.income} onChange={handleChange} required />
              <Input label="80C Deductions (₹)" name="deductions80c" type="number" value={formData.deductions80c} onChange={handleChange} required />
              <Input label="80D Deductions (₹)" name="deductions80d" type="number" value={formData.deductions80d} onChange={handleChange} required />
              <Input label="HRA Exemption (₹)" name="hra" type="number" value={formData.hra} onChange={handleChange} required />
              <div className="pt-2">
                <Button type="submit" isLoading={isLoading}>
                  Calculate Tax
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

export default TaxFiling;
