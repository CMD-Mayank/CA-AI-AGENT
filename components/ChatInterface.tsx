
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

interface ChatInterfaceProps {
    client?: Client;
    initialPrompt?: string;
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
    { id: '1', category: 'Notices', title: 'Reply to Sec 148 Notice', prompt: 'Draft a reply to a notice received under Section 148 of the Income Tax Act. The client has undisclosed income from property sale. Cite relevant case laws.' },
    { id: '2', category: 'Notices', title: 'GST DRC-01 Response', prompt: 'Draft a response to GST DRC-01 regarding mismatch in GSTR-3B and GSTR-2A. Assume the difference is due to vendor delay.' },
    { id: '3', category: 'Drafting', title: 'Rent Agreement (Commercial)', prompt: 'Draft a commercial rent agreement for an office space in Mumbai. Include clauses for security deposit, lock-in period, and GST applicability.' },
    { id: '4', category: 'Drafting', title: 'Board Resolution (Loan)', prompt: 'Draft a Board Resolution for a Private Limited Company to avail a working capital loan of 50 Lakhs from HDFC Bank.' },
    { id: '5', category: 'Tax Planning', title: 'Capital Gains Saving', prompt: 'Client sold a residential property for 2Cr (Long Term). Suggest ways to save Capital Gains tax under Section 54 and 54EC.' },
    { id: '6', category: 'Audit', title: 'Internal Audit Checklist', prompt: 'Create an Internal Audit Checklist for a Manufacturing entity focusing on Inventory controls and Procurement cycles.' }
];

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    const renderSegment = (segment: string) => {
        if (segment.startsWith('```') && segment.endsWith('```')) {
            return <pre className="bg-gray-100 dark:bg-slate-800 p-3 rounded-md my-2 text-sm overflow-x-auto"><code>{segment.slice(3, -3).trim()}</code></pre>;
        }
        segment = segment.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        segment = segment.replace(/\*(.*?)\*/g, '<em>$1</em>');
        return <span dangerouslySetInnerHTML={{ __html: segment }} />;
    }

    const segments = text.split(/(```[\s\S]*?```)/g);

    return (
        <div className="prose prose-sm dark:prose-invert max-w-none text-left">
            {segments.map((segment, index) => {
                if (!segment) return null;
                if (segment.startsWith('```')) {
                    return <div key={index}>{renderSegment(segment)}</div>;
                }
                const lines = segment.split('\n');
                return lines.map((line, lineIndex) => {
                    if (line.startsWith('### ')) return <h3 key={`${index}-${lineIndex}`} className="font-semibold text-md mt-4 mb-2">{line.substring(4)}</h3>;
                    if (line.startsWith('## ')) return <h2 key={`${index}-${lineIndex}`} className="font-bold text-lg mt-5 mb-3">{line.substring(3)}</h2>;
                    if (line.startsWith('# ')) return <h1 key={`${index}-${lineIndex}`} className="font-extrabold text-xl mt-6 mb-4">{line.substring(2)}</h1>;
                    if (line.trim().startsWith('* ')) return <li key={`${index}-${lineIndex}`} className="ml-5 list-disc">{renderSegment(line.substring(2))}</li>
                    return <p key={`${index}-${lineIndex}`} className="mb-2 last:mb-0">{renderSegment(line)}</p>;
                });
            })}
        </div>
    );
};


const ChatInterface: React.FC<ChatInterfaceProps> = ({ client, initialPrompt }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<{ name: string; type: string; data: string } | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load messages when client changes
  useEffect(() => {
      if (client) {
          const loadedMessages = storageService.getMessages(client.id);
          setMessages(loadedMessages);
      }
  }, [client?.id]);
  
  // Handle auto-trigger from other modules
  useEffect(() => {
      if(initialPrompt && !isLoading) {
          setInput(initialPrompt);
      }
  }, [initialPrompt]);

  // Save messages whenever they change
  useEffect(() => {
      if (client && messages.length > 0) {
          storageService.saveMessages(client.id, messages);
      }
  }, [messages, client]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setFile({
          name: selectedFile.name,
          type: selectedFile.type,
          data: base64String,
        });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const toggleDictation = () => {
      if (!('webkitSpeechRecognition' in window)) {
          alert('Dictation is not supported in this browser.');
          return;
      }
      
      if (isListening) {
          setIsListening(false);
          // Stop logic handled by end event usually, but here we just rely on UI toggle for demo
          return;
      }

      setIsListening(true);
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => prev + (prev ? ' ' : '') + transcript);
          setIsListening(false);
      };
      
      recognition.onerror = () => {
          setIsListening(false);
      };
      
      recognition.onend = () => {
          setIsListening(false);
      };
      
      recognition.start();
  };

  const handleSend = useCallback(async (prompt: string) => {
    if ((!prompt.trim() && !file) || isLoading) return;

    const currentFile = file;
    const userMessage: ChatMessage = { 
        sender: MessageSender.USER, 
        text: prompt, 
        file: currentFile ? { name: currentFile.name, type: currentFile.type } : undefined,
        timestamp: Date.now()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setFile(null);
    setShowTemplates(false);
    if(fileInputRef.current) fileInputRef.current.value = '';

    setIsLoading(true);

    const aiMessage: ChatMessage = { sender: MessageSender.AI, text: '', timestamp: Date.now() };
    setMessages((prev) => [...prev, aiMessage]);

    // Construct contextual prompt
    let enhancedPrompt = prompt;
    if (client) {
        enhancedPrompt = `[System Context: You are analyzing for Client: ${client.name}. Entity Type: ${client.type}. Industry: ${client.industry}. PAN: ${client.pan}.] \n\nUser Query: ${prompt}`;
    }

    try {
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
        // Log Activity
        if (client) {
            storageService.logActivity({
                id: Date.now().toString(),
                clientId: client.id,
                clientName: client.name,
                action: 'Advisory Query',
                timestamp: Date.now(),
                details: prompt.substring(0, 40) + (prompt.length > 40 ? '...' : '')
            });
        }

    } catch (error) {
      const errorMessage: ChatMessage = {
        sender: MessageSender.AI,
        text: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, file, client]);
  
  const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSend(input);
  }

  const handleTemplateClick = (template: PromptTemplate) => {
      setInput(template.prompt);
      // Optional: Auto send? No, let user review.
      setShowTemplates(false);
  };
  
  const clearChat = () => {
      if(confirm('Are you sure you want to clear the current conversation?')) {
          setMessages([]);
          setFile(null);
          if (client) {
              storageService.clearMessages(client.id);
          }
      }
  }

  const downloadTranscript = () => {
      if (messages.length === 0) return;
      
      const transcript = messages.map(m => 
          `[${new Date(m.timestamp || Date.now()).toLocaleString()}] ${m.sender.toUpperCase()}: ${m.text}`
      ).join('\n\n');
      
      const blob = new Blob([transcript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ca-agent-transcript-${client?.name.replace(/\s+/g, '-') || 'session'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      if (client) {
          storageService.logActivity({
            id: Date.now().toString(),
            clientId: client.id,
            clientName: client.name,
            action: 'Transcript Downloaded',
            timestamp: Date.now()
          });
      }
  };
  
  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto relative">
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                Advisory Assistant
            </h1>
            {client && (
                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-0.5">
                    Context: {client.name} ({client.type})
                </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
                <button 
                    onClick={downloadTranscript}
                    className="p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Download Workpaper Transcript"
                >
                    <DownloadIcon />
                </button>
            )}
            <button onClick={clearChat} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 shadow-sm transition-all">
                New Session
            </button>
          </div>
      </header>
      
      {/* Template Modal / Popover */}
      {showTemplates && (
          <div className="absolute bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-20 max-h-[60vh] overflow-y-auto animate-fade-in">
              <div className="p-3 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-700/50 sticky top-0">
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm">Prompt Library</h3>
                  <button onClick={() => setShowTemplates(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
              </div>
              <div className="p-2">
                  {['Notices', 'Drafting', 'Tax Planning', 'Audit'].map(category => (
                      <div key={category} className="mb-3">
                          <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">{category}</h4>
                          <div className="space-y-1">
                              {PROMPT_TEMPLATES.filter(t => t.category === category).map(t => (
                                  <button 
                                    key={t.id} 
                                    onClick={() => handleTemplateClick(t)}
                                    className="w-full text-left p-2 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg text-sm text-gray-700 dark:text-slate-200 transition-colors"
                                  >
                                      {t.title}
                                  </button>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-6 p-4 md:p-6">
        {messages.length === 0 && (
          <div className="text-center pt-10 animate-fade-in">
            <div className="inline-block p-4 bg-primary-100 dark:bg-primary-900/50 rounded-full">
              <SparklesIcon className="text-primary-600 dark:text-primary-300 w-8 h-8" />
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">AuditEra</h2>
            <p className="mt-2 text-gray-500 dark:text-slate-400">Ready to assist with client {client?.name || 'files'}.</p>
            
            <div className="mt-8 flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
                 <button
                  onClick={() => setShowTemplates(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700 dark:text-slate-200"
                >
                  <TemplateIcon className="w-5 h-5 text-primary-600" />
                  Browse Prompt Library
                </button>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`group flex items-start gap-4 ${msg.sender === MessageSender.USER ? 'justify-end' : ''}`}>
             {msg.sender === MessageSender.AI && (
              <div className="w-9 h-9 rounded-full bg-primary-700 flex items-center justify-center flex-shrink-0 text-white shadow-sm border border-primary-600">
                <SparklesIcon className="w-5 h-5"/>
              </div>
            )}
            <div className={`relative max-w-2xl p-4 rounded-2xl shadow-sm ${
                msg.sender === MessageSender.USER
                  ? 'bg-primary-700 text-white rounded-br-none'
                  : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-bl-none border border-gray-200 dark:border-slate-600'
              }`}>
               {msg.sender === MessageSender.AI && !isLoading && (
                  <button onClick={() => handleCopy(msg.text)} className="absolute top-2 right-2 p-1.5 text-gray-400 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-600 rounded opacity-0 group-hover:opacity-100 transition-opacity" title="Copy to clipboard">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>
               )}
              <MarkdownRenderer text={msg.text} />
              {msg.file && (
                <div className="mt-3 flex items-center gap-2 text-xs bg-black/10 dark:bg-black/20 p-2 rounded">
                    <AttachmentIcon className="w-4 h-4" />
                    <span>{msg.file.name}</span>
                </div>
              )}
            </div>
            {msg.sender === MessageSender.USER && (
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center flex-shrink-0 text-gray-500 dark:text-slate-300">
                <UserIcon className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-4 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-primary-700 flex items-center justify-center flex-shrink-0 text-white">
                <SparklesIcon className="w-5 h-5"/>
            </div>
            <div className="bg-white dark:bg-slate-700 p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-200 dark:border-slate-600">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-slate-700 sticky bottom-0 z-10">
        <form onSubmit={handleFormSubmit} className="relative flex items-end gap-2 max-w-4xl mx-auto">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            title="Upload Document"
          >
            <AttachmentIcon className="w-6 h-6" />
          </button>
          
          <div className="flex-1 relative">
              {file && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg p-2 flex items-center justify-between text-sm text-primary-700 dark:text-primary-200">
                    <span className="truncate flex items-center gap-2">
                        <DocumentIcon className="w-4 h-4"/> {file.name}
                    </span>
                    <button type="button" onClick={removeFile} className="hover:text-red-500">&times;</button>
                </div>
              )}
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask a query, draft a notice, or analyze a file..."}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none dark:text-white placeholder-gray-400 dark:placeholder-slate-500 shadow-sm"
                rows={1}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(input);
                    }
                }}
              />
              <button
                type="button"
                onClick={toggleDictation}
                className={`absolute right-3 bottom-3 p-1 rounded-full transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-primary-600'}`}
                title="Voice Dictation"
              >
                  <MicrophoneIcon className="w-5 h-5" />
              </button>
          </div>
          
          <button
            type="submit"
            disabled={(!input.trim() && !file) || isLoading}
            className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all transform active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-400 dark:text-slate-500 mt-2">
            AuditEra may produce inaccurate information. Verify important information.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
