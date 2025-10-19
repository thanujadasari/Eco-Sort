import React, { useState, useEffect } from 'react';

interface SignUpScreenProps {
    onSignUp: (email: string) => void;
    onSwitchToLogin: () => void;
    error?: string | null;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignUp, onSwitchToLogin, error }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);

    useEffect(() => {
        if (confirmPassword && password !== confirmPassword) {
            setPasswordError("Passwords do not match.");
        } else {
            setPasswordError(null);
        }
    }, [password, confirmPassword]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }
        if (passwordError) return; // Prevent submission if there's an error
        onSignUp(email);
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-sky-50">
            <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-sky-600 mb-2">
                    Create Account
                </h1>
                <p className="text-slate-600 text-center mb-6">Join Eco-Sort to start classifying.</p>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email-signup" className="block text-sm font-medium text-slate-700">Email</label>
                        <input
                            id="email-signup"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password-signup" className="block text-sm font-medium text-slate-700">Password</label>
                        <input
                            id="password-signup"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm-password-signup" className="block text-sm font-medium text-slate-700">Confirm Password</label>
                        <input
                            id="confirm-password-signup"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-slate-400 focus:outline-none sm:text-sm ${passwordError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-sky-500 focus:border-sky-500'}`}
                            placeholder="••••••••"
                        />
                         {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={!!passwordError}
                        className="w-full py-3 px-4 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        Sign Up
                    </button>
                </form>
                
                <p className="mt-6 text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <button onClick={onSwitchToLogin} className="font-medium text-sky-600 hover:text-sky-500">
                        Log in
                    </button>
                </p>
            </div>
        </div>
    );
};

export default SignUpScreen;