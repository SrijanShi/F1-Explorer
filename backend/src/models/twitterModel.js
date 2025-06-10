import mongoose from "mongoose";

const twitterSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        required: true
    },
    profileImageUrl: {
        type: String,
    },
    category: {
        type: String,
        enum: ['driver', 'team'],
        default: 'driver'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const tweetSchema = new mongoose.Schema({
    tweetId: {
        type: String, 
        required: true,
        unique: true
    },
    authorId: {
        type: String,
        required: true,
        ref: 'TwitterUser'
    },
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    metrics: {
        likeCount: Number,
        retweetCount: Number,
        replyCount: Number,
        quoteCount: Number
    },
    mediaUrls: [String],
    fetchedAt: {
        type: Date,
        default: Date.now
    }
});

const TwitterUser = mongoose.model('TwitterUser', twitterSchema);
const Tweet = mongoose.model('Tweet', tweetSchema);

export { TwitterUser,  Tweet};
