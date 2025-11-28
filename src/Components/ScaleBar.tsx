import React from 'react';
import './ScaleBar.css'; // We'll create this CSS file
import type { TProperties } from '../types';

interface VerticalScaleProps {
    properties: TProperties|null; 
    labels?: string[]; 
}

export const ScaleBar: React.FC<VerticalScaleProps> = ({ 
    properties, 
    labels = ['1', '2', '3', '4', '5', '6'] 
}) => {
    const brackets = 6;
    const value = properties?.pop_density ?? 0
    return (
        <div className="vertical-scale">
        <div className="scale-track">
            {Array.from({ length: brackets }).map((_, index) => (
            <div
                key={index}
                className={`bracket ${index === value ? 'active' : ''} ${
                index < value ? 'filled' : ''
                }`}
            >
                <div className="bracket-fill" />
                <span className="bracket-label">{labels[index]}</span>
            </div>
            ))}
        </div>
        <div className='ticks'>
            <div>0</div>
            <div>1</div>
            <div>5</div>
            <div>10</div>
            <div>25</div>
            <div>100</div>
            <div>2500</div>
        </div>
        </div>
    );
};