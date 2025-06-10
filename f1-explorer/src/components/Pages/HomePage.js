import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    return (
        <div className="homepage-container">
            <div className="hero-section">
                <h1>Welcome to F1 Explorer</h1>
                <p>Your ultimate destination for Formula 1 insights</p>
                <div className="auth-buttons">
                    <Link to="/login" className="auth-btn login">Login</Link>
                    <Link to="/signup" className="auth-btn signup">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default HomePage;