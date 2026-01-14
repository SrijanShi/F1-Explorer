import mongoose from 'mongoose';

// Driver social accounts mapping
const driverSocialSchema = new mongoose.Schema({
    driver_number: {
        type: String,
        required: true,
        unique: true
    },
    full_name: {
        type: String,
        required: true
    },
    instagram_username: {
        type: String,
        default: null
    },
    twitter_username: {
        type: String,
        default: null
    },
    team_name: {
        type: String
    },
    is_active: {
        type: Boolean,
        default: true
    },
    last_updated: {
        type: Date,
        default: Date.now
    }
});

// Instagram posts schema
const instagramPostSchema = new mongoose.Schema({
    post_id: {
        type: String,
        required: true,
        unique: true
    },
    driver_number: {
        type: String,
        required: true
    },
    driver_name: {
        type: String,
        required: true
    },
    instagram_username: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        default: ''
    },
    media_type: {
        type: String,
        enum: ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'],
        required: true
    },
    media_url: {
        type: String,
        required: true
    },
    thumbnail_url: {
        type: String,
        default: null
    },
    permalink: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    like_count: {
        type: Number,
        default: 0
    },
    comments_count: {
        type: Number,
        default: 0
    },
    fetched_at: {
        type: Date,
        default: Date.now
    }
});

// Twitter posts schema (for later)
const twitterPostSchema = new mongoose.Schema({
    tweet_id: {
        type: String,
        required: true,
        unique: true
    },
    driver_number: {
        type: String,
        required: true
    },
    driver_name: {
        type: String,
        required: true
    },
    twitter_username: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    media_urls: [{
        type: String
    }],
    created_at: {
        type: Date,
        required: true
    },
    public_metrics: {
        like_count: Number,
        retweet_count: Number,
        reply_count: Number,
        quote_count: Number
    },
    fetched_at: {
        type: Date,
        default: Date.now
    }
});

driverSocialSchema.index({ driver_number: 1 });
instagramPostSchema.index({ driver_number: 1, timestamp: -1 });
instagramPostSchema.index({ fetched_at: -1 });

const DriverSocial = mongoose.model('DriverSocial', driverSocialSchema);
const InstagramPost = mongoose.model('InstagramPost', instagramPostSchema);
const TwitterPost = mongoose.model('TwitterPost', twitterPostSchema);

export { DriverSocial, InstagramPost, TwitterPost };