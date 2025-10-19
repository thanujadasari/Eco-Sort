
import React from 'react';
import { REEResult } from '../types';
import BackButton from './common/BackButton';

interface REEScreenProps {
    imageSrc: string;
    result: REEResult;
    onReset: () => void;
    onBack: () => void;
}

const REEScreen: React.FC<REEScreenProps> = ({ imageSrc, result, onReset, onBack }) => {
    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-800 to-teal-900 text-white">
            <BackButton onClick={onBack} />
            <div className="w-full max-w-2xl bg-slate-700/50 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-teal-500/30">
                <h2 className="text-3xl font-bold text-center mb-6">
                    <span className="text-teal-300">Rare Earth Element</span> Lookup
                </h2>
                
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <img src={imageSrc} alt="E-waste item" className="w-40 h-40 object-cover rounded-xl shadow-lg border-2 border-teal-400" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2 text-teal-200">Identified REEs:</h3>
                        {result.identifiedREEs.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {result.identifiedREEs.map((ree, index) => (
                                    <span key={index} className="px-3 py-1 bg-teal-500/80 rounded-full text-sm font-medium">
                                        {ree}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-300">No specific Rare Earth Elements were identified for this item.</p>
                        )}
                    </div>
                </div>

                <button
                    onClick={onReset}
                    className="w-full mt-8 px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 transition-all duration-300"
                >
                    Sort Another Item
                </button>
            </div>
        </div>
    );
};

export default REEScreen;
