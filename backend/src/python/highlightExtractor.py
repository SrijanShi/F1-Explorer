from fastapi import FastAPI, HTTPException
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled,
    NoTranscriptFound,
    VideoUnavailable,
    RequestBlocked,
    IpBlocked,
)
import logging
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

ytt_api = YouTubeTranscriptApi()

@app.get("/transcript/{video_id}")
async def get_transcript(video_id: str):
    try:
        logger.info(f"Fetching transcript for video ID: {video_id}")

        await asyncio.sleep(0.5)  # non-blocking delay

        transcript = ytt_api.fetch(
            video_id,
            languages=["en", "en-US", "en-GB"]
        )

        transcript_data = transcript.to_raw_data()

        if not transcript_data:
            raise HTTPException(status_code=404, detail="Transcript is empty")

        return {
            "videoId": video_id,
            "language": transcript.language_code,
            "is_generated": transcript.is_generated,
            "transcript": transcript_data,
        }

    except (TranscriptsDisabled, NoTranscriptFound, VideoUnavailable):
        raise HTTPException(status_code=404, detail="Transcript not available")

    except (RequestBlocked, IpBlocked):
        raise HTTPException(
            status_code=429,
            detail="YouTube temporarily blocked requests from this IP"
        )

    except Exception as e:
        logger.exception("Unexpected error")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

@app.get("/transcripts/{video_id}")
async def list_transcripts(video_id: str):
    try:
        transcript_list = ytt_api.list(video_id)

        return {
            "videoId": video_id,
            "available_transcripts": [
                {
                    "language": t.language,
                    "language_code": t.language_code,
                    "is_generated": t.is_generated,
                    "is_translatable": t.is_translatable,
                }
                for t in transcript_list
            ],
        }

    except Exception:
        raise HTTPException(status_code=500, detail="Failed to list transcripts")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
