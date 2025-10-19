import React from 'react';
import { ScanHistoryItem } from '../types';
import BackButton from './common/BackButton';

interface HistoryScreenProps {
    history: ScanHistoryItem[];
    onBack: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ history, onBack }) => {
    return (
        <div className="relative w-full h-full p-4 md:p-6 bg-slate-50 overflow-y-auto">
            <BackButton onClick={onBack} />
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-slate-700">
                        Scan History
                    </h2>
                    <p className="text-lg text-slate-500 mt-1">Your recent classifications.</p>
                </div>

                {history.length > 0 ? (
                    <div className="space-y-4">
                        {history.map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-xl shadow-md border border-gray-200 flex items-center gap-4">
                                <img src={item.thumbnail} alt="Scanned item thumbnail" className="w-20 h-20 object-cover rounded-lg flex-shrink-0 bg-gray-100" />
                                <div className="flex-grow">
                                    <p className="font-semibold text-slate-800">
                                        {item.results.map(r => r.itemName).join(', ')}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {item.results.length} item(s) identified
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {new Date(item.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 px-6 bg-white rounded-lg shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-xl font-medium text-slate-800">No History Yet</h3>
                        <p className="mt-1 text-slate-500">Start scanning items to see your history here!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryScreen;