
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


const ChatInterface: React.FC<ChatInterfaceProps> = ({ client }) => {
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
            <h2 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">CA AI Associate</h2>
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
                  <button onClick={() => handleCopy(msg.text)} className="absolute top-2 right-2 p-1.5 text-gray-400 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>
               )}
               {isLoading && index === messages.length - 1 ? (
                   <div className="flex items-center space-x-2">
                       <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                       <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                       <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                   </div>
               ) : (
                  <MarkdownRenderer text={msg.text} />
               )}
               {msg.sender === MessageSender.USER && msg.file && (
                    <div className="mt-3 p-2.5 bg-primary-800/50 rounded-lg flex items-center gap-3 text-white border border-primary-600">
                        <DocumentIcon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{msg.file.name}</span>
                    </div>
                )}
            </div>
             {msg.sender === MessageSender.USER && (
                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <UserIcon />
                </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 md:p-6 bg-white dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto">
             {file && (
                <div className="mb-2 flex items-center justify-between p-2 bg-gray-100 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-200">
                        <AttachmentIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{file.name}</span>
                    </div>
                    <button
                        type="button"
                        onClick={removeFile}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                        aria-label="Remove file"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}
            <form onSubmit={handleFormSubmit} className="relative">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.docx,.csv,.jpg,.jpeg,.png"
                disabled={isLoading}
            />
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleFormSubmit(e);
                }
                }}
                placeholder={`Ask complicated questions...`}
                className="w-full p-4 pl-14 pr-32 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none shadow-sm transition-shadow"
                rows={2}
                disabled={isLoading}
            />
            <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className={`absolute left-3 top-3 p-1.5 rounded-lg transition-colors ${showTemplates ? 'bg-primary-100 text-primary-700' : 'text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                title="Prompt Library"
            >
                <TemplateIcon className="w-5 h-5" />
            </button>
            
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                 <button
                    type="button"
                    onClick={toggleDictation}
                    className={`p-2.5 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                    title="Voice Dictation"
                >
                    <MicrophoneIcon className="w-5 h-5" />
                </button>
                 <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="p-2.5 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:cursor-not-allowed transition-colors"
                    aria-label="Attach file"
                >
                    <AttachmentIcon className="w-5 h-5" />
                </button>
                <button
                    type="submit"
                    disabled={isLoading || (!input.trim() && !file)}
                    className="p-2.5 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors shadow-sm"
                    aria-label="Send message"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;