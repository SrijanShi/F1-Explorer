import axios from 'axios';
import { F1VideoDetail, F1Video } from '../models/highlightModel.js';

export async function processAndSaveVideoDetails(req, res) {
    try {
        console.log("Processing the videos for detailed information...");
        const videoList = await F1Video.find();

        if (videoList.length === 0) {
            return res.status(404).json({ message: 'No videos available in the database.' });
        }

        for (const video of videoList) {
            try {
                console.log(`Processing video: ${video.videoId}`);

                // Fetch transcript from Python service
                let transcriptData = [];
                try {
                    const transcriptResponse = await axios.get(`http://127.0.0.1:8000/transcript/${video.videoId}`);

                    if (transcriptResponse.data && transcriptResponse.data.transcript.length > 0) {
                        transcriptData = transcriptResponse.data.transcript;
                    } else {
                        console.log(`No transcript found for video ID: ${video.videoId}`);
                    }
                } catch (transcriptError) {
                    console.error(`Transcript not available for video ID: ${video.videoId} - ${transcriptError.message}`);
                }

                // Fetch additional video details using YouTube API
                const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
                    params: {
                        part: 'snippet,statistics,contentDetails',
                        id: video.videoId,
                        key: process.env.YOUTUBE_API_KEY
                    }
                });

                const videoData = response.data.items[0];

                if (!videoData) {
                    console.error(`No video details found for video ID: ${video.videoId}`);
                    continue;
                }

                // Save all video details to DB with transcript as JSON array
                await F1VideoDetail.updateOne(
                    { videoId: video.videoId },
                    {
                        $set: {
                            title: videoData.snippet.title,
                            publishedAt: new Date(videoData.snippet.publishedAt),
                            thumbnailUrl: videoData.snippet.thumbnails?.maxres?.url || videoData.snippet.thumbnails?.high?.url,
                            viewCount: parseInt(videoData.statistics.viewCount) || 0,
                            likeCount: parseInt(videoData.statistics.likeCount) || 0,
                            duration: videoData.contentDetails.duration,
                            transcript: transcriptData // Store as JSON array exactly as received
                        }
                    },
                    { upsert: true }
                );

                console.log(`Successfully stored video details for video ID: ${video.videoId}`);

                // Optional: Delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (innerError) {
                console.error(`Error processing video ID ${video.videoId}:`, innerError.message);
            }
        }

        res.status(200).json({ message: "All videos processed and details saved successfully" });

    } catch (error) {
        console.error('Error processing videos: ', error.message);
        res.status(500).json({ message: 'Error processing videos', error: error.message });
    }
};

export async function getVideoDetails(req, res) {
    try {
      const { videoId } = req.params;
      
      if (!videoId) {
        return res.status(400).json({message: "Video Id is required"});
      }
      
      // Try to get detailed info
      const videoDetails = await F1VideoDetail.findOne({ videoId });
      
      if (!videoDetails) {
        // Try to get basic info
        const basicVideo = await F1Video.findOne({ videoId });
        
        if (!basicVideo) {
          return res.status(404).json({ message: 'Video not found' });
        }
        
        return res.status(200).json({
          videoId: basicVideo.videoId,
          title: basicVideo.title,
          publishedAt: basicVideo.publishedAt,
          hasTranscript: false,
          hasEvents: false
        });
      }
      
      return res.status(200).json({
        videoId: videoDetails.videoId,
        title: videoDetails.title,
        publishedAt: videoDetails.publishedAt,
        thumbnailUrl: videoDetails.thumbnailUrl,
        duration: videoDetails.duration,
        viewCount: videoDetails.viewCount,
        likeCount: videoDetails.likeCount,
        hasTranscript: Boolean(videoDetails.transcript && videoDetails.transcript.length > 0),
        hasEvents: Boolean(videoDetails.events && videoDetails.events.length > 0)
      });
    }
    catch(error){
      console.error('Error retrieving video details: ', error);
      return res.status(500).json({message: "Error retrieving video details", error: error.message});
    }
  }