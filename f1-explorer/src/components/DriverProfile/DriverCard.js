import React, { useState } from 'react';
import './DriverCard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const DriverCard = ({ driver, onClick }) => {
    const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
    const optimizedImageUrl = `http://localhost:3002/optimized-image?imageUrl=${encodeURIComponent(driver.headshot_url)}&width=200&height=200`;

    const addToFavorites = async (e) => {
        e.stopPropagation();
        setIsFavoriteLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/user/favorites`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    driver_number: driver.driver_number,
                    full_name: driver.full_name,
                    team_name: driver.team_name,
                    team_colour: driver.team_colour,
                    headshot_url: driver.headshot_url
                })
            });

            if (response.ok) {
                alert('Driver added to favorites!');
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to add to favorites');
            }
        } catch (error) {
            console.error('Error adding to favorites:', error);
            alert('Error adding driver to favorites');
        } finally {
            setIsFavoriteLoading(false);
        }
    };

    return (
        <div className="driver-card" style={{ '--team-color': `#${driver.team_colour}` }}>
            <img src={optimizedImageUrl} alt={driver.full_name} onClick={onClick} />
            <h3 className="driver-name" onClick={onClick}>{driver.full_name}</h3>
            <p className="driver-number" onClick={onClick}>
                #{driver.driver_number} - <span className="driver-team">{driver.team_name}</span>
            </p>
            <button 
                className="favorite-btn" 
                onClick={addToFavorites}
                disabled={isFavoriteLoading}
            >
                {isFavoriteLoading ? 'Adding...' : '❤️ Add to Favorites'}
            </button>
        </div>
    );
};

export default DriverCard;