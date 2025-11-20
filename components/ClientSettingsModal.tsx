
import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { GlobeIcon } from './icons/GlobeIcon';

interface ClientSettingsModalProps {
    client: Client;
    onClose: () => void;
    onUpdate: (client: Client) => void;
    onDelete: (clientId: string) => void;
}

export const ClientSettingsModal: React.FC<ClientSettingsModalProps> = ({ client, onClose, onUpdate, onDelete }) => {
    const [formData, setFormData] = useState<Client>(client);
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [portalEnabled, setPortalEnabled] = useState(false);

    useEffect(() => {
        setFormData(client);
    }, [client]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            onUpdate(formData);
            setIsLoading(false);
            onClose();
        }, 800);
    };
    
    const handleDelete = () => {
        onDelete(client.id);
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-slate-700">
                {!showDeleteConfirm ? (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Client</h2>
                            <button onClick={() => setShowDeleteConfirm(true)} className="text-red-600 hover:text-red-800 text-sm font-semibold">
                                Delete Client
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input 
                                label="Client Name" 
                                name="name"
                                value={formData.name} 
                                onChange={handleChange}
                                required
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
                                value={formData.pan} 
                                onChange={handleChange}
                                required
                            />
                            <Input 
                                label="Industry / Sector" 
                                name="industry"
                                value={formData.industry} 
                                onChange={handleChange}
                                required
                            />
                            
                            {/* Client Portal Settings */}
                            <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <GlobeIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Client Portal Access</p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">Allow client to view shared docs</p>
                                        </div>
                                    </div>
                                    <div className="relative inline-block w-12 align-middle select-none">
                                        <input 
                                            type="checkbox" 
                                            checked={portalEnabled}
                                            onChange={() => setPortalEnabled(!portalEnabled)}
                                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 ease-in-out"
                                            style={{ right: portalEnabled ? '0' : '1.5rem', borderColor: portalEnabled ? '#0d9488' : '#d1d5db' }}
                                        />
                                        <div className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${portalEnabled ? 'bg-teal-600' : 'bg-gray-300'}`}></div>
                                    </div>
                                </div>
                                {portalEnabled && (
                                    <div className="mt-3 pt-3 border-t border-teal-200 dark:border-teal-800">
                                        <p className="text-xs text-teal-800 dark:text-teal-200 mb-2">Invite Link:</p>
                                        <div className="flex gap-2">
                                            <input readOnly value={`https://portal.firm.com/invite/${client.id}`} className="flex-1 text-xs bg-white dark:bg-slate-800 p-1.5 rounded border border-teal-200 dark:border-teal-800 text-gray-600 dark:text-slate-300" />
                                            <button type="button" className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline">Copy</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <div className="flex-1">
                                    <Button type="submit" isLoading={isLoading}>Save Changes</Button>
                                </div>
                            </div>
                        </form>
                    </>
                ) : (
                     <div className="text-center py-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Client?</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Are you sure you want to delete <strong>{client.name}</strong>? <br/>
                            All chat history, documents, and invoices for this client will be permanently removed.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Yes, Delete
                            </button>
                        </div>
                     </div>
                )}
            </div>
        </div>
    );
};
