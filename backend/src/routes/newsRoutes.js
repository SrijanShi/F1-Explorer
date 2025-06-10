import express from 'express';
import {
    getF1News, 
    saveArticle,
    removeSavedArticle,
    getSavedArticles
} from '../controllers/newsController.js';
import auth from '../middlewares/auth.js'

const router = express.Router();

router.get('/f1', getF1News);

// Saved articles routes
router.post('/save', auth, saveArticle);
router.delete('/saved/:articleId', auth, removeSavedArticle);
router.get('/saved', auth, getSavedArticles);

export default router;