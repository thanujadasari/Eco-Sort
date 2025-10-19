
import React from 'react';
import { WasteType } from '../../types';

const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM3 10a7 7 0 1111.93-4.95L4.05 15.93A7 7 0 013 10zm11.95-4.95a7 7 0 01-5.88 10.83L17.95 4.05A7 7 0 0114.95 5.05z" clipRule="evenodd" />
        <path d="M10 3a7 7 0 017 7c0 1.25-.33 2.42-.9 3.44l-1.46-1.46A5 5 0 0010 5V3z" />
    </svg>
);

const BottleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2a3 3 0 00-3 3v1H5.5a1 1 0 00-.97.744L3.11 15.46A1 1 0 004.08 17h11.84a1 1 0 00.97-1.54l-1.42-8.716A1 1 0 0014.5 6H13V5a3 3 0 00-3-3zm-1 3v1h2V5a1 1 0 00-2 0z" />
    </svg>
);

const ComputerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.13.39a.5.5 0 01-.48.61H6.57a.5.5 0 01-.48-.61l.13-.39H3a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v8a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5z" clipRule="evenodd" />
        <path d="M6 8a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7A.5.5 0 016 8zm0 2a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7A.5.5 0 016 10z" />
    </svg>
);

const WasteIcon: React.FC<{ type: WasteType }> = ({ type }) => {
    switch (type) {
        case WasteType.Biodegradable:
            return <LeafIcon />;
        case WasteType.NonBiodegradable:
            return <BottleIcon />;
        case WasteType.EWaste:
            return <ComputerIcon />;
        default:
            return null;
    }
};

export default WasteIcon;

