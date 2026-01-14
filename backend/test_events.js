import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import mongoose from 'mongoose';
import { F1VideoDetail } from "./src/models/highlightModel.js";

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

async function testEventsExtraction() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Gemini API Key loaded:', process.env.GEMIMI_API_KEY ? 'Yes' : 'No');
    console.log('Gemini API Key first 10 chars:', process.env.GEMIMI_API_KEY?.substring(0, 10));

    // Get one video with transcript
    const video = await F1VideoDetail.findOne({ 
      videoId: 'kGMp1Byuwto',
      transcript: { $exists: true, $ne: [] } 
    });

    if (!video) {
      console.log('No video found with transcript');
      process.exit(1);
    }

    console.log(`Found video: ${video.title}`);
    console.log(`Transcript length: ${video.transcript.length} entries`);
    console.log('Sample transcript:', video.transcript.slice(0, 3));

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Create a shorter transcript for testing
    const shortTranscript = video.transcript.slice(0, 50); // First 50 entries only
    const transcriptJson = JSON.stringify(shortTranscript);

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

    console.log('Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('🤖 AI Response:', text);

    let cleaned = cleanJsonString(text);
    console.log('🧹 Cleaned JSON:', cleaned);

    let events = [];
    try {
      const rawEvents = JSON.parse(cleaned);
      console.log('✅ Parsed events:', rawEvents);

      // Format the time correctly
      events = rawEvents.map(event => ({
        time: formatTime(event.timeInSeconds),
        description: event.description,
        drivers: event.drivers
      }));

      console.log('📋 Formatted events:', events);

    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError.message);
      console.log('Response received:', cleaned);
    }

    await mongoose.disconnect();
    console.log('✅ Test completed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testEventsExtraction();