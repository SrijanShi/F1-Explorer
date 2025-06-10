import React from 'react';
import { circuitData } from '../../api/circuitData';
import './CircuitSelector.css';

const CircuitSelector = ({ setSelectedCircuit }) => {
    return (
        <div className="dropdown-container">
            <select onChange={(e) => setSelectedCircuit(e.target.value)} defaultValue="">
                <option value="" disabled>Select a Circuit</option>
                {Object.keys(circuitData).map((circuitName) => (
                    <option key={circuitName} value={circuitData[circuitName]}>
                        {circuitName}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CircuitSelector;