
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
                        <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-600 dark:text-slate-300">
                            <button onClick={() => scrollToSection('features')} className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Platform</button>
                            <button onClick={() => scrollToSection('security')} className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Security</button>
                            <button onClick={() => scrollToSection('pricing')} className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Enterprise</button>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={toggleTheme}
                                className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                                {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                            </button>
                            <button onClick={onLogin} className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-white transition-colors">
                                Client Login
                            </button>
                            <button onClick={onLogin} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-teal-500/20 hover:scale-105 active:scale-95">
                                Access Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-slate-950">
                {/* 3D Background */}
                <Hero3D />
                
                {/* Overlay Gradient for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/0 via-slate-950/40 to-slate-950 pointer-events-none z-0"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-[-5vh]">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                        Privacy-First Architecture • v2.0 Live
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 text-white animate-slide-up leading-[1.1]">
                        The AI Operating System <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-teal-400 to-blue-500">For Modern Firms</span>
                    </h1>
                    
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-300 mb-12 animate-slide-up font-light leading-relaxed" style={{animationDelay: '0.1s'}}>
                        Replace fragmented tools with a unified platform for tax, compliance, and advisory. 
                        Powered by local AI that <span className="text-white font-medium">never uploads client data</span> to the cloud.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{animationDelay: '0.2s'}}>
                        <button onClick={onLogin} className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(20,184,166,0.4)] transition-all transform hover:-translate-y-1 hover:scale-105">
                            Launch Secure Session
                        </button>
                        <button onClick={() => scrollToSection('features')} className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                            Explore Platform
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-white/5 pt-8 animate-slide-up" style={{animationDelay: '0.3s'}}>
                         <div className="p-4 rounded-lg hover:bg-white/5 transition-colors">
                             <p className="text-3xl font-bold text-white">100%</p>
                             <p className="text-xs text-slate-400 uppercase tracking-wide mt-1">Local Storage</p>
                         </div>
                         <div className="p-4 rounded-lg hover:bg-white/5 transition-colors">
                             <p className="text-3xl font-bold text-white">0ms</p>
                             <p className="text-xs text-slate-400 uppercase tracking-wide mt-1">Network Latency</p>
                         </div>
                         <div className="p-4 rounded-lg hover:bg-white/5 transition-colors">
                             <p className="text-3xl font-bold text-white">AES-256</p>
                             <p className="text-xs text-slate-400 uppercase tracking-wide mt-1">Bank-Grade Security</p>
                         </div>
                         <div className="p-4 rounded-lg hover:bg-white/5 transition-colors">
                             <p className="text-3xl font-bold text-white">50+</p>
                             <p className="text-xs text-slate-400 uppercase tracking-wide mt-1">Practice Tools</p>
                         </div>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-12 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-8">Trusted by 500+ Forward-Thinking CA Firms</p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                        {['Apex Partners', 'Mehta & Co', 'Global Tax', 'FinTech Solutions', 'LegalEase'].map(logo => (
                            <span key={logo} className="text-2xl font-black text-gray-800 dark:text-white tracking-tighter cursor-default">{logo}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Highlights with Glassmorphism */}
            <section id="features" className="py-32 bg-gray-50 dark:bg-slate-950 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-white">Unified Command Center</h2>
                        <p className="text-xl text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">Replace fragmented Excel sheets and disparate tools with one integrated, secure operating system.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-2xl hover:shadow-3xl transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-teal-500/20"></div>
                            <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300">
                                <SparklesIcon className="w-7 h-7 text-teal-600 dark:text-teal-400 group-hover:text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">AI Advisory Copilot</h3>
                            <p className="text-gray-600 dark:text-slate-400 leading-relaxed">Draft replies to Income Tax notices, analyze balance sheets, and get section-specific citations in seconds with our specialized LLM.</p>
                        </div>
                        
                        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-2xl hover:shadow-3xl transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/20"></div>
                            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                                <DocumentIcon className="w-7 h-7 text-blue-600 dark:text-blue-400 group-hover:text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">White-Label Reports</h3>
                            <p className="text-gray-600 dark:text-slate-400 leading-relaxed">Generate professional, branded PDFs with your firm's logo and FRN automatically. Impress clients with standardized deliverables.</p>
                        </div>
                        
                        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-2xl hover:shadow-3xl transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-purple-500/20"></div>
                            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                                <CreditCardIcon className="w-7 h-7 text-purple-600 dark:text-purple-400 group-hover:text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Smart Billing</h3>
                            <p className="text-gray-600 dark:text-slate-400 leading-relaxed">Track every billable minute. Convert timesheets to invoices with one click. Never leak revenue again with automated tracking.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section id="security" className="py-32 bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-900/10 to-transparent pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16 relative z-10">
                    <div className="flex-1 space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase">
                            <ShieldCheckIcon className="w-4 h-4" />
                            GDPR & ISO 27001 Compliant Architecture
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">Your client data never leaves your device.</h2>
                        <p className="text-xl text-slate-400 leading-relaxed">
                            Unlike cloud SaaS where data sits on a central server, AuditEra uses a local-first database. 
                            Your sensitive financial data is stored encrypted on your browser/device using IndexedDB.
                        </p>
                        <ul className="space-y-4 pt-4">
                            {['Zero-Knowledge Architecture', 'No Cloud Database Leaks', 'Instant Access (Offline Capable)'].map(item => (
                                <li key={item} className="flex items-center gap-3 text-lg font-medium text-slate-200">
                                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
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
                                        <h4 className="font-bold text-white text-lg">System Status</h4>
                                        <p className="text-sm text-green-400 font-bold flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            Secure • Local Environment
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-6 font-mono text-sm">
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span>Encryption Standard</span>
                                        <span className="text-white bg-slate-800 border border-slate-700 px-2 py-1 rounded">AES-256-GCM</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span>Database Location</span>
                                        <span className="text-white bg-slate-800 border border-slate-700 px-2 py-1 rounded">IndexedDB (Local)</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400">
                                        <span>Cloud Sync</span>
                                        <span className="text-red-400 bg-red-900/10 px-2 py-1 rounded border border-red-900/30">Disabled (Privacy Mode)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-32 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-extrabold mb-4 text-gray-900 dark:text-white">Simple, Transparent Pricing</h2>
                        <p className="text-xl text-gray-500 dark:text-slate-400">Pay for what you use. No hidden setup fees.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Solo */}
                        <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all flex flex-col">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Solo Practitioner</h3>
                            <p className="text-gray-500 text-sm mb-8">Perfect for independent CAs.</p>
                            <div className="text-5xl font-extrabold text-gray-900 dark:text-white mb-8">₹999<span className="text-lg font-normal text-gray-500">/mo</span></div>
                            <ul className="space-y-4 mb-8 flex-1">
                                {['1 User License', 'Unlimited Clients', 'Basic Tax Computation', 'Local Backup'].map(feat => (
                                     <li key={feat} className="flex gap-3 text-sm text-gray-600 dark:text-slate-300">
                                        <span className="text-teal-500 font-bold">✓</span> {feat}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={onLogin} className="w-full py-4 border-2 border-teal-600 text-teal-600 dark:text-teal-400 font-bold rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">Start Free Trial</button>
                        </div>

                        {/* Growth (Highlighted) */}
                        <div className="bg-slate-900 dark:bg-slate-950 p-10 rounded-3xl border-2 border-teal-500 shadow-2xl flex flex-col relative transform md:-translate-y-6 z-10">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-teal-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-lg">Most Popular</div>
                            <h3 className="text-xl font-bold text-white mb-2">Growth Firm</h3>
                            <p className="text-slate-400 text-sm mb-8">For firms with articles & staff.</p>
                            <div className="text-5xl font-extrabold text-white mb-8">₹2,499<span className="text-lg font-normal text-slate-500">/mo</span></div>
                            <ul className="space-y-4 mb-8 flex-1">
                                {['5 User Licenses', 'Maker-Checker Workflow', 'White-Label Reports', 'Billing & Timesheets', 'AI Notice Drafting'].map(feat => (
                                     <li key={feat} className="flex gap-3 text-sm text-slate-300">
                                        <span className="text-teal-400 font-bold">✓</span> {feat}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={onLogin} className="w-full py-4 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-400 transition-colors shadow-lg hover:shadow-teal-500/25">Get Started</button>
                        </div>

                        {/* Enterprise */}
                        <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all flex flex-col">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h3>
                            <p className="text-gray-500 text-sm mb-8">For large multi-branch firms.</p>
                            <div className="text-5xl font-extrabold text-gray-900 dark:text-white mb-8">Custom</div>
                            <ul className="space-y-4 mb-8 flex-1">
                                {['Unlimited Users', 'Dedicated Support Manager', 'API Access', 'Custom AI Model Training'].map(feat => (
                                     <li key={feat} className="flex gap-3 text-sm text-gray-600 dark:text-slate-300">
                                        <span className="text-teal-500 font-bold">✓</span> {feat}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={onLogin} className="w-full py-4 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">Contact Sales</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 py-16 border-t border-gray-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-12">
                    <div className="col-span-2">
                        <div className="flex items-center mb-6">
                             <Logo />
                        </div>
                        <p className="text-sm leading-relaxed max-w-sm mb-6">Empowering Chartered Accountants with Artificial Intelligence to automate compliance, maintain strict privacy, and grow their practice efficiently.</p>
                        <p className="text-xs font-medium">© 2024 AuditEra Systems. Made in India.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-6">Product</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Security</a></li>
                            <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Roadmap</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-6">Legal</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Disclaimer</a></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
};
