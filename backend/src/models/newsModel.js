import mongoose from 'mongoose';

const savedArticleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    url: {
        type: String,
        required: true
    },
    urlToImage: {
        type: String
    },
    publishedAt: {
        type: Date,
        required: true
    },
    source: {
        name: String,
        id: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    savedAt: {
        type: Date,
        default: Date.now
    },
    category: {
        type: String,
        enum: ['general', 'driver', 'team', 'race'],
        default: 'general'
    },
    relatedTo: {
        type: String, // Could be driver name, team name........
    }
});

// Create a compound index to prevent duplicate saved articles for a user
savedArticleSchema.index({ url: 1, userId: 1 }, { unique: true });

const SavedArticle = mongoose.model('SavedArticle', savedArticleSchema);
export default SavedArticle;