import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
    const { isAuthenticated, user, isLoading } = useAuth0();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (isLoading) return;

        const handleAuthCallback = async () => {
            if (isAuthenticated && user) {
                setProcessing(true);
                try {
                    const payload = {
                        email: user.email,
                        name: user.name,
                        sub: user.sub
                    };
                    
                    // Send user data to your backend
                    const response = await fetch('http://localhost:5000/api/auth/auth0', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        localStorage.setItem('token', data.token);
                        navigate('/dashboard');
                    } else {
                        throw new Error('Failed to authenticate with server');
                    }
                } catch (error) {
                    console.error('Auth0 callback error:', error);
                    setError('Authentication failed. Please try again.');
                } finally {
                    setProcessing(false);
                }
            } else if (!isLoading && !isAuthenticated) {
                navigate('/login');
            }
        };

        handleAuthCallback();
    }, [isAuthenticated, isLoading, user, navigate]);

    if (isLoading || processing) {
        return (
            <div className="auth-container">
                <div className="auth-box">
                    <h2>Processing</h2>
                    <div className="spinner"></div>
                    <p>Completing authentication...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="auth-container">
                <div className="auth-box">
                    <h2>Error</h2>
                    <div className="error-message">{error}</div>
                    <button 
                        className="auth-button"
                        onClick={() => navigate('/login')}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default Callback;