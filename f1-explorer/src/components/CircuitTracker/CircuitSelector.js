import React from 'react';
import { circuitData } from '../../api/circuitData';
import './CircuitSelector.css';

const CircuitSelector = ({ setSelectedCircuit }) => {
    return (
        <div className="dropdown-container">
            <select onChange={(e) => setSelectedCircuit(e.target.value)} defaultValue="">
                //Default non-selectable option
                <option value="" disabled>Select a Circuit</option>
                //Make an array of keys from the circuitData object and dynamically create options
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