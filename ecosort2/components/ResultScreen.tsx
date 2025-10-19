import React, { useState, useMemo } from 'react';
import { ClassificationResult, WasteType, CompositionItem } from '../types';
import CompositionChart from './common/CompositionChart';
import WasteIcon from './common/WasteIcon';
import BackButton from './common/BackButton';

interface ResultScreenProps {
    imageSrc: string;
    results: ClassificationResult[];
    onLookupREEs: () => void;
    onReset: () => void;
    onBack: () => void;
    onLearnMore: (materialName: string, composition: CompositionItem[]) => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ imageSrc, results, onLookupREEs, onReset, onBack, onLearnMore }) => {
    
    // Handle the "no items found" case gracefully
    if (!results || results.length === 0) {
        return (
            <div className="relative w-full h-full p-4 md:p-6 bg-gray-50 flex flex-col items-center justify-center">
                <BackButton onClick={onBack} />
                <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10l.01.01" />
                    </svg>
                    <h2 className="mt-4 text-2xl font-bold text-slate-800">No Items Identified</h2>
                    <p className="mt-2 text-slate-500">
                        Our AI couldn't find any classifiable items in the image. Please try again with a clearer picture or a different angle.
                    </p>
                    <img src={imageSrc} alt="Uploaded item that could not be identified" className="w-full max-w-xs h-auto object-cover rounded-xl shadow-md my-6 mx-auto" />
                    <button
                        onClick={onReset}
                        className="w-full max-w-xs mt-2 px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 transition-all duration-300"
                    >
                        Try Another Photo
                    </button>
                </div>
            </div>
        );
    }

    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedResult = results[selectedIndex];

    const dominantMaterial = useMemo(() => {
        if (!selectedResult || !selectedResult.composition || selectedResult.composition.length === 0) {
            return null;
        }
        return selectedResult.composition.reduce((max, item) => item.value > max.value ? item : max, selectedResult.composition[0]);
    }, [selectedResult]);

    const aggregatedComposition = useMemo(() => {
        if (!results || results.length === 0) return [];

        const compositionMap = new Map<string, number>();
        let totalValuePoints = 0;

        results.forEach(result => {
            result.composition.forEach(item => {
                compositionMap.set(item.name, (compositionMap.get(item.name) || 0) + item.value);
                totalValuePoints += item.value;
            });
        });

        if (totalValuePoints === 0) return [];
        
        return Array.from(compositionMap.entries()).map(([name, value]) => ({
            name,
            value: (value / totalValuePoints) * 100 
        }));

    }, [results]);

    return (
        <div className="relative w-full h-full p-4 md:p-6 bg-gray-50 overflow-y-auto">
            <BackButton onClick={onBack} />
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                    {/* Left Column: Image and Main Action */}
                    <div className="flex flex-col items-center">
                        <h2 className="text-3xl font-bold text-slate-800 text-center mb-2 animate-fadeInUp" style={{ animationDelay: '100ms' }}>Classification Result</h2>
                        <p className="text-slate-500 text-center mb-4 animate-fadeInUp" style={{ animationDelay: '200ms' }}>Found {results.length} item(s). Select an item below to see details.</p>
                        <img src={imageSrc} alt="Uploaded waste items" className="w-full max-w-sm h-auto object-cover rounded-xl shadow-md mb-4 animate-fadeInUp" style={{ animationDelay: '300ms' }} />
                        <div className="w-full max-w-sm p-4 bg-gray-100 border border-gray-200 rounded-lg animate-fadeInUp" style={{ animationDelay: '400ms' }}>
                            <h3 className="font-semibold text-slate-700 text-lg mb-2 text-center">Overall Material Composition</h3>
                            <CompositionChart data={aggregatedComposition} />
                        </div>
                         <button
                            onClick={onReset}
                            className="w-full max-w-sm mt-4 px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 transition-all duration-300"
                         >
                            Sort Another Item
                        </button>
                    </div>

                    {/* Right Column: Item Details */}
                    <div className="flex flex-col">
                        {/* Item Selector Chips */}
                        <div className="flex flex-wrap gap-2 mb-4 border-b pb-4">
                            {results.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedIndex(index)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors animate-fadeInUp ${selectedIndex === index ? 'bg-emerald-500 text-white shadow' : 'bg-gray-200 text-slate-700 hover:bg-gray-300'}`}
                                    style={{ animationDelay: `${500 + index * 100}ms` }}
                                >
                                    {item.itemName}
                                </button>
                            ))}
                        </div>
                        
                        {/* Details for Selected Item */}
                        <div key={selectedIndex} className="space-y-4 animate-slideIn">
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <h3 className="font-semibold text-slate-700 text-lg mb-2">Waste Type</h3>
                                <div className="flex items-center gap-3">
                                    <WasteIcon type={selectedResult.wasteType} />
                                    <p className="text-2xl font-bold text-emerald-700">{selectedResult.wasteType}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg">
                                <h3 className="font-semibold text-slate-700 text-lg mb-2">Recycling Info</h3>
                                <p className="text-slate-600">{selectedResult.recyclingInfo}</p>
                            </div>
                            
                            {selectedResult.wasteType === WasteType.EWaste && (
                                <button
                                    onClick={onLookupREEs}
                                    className="w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-all"
                                >
                                    ⚙️ Lookup Rare Earth Elements
                                </button>
                            )}
                            
                            {dominantMaterial && (
                                <button
                                    onClick={() => onLearnMore(dominantMaterial.name, selectedResult.composition)}
                                    className="w-full px-6 py-3 bg-amber-500 text-white font-bold rounded-lg shadow-md hover:bg-amber-600 transition-all"
                                >
                                    🧠 Learn More about {dominantMaterial.name}
                                </button>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultScreen;