import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();
    
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [profileForm, setProfileForm] = useState({
        name: '',
        favorite_team: ''
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/user/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                    setProfileForm({
                        name: data.name || '',
                        favorite_team: data.favorite_team || ''
                    });
                } else {
                    throw new Error('Failed to fetch profile');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileForm)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                setSuccessMessage('Profile updated successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile');
            setTimeout(() => setError(''), 3000);
        }
    };

    const addFavoriteDriver = async (driver) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/user/favorites`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(driver)
            });

            if (response.ok) {
                const data = await response.json();
                setUser(prevUser => ({
                    ...prevUser,
                    favorite_drivers: data.favorite_drivers
                }));
                setSuccessMessage('Driver added to favorites');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                throw new Error('Failed to add favorite driver');
            }
        } catch (error) {
            console.error('Error adding favorite driver:', error);
            setError('Failed to add driver to favorites');
            setTimeout(() => setError(''), 3000);
        }
    };

    const removeFavoriteDriver = async (driverNumber) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/user/favorites/${driverNumber}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(prevUser => ({
                    ...prevUser,
                    favorite_drivers: data.favorite_drivers
                }));
                setSuccessMessage('Driver removed from favorites');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                throw new Error('Failed to remove favorite driver');
            }
        } catch (error) {
            console.error('Error removing favorite driver:', error);
            setError('Failed to remove driver from favorites');
            setTimeout(() => setError(''), 3000);
        }
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <nav className="profile-nav">
                <h1>F1 Explorer</h1>
                <div>
                    <button onClick={() => navigate('/dashboard')} className="nav-btn">
                        Dashboard
                    </button>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </nav>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <div className="profile-content">
                <div className="profile-sidebar">
                    <div className="user-info">
                        <div className="profile-avatar">
                            {user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <h2>{user?.name || "User"}</h2>
                        <p>{user?.email || "user@example.com"}</p>
                    </div>

                    <div className="profile-tabs">
                        <button 
                            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
                            onClick={() => setActiveTab('favorites')}
                        >
                            Favorite Drivers
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'predictions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('predictions')}
                        >
                            Race Predictions
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            Settings
                        </button>
                    </div>
                </div>

                <div className="profile-main">
                    {activeTab === 'overview' && (
                        <div className="overview-section">
                            <h2>Profile Overview</h2>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <h3>Member Since</h3>
                                    <p>{new Date(user?.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Favorite Team</h3>
                                    <p>{user?.favorite_team || "Not set"}</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Total Points</h3>
                                    <p>{user?.total_points || 0}</p>
                                </div>
                            </div>
                            <div className="favorite-drivers-preview">
                                <h3>Your Favorite Drivers</h3>
                                {user?.favorite_drivers?.length > 0 ? (
                                    <div className="favorite-drivers-list">
                                        {user.favorite_drivers.slice(0, 3).map(driver => (
                                            <div key={driver.driver_number} className="favorite-driver-item">
                                                <span>{driver.full_name}</span>
                                            </div>
                                        ))}
                                        {user.favorite_drivers.length > 3 && (
                                            <div className="favorite-driver-more">
                                                +{user.favorite_drivers.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="no-data">No favorite drivers yet</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'favorites' && (
                        <div className="favorites-section">
                            <h2>Your Favorite Drivers</h2>
                            {user?.favorite_drivers?.length > 0 ? (
                                <div className="favorites-grid">
                                    {user.favorite_drivers.map(driver => (
                                        <div key={driver.driver_number} 
                                             className="favorite-driver-card"
                                             style={{ borderColor: `#${driver.team_colour}` }}>
                                            <img 
                                                src={`http://localhost:3002/optimized-image?imageUrl=${encodeURIComponent(driver.headshot_url)}&width=100&height=100`} 
                                                alt={driver.full_name} 
                                            />
                                            <h3>{driver.full_name}</h3>
                                            <p>#{driver.driver_number} - {driver.team_name}</p>
                                            <button 
                                                className="remove-favorite"
                                                onClick={() => removeFavoriteDriver(driver.driver_number)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-favorites">
                                    <p>You haven't added any favorite drivers yet.</p>
                                    <button 
                                        className="add-drivers-btn"
                                        onClick={() => navigate('/drivers')}
                                    >
                                        Browse Drivers
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'predictions' && (
                        <div className="predictions-section">
                            <h2>Your Race Predictions</h2>
                            {user?.predictions?.length > 0 ? (
                                <div className="predictions-list">
                                    {user.predictions.map((prediction, index) => (
                                        <div key={index} className="prediction-card">
                                            <h3>{prediction.race_name}</h3>
                                            <p className="race-date">
                                                {new Date(prediction.race_date).toLocaleDateString()}
                                            </p>
                                            <div className="prediction-details">
                                                <h4>Your Prediction</h4>
                                                <ol className="prediction-positions">
                                                    {prediction.prediction.map((pos, idx) => (
                                                        <li key={idx}>
                                                            {pos.driver_name} (#{pos.driver_number})
                                                        </li>
                                                    ))}
                                                </ol>
                                            </div>
                                            {prediction.actual_result?.length > 0 && (
                                                <div className="actual-results">
                                                    <h4>Actual Results</h4>
                                                    <ol className="result-positions">
                                                        {prediction.actual_result.map((pos, idx) => (
                                                            <li key={idx}>
                                                                {pos.driver_name} (#{pos.driver_number})
                                                            </li>
                                                        ))}
                                                    </ol>
                                                    <div className="accuracy">
                                                        <span>Accuracy: {prediction.accuracy_score}%</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-predictions">
                                    <p>You haven't made any race predictions yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="settings-section">
                            <h2>Profile Settings</h2>
                            <form className="settings-form" onSubmit={handleProfileUpdate}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input 
                                        type="text" 
                                        value={profileForm.name} 
                                        onChange={(e) => setProfileForm({
                                            ...profileForm,
                                            name: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input 
                                        type="email" 
                                        value={user?.email} 
                                        disabled 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Favorite Team</label>
                                    <select 
                                        value={profileForm.favorite_team} 
                                        onChange={(e) => setProfileForm({
                                            ...profileForm,
                                            favorite_team: e.target.value
                                        })}
                                    >
                                        <option value="">Select a team</option>
                                        <option value="Mercedes">Mercedes</option>
                                        <option value="Red Bull">Red Bull</option>
                                        <option value="Ferrari">Ferrari</option>
                                        <option value="McLaren">McLaren</option>
                                        <option value="Aston Martin">Aston Martin</option>
                                        <option value="Alpine">Alpine</option>
                                        <option value="Williams">Williams</option>
                                        <option value="RB">Racing Bulls</option>
                                        <option value="Haas">Haas</option>
                                        <option value="Sauber">Kick Sauber</option>
                                    </select>
                                </div>
                                <button type="submit" className="save-btn">Save Changes</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;