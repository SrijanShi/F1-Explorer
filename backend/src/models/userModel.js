import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


// Create schemas for nested documents
const favoriteDriverSchema = new mongoose.Schema({
    driver_number: {
        type: String,
        required: true
    },
    full_name: {
        type: String,
        required: true
    },
    team_name: {
        type: String
    },
    team_colour: {
        type: String
    },
    headshot_url: {
        type: String
    },
    added_on: {
        type: Date,
        default: Date.now
    }
});

const predictionSchema = new mongoose.Schema({
    race_name: {
        type: String,
        required: true
    },
    race_date: {
        type: Date,
        required: true
    },
    prediction: [{
        position: Number,
        driver_number: String,
        driver_name: String
    }],
    actual_result: [{
        position: Number,
        driver_number: String,
        driver_name: String
    }],
    accuracy_score: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Main user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function() {
            return !this.auth0Id;
        },
        minlength: 6
    },
    auth0Id: {
        type: String,
        sparse: true,
        unique: true
    },
    favorite_drivers: [favoriteDriverSchema],
    predictions: [predictionSchema],
    favorite_team: {
        type: String,
        default: ''
    },
    total_points: {
        type: Number,
        default: 0
    },
    profile_completed: {
        type: Boolean,
        default: false
    },
    savedArticles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SavedArticle'
    }]
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;