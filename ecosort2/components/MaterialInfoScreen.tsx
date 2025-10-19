import React from 'react';
import { MaterialInfoResult, CompositionItem } from '../types';
import BackButton from './common/BackButton';
import CompositionChart from './common/CompositionChart';

interface MaterialInfoScreenProps {
    imageSrc: string;
    result: MaterialInfoResult;
    composition: CompositionItem[];
    onBack: () => void;
}

const InfoCard: React.FC<{ title: string; points: string[], icon: string }> = ({ title, points, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{icon}</span>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        </div>
        <ul className="space-y-2 list-disc list-inside text-slate-600 leading-relaxed">
            {points.map((point, index) => (
                <li key={index}>{point}</li>
            ))}
        </ul>
    </div>
);


const MaterialInfoScreen: React.FC<MaterialInfoScreenProps> = ({ imageSrc, result, composition, onBack }) => {
    return (
        <div className="relative w-full h-full p-4 md:p-6 bg-amber-50 overflow-y-auto">
            <BackButton onClick={onBack} />
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-amber-700">
                        Material Deep Dive
                    </h2>
                    <p className="text-2xl font-semibold text-slate-700 mt-1">{result.materialName}</p>
                </div>

                <div className="space-y-6">
                    <InfoCard title="Description" icon="📝" points={result.description} />
                    <InfoCard title="Environmental Impact" icon="🌍" points={result.environmentalImpact} />
                    <InfoCard title="Recycling Potential" icon="♻️" points={result.recyclingPotential} />
                    
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">📊</span>
                            <h3 className="text-xl font-bold text-slate-800">Item-Specific Composition</h3>
                        </div>
                        <CompositionChart data={composition} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaterialInfoScreen;