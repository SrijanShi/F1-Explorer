import express from 'express';
import { 
    signup, 
    login, 
    getProfile,
    updateProfile,
    addFavoriteDriver,
    removeFavoriteDriver,
    addPrediction,
    auth0Login
} from '../controllers/userController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();


router.post('/signup', signup);
router.post('/login', login);
router.post('/auth0', auth0Login);


router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);


router.post('/favorites', auth, addFavoriteDriver);
router.delete('/favorites/:driver_number', auth, removeFavoriteDriver);


router.post('/predictions', auth, addPrediction);

export default router;