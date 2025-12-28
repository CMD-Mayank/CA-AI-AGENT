
import React from 'react';
import { Hero3D } from './Hero3D';
import { Logo } from './common/Logo';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SunIcon } from './icons/SunIcon';

interface LandingPageProps {
    onLogin: () => void;
    darkMode: boolean;
    toggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, darkMode, toggleTheme }) => {
    
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white font-sans overflow-x-hidden selection:bg-teal-500 selection:text-white">
            {/* Navbar */}
            <nav className="fixed w-full z-50 glass dark:glass-dark transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                            <Logo className="w-9 h-9" />
                        </div>
                        <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-600 dark:text-slate-300 uppercase tracking-widest">
                            <button onClick={() => scrollToSection('architecture')} className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Architecture</button>
                            <button onClick={() => scrollToSection('security')} className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Sovereignty</button>
                            <button onClick={() => scrollToSection('pricing')} className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Deployment</button>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={toggleTheme}
                                className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                                {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                            </button>
                            <button onClick={onLogin} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-teal-500/20 hover:scale-105 active:scale-95">
                                Initialize OS
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-slate-950">
                <Hero3D />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/0 via-slate-950/40 to-slate-950 pointer-events-none z-0"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-[-5vh]">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                        Zero-Knowledge System Architecture • V2.4
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 text-white animate-slide-up leading-[1.1]">
                        The Secure Practice <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-teal-400 to-blue-500">Operating System</span>
                    </h1>
                    
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-300 mb-12 animate-slide-up font-light leading-relaxed" style={{animationDelay: '0.1s'}}>
                        Eliminate fragmented tools. Deploy a unified OS for tax, compliance, and advisory. 
                        Engineered with <span className="text-white font-medium italic underline decoration-teal-500">Local-First Privacy</span> — your client data never leaves your environment.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{animationDelay: '0.2s'}}>
                        <button onClick={onLogin} className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(20,184,166,0.4)] transition-all transform hover:-translate-y-1 hover:scale-105">
                            Launch Terminal
                        </button>
                        <button onClick={() => scrollToSection('architecture')} className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                            Explore Architecture
                        </button>
                    </div>

                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-white/5 pt-8 animate-slide-up" style={{animationDelay: '0.3s'}}>
                         <div className="p-4 rounded-lg hover:bg-white/5 transition-colors">
                             <p className="text-3xl font-bold text-white uppercase tracking-tighter">Sovereign</p>
                             <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Data Ownership</p>
                         </div>
                         <div className="p-4 rounded-lg hover:bg-white/5 transition-colors">
                             <p className="text-3xl font-bold text-white uppercase tracking-tighter">0ms</p>
                             <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Network Latency</p>
                         </div>
                         <div className="p-4 rounded-lg hover:bg-white/5 transition-colors">
                             <p className="text-3xl font-bold text-white uppercase tracking-tighter">AES-256</p>
                             <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Hardware Grade</p>
                         </div>
                         <div className="p-4 rounded-lg hover:bg-white/5 transition-colors">
                             <p className="text-3xl font-bold text-white uppercase tracking-tighter">AI-Core</p>
                             <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Gemini 3 Pro</p>
                         </div>
                    </div>
                </div>
            </section>

            {/* Architecture Section */}
            <section id="architecture" className="py-32 bg-gray-50 dark:bg-slate-950 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-white">System Modules</h2>
                        <p className="text-xl text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">One OS. Every professional capability integrated into a single high-performance kernel.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 card-premium hover:-translate-y-2 transition-all relative overflow-hidden">
                            <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center mb-8">
                                <SparklesIcon className="w-7 h-7 text-teal-600 dark:text-teal-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white uppercase tracking-tighter">AI Logic Engine</h3>
                            <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-sm">Deep reasoning for Income Tax notice drafting, case law citations, and multi-regime computations. A partner-level mind in your terminal.</p>
                        </div>
                        
                        <div className="p-8 card-premium hover:-translate-y-2 transition-all relative overflow-hidden">
                            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-8">
                                <DocumentIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white uppercase tracking-tighter">File System 2.0</h3>
                            <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-sm">Automated white-labeled PDF generation. Standardized audits and computations with your FRN and firm branding hardcoded into the output.</p>
                        </div>
                        
                        <div className="p-8 card-premium hover:-translate-y-2 transition-all relative overflow-hidden">
                            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-8">
                                <CreditCardIcon className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white uppercase tracking-tighter">Revenue Kernel</h3>
                            <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-sm">Precision timesheet tracking linked to automated invoicing. Real-time profitability telemetry for every staff member and client engagement.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section id="security" className="py-32 bg-slate-950 text-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16 relative z-10">
                    <div className="flex-1 space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest">
                            <ShieldCheckIcon className="w-4 h-4" />
                            Sovereign Data Protocol
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">Your practice data is your property. Period.</h2>
                        <p className="text-xl text-slate-400 leading-relaxed">
                            Cloud SaaS platforms are a liability. AuditEra uses a <span className="text-teal-400 font-bold">Local-First encrypted kernel</span>. 
                            Sensitive financial data is stored directly on your hardware via IndexedDB.
                        </p>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            {['Zero-Knowledge Auth', 'Hardware Key Storage', 'Offline Capability', 'Master Export Tool'].map(item => (
                                <div key={item} className="flex items-center gap-2 text-sm font-bold text-slate-300 uppercase tracking-tighter">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <div className="relative group cursor-default">
                            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                            <div className="relative bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
                                <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
                                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                                        <ShieldCheckIcon className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg uppercase tracking-tight">System Status</h4>
                                        <p className="text-xs text-green-400 font-bold flex items-center gap-2 uppercase tracking-widest">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            Encrypted Terminal Active
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                                    <div className="flex justify-between items-center">
                                        <span>Cryptographic Standard</span>
                                        <span className="text-teal-400">AES-256-GCM</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Data Residency</span>
                                        <span className="text-teal-400">Local (Host Device)</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Sync Status</span>
                                        <span className="text-red-500">Cloud Isolation Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing/Deployment Section */}
            <section id="pricing" className="py-32 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-extrabold mb-4 text-gray-900 dark:text-white">Deployment Options</h2>
                        <p className="text-xl text-gray-500 dark:text-slate-400 uppercase tracking-widest font-bold">Standardize your practice today.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Solo */}
                        <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-lg flex flex-col">
                            <h3 className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-4">Core Edition</h3>
                            <h4 className="text-2xl font-bold mb-8">Professional</h4>
                            <div className="text-5xl font-extrabold text-gray-900 dark:text-white mb-8">₹999<span className="text-lg font-normal text-gray-500">/mo</span></div>
                            <ul className="space-y-4 mb-8 flex-1">
                                {['Full OS Access', 'Local Storage Only', 'Standard AI Engine', 'PDF Generation'].map(feat => (
                                     <li key={feat} className="flex gap-3 text-xs font-bold uppercase tracking-tighter text-gray-600 dark:text-slate-300">
                                        <span className="text-teal-500">/</span> {feat}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={onLogin} className="w-full py-4 border-2 border-slate-900 dark:border-white font-bold rounded-xl hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all uppercase tracking-widest text-xs">Initialize Trial</button>
                        </div>

                        {/* Growth (Highlighted) */}
                        <div className="bg-slate-900 dark:bg-slate-950 p-10 rounded-3xl border-2 border-teal-500 shadow-2xl flex flex-col relative transform md:-translate-y-6 z-10">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-teal-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Firm Favorite</div>
                            <h3 className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-4">Team Edition</h3>
                            <h4 className="text-2xl font-bold text-white mb-8">Enterprise OS</h4>
                            <div className="text-5xl font-extrabold text-white mb-8">₹2,499<span className="text-lg font-normal text-slate-500">/mo</span></div>
                            <ul className="space-y-4 mb-8 flex-1">
                                {['5 User Environment', 'Collaborative Kernels', 'White-Label Branding', 'Revenue Analytics'].map(feat => (
                                     <li key={feat} className="flex gap-3 text-xs font-bold uppercase tracking-tighter text-slate-300">
                                        <span className="text-teal-400">/</span> {feat}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={onLogin} className="w-full py-4 bg-teal-500 text-slate-900 font-bold rounded-xl hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/25 uppercase tracking-widest text-xs">Deploy System</button>
                        </div>

                        {/* Enterprise */}
                        <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-lg flex flex-col">
                            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Architecture</h3>
                            <h4 className="text-2xl font-bold mb-8">Custom Site</h4>
                            <div className="text-5xl font-extrabold text-gray-900 dark:text-white mb-8">Custom</div>
                            <ul className="space-y-4 mb-8 flex-1">
                                {['On-Premise Server', 'Custom LLM Training', 'API Integration', 'Partner Support'].map(feat => (
                                     <li key={feat} className="flex gap-3 text-xs font-bold uppercase tracking-tighter text-gray-600 dark:text-slate-300">
                                        <span className="text-blue-500">/</span> {feat}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={onLogin} className="w-full py-4 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors uppercase tracking-widest text-xs">Contact Architects</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 py-16 border-t border-gray-200 dark:border-slate-800 font-mono">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-12">
                    <div className="col-span-2">
                        <div className="flex items-center mb-6">
                             <Logo />
                        </div>
                        <p className="text-xs leading-relaxed max-w-sm mb-6 uppercase tracking-widest">Deploying security and efficiency to modern Chartered Accountants through a sovereign operating system.</p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">© 2024 AuditEra Systems Architecture. Node_India</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-widest text-xs">System</h4>
                        <ul className="space-y-3 text-[10px] uppercase tracking-widest">
                            <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Capabilities</a></li>
                            <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Cryptography</a></li>
                            <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Roadmap</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Legal_Kernel</h4>
                        <ul className="space-y-3 text-[10px] uppercase tracking-widest">
                            <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Privacy_Auth</a></li>
                            <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Terms_v1.2</a></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
};
