import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

export const auth0Login = async(req, res) => {
    try {
        const { email, name, sub } = req.body;
        let user = await User.findOne({ auth0Id: sub });
        if(!user) {
            user = await User.findOne({ email }); //If user has signed up earlier but didnt use Auth0 for the purpose of registering and now is using auth0 for login

            if(user) {
                user.auth0Id = sub;
                await user.save();
            }
            else {
                user = new User({
                    name, 
                    email,
                    auth0Id: sub,
                    password: Math.random().toString(36).slice(-8), // Generate a random password
                });
                await user.save();
            }
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({
            message: 'Login Successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch (error) {
        res.status(500).json({message: 'Error with Auth0 login', error: error.message});
    }
};

// Get user profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { name, favorite_team } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { 
                name,
                favorite_team,
                profile_completed: true
            },
            { new: true }
        ).select('-password');
        
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};

// Add favorite driver
export const addFavoriteDriver = async (req, res) => {
    try {
        const { driver_number, full_name, team_name, team_colour, headshot_url } = req.body;
        
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if driver already exists in favorites
        const driverExists = user.favorite_drivers.some(driver => 
            driver.driver_number === driver_number
        );
        
        if (driverExists) {
            return res.status(400).json({ message: 'Driver already in favorites' });
        }
        
        user.favorite_drivers.push({
            driver_number,
            full_name,
            team_name,
            team_colour,
            headshot_url
        });
        
        await user.save();
        
        res.json({
            message: 'Driver added to favorites',
            favorite_drivers: user.favorite_drivers
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding favorite driver', error: error.message });
    }
};

// Remove favorite driver
export const removeFavoriteDriver = async (req, res) => {
    try {
        const { driver_number } = req.params;
        
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.favorite_drivers = user.favorite_drivers.filter(
            driver => driver.driver_number !== driver_number
        );
        
        await user.save();
        
        res.json({
            message: 'Driver removed from favorites',
            favorite_drivers: user.favorite_drivers
        });
    } catch (error) {
        res.status(500).json({ message: 'Error removing favorite driver', error: error.message });
    }
};

// Add race prediction
export const addPrediction = async (req, res) => {
    try {
        const { race_name, race_date, prediction } = req.body;
        
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.predictions.push({
            race_name,
            race_date,
            prediction
        });
        
        await user.save();
        
        res.json({
            message: 'Prediction added successfully',
            predictions: user.predictions
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding prediction', error: error.message });
    }
};