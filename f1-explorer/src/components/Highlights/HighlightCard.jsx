import React from 'react';

const HighlightCard = ({ highlight, onClick }) => {
    return (
        <div className="highlight-card" onClick={onClick}>
            <div className="thumbnail-container">
                <img 
                    src={`https://img.youtube.com/vi/${highlight.videoId}/mqdefault.jpg`} 
                    alt={highlight.title} 
                    className="highlight-thumbnail" 
                    onError={(e) => {
                        e.target.src = `https://img.youtube.com/vi/${highlight.videoId}/hqdefault.jpg`;
                    }}
                />
                <div className="play-button">
                    <span className="play-icon">▶</span>
                </div>
            </div>
            
            <div className="highlight-content">
                <h3 className="highlight-title">{highlight.title}</h3>
                <p className="highlight-date">
                    {new Date(highlight.publishedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </p>
            </div>
        </div>
    );
};

export default HighlightCard;