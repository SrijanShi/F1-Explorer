import React, { useState } from 'react';
import CircuitMap from './CircuitMap';
import CircuitSelector from './CircuitSelector';
import './CircuitTracker.css'; 

const CircuitTracker = () => {
    const [selectedCircuit, setSelectedCircuit] = useState(null);

    return (
        <div className="tracker-container">
            <CircuitSelector setSelectedCircuit={setSelectedCircuit} />
            {selectedCircuit && <CircuitMap selectedCircuit={selectedCircuit} />}
        </div>
    );
};

export default CircuitTracker;
