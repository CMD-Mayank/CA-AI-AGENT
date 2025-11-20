
import React, { useEffect, useState } from 'react';
import { ModuleContainer } from './common/ModuleContainer';
import { Client, ClientDocument } from '../types';
import { storageService } from '../services/storage';
import { DocumentIcon } from './icons/DocumentIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { MailIcon } from './icons/MailIcon';
import { ShareIcon } from './icons/ShareIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { SignatureIcon } from './icons/SignatureIcon';

interface DocumentsProps {
    client: Client;
}

export const Documents: React.FC<DocumentsProps> = ({ client }) => {
    const [documents, setDocuments] = useState<ClientDocument[]>([]);
    const [previewDoc, setPreviewDoc] = useState<ClientDocument | null>(null);

    useEffect(() => {
        const docs = storageService.getDocumentsForClient(client.id);
        setDocuments(docs);
        if (previewDoc) {
            // Update preview if status changed
            const updated = docs.find(d => d.id === previewDoc.id);
            if (updated) setPreviewDoc(updated);
        }
    }, [client.id]);

    const updateDocStatus = (doc: ClientDocument, status: ClientDocument['status']) => {
        const updatedDoc = { ...doc, status };
        
        // Handle Signature Logic
        if (status === 'Signed') {
            updatedDoc.signedBy = storageService.getUserEmail() || 'Partner';
            updatedDoc.signedAt = Date.now();
        }

        storageService.updateDocument(updatedDoc);
        
        // Refresh list
        const docs = storageService.getDocumentsForClient(client.id);
        setDocuments(docs);
        setPreviewDoc(updatedDoc);

        storageService.logActivity({
            id: Date.now().toString(),
            clientId: client.id,
            clientName: client.name,
            action: `Document ${status}`,
            timestamp: Date.now(),
            details: doc.title
        });
    };

    const handleDownload = (doc: ClientDocument) => {
        const blob = new Blob([doc.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${doc.title.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const handleEmail = (doc: ClientDocument) => {
        if (doc.status !== 'Signed' && doc.status !== 'Approved') {
            if (!confirm('Warning: This document is not yet signed/approved. Send anyway?')) return;
        }

        if (!client.email) {
            alert('Please add an email address to this client profile first.');
            return;
        }
        
        const subject = `Important Document: ${doc.title}`;
        const body = `Dear ${client.name},\n\nPlease find attached the ${doc.title} for your records.\n\nSummary of the document:\n${doc.content.substring(0, 200)}...\n\nBest Regards,\n${storageService.getFirmProfile()?.name || 'Your CA Firm'}`;
        
        const mailtoLink = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
        
        storageService.logActivity({
            id: Date.now().toString(),
            clientId: client.id,
            clientName: client.name,
            action: 'Email Drafted',
            timestamp: Date.now(),
            details: doc.title
        });
    };
    
    const handleWhatsApp = (doc: ClientDocument) => {
        if (doc.status !== 'Signed') {
            alert('Compliance Warning: You can only share Signed documents via WhatsApp.');
            return;
        }
        const text = `Hello ${client.name}, sharing your *${doc.title}*. Please review.`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleShareLink = (doc: ClientDocument) => {
        // Simulate generating a secure, expiring link
        const secureId = Math.random().toString(36).substring(2, 15);
        const fakeLink = `https://portal.firm.com/d/${secureId}?exp=24h`;
        
        navigator.clipboard.writeText(fakeLink).then(() => {
            alert(`Secure Link Copied to Clipboard!\n\n${fakeLink}\n\n(This link expires in 24 hours)`);
            
            storageService.logActivity({
                id: Date.now().toString(),
                clientId: client.id,
                clientName: client.name,
                action: 'Secure Link Generated',
                timestamp: Date.now(),
                details: `Shared: ${doc.title}`
            });
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this record?')) {
            storageService.deleteDocument(id);
            setDocuments(prev => prev.filter(d => d.id !== id));
            if (previewDoc?.id === id) setPreviewDoc(null);
        }
    };
    
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Draft': return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
            case 'Pending Review': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'Approved': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'Signed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'Rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100';
        }
    };

    return (
        <ModuleContainer 
            title="Client Records & Compliance" 
            description={`Digital filing cabinet for ${client.name}. Manage document lifecycles from Draft to Signed.`}
        >
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
                {/* Document List */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                        <h3 className="font-semibold text-gray-700 dark:text-slate-200">Files ({documents.length})</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {documents.length === 0 && (
                            <div className="text-center p-8 text-gray-500 dark:text-slate-400 text-sm">
                                No documents saved yet. <br/> Generate reports in Tax or Compliance modules.
                            </div>
                        )}
                        {documents.map(doc => (
                            <div 
                                key={doc.id}
                                onClick={() => setPreviewDoc(doc)}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                    previewDoc?.id === doc.id 
                                    ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-500 dark:border-teal-500 shadow-sm' 
                                    : 'bg-white dark:bg-slate-800 border-transparent hover:bg-gray-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 p-2 rounded ${doc.status === 'Signed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300'}`}>
                                        {doc.status === 'Signed' ? <SignatureIcon className="w-4 h-4"/> : <DocumentIcon className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate pr-2">{doc.title}</h4>
                                            {doc.status === 'Signed' && <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5"></div>}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getStatusColor(doc.status || 'Draft')}`}>
                                                {doc.status || 'Draft'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1">{new Date(doc.createdAt).toLocaleDateString()} • {doc.createdBy}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preview Pane */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
                    {previewDoc ? (
                        <>
                            {/* Action Header */}
                            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 flex-wrap gap-3">
                                <div>
                                    <h3 className="font-bold text-gray-800 dark:text-white">{previewDoc.title}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(previewDoc.status || 'Draft')}`}>
                                            {previewDoc.status || 'Draft'}
                                        </span>
                                        <span className="text-xs text-gray-500">{previewDoc.id}</span>
                                    </div>
                                </div>
                                
                                {/* Maker-Checker Workflow Actions */}
                                <div className="flex items-center gap-2">
                                    {(!previewDoc.status || previewDoc.status === 'Draft') && (
                                        <button 
                                            onClick={() => updateDocStatus(previewDoc, 'Pending Review')}
                                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded transition-colors shadow-sm"
                                        >
                                            Submit for Review
                                        </button>
                                    )}

                                    {previewDoc.status === 'Pending Review' && (
                                        <>
                                            <button 
                                                onClick={() => updateDocStatus(previewDoc, 'Draft')} // Reject to Draft
                                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-medium rounded transition-colors"
                                            >
                                                Reject
                                            </button>
                                            <button 
                                                onClick={() => updateDocStatus(previewDoc, 'Approved')}
                                                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded transition-colors shadow-sm"
                                            >
                                                Approve
                                            </button>
                                        </>
                                    )}

                                    {previewDoc.status === 'Approved' && (
                                        <button 
                                            onClick={() => updateDocStatus(previewDoc, 'Signed')}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors shadow-sm"
                                        >
                                            <SignatureIcon className="w-3 h-3" />
                                            Digitally Sign
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Utility Bar */}
                            <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700 flex gap-2 bg-white dark:bg-slate-800 overflow-x-auto">
                                <button onClick={() => handleShareLink(previewDoc)} className="action-btn flex items-center gap-1 px-3 py-1.5 rounded border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-xs text-gray-700 dark:text-slate-300">
                                    <ShareIcon className="w-3 h-3" /> Link
                                </button>
                                <button onClick={() => handleEmail(previewDoc)} className="action-btn flex items-center gap-1 px-3 py-1.5 rounded border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-xs text-gray-700 dark:text-slate-300">
                                    <MailIcon className="w-3 h-3" /> Email
                                </button>
                                <button onClick={() => handleWhatsApp(previewDoc)} className="action-btn flex items-center gap-1 px-3 py-1.5 rounded border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
                                    <WhatsAppIcon className="w-3 h-3" /> WhatsApp
                                </button>
                                <button onClick={() => handleDownload(previewDoc)} className="action-btn flex items-center gap-1 px-3 py-1.5 rounded border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-xs text-gray-700 dark:text-slate-300 ml-auto">
                                    <DownloadIcon className="w-3 h-3" /> Download
                                </button>
                                <button onClick={() => handleDelete(previewDoc.id)} className="action-btn px-3 py-1.5 rounded text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                    Delete
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-slate-900">
                                <div className="bg-white dark:bg-slate-800 p-8 shadow-sm min-h-full border border-gray-200 dark:border-slate-700 relative">
                                    {previewDoc.status === 'Signed' && (
                                        <div className="absolute top-4 right-4 border-2 border-green-600 text-green-600 dark:text-green-400 dark:border-green-400 px-3 py-1 rounded opacity-80 transform rotate-[-10deg] flex flex-col items-center justify-center pointer-events-none">
                                            <div className="flex items-center gap-1 font-bold text-xs uppercase tracking-widest">
                                                <SignatureIcon className="w-3 h-3" />
                                                Digitally Signed
                                            </div>
                                            <span className="text-[8px] font-mono mt-0.5">{previewDoc.signedBy}</span>
                                            <span className="text-[8px] font-mono">{new Date(previewDoc.signedAt || 0).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-slate-300">
                                        {previewDoc.content}
                                    </pre>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400 flex-col p-8">
                            <DocumentIcon className="w-16 h-16 opacity-20 mb-4" />
                            <p>Select a document to manage compliance workflow</p>
                        </div>
                    )}
                </div>
             </div>
        </ModuleContainer>
    );
};
