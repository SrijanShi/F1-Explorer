import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { F1VideoDetail } from "../models/highlightModel.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMIMI_API_KEY);

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
    const videos = await F1VideoDetail.find({ transcript: { $exists: true, $ne: [] } });
    if (videos.length === 0) return res.status(404).json({ message: "No transcripts found." });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    for (const v of videos) {
      try {
        console.log(`Processing video: ${v.videoId}`);

        // Pass transcript as JSON
        const transcriptJson = JSON.stringify(v.transcript);

        const prompt = `
You are an expert Formula 1 race analyst.

Here is the transcript in JSON format:
${transcriptJson}

Each transcript entry looks like:
{ "start": 436.639, "text": "Nice. Well done team. I made it last" }

Your task:
- Extract key Formula 1 events like overtakes, crashes, pit stops, penalties.
- For each event, use the EXACT "start" value from the corresponding transcript entry.
- DO NOT guess the time. Only use the "start" field from the transcript entry that matches the event.
- Whatever is the time that you recieve from the transcript, use time - 3 seconds as the timeInSeconds for the event.

Provide the output in this JSON format:
[
  { "timeInSeconds": 436, "description": "Overtake by Hamilton on Verstappen", "drivers": ["Lewis Hamilton", "Max Verstappen"] }
]

Notes:
- DO NOT invent times.
- Use the transcript "start" as timeInSeconds.
- Provide JSON only, no explanation.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        let cleaned = cleanJsonString(text);

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

        await F1VideoDetail.updateOne({ videoId: v.videoId }, { $set: { events } });
        console.log(`✅ Events saved for ${v.videoId}`);

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