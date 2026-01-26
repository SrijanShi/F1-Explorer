import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { F1VideoDetail } from "../models/highlightModel.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMIMI_API_KEY);

// Add debugging for API key
console.log('Gemini API Key loaded:', process.env.GEMIMI_API_KEY ? 'Yes' : 'No');
console.log('Gemini API Key first 10 chars:', process.env.GEMIMI_API_KEY?.substring(0, 10));

function cleanJsonString(dirtyJson) {
  return dirtyJson
    .replace(/^```json\n?/, "")
    .replace(/\n?```$/, "")
    .replace(/,\s*]/g, ']')
    .replace(/,\s*}/g, '}')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export async function extractEventsFromTranscripts(req, res) {
  try {
    // Only get videos with transcripts but WITHOUT events or with empty events array
    const videos = await F1VideoDetail.find({ 
      transcript: { $exists: true, $ne: [] },
      $or: [
        { events: { $exists: false } },
        { events: { $size: 0 } }
      ]
    });
    
    if (videos.length === 0) {
      console.log('✅ All videos with transcripts already have events!');
      return res.status(200).json({ message: "✔️ All videos already have events extracted." });
    }

    console.log(`📊 Processing ${videos.length} videos without events (skipping ${await F1VideoDetail.countDocuments({ events: { $exists: true, $ne: [] } })} videos that already have events)`);
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    for (const v of videos) {
      try {
        console.log(`Processing video: ${v.videoId} - ${v.title}`);

        // Pass transcript as JSON
        const transcriptJson = JSON.stringify(v.transcript);

        const prompt = `You are an expert Formula 1 race analyst. Extract key Formula 1 events from this transcript.

TRANSCRIPT:
${transcriptJson}

INSTRUCTIONS:
1. Find key F1 events: overtakes, crashes, pit stops, penalties, race start, incidents
2. For each event, use the EXACT "start" time from the matching transcript entry
3. Return ONLY valid JSON array, no explanation

OUTPUT FORMAT:
[
  {"timeInSeconds": 13.2, "description": "Race start at Italian Grand Prix", "drivers": []},
  {"timeInSeconds": 27.279, "description": "Max Verstappen vs Lando Norris battle", "drivers": ["Max Verstappen", "Lando Norris"]}
]

Rules:
- Use exact "start" values from transcript
- Only return JSON array
- No markdown formatting`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log(`🤖 AI Response for ${v.videoId}:`, text.substring(0, 200) + '...');

        let cleaned = cleanJsonString(text);
        console.log(`🧹 Cleaned JSON for ${v.videoId}:`, cleaned.substring(0, 200) + '...');

        let events = [];
        try {
          const rawEvents = JSON.parse(cleaned);

          // Format the time correctly
          events = rawEvents.map(event => ({
            time: formatTime(event.timeInSeconds),
            description: event.description,
            drivers: event.drivers
          }));

        } catch (parseError) {
          console.error(`❌ Failed to parse JSON for ${v.videoId}:`, parseError.message);
          console.log('Response received:', cleaned);
          continue;
        }

        console.log(`📋 Found ${events.length} events for ${v.videoId}:`, events.slice(0, 3));
        
        await F1VideoDetail.updateOne({ videoId: v.videoId }, { $set: { events } });
        console.log(`✅ Events saved for ${v.videoId}`);

        // Verify the save worked
        const verifyVideo = await F1VideoDetail.findOne({ videoId: v.videoId });
        console.log(`🔍 Verification: ${verifyVideo.events?.length || 0} events in DB for ${v.videoId}`);

        // Optional: Throttle
        await new Promise((resolve) => setTimeout(resolve, 500));

      } catch (err) {
        console.error(`❌ Error extracting events for ${v.videoId}:`, err.message);
      }
    }

    res.json({ message: "✔️ Events extraction completed." });

  } catch (err) {
    console.error("❌ Global error: ", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

export async function getVideoEvents(req, res) {
  try {
    const { videoId } = req.params;
    
    if (!videoId) {
      return res.status(400).json({ message: 'Video ID is required' });
    }
    
    const videoDetail = await F1VideoDetail.findOne({ videoId });
    
    if (!videoDetail) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Check if events exist
    if (!videoDetail.events || videoDetail.events.length === 0) {
      return res.status(404).json({ 
        message: 'No events found for this video',
        videoId: videoId
      });
    }
    
    // Return the events
    return res.status(200).json({
      videoId: videoDetail.videoId,
      title: videoDetail.title,
      events: videoDetail.events
    });
    
  } catch (error) {
    console.error('Error retrieving video events:', error);
    return res.status(500).json({ 
      message: 'Error retrieving video events', 
      error: error.message 
    });
  }
}