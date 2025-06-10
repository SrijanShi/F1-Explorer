import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashBoard.css';

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <h1>F1 Explorer</h1>
                <div className="nav-buttons">
                    
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </nav>

            <section className="hero-banner">
                <h2>Welcome to F1 Explorer 🏁</h2>
                <p>Track Drivers, Circuits & Performance in Real-Time</p>
            </section>

            <div className="services-grid">
                <div className="service-card" onClick={() => navigate('/profile')}>
                    <h2>👤 My Profile</h2>
                    <p>Manage your account and preferences</p>
                </div>
                <div className="service-card" onClick={() => navigate('/drivers')}>
                    <h2>🏎️ Drivers</h2>
                    <p>Explore all current F1 drivers and their stats</p>
                </div>
                <div className="service-card" onClick={() => navigate('/circuits')}>
                    <h2>🗺️ Circuits</h2>
                    <p>Discover F1 race tracks around the world</p>
                </div>
                <div className="service-card" onClick={() => navigate('/news')}>
                    <h2>📰 News</h2>
                    <p>Stay updated with the latest F1 news</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;