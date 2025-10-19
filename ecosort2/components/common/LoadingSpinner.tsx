import React from 'react';

interface LoadingSpinnerProps {
    text?: string;
}

const ICONS = ['♻️', '🍃', '💻', '🍌', '📦'];

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = "Sorting..." }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="relative w-full h-24 flex items-center justify-center overflow-hidden mb-4">
        {ICONS.map((icon, index) => (
          <span
            key={index}
            className="absolute text-4xl animate-sort-item"
            style={{ animationDelay: `${index * 0.5}s` }}
            aria-hidden="true"
          >
            {icon}
          </span>
        ))}
      </div>
      <p className="mt-4 text-lg font-medium text-emerald-800">{text}</p>
      <p className="mt-1 text-sm text-slate-600">Our AI is sorting things out for a greener planet.</p>
    </div>
  );
};

export default LoadingSpinner;