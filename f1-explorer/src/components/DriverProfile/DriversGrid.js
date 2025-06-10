import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDrivers } from '../../api/openF1.js';
import DriverCard from './DriverCard';
import './DriversGrid.css';

const DriversGrid = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDrivers()
            .then(data => {
                setDrivers(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching drivers:', error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <h2>Loading drivers...</h2>
            </div>
        );
    }

    return (
        <div className="grid-container">
            <button className="back-button" onClick={() => navigate('/dashboard')}>
                ← Back to Dashboard
            </button>
            <h1 className="grid-title">F1 Drivers</h1>
            <div className="drivers-grid">
                {drivers.map(driver => (
                    <DriverCard 
                        key={driver.driver_number} 
                        driver={driver} 
                        onClick={() => navigate(`/drivers/${driver.driver_number}`)}
                    />
                ))}
            </div>
        </div>
    );
};

export default DriversGrid;
