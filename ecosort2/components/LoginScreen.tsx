
import React, { useState } from 'react';

interface LoginScreenProps {
    onLogin: (email: string, rememberMe: boolean) => void;
    onSwitchToSignUp: () => void;
    error?: string | null;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSwitchToSignUp, error }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); // Password is for UI purposes only
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(email, rememberMe);
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-emerald-50">
            <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-emerald-600 mb-2">
                    Welcome Back!
                </h1>
                <p className="text-slate-600 text-center mb-6">Log in to continue sorting.</p>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"  className="block text-sm font-medium text-slate-700">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                             className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">Remember me</label>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-emerald-500 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-600 transition-all duration-300 transform hover:scale-105"
                    >
                        Log In
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Don't have an account?{' '}
                    <button onClick={onSwitchToSignUp} className="font-medium text-emerald-600 hover:text-emerald-500">
                        Sign up
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;
