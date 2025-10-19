import React from 'react';

interface TitleScreenProps {
    onStart: () => void;
}

// FIX: Used React.PropsWithChildren to correctly type the component with children, resolving the TypeScript error.
type IconProps = React.PropsWithChildren<{
    className: string;
    style?: React.CSSProperties;
}>;

const Icon = ({ className, children, style }: IconProps) => (
    <div className={`absolute text-emerald-200/50 ${className}`} style={style}>
        {children}
    </div>
);

const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-4 overflow-hidden bg-emerald-50">
             <Icon className="top-[10%] left-[15%] text-5xl animate-float" style={{ animationDelay: '0s' }}>♻️</Icon>
             <Icon className="top-[20%] right-[10%] text-4xl animate-float" style={{ animationDelay: '1s' }}>🍃</Icon>
             <Icon className="bottom-[15%] left-[20%] text-3xl animate-float" style={{ animationDelay: '2s' }}>💧</Icon>
             <Icon className="bottom-[25%] right-[25%] text-5xl animate-float" style={{ animationDelay: '3s' }}>♻️</Icon>
             <Icon className="top-[60%] left-[10%] text-4xl animate-float" style={{ animationDelay: '4s' }}>🍃</Icon>

            <div className="z-10 bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
                <h1 className="text-6xl md:text-7xl font-bold text-emerald-600">
                    ♻️ Eco-Sort
                </h1>
                <p className="mt-4 text-xl md:text-2xl text-slate-700">
                    AI-Powered Waste Classification
                </p>
                <button
                    onClick={onStart}
                    className="mt-10 px-8 py-4 bg-emerald-500 text-white font-semibold text-lg rounded-full shadow-md hover:bg-emerald-600 transition-all duration-300 transform hover:scale-105"
                >
                    Get Started
                </button>
            </div>
        </div>
    );
};

export default TitleScreen;
