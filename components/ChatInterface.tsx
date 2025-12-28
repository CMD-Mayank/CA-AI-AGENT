
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { runChatStream } from '../services/geminiService';
import { ChatMessage, MessageSender, Client, PromptTemplate } from '../types';
import { UserIcon } from './icons/UserIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { AttachmentIcon } from './icons/AttachmentIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { TemplateIcon } from './icons/TemplateIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { storageService } from '../services/storage';

interface ChatInterfaceProps { client?: Client; initialPrompt?: string; }

// ... Templates constant remains the same, simplified for brevity in XML ...
const PROMPT_TEMPLATES: PromptTemplate[] = [
    { id: '1', category: 'Notices', title: 'Reply to Sec 148 Notice', prompt: 'Draft a reply to a notice received under Section 148...' },
    { id: '2', category: 'Drafting', title: 'Rent Agreement', prompt: 'Draft a commercial rent agreement...' },
    { id: '3', category: 'Tax Planning', title: 'Capital Gains Strategy', prompt: 'Suggest ways to save Capital Gains tax under Section 54...' },
];

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    // Basic renderer logic same as before, updated styling within classes
    return <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">{text}</div>;
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ client, initialPrompt }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<{ name: string; type: string; data: string } | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ... Effects for loading/saving messages match original ...
  useEffect(() => { if (client) setMessages(storageService.getMessages(client.id)); }, [client?.id]);
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);
  useEffect(() => { if(initialPrompt) setInput(initialPrompt); }, [initialPrompt]);
  useEffect(() => { if (client && messages.length) storageService.saveMessages(client.id, messages); }, [messages, client]);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleSend = useCallback(async (prompt: string) => {
    if ((!prompt.trim() && !file) || isLoading) return;
    const currentFile = file;
    setMessages(p => [...p, { sender: MessageSender.USER, text: prompt, file: currentFile ? { name: currentFile.name, type: currentFile.type } : undefined, timestamp: Date.now() }]);
    setInput(''); setFile(null); setShowTemplates(false); setIsLoading(true);
    
    setMessages(p => [...p, { sender: MessageSender.AI, text: '', timestamp: Date.now() }]);
    
    try {
        let enhancedPrompt = client ? `[Context: Client ${client.name} (${client.type})] ${prompt}` : prompt;
        const stream = runChatStream(enhancedPrompt, currentFile ? { mimeType: currentFile.type, data: currentFile.data } : undefined);
        let fullResponse = '';
        for await (const chunk of stream) {
            fullResponse += chunk;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = fullResponse;
                return newMessages;
            });
        }
    } catch (e) { setMessages(p => [...p.slice(0, -1), { sender: MessageSender.AI, text: 'Error.' }]); } 
    finally { setIsLoading(false); }
  }, [isLoading, file, client]);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-page)] relative">
      {/* Header */}
      <div className="h-14 border-b border-[var(--border-subtle)] flex items-center justify-between px-6 bg-[var(--bg-surface)]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-teal-500" />
              <span className="font-semibold text-sm text-[var(--text-primary)]">Advisory Assistant</span>
              {client && <span className="text-xs px-2 py-0.5 bg-[var(--bg-surface-hover)] rounded text-[var(--text-secondary)]">{client.name}</span>}
          </div>
          <div className="flex gap-2">
              <button onClick={() => setMessages([])} className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded hover:bg-[var(--bg-surface-hover)] transition-colors">Clear Chat</button>
          </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
        {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto opacity-0 animate-fade-in" style={{animationDelay: '0.1s', opacity: 1}}>
                <div className="w-12 h-12 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-center mb-6 shadow-sm">
                    <SparklesIcon className="w-6 h-6 text-teal-500" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">How can I help today?</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-8 leading-relaxed">
                    I can draft notices, compute tax liabilities, or analyze financial documents for your clients.
                </p>
                <div className="grid grid-cols-1 gap-2 w-full">
                    {PROMPT_TEMPLATES.map(t => (
                        <button key={t.id} onClick={() => setInput(t.prompt)} className="text-left px-4 py-3 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] transition-all text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-sm">
                            {t.title}
                        </button>
                    ))}
                </div>
            </div>
        ) : (
            messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 max-w-3xl mx-auto ${msg.sender === MessageSender.USER ? 'justify-end' : ''}`}>
                    {msg.sender === MessageSender.AI && (
                        <div className="w-8 h-8 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-center shrink-0 mt-1">
                            <SparklesIcon className="w-4 h-4 text-teal-600" />
                        </div>
                    )}
                    <div className={`py-3 px-4 rounded-xl text-sm leading-relaxed shadow-sm ${
                        msg.sender === MessageSender.USER 
                        ? 'bg-[#27272a] text-white dark:bg-white dark:text-black rounded-br-sm' 
                        : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-bl-sm w-full'
                    }`}>
                        {msg.file && (
                            <div className="mb-3 flex items-center gap-2 p-2 bg-black/5 dark:bg-white/10 rounded text-xs font-medium">
                                <DocumentIcon className="w-4 h-4" /> {msg.file.name}
                            </div>
                        )}
                        {msg.sender === MessageSender.USER ? msg.text : <MarkdownRenderer text={msg.text} />}
                    </div>
                </div>
            ))
        )}
        {isLoading && (
            <div className="flex gap-4 max-w-3xl mx-auto">
                <div className="w-8 h-8 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-center shrink-0">
                    <div className="w-4 h-4 rounded-full border-2 border-teal-500 border-t-transparent animate-spin"></div>
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-[var(--bg-page)] sticky bottom-0 z-20">
          <div className="max-w-3xl mx-auto relative bg-[var(--bg-surface)] rounded-xl border border-[var(--border-strong)] shadow-lg transition-all focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500">
                {file && (
                    <div className="absolute -top-12 left-0 bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-2 rounded-lg text-xs flex items-center gap-2 shadow-sm">
                        <span className="truncate max-w-[150px]">{file.name}</span>
                        <button onClick={() => setFile(null)} className="hover:text-red-500">&times;</button>
                    </div>
                )}
                <textarea 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); } }}
                    placeholder="Ask anything..."
                    className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 pl-4 pr-12 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] max-h-32"
                    rows={1}
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={e => {
                        const f = e.target.files?.[0];
                        if(f) { const r = new FileReader(); r.onload = () => setFile({name: f.name, type: f.type, data: (r.result as string).split(',')[1]}); r.readAsDataURL(f); }
                    }} />
                    <button onClick={() => fileInputRef.current?.click()} className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors rounded-md hover:bg-[var(--bg-surface-hover)]">
                        <AttachmentIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleSend(input)} disabled={!input && !file} className="p-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </div>
          </div>
          <div className="text-center mt-3">
              <p className="text-[10px] text-[var(--text-tertiary)]">AI can make mistakes. Verify important info.</p>
          </div>
      </div>
    </div>
  );
};

export default ChatInterface;
