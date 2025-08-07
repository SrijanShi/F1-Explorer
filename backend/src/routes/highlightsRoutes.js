import express from 'express';
import { setRaceHighlightVideoId, getF1HighlightVideoIds } from '../controllers/gettingVideoID.js'; 
import { processAndSaveVideoDetails, getVideoDetails } from '../controllers/gettingTranscript.js'; 
import { extractEventsFromTranscripts, getVideoEvents } from '../controllers/gettingEvents.js';
import { getVideoById, getAllVideosWithDetails } from '../controllers/highlightController.js';

const router = express.Router();

router.post('/post', setRaceHighlightVideoId);
router.post('/process', processAndSaveVideoDetails);
router.post('/events', extractEventsFromTranscripts);

router.get('/get', getF1HighlightVideoIds);
router.get('/videos', getAllVideosWithDetails); 
router.get('/video/:videoId', getVideoById); 
router.get('/details/:videoId', getVideoDetails); 
router.get('/events/:videoId', getVideoEvents);

export default router;