import React from 'react';
import { SparklesIcon } from '../icons/SparklesIcon';

// This is a simplified version of the renderer from ChatInterface.
// For a full app, you might abstract this into a shared markdown library.
const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    const renderSegment = (segment: string) => {
        if (segment.startsWith('```') && segment.endsWith('```')) {
            return <pre className="bg-gray-100 dark:bg-slate-800/50 p-3 rounded-md my-2 text-sm overflow-x-auto"><code>{segment.slice(3, -3).trim()}</code></pre>;
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
                    if (line.trim().startsWith('* ')) {
                         // Basic list handling. A more robust solution would group `li`s in a `ul`.
                        return <div key={`${index}-${lineIndex}`} className="flex items-start"><span className="mr-2 mt-1.5 text-teal-500">&bull;</span><span>{renderSegment(line.substring(line.indexOf('* ') + 2))}</span></div>;
                    }
                    if (line.trim().startsWith('1. ') || line.trim().startsWith('2. ') || line.trim().startsWith('3. ')) {
                        return <div key={`${index}-${lineIndex}`} className="flex items-start"><span className="mr-2 mt-1.5 text-teal-500">{line.substring(0, 3)}</span><span>{renderSegment(line.substring(3))}</span></div>;
                    }
                    return <p key={`${index}-${lineIndex}`} className="mb-2 last:mb-0">{renderSegment(line)}</p>;
                });
            })}
        </div>
    );
};

interface AIResponseStreamProps {
    response: string;
    isLoading: boolean;
}

export const AIResponseStream: React.FC<AIResponseStreamProps> = ({ response, isLoading }) => {
    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center">
                <SparklesIcon className="w-5 h-5 mr-2 text-teal-500" />
                AI Analysis
            </h3>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 min-h-[10rem]">
                {isLoading && !response && (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex items-center space-x-2 text-gray-500 dark:text-slate-400">
                           <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                           <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                           <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                           <span>Analyzing...</span>
                       </div>
                    </div>
                )}
                {response && <MarkdownRenderer text={response} />}
            </div>
        </div>
    );
};
