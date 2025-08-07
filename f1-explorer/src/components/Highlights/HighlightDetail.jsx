import React, { useState, useEffect } from 'react';

const HighlightDetail = ({ highlight, onBack }) => {
    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchVideoData();
    }, [highlight.videoId]);

    const fetchVideoData = async () => {
        try {
            setLoading(true);
            
            // Fetch video details with events
            const response = await fetch(`http://localhost:5000/api/highlights/video/${highlight.videoId}`);
            
            if (!response.ok) {
                throw new Error('Failed to load video details');
            }
            
            const data = await response.json();
            setVideoData(data);
            setLoading(false);
            
        } catch (err) {
            console.error('Error fetching video data:', err);
            setError('Failed to load video details. Please try again.');
            setLoading(false);
        }
    };

    const openYouTubeVideo = (timeInSeconds = 0) => {
        // Open YouTube with timestamp if provided
        const timeParam = timeInSeconds > 0 ? `&t=${timeInSeconds}s` : '';
        window.open(`https://www.youtube.com/watch?v=${highlight.videoId}${timeParam}`, '_blank');
    };

    if (loading) {
        return (
            <div className="highlight-detail">
                <div className="detail-header">
                    <button className="back-button" onClick={onBack}>
                        ← Back to Highlights
                    </button>
                </div>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading video details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="highlight-detail">
                <div className="detail-header">
                    <button className="back-button" onClick={onBack}>
                        ← Back to Highlights
                    </button>
                </div>
                <div className="error-container">
                    <p className="error-message">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="highlight-detail">
            <div className="detail-header">
                <button className="back-button" onClick={onBack}>
                    ← Back to Highlights
                </button>
            </div>
            
            <h1 className="highlight-title">{videoData?.title || highlight.title}</h1>
            
            <div className="video-preview-container">
                <img 
                    src={videoData?.thumbnailUrl || `https://img.youtube.com/vi/${highlight.videoId}/maxresdefault.jpg`}
                    alt={videoData?.title || highlight.title}
                    className="video-preview-image"
                    onError={(e) => {
                        e.target.src = `https://img.youtube.com/vi/${highlight.videoId}/hqdefault.jpg`;
                    }}
                />
                <div className="video-overlay">
                    <div className="embed-error-message">
                        <p>This video is provided by Formula One Management and must be viewed on YouTube.</p>
                    </div>
                    <button className="watch-on-youtube-btn" onClick={() => openYouTubeVideo()}>
                        Watch on YouTube
                        <span className="youtube-icon">▶</span>
                    </button>
                </div>
            </div>
            
            <div className="video-info">
                <p className="video-date">
                    Published on {new Date(videoData?.publishedAt || highlight.publishedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
                
                {videoData?.viewCount && (
                    <div className="video-stats">
                        <div className="stat-item">
                            <span className="stat-icon">👁️</span>
                            <span className="stat-value">{Number(videoData.viewCount).toLocaleString()}</span>
                            <span className="stat-label">views</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-icon">👍</span>
                            <span className="stat-value">{Number(videoData.likeCount).toLocaleString()}</span>
                            <span className="stat-label">likes</span>
                        </div>
                    </div>
                )}
            </div>
            
            {videoData?.events && videoData.events.length > 0 ? (
                <div className="event-list">
                    <h2>Key Moments</h2>
                    <div className="events-container">
                        {videoData.events.map((event, index) => {
                            // Try to extract time in seconds from various formats
                            let timeInSeconds = 0;
                            
                            if (typeof event.timeInSeconds === 'number') {
                                timeInSeconds = event.timeInSeconds;
                            } else if (event.time) {
                                const [minutes, seconds] = event.time.split(':').map(Number);
                                timeInSeconds = (minutes * 60) + seconds;
                            }
                            
                            const formattedTime = event.time || 
                                `${Math.floor(timeInSeconds/60)}:${(timeInSeconds % 60).toString().padStart(2, '0')}`;
                            
                            return (
                                <div 
                                    key={index} 
                                    className="event-item"
                                    onClick={() => openYouTubeVideo(timeInSeconds)}
                                >
                                    <span className="event-time">{formattedTime}</span>
                                    <span className="event-description">
                                        {event.description || event.title || 'Race highlight'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="no-events">
                    <p>No event timeline available for this highlight.</p>
                    <button className="watch-on-youtube-btn margin-top" onClick={() => openYouTubeVideo()}>
                        Watch Full Video on YouTube
                    </button>
                </div>
            )}
        </div>
    );
};

export default HighlightDetail;