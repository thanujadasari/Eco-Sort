import React from 'react';
import { CompositionItem } from '../../types';

interface CompositionChartProps {
    data: CompositionItem[];
}

const COLORS = ['#10B981', '#3B82F6', '#64748B', '#F59E0B', '#8B5CF6', '#EC4899'];

const CompositionChart: React.FC<CompositionChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-slate-500 text-center py-4">No composition data available.</p>;
    }

    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    
    if (totalValue === 0) {
        return <p className="text-slate-500 text-center py-4">Composition values are all zero.</p>;
    }

    let cumulativePercentage = 0;
    const gradientParts = data.map((item, index) => {
        const percentage = (item.value / totalValue) * 100;
        const start = cumulativePercentage;
        cumulativePercentage += percentage;
        const end = cumulativePercentage;
        return `${COLORS[index % COLORS.length]} ${start}% ${end}%`;
    });

    const conicGradient = `conic-gradient(${gradientParts.join(', ')})`;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-4 w-full p-2">
            {/* Pie Chart */}
            <div
                className="w-32 h-32 rounded-full border-4 border-gray-200 shadow-inner flex-shrink-0"
                style={{
                    backgroundImage: conicGradient,
                }}
                role="img"
                aria-label={`Pie chart showing material composition: ${data.map(d => `${d.name} ${d.value.toFixed(0)}%`).join(', ')}`}
            ></div>
            {/* Legend */}
            <div className="flex flex-col items-start gap-y-2">
                {data.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm text-slate-700">
                        <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span>{item.name}: <strong>{item.value.toFixed(0)}%</strong></span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompositionChart;