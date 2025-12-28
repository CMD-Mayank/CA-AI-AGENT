
import React, { useState } from 'react';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { Logo } from './common/Logo';
import { storageService } from '../services/storage';

interface AuthProps {
  onLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [firmName, setFirmName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        const { error } = await storageService.signIn(email);
        
        if (error) throw new Error(error);
        
        setIsLoading(false);
        onLogin();
    } catch (err: any) {
        setError(err.message || 'Login failed');
        setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        if (!email || !password || !firmName) {
            throw new Error("All fields are required");
        }

        const { error } = await storageService.signUp(email, fullName, firmName);

        if (error) throw new Error(error);

        setIsLoading(false);
        onLogin();

    } catch (err: any) {
        setError(err.message || "Signup failed");
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 text-gray-900 dark:text-white">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center flex flex-col items-center">
          <Logo className="w-16 h-16 mb-4" textClassName="text-3xl" showText={false} />
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {isLogin ? 'Welcome back' : 'Setup your Firm'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
            {isLogin ? 'Sign in to access your dashboard' : 'Create your secure practice environment'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100 dark:border-slate-700">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg border border-red-100 dark:border-red-800">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={isLogin ? handleLogin : handleSignUp}>
            {!isLogin && (
              <>
                 <Input 
                  label="Full Name" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. CA Rajesh Kumar"
                  required
                />
                 <Input 
                  label="Firm Name" 
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  placeholder="e.g. Kumar & Associates"
                  required
                />
              </>
            )}

            <Input 
              label="Email Address" 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            
            <Input 
              label="Password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
            />

            <Button type="submit" isLoading={isLoading}>
              {isLogin ? 'Sign In' : 'Create Firm Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              {isLogin ? 'Register new Firm' : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
