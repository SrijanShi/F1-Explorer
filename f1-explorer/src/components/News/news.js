import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './news.css';

const News = () => {
    const [articles, setArticles] = useState([]);
    const [savedArticles, setSavedArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('f1');
    const navigate = useNavigate();

    useEffect(() => {
        fetchNews(activeTab);
    }, [activeTab]);

    const fetchNews = async (tab) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            let endpoint;
            switch (tab) {
                case 'saved':
                    endpoint = 'saved';
                    break;
                case 'f1':
                default:
                    endpoint = 'f1';
                    break;
            }

            const res = await fetch(`http://localhost:5000/api/news/${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch news');
            }

            const data = await res.json();
            
            if (tab === 'saved') {
                setSavedArticles(data.savedArticles);
            } else {
                setArticles(data.articles);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveArticle = async (article) => {
        try {
            const token = localStorage.getItem('token');
            
            const articleData = {
                title: article.title,
                description: article.description,
                url: article.url,
                urlToImage: article.urlToImage,
                publishedAt: article.publishedAt,
                source: article.source,
                category: 'general'
            };
            
            const res = await fetch('http://localhost:5000/api/news/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(articleData)
            });

            if (res.ok) {
                alert('Article saved successfully!');
            } else {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to save article');
            }
        } catch (error) {
            console.error('Error saving article:', error);
            alert(error.message);
        }
    };

    const handleUnsaveArticle = async (articleId) => {
        try {
            const token = localStorage.getItem('token');
            
            const res = await fetch(`http://localhost:5000/api/news/saved/${articleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                // Refresh the saved articles list
                setSavedArticles(savedArticles.filter(article => article._id !== articleId));
                alert('Article removed from saved list');
            } else {
                throw new Error('Failed to remove article');
            }
        } catch (error) {
            console.error('Error removing article:', error);
            alert(error.message);
        }
    };

    if (loading) return <div className="news-container">Loading news...</div>;
    if (error) return <div className="news-container">Error: {error}</div>;

    return (
        <div className="news-container">
            <button 
                className="back-button" 
                onClick={() => navigate('/dashboard')}
            >
                ← Back to Dashboard
            </button>
            
            <h1>Formula 1 News</h1>
            
            <div className="news-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'f1' ? 'active' : ''}`}
                    onClick={() => setActiveTab('f1')}
                >
                    F1 News
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
                    onClick={() => setActiveTab('saved')}
                >
                    Saved Articles
                </button>
            </div>
            
            {activeTab === 'f1' && (
                <div className="articles-list">
                    {articles.length === 0 ? (
                        <p>No articles found.</p>
                    ) : (
                        articles.map((article, index) => (
                            <div key={index} className="article-item">
                                {article.urlToImage && (
                                    <img 
                                        src={article.urlToImage} 
                                        alt={article.title} 
                                        className="article-image"
                                    />
                                )}
                                <div className="article-content">
                                    <h3>{article.title}</h3>
                                    <p>{article.description}</p>
                                    <div className="article-meta">
                                        <span>{article.source?.name} - {new Date(article.publishedAt).toLocaleDateString()}</span>
                                        <div className="article-actions">
                                            <a 
                                                href={article.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="read-link"
                                            >
                                                Read Article
                                            </a>
                                            <button 
                                                className="save-btn"
                                                onClick={() => handleSaveArticle(article)}
                                            >
                                                Save for Later
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            
            {activeTab === 'saved' && (
                <div className="articles-list">
                    {savedArticles.length === 0 ? (
                        <p>No saved articles yet.</p>
                    ) : (
                        savedArticles.map((article) => (
                            <div key={article._id} className="article-item saved">
                                {article.urlToImage && (
                                    <img 
                                        src={article.urlToImage} 
                                        alt={article.title} 
                                        className="article-image"
                                    />
                                )}
                                <div className="article-content">
                                    <h3>{article.title}</h3>
                                    <p>{article.description}</p>
                                    <div className="article-meta">
                                        <span>{article.source?.name} - {new Date(article.publishedAt).toLocaleDateString()}</span>
                                        <div className="article-actions">
                                            <a 
                                                href={article.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="read-link"
                                            >
                                                Read Article
                                            </a>
                                            <button 
                                                className="unsave-btn"
                                                onClick={() => handleUnsaveArticle(article._id)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default News;