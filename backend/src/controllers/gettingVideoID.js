import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { F1Video } from '../models/highlightModel.js'; 

dotenv.config();

const __filename = fileURLToPath(import.meta.url)// Get the current file's path, converts this URL to a usable file path;
const __dirname = path.dirname(__filename);

// Remove hardcoded API key - use only environment variable
const F1_HIGHLIGHTS_PLAYLIST_ID = 'PLfoNZDHitwjUleAqrgG-OC5gVAL2mv-Mh';
const OUTPUT_FILE = path.join(__dirname, '../data/f1_video_ids.json');

// Add debugging for environment variables
console.log('YouTube API Key loaded:', process.env.YOUTUBE_API_KEY ? 'Yes' : 'No');
console.log('YouTube API Key first 10 chars:', process.env.YOUTUBE_API_KEY?.substring(0, 10));

// Recursively create the data directory if it doesn't exist, like id parent folder is not present it will create that too
if(!fs.existsSync(path.join(__dirname, '../data'))){
    fs.mkdirSync(path.join(__dirname, '../data'), {recursive: true});
}

// ... keep your existing imports (axios, F1Video, etc.)

export async function setRaceHighlightVideoId(req, res){
    try {
        console.log('Fetching F1 video Ids from the Youtube API....');

        // Add validation for API key
        if (!process.env.YOUTUBE_API_KEY) {
            console.error('YouTube API key not found in environment variables');
            return res.status(500).json({ 
                message: 'YouTube API key not configured',
                error: 'YOUTUBE_API_KEY environment variable is missing'
            });
        }

        let allVideos = [];
        let nextPageToken = '';
        let hasMorePages = true;

        while (hasMorePages) {
            console.log(`Fetching page with token: ${nextPageToken || 'first page'}`);
            
            const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
                params: {
                    part: 'snippet',
                    playlistId: F1_HIGHLIGHTS_PLAYLIST_ID, // Using the playlist ID
                    maxResults: 50,
                    pageToken: nextPageToken,
                    key: process.env.YOUTUBE_API_KEY
                }
            });

            console.log(`API Response status: ${response.status}`);
            console.log(`Items received: ${response.data.items?.length || 0}`);

            if (!response.data.items || response.data.items.length === 0) {
                break;
            }

            const videos = response.data.items.map(item => ({
                videoId: item.snippet.resourceId.videoId,
                title: item.snippet.title,
                publishedAt: new Date(item.snippet.publishedAt)
            }));

            allVideos = [...allVideos, ...videos];

            if (response.data.nextPageToken) {
                nextPageToken = response.data.nextPageToken;
            } else {
                hasMorePages = false;
            }
        }

        console.log(`Fetched ${allVideos.length} video IDs. Syncing with database...`);

        // Add database operation logging
        let insertedCount = 0;
        let updatedCount = 0;
        let errorCount = 0;

        for (const video of allVideos) {
            try {
                // Use updateOne with upsert to create or update videos
                const result = await F1Video.updateOne(
                    { videoId: video.videoId },
                    { $set: { title: video.title, publishedAt: video.publishedAt } },
                    { upsert: true }
                );
                
                if (result.upsertedCount > 0) {
                    insertedCount++;
                    console.log(`✅ Inserted new video: ${video.videoId} - ${video.title.substring(0, 50)}...`);
                } else if (result.modifiedCount > 0) {
                    updatedCount++;
                    console.log(`🔄 Updated video: ${video.videoId} - ${video.title.substring(0, 50)}...`);
                } else {
                    console.log(`⏭️ No changes for video: ${video.videoId}`);
                }
                
            } catch (dbError) {
                errorCount++;
                console.error(`❌ Database error for video ${video.videoId}:`, dbError.message);
            }
        }

        console.log(`Database sync complete: ${insertedCount} inserted, ${updatedCount} updated, ${errorCount} errors`);
        
        // Send a success response back to the client
        return res.status(200).json({
            message: `Successfully synced ${allVideos.length} videos.`,
            details: {
                total: allVideos.length,
                inserted: insertedCount,
                updated: updatedCount,
                errors: errorCount
            }
        });

    } catch (error) {
        console.error('Error syncing highlights:', error.message);
        console.error('Full error:', error);
        
        // Check if it's a YouTube API error
        if (error.response?.status === 403) {
            console.error('YouTube API quota exceeded or invalid API key');
            return res.status(403).json({
                message: 'YouTube API access denied. Check API key and quota.',
                error: error.message
            });
        }
        
        if (error.response?.status === 400) {
            console.error('Invalid YouTube API request');
            return res.status(400).json({
                message: 'Invalid request to YouTube API.',
                error: error.message
            });
        }
        
        // Send an error response back to the client
        return res.status(500).json({
            message: 'Failed to sync highlights.',
            error: error.message,
            details: error.response?.data || 'No additional details'
        });
    }
};

// ... keep your getF1HighlightVideoIds function as it is ...

export async function getF1HighlightVideoIds(req, res)
{
    try {
        const videoIds = await F1Video.find().sort({publishedAt: -1}).limit(50);
        res.status(200).json(videoIds);
    }
    catch (error) {
        res.status(500).json({message: "Failed to fetch F1 video Ids from DB", error: error.message});
    }
}
// If this file is run directly, fetch the video IDs and exit the process
if(process.argv[1] === fileURLToPath(import.meta.url)){
    setRaceHighlightVideoId().then(() => {
        console.log('Finished fetching F1 video Ids');
        process.exit(0);//Successful exit
    }).catch(error => {
        console.error('Execution error: ', error);
        process.exit(1);//Unsuccessful exit
    });
};
