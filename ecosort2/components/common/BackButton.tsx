
import React from 'react';

interface BackButtonProps {
    onClick: () => void;
    className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, className }) => {
    return (
        <button
            onClick={onClick}
            className={`absolute top-4 left-4 z-20 flex items-center justify-center w-10 h-10 bg-white/50 backdrop-blur-sm rounded-full shadow-md hover:bg-white/80 transition-all duration-300 ${className}`}
            aria-label="Go back"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </button>
    );
};

export default BackButton;
