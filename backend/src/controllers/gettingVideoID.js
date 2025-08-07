import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { F1Video } from '../models/highlightModel.js'; 

dotenv.config();

const __filename = fileURLToPath(import.meta.url)// Get the current file's path, converts this URL to a usable file path;
const __dirname = path.dirname(__filename);

const YOUTUBE_API_KEY = 'AIzaSyA3Q3RNtIZtEMsa-NY4i80yr-9FqTF7vpU';
const F1_HIGHLIGHTS_PLAYLIST_ID = 'PLfoNZDHitwjUleAqrgG-OC5gVAL2mv-Mh';
const OUTPUT_FILE = path.join(__dirname, '../data/f1_video_ids.json');

// Recursively create the data directory if it doesn't exist, like id parent folder is not present it will create that too
if(!fs.existsSync(path.join(__dirname, '../data'))){
    fs.mkdirSync(path.join(__dirname, '../data'), {recursive: true});
}

// ... keep your existing imports (axios, F1Video, etc.)

export async function setRaceHighlightVideoId(req, res){
    try {
        console.log('Fetching F1 video Ids from the Youtube API....');

        let allVideos = [];
        let nextPageToken = '';
        let hasMorePages = true;

        while (hasMorePages) {
            const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
                params: {
                    part: 'snippet',
                    playlistId: F1_HIGHLIGHTS_PLAYLIST_ID, // Using the playlist ID
                    maxResults: 50,
                    pageToken: nextPageToken,
                    key: process.env.YOUTUBE_API_KEY
                }
            });

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

        for (const video of allVideos) {
            // Use updateOne with upsert to create or update videos
            await F1Video.updateOne(
                { videoId: video.videoId },
                { $set: { title: video.title, publishedAt: video.publishedAt } },
                { upsert: true }
            );
        }

        console.log('Video IDs synced with MongoDB successfully.');
        // Send a success response back to the client
        return res.status(200).json({
            message: `Successfully synced ${allVideos.length} videos.`
        });

    } catch (error) {
        console.error('Error syncing highlights:', error.message);
        // Send an error response back to the client
        return res.status(500).json({
            message: 'Failed to sync highlights.',
            error: error.message
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
