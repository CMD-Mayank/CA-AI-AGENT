
import React, { useEffect, useState } from 'react';
import { ModuleContainer } from './common/ModuleContainer';
import { Client, ClientDocument } from '../types';
import { DocumentIcon } from './icons/DocumentIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { MailIcon } from './icons/MailIcon';
import { ShareIcon } from './icons/ShareIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { SignatureIcon } from './icons/SignatureIcon';
import { generateDocumentPDF } from '../services/pdfGenerator';
import { storageService } from '../services/storage';

interface DocumentsProps {
    client: Client;
    firmId: string | null;
}

export const Documents: React.FC<DocumentsProps> = ({ client, firmId }) => {
    const [documents, setDocuments] = useState<ClientDocument[]>([]);
    const [previewDoc, setPreviewDoc] = useState<ClientDocument | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, [client.id]);

    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const docs = await storageService.getDocumentsForClient(client.id);
            setDocuments(docs);
            
            if (previewDoc) {
                const updated = docs.find(d => d.id === previewDoc.id);
                if (updated) setPreviewDoc(updated);
            }
        } catch (e) {
            console.error(e);
        }
        setIsLoading(false);
    };

    const updateDocStatus = async (doc: ClientDocument, status: ClientDocument['status']) => {
        try {
            const userEmail = await storageService.getUserEmail();
            const updatedDoc: ClientDocument = { ...doc, status };
            
            if (status === 'Signed') {
                updatedDoc.signedBy = userEmail || 'Partner';
                updatedDoc.signedAt = Date.now();
            }

            await storageService.updateDocument(updatedDoc);
            fetchDocuments(); 
            
        } catch (error: any) {
            alert('Error updating status: ' + error.message);
        }
    };

    const handleDownload = (doc: ClientDocument) => {
        const firmProfile = storageService.getFirmProfile();
        generateDocumentPDF(doc, firmProfile || undefined, client);
    };
    
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this record?')) return;
        
        try {
            await storageService.deleteDocument(id);
            setDocuments(prev => prev.filter(d => d.id !== id));
            if (previewDoc?.id === id) setPreviewDoc(null);
            
        } catch (error: any) {
            alert('Delete failed: ' + error.message);
        }
    };

    const handleEmail = (doc: ClientDocument) => {
        const subject = `Important Document: ${doc.title}`;
        const body = `Dear ${client.name},\n\nPlease find attached: ${doc.title}`;
        const mailtoLink = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    };
    
    const handleWhatsApp = (doc: ClientDocument) => {
        const text = `Hello ${client.name}, sharing your *${doc.title}*.`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
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
            title="Client Records" 
            description={`Secure storage for ${client.name}.`}
        >
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
                {/* Document List */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex justify-between">
                        <h3 className="font-semibold text-gray-700 dark:text-slate-200">Files ({documents.length})</h3>
                        {isLoading && <span className="text-xs text-gray-400">Loading...</span>}
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {documents.length === 0 && !isLoading && (
                            <div className="text-center p-8 text-gray-500 dark:text-slate-400 text-sm">
                                No documents found.
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
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getStatusColor(doc.status || 'Draft')}`}>
                                                {doc.status || 'Draft'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1">{new Date(doc.createdAt).toLocaleDateString()}</p>
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
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(previewDoc.status || 'Draft')}`}>
                                        {previewDoc.status || 'Draft'}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {(!previewDoc.status || previewDoc.status === 'Draft') && (
                                        <button onClick={() => updateDocStatus(previewDoc, 'Pending Review')} className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded">Submit</button>
                                    )}
                                    {previewDoc.status === 'Pending Review' && (
                                        <button onClick={() => updateDocStatus(previewDoc, 'Approved')} className="px-3 py-1.5 bg-teal-600 text-white text-xs rounded">Approve</button>
                                    )}
                                    {previewDoc.status === 'Approved' && (
                                        <button onClick={() => updateDocStatus(previewDoc, 'Signed')} className="px-3 py-1.5 bg-green-600 text-white text-xs rounded">Sign</button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Utility Bar */}
                            <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700 flex gap-2 bg-white dark:bg-slate-800 overflow-x-auto">
                                <button onClick={() => handleEmail(previewDoc)} className="action-btn flex items-center gap-1 px-3 py-1.5 rounded border text-xs"><MailIcon className="w-3 h-3" /> Email</button>
                                <button onClick={() => handleWhatsApp(previewDoc)} className="action-btn flex items-center gap-1 px-3 py-1.5 rounded border text-xs"><WhatsAppIcon className="w-3 h-3" /> WhatsApp</button>
                                <button onClick={() => handleDownload(previewDoc)} className="action-btn flex items-center gap-1 px-3 py-1.5 rounded border text-xs ml-auto"><DownloadIcon className="w-3 h-3" /> PDF</button>
                                <button onClick={() => handleDelete(previewDoc.id)} className="action-btn px-3 py-1.5 rounded text-xs text-red-600 hover:bg-red-50">Delete</button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-slate-900">
                                <div className="bg-white dark:bg-slate-800 p-8 shadow-sm min-h-full border border-gray-200 dark:border-slate-700 relative">
                                    {previewDoc.status === 'Signed' && (
                                        <div className="absolute top-4 right-4 border-2 border-green-600 text-green-600 px-3 py-1 rounded opacity-80 rotate-[-10deg]">
                                            <div className="font-bold text-xs">SIGNED</div>
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
                            <p>Select a document from the list</p>
                        </div>
                    )}
                </div>
             </div>
        </ModuleContainer>
    );
};
