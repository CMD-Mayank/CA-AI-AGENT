import React, { useState, useRef, useEffect, useCallback } from 'react';
import { runChatStream } from '../services/geminiService';
import { ChatMessage, MessageSender } from '../types';
import { UserIcon } from './icons/UserIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { AttachmentIcon } from './icons/AttachmentIcon';
import { DocumentIcon } from './icons/DocumentIcon';

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


const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<{ name: string; type: string; data: string } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const coreServices = [
    'Taxation',
    'Auditing & Assurance',
    'Financial Reporting',
    'Advisory & Consultancy',
    'Cost & Management',
    'Corporate Finance',
    'Regulatory Compliance',
    'Forensic Accounting',
  ];

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

  const handleSend = useCallback(async (prompt: string) => {
    if ((!prompt.trim() && !file) || isLoading) return;

    const currentFile = file;
    const userMessage: ChatMessage = { 
        sender: MessageSender.USER, 
        text: prompt, 
        file: currentFile ? { name: currentFile.name, type: currentFile.type } : undefined 
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setFile(null);
    if(fileInputRef.current) fileInputRef.current.value = '';

    setIsLoading(true);

    const aiMessage: ChatMessage = { sender: MessageSender.AI, text: '' };
    setMessages((prev) => [...prev, aiMessage]);

    try {
        const stream = runChatStream(prompt, currentFile ? { mimeType: currentFile.type, data: currentFile.data } : undefined);
        let fullResponse = '';
        for await (const chunk of stream) {
            fullResponse += chunk;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = fullResponse;
                return newMessages;
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
  }, [isLoading, file]);
  
  const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSend(input);
  }

  const handleSuggestionClick = (service: string) => {
    handleSend(`Tell me about your services for ${service}.`);
  };
  
  const clearChat = () => {
      setMessages([]);
      setFile(null);
  }
  
  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Conversational Advisory</h1>
          <button onClick={clearChat} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600">
              New Chat
          </button>
      </header>
      <div className="flex-1 overflow-y-auto space-y-6 p-4 md:p-6">
        {messages.length === 0 && (
          <div className="text-center pt-10">
            <div className="inline-block p-4 bg-teal-100 dark:bg-teal-900/50 rounded-full">
              <SparklesIcon className="text-teal-600 dark:text-teal-300 w-8 h-8" />
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">Welcome to your CA AI Agent</h2>
            <p className="mt-2 text-gray-500 dark:text-slate-400">I am here to provide expert financial guidance. How may I assist you today?</p>
            <p className="mt-1 text-gray-500 dark:text-slate-400 text-sm">You can also upload a document for analysis.</p>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
              {coreServices.map((service) => (
                <button
                  key={service}
                  onClick={() => handleSuggestionClick(service)}
                  className="p-3 border border-gray-200 dark:border-slate-700 rounded-lg text-center hover:bg-gray-50 dark:hover:bg-slate-800 transition-all hover:shadow-md text-sm font-medium"
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`group flex items-start gap-4 ${msg.sender === MessageSender.USER ? 'justify-end' : ''}`}>
             {msg.sender === MessageSender.AI && (
              <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                <SparklesIcon className="w-5 h-5"/>
              </div>
            )}
            <div className={`relative max-w-2xl p-4 rounded-2xl shadow-sm ${
                msg.sender === MessageSender.USER
                  ? 'bg-teal-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-bl-none border border-gray-200 dark:border-slate-600'
              }`}>
               {msg.sender === MessageSender.AI && !isLoading && (
                  <button onClick={() => handleCopy(msg.text)} className="absolute top-2 right-2 p-1.5 text-gray-400 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>
               )}
               {isLoading && index === messages.length - 1 ? (
                   <div className="flex items-center space-x-2">
                       <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                       <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                       <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                   </div>
               ) : (
                  <MarkdownRenderer text={msg.text} />
               )}
               {msg.sender === MessageSender.USER && msg.file && (
                    <div className="mt-3 p-2.5 bg-teal-700/80 rounded-lg flex items-center gap-3 text-white border border-teal-500">
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
                <div className="mb-2 flex items-center justify-between p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-200">
                        <AttachmentIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{file.name}</span>
                    </div>
                    <button
                        type="button"
                        onClick={removeFile}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600"
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
                placeholder="Ask a question or upload a document for analysis..."
                className="w-full p-4 pr-28 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none shadow-sm"
                rows={2}
                disabled={isLoading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
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
                    className="p-2.5 rounded-full bg-teal-600 text-white hover:bg-teal-700 disabled:bg-gray-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
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