import axios from 'axios';
import User from '../models/userModel.js';
import SavedArticle from '../models/newsModel.js';
import dotenv from 'dotenv';

dotenv.config();

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

const isRelevant = (article) => {
    let count = 0;
    const combinedText = `${article.title} ${article.description || ''}`.toLowerCase();
    const f1Keywords = [
        'formula 1', 'f1', 'f1 racing', 'grand prix', 'qualifying',
        'free practice 1', 'free practice 2', 'free practice 3',
        'q 1', 'q 2', 'q 3', 'race weekend', 'fia', 'stewards',
        'ferrari', 'mercedes', 'red bull', 'mclaren', 'alpine',
        'aston martin', 'haas', 'williams', 'pirelli',
        'fia f1 world championship', 'paddock', 'pit stops',
        'podium', 'drivers championship', 'constructors championship',
        'oscar piastri', 'lando norris', 'max verstappen', 'george russell',
        'charles leclerc', 'lewis hamilton', 'kimi antonelli', 'alex albon',
        'isack hadjar', 'esteban ocon', 'nico hulkenberg', 'lance stroll',
        'carlos sainz', 'pierre gasly', 'yuki tsunoda', 'oliver bearman',
        'liam lawson', 'fernando alonso', 'gabriel bortoleto', 'franco colapinto'
      ];

    f1Keywords.forEach(keyword => {
        if(combinedText.includes(keyword)) count++;
    });

    return count >= 2;
};


export const getF1News = async(req, res) => {
    try {
        const response = await axios.get(NEWS_API_URL, {
            params: {
                q: 'formula 1 OR F1 OR Formula 1 OR F1 Racing OR Grand Prix',
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: 50,
                apiKey: NEWS_API_KEY
            }
        });
        let filteredArticles = []; // Declare variable

        if(response.data.status === 'ok'){
            console.log('F1 Articles fetched successfully');
            filteredArticles = response.data.articles.filter(isRelevant); 
            console.log(`Filtered to ${filteredArticles.length} relevant F1 articles`);
        }
        res.json({ articles: filteredArticles.slice(0, 50) });
    }
    catch (error) {
        console.error('Error in fetching F1 news: ', error);
        res.status(500).json({ message: 'Error fetching F1 news', error: error.message });
    } 
};


export const saveArticle = async (req, res) => {
    try {
        const { title, description, url, urlToImage, publishedAt, source, category, relatedTo } = req.body;
        
        const existingSavedArticle = await SavedArticle.findOne({ url, userId: req.userId });
        
        if (existingSavedArticle) {
            return res.status(400).json({ message: 'Article already saved' });
        }
        
        const savedArticle = new SavedArticle({
            title,
            description,
            url,
            urlToImage,
            publishedAt,
            source,
            userId: req.userId,
            category: category || 'general',
            relatedTo
        });
        
        await savedArticle.save();
        
        // Update user's savedArticles array
        await User.findByIdAndUpdate(
            req.userId,
            { $push: { savedArticles: savedArticle._id } }
        );
        
        res.status(201).json({ 
            message: 'Article saved successfully',
            savedArticle
        });
    }

    catch (error) {
        console.error('Error saving article:', error);
        res.status(500).json({ message: 'Error saving article', error: error.message });
    }
};

export const removeSavedArticle = async (req, res) => {
    try {
        const { articleId } = req.params;
        
        const savedArticle = await SavedArticle.findOne({ 
            _id: articleId,
            userId: req.userId
        });
        
        if (!savedArticle) {
            return res.status(404).json({ message: 'Saved article not found' });
        }
        
        // Remove article from saved articles collection
        await SavedArticle.deleteOne({ _id: articleId });
        
        // Remove reference from user's savedArticles array
        await User.findByIdAndUpdate(
            req.userId,
            { $pull: { savedArticles: articleId } }
        );
        
        res.json({ message: 'Article removed from saved articles' });
    } catch (error) {
        console.error('Error removing saved article:', error);
        res.status(500).json({ message: 'Error removing saved article', error: error.message });
    }
};

export const getSavedArticles = async (req, res) => {
    try {
        const { category } = req.query;
        
        let query = { userId: req.userId };
        
        // Add category filter if specified
        if (category) {
            query.category = category;
        }
        
        const savedArticles = await SavedArticle.find(query)
            .sort({ savedAt: -1 });
        
        res.json({ savedArticles });
    } catch (error) {
        console.error('Error fetching saved articles:', error);
        res.status(500).json({ message: 'Error fetching saved articles', error: error.message });
    }
};