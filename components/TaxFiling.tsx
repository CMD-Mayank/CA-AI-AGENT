
import React, { useState, useCallback, useEffect } from 'react';
import { runChatStream } from '../services/geminiService';
import { ModuleContainer } from './common/ModuleContainer';
import { Card } from './common/Card';
import { Input } from './common/Input';
import { Button } from './common/Button';
import { AIResponseStream } from './common/AIResponseStream';
import { Client, FirmProfile, ClientDocument } from '../types';
import { storageService } from '../services/storage';
import { CloudUploadIcon } from './icons/CloudUploadIcon';

interface TaxFilingProps {
    client: Client;
    firmProfile?: FirmProfile;
}

const TaxFiling: React.FC<TaxFilingProps> = ({ client, firmProfile }) => {
  const [formData, setFormData] = useState({
    income: '1800000',
    deductions80c: '150000',
    deductions80d: '25000',
    hra: '100000',
  });
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isImporting, setIsImporting] = useState(false);

  // Load Saved State
  useEffect(() => {
      const savedState = storageService.getModuleState(client.id, 'TaxFiling');
      if (savedState) {
          if (savedState.formData) setFormData(savedState.formData);
          if (savedState.response) setResponse(savedState.response);
      } else {
          // Reset if no saved state for this client
           setFormData({
            income: '1800000',
            deductions80c: '150000',
            deductions80d: '25000',
            hra: '100000',
          });
          setResponse('');
      }
  }, [client.id]);

  // Auto-Save Effect
  useEffect(() => {
      const timeout = setTimeout(() => {
          if (formData.income !== '1800000' || response) {
             storageService.saveModuleState(client.id, 'TaxFiling', { formData, response });
          }
      }, 1000);
      return () => clearTimeout(timeout);
  }, [formData, response, client.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImport = () => {
      setIsImporting(true);
      // Simulate reading a complex Tally XML or CSV file
      setTimeout(() => {
          const importedData = {
              income: (Math.floor(Math.random() * 5000000) + 1500000).toString(),
              deductions80c: '150000',
              deductions80d: '55000',
              hra: '240000'
          };
          setFormData(importedData);
          setIsImporting(false);
          
          storageService.logActivity({
              id: Date.now().toString(),
              clientId: client.id,
              clientName: client.name,
              action: 'Data Import',
              timestamp: Date.now(),
              details: 'Imported financials from external source (CSV)'
          });
      }, 1500);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setResponse('');

    const prompt = `
      Act as a Chartered Accountant computing tax for Client: ${client.name} (${client.type}).
      PAN: ${client.pan}.
      Assessment Year 2024-25.
      
      Financials Provided:
      - Gross Total Income: ₹${formData.income}
      - 80C: ₹${formData.deductions80c}
      - 80D: ₹${formData.deductions80d}
      - HRA: ₹${formData.hra}

      Task:
      1. Generate a comparative Computation of Total Income (New Regime vs Old Regime).
      2. Recommend the most beneficial regime for this specific client type (${client.type}).
      3. Draft a professional email to the client explaining the tax liability and savings.
      
      Format: Professional markdown with tables.
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

  const handleSaveRecord = async () => {
      if (!response) return;
      
      setSaveStatus('saving');
      
      let header = '';
      if (firmProfile && firmProfile.name) {
          header += `${firmProfile.name.toUpperCase()}\n`;
          if (firmProfile.frn) header += `FRN: ${firmProfile.frn}\n`;
          if (firmProfile.address) header += `${firmProfile.address}\n`;
          header += `${'-'.repeat(50)}\n`;
      }
      
      const content = `${header}TAX COMPUTATION REPORT\n\nClient: ${client.name}\nPAN: ${client.pan}\nDate: ${new Date().toLocaleDateString()}\n\n${response}`;
      const userEmail = await storageService.getUserEmail();
      
      const newDoc: ClientDocument = {
          id: Date.now().toString(),
          clientId: client.id,
          title: `Tax Computation ${new Date().getFullYear()}`,
          type: 'Tax Report',
          content: content,
          createdAt: Date.now(),
          createdBy: userEmail || 'Admin',
          status: 'Draft' // Default to Draft for workflow
      };
      
      setTimeout(() => {
          storageService.saveDocument(newDoc);
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
      }, 800);
  };

  return (
    <ModuleContainer
      title="Tax Computation Workpaper"
      description="Prepare and analyze tax liability for client filings. Changes are auto-saved."
    >
      <div className="mb-6 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-lg flex items-center justify-between">
          <div>
              <p className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide">Client File</p>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">{client.name}</h3>
          </div>
          <div className="text-right flex flex-col items-end">
               <div className="flex items-center gap-2">
                 <span className="text-sm text-gray-600 dark:text-slate-300 font-mono">{client.pan}</span>
                 {response && (
                     <button 
                        onClick={handleSaveRecord}
                        disabled={saveStatus !== 'idle'}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded border text-xs font-medium shadow-sm transition-all ${
                            saveStatus === 'saved' 
                            ? 'bg-green-600 text-white border-green-600' 
                            : 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-slate-600 hover:bg-teal-50'
                        }`} 
                        title="Save to Client Records"
                     >
                        {saveStatus === 'saving' && <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full mr-1"></span>}
                        {saveStatus === 'saved' ? 'Saved to Records!' : 'Save as Draft'}
                     </button>
                 )}
               </div>
               <span className="inline-block px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-xs font-semibold shadow-sm text-gray-500 border border-gray-200 dark:border-slate-600 mt-2">{client.type}</span>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Financials</h3>
                <button 
                    onClick={handleImport}
                    disabled={isImporting}
                    className="text-xs flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:text-teal-800 border border-teal-100 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded transition-colors"
                    title="Import from Excel/JSON/XML"
                >
                    {isImporting ? (
                         <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></span>
                    ) : (
                        <CloudUploadIcon className="w-3 h-3" />
                    )}
                    Smart Import
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Gross Total Income (₹)" name="income" type="number" value={formData.income} onChange={handleChange} required />
              <Input label="80C Deductions (₹)" name="deductions80c" type="number" value={formData.deductions80c} onChange={handleChange} required />
              <Input label="80D Deductions (₹)" name="deductions80d" type="number" value={formData.deductions80d} onChange={handleChange} required />
              <Input label="HRA Exemption (₹)" name="hra" type="number" value={formData.hra} onChange={handleChange} required />
              <div className="pt-2">
                <Button type="submit" isLoading={isLoading}>
                  Generate Computation
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
