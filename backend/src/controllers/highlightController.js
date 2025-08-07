import { F1Video, F1VideoDetail } from '../models/highlightModel.js';

// Get video by ID with its events
export const getVideoById = async (req, res) => {
  try {
    const { videoId } = req.params;
    
    // First try to get detailed info with transcript and events
    let videoDetail = await F1VideoDetail.findOne({ videoId });
    
    if (!videoDetail) {
      // Fall back to basic video info
      const basicVideo = await F1Video.findOne({ videoId });
      
      if (!basicVideo) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      return res.json({
        videoId: basicVideo.videoId,
        title: basicVideo.title,
        publishedAt: basicVideo.publishedAt,
        events: [] // No events available
      });
    }
    
    // Return the video details with events
    res.json({
      videoId: videoDetail.videoId,
      title: videoDetail.title,
      publishedAt: videoDetail.publishedAt,
      thumbnailUrl: videoDetail.thumbnailUrl || `https://img.youtube.com/vi/${videoDetail.videoId}/maxresdefault.jpg`,
      duration: videoDetail.duration,
      events: videoDetail.events || [],
      viewCount: videoDetail.viewCount,
      likeCount: videoDetail.likeCount
    });
  } catch (error) {
    console.error('Error getting video details:', error);
    res.status(500).json({ message: 'Error getting video details', error: error.message });
  }
};

// Get all videos with additional details
export const getAllVideosWithDetails = async (req, res) => {
  try {
    // Get all basic videos
    const basicVideos = await F1Video.find().sort({ publishedAt: -1 });
    
    if (!basicVideos || basicVideos.length === 0) {
      return res.status(404).json({ message: 'No videos found' });
    }
    
    // Get details for all videos
    const videoDetails = await F1VideoDetail.find({
      videoId: { $in: basicVideos.map(v => v.videoId) }
    });
    
    // Create a map for quick lookup
    const detailsMap = videoDetails.reduce((map, detail) => {
      map[detail.videoId] = detail;
      return map;
    }, {});
    
    // Combine the data
    const combinedVideos = basicVideos.map(video => {
      const detail = detailsMap[video.videoId];
      return {
        videoId: video.videoId,
        title: video.title,
        publishedAt: video.publishedAt,
        thumbnailUrl: detail?.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`,
        hasTranscript: detail?.transcript && detail.transcript.length > 0,
        hasEvents: detail?.events && detail.events.length > 0,
        eventCount: detail?.events?.length || 0
      };
    });
    
    res.json(combinedVideos);
  } catch (error) {
    console.error('Error getting all videos with details:', error);
    res.status(500).json({ message: 'Error getting videos', error: error.message });
  }
};