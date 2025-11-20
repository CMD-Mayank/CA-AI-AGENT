
import React, { useState } from 'react';
import { Client } from '../types';
import { Button } from './common/Button';
import { Input } from './common/Input';

interface AddClientModalProps {
    onClose: () => void;
    onSave: (client: Client) => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Client>>({
        type: 'Individual'
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simulate delay
        setTimeout(() => {
            const newClient: Client = {
                id: Date.now().toString(),
                name: formData.name || 'New Client',
                type: formData.type as 'Individual' | 'Company' | 'LLP',
                pan: formData.pan || 'XXXXX1234X',
                industry: formData.industry || 'General'
            };
            onSave(newClient);
            setIsLoading(false);
            onClose();
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Client</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input 
                        label="Client Name" 
                        name="name"
                        value={formData.name || ''} 
                        onChange={handleChange}
                        required
                        placeholder="e.g. Global Tech Solutions"
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Entity Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full p-3 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-sm text-gray-900 dark:text-white"
                        >
                            <option value="Individual">Individual</option>
                            <option value="Company">Company (Pvt Ltd/Ltd)</option>
                            <option value="LLP">LLP</option>
                        </select>
                    </div>
                    <Input 
                        label="PAN Number" 
                        name="pan"
                        value={formData.pan || ''} 
                        onChange={handleChange}
                        required
                        placeholder="ABCDE1234F"
                        maxLength={10}
                    />
                    <Input 
                        label="Industry / Sector" 
                        name="industry"
                        value={formData.industry || ''} 
                        onChange={handleChange}
                        required
                        placeholder="e.g. Retail, IT Services"
                    />
                    
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <div className="flex-1">
                            <Button type="submit" isLoading={isLoading}>Save Client</Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
