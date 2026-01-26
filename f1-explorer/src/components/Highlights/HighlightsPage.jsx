import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HighlightCard from './HighlightCard';
import HighlightDetail from './HighlightDetail';
import './Highlights.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const HighlightsPage = () => {
    const [highlights, setHighlights] = useState([]);
    const [selectedHighlight, setSelectedHighlight] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHighlights();
    }, []);

    const fetchHighlights = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/highlights/get`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch highlights');
            }
            
            const data = await response.json();
            
            if (Array.isArray(data) && data.length > 0) {
                setHighlights(data);
            } else {
                setHighlights([]);
            }
            
            setError(null);
        } catch (err) {
            console.error('Error fetching highlights:', err);
            setError('Failed to load highlights. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleHighlightSelect = (videoId) => {
        const highlight = highlights.find(h => h.videoId === videoId);
        if (highlight) {
            setSelectedHighlight(highlight);
        }
    };

    const handleBackToList = () => {
        setSelectedHighlight(null);
    };

    if (loading) {
        return (
            <div className="highlights-container">
                <button className="back-button" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading highlights...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="highlights-container">
                <button className="back-button" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button className="retry-button" onClick={fetchHighlights}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (highlights.length === 0) {
        return (
            <div className="highlights-container">
                <button className="back-button" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>
                <div className="no-highlights">
                    <h2>No highlights available</h2>
                    <p>Please check back later for F1 race highlights.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="highlights-container">
            <button className="back-button" onClick={() => navigate('/dashboard')}>
                ← Back to Dashboard
            </button>
            
            {selectedHighlight ? (
                <HighlightDetail 
                    highlight={selectedHighlight} 
                    onBack={handleBackToList}
                />
            ) : (
                <>
                    <h1 className="highlights-title">F1 Race Highlights</h1>
                    
                    {highlights.length > 0 && (
                        <div className="featured-highlight">
                            <div className="featured-header">
                                <h2>Latest Race Highlight</h2>
                            </div>
                            <div 
                                className="featured-card" 
                                onClick={() => handleHighlightSelect(highlights[0].videoId)}
                            >
                                <div className="featured-thumbnail-container">
                                    <img 
                                        src={`https://img.youtube.com/vi/${highlights[0].videoId}/maxresdefault.jpg`}
                                        alt={highlights[0].title} 
                                        className="featured-thumbnail" 
                                        onError={(e) => {
                                            e.target.src = `https://img.youtube.com/vi/${highlights[0].videoId}/hqdefault.jpg`;
                                        }}
                                    />
                                    <div className="play-button">
                                        <span className="play-icon">▶</span>
                                    </div>
                                    <div className="latest-badge">LATEST</div>
                                </div>
                                
                                <div className="featured-content">
                                    <h3 className="featured-title">{highlights[0].title}</h3>
                                    <p className="featured-details">
                                        📅 {new Date(highlights[0].publishedAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <h2>Previous Race Highlights</h2>
                    
                    <div className="highlights-grid">
                        {highlights.slice(1).map(highlight => (
                            <HighlightCard 
                                key={highlight.videoId}
                                highlight={highlight}
                                onClick={() => handleHighlightSelect(highlight.videoId)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default HighlightsPage;