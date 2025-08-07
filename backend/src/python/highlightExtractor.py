import sys
import json
import re
from youtube_transcript_api import YouTubeTranscriptApi

# Enhanced keyword mapping with more patterns
highlight_keywords = {
    # Overtaking patterns
    'overtake': 'OVERTAKE',
    'overtaking': 'OVERTAKE', 
    'passes': 'OVERTAKE',
    'brilliant move': 'OVERTAKE',
    'goes around': 'OVERTAKE',
    'side by side': 'OVERTAKE',
    
    # Incident patterns
    'crash': 'COLLISION',
    'collision': 'COLLISION',
    'contact': 'COLLISION',
    'spins': 'COLLISION',
    'into the barrier': 'COLLISION',
    'loses control': 'COLLISION',
    
    # DNF patterns
    'dnf': 'DNF',
    'retires': 'DNF',
    'retirement': 'DNF',
    'mechanical': 'DNF',
    'engine failure': 'DNF',
    'out of the race': 'DNF',
    
    # Safety car patterns
    'safety car': 'SAFETY_CAR',
    'safety car deployed': 'SAFETY_CAR',
    'sc deployed': 'SAFETY_CAR',
    'yellow flag': 'SAFETY_CAR',
    
    # Virtual safety car
    'virtual safety car': 'VIRTUAL_SAFETY_CAR',
    'vsc': 'VIRTUAL_SAFETY_CAR',
    'vsc deployed': 'VIRTUAL_SAFETY_CAR',
    
    # Race results
    'wins': 'PODIUM_FINISH',
    'victory': 'PODIUM_FINISH',
    'champion': 'PODIUM_FINISH',
    'takes the win': 'PODIUM_FINISH',
    'crosses the line': 'PODIUM_FINISH',
    'checkered flag': 'PODIUM_FINISH',
    'on the podium': 'PODIUM_FINISH',
    
    # Penalties
    'penalty': 'PENALTY',
    'time penalty': 'PENALTY',
    'grid penalty': 'PENALTY',
    'investigated': 'PENALTY',
    'stewards': 'PENALTY',
    
    # Performance
    'fastest lap': 'FASTEST_LAP',
    'purple sector': 'FASTEST_LAP',
    'personal best': 'FASTEST_LAP',
    
    # Pit stops
    'pit stop': 'PIT_STOP',
    'pitstop': 'PIT_STOP',
    'into the pits': 'PIT_STOP',
    'pit lane': 'PIT_STOP',
    'tire change': 'PIT_STOP',
    
    # Qualifying
    'pole position': 'POLE_POSITION',
    'front row': 'POLE_POSITION',
    'provisional pole': 'POLE_POSITION',
    
    # Weather
    'rain': 'WEATHER_CHANGE',
    'wet': 'WEATHER_CHANGE',
    'dry': 'WEATHER_CHANGE',
    'weather': 'WEATHER_CHANGE'
}

# Driver name patterns for extraction
driver_patterns = [
    r'\b(verstappen|max)\b',
    r'\b(hamilton|lewis)\b', 
    r'\b(leclerc|charles)\b',
    r'\b(norris|lando)\b',
    r'\b(russell|george)\b',
    r'\b(sainz|carlos)\b',
    r'\b(alonso|fernando)\b',
    r'\b(piastri|oscar)\b',
    r'\b(gasly|pierre)\b',
    r'\b(ocon|esteban)\b',
    r'\b(stroll|lance)\b',
    r'\b(hulkenberg|nico)\b',
    r'\b(magnussen|kevin)\b',
    r'\b(tsunoda|yuki)\b',
    r'\b(albon|alex)\b',
    r'\b(sargeant|logan)\b',
    r'\b(bottas|valtteri)\b',
    r'\b(zhou|guanyu)\b'
]

def extract_drivers_from_text(text):
    """Extract driver names mentioned in the text"""
    drivers = []
    text_lower = text.lower()
    
    for pattern in driver_patterns:
        matches = re.findall(pattern, text_lower, re.IGNORECASE)
        if matches:
            # Capitalize first letter
            driver_name = matches[0].capitalize()
            if driver_name not in drivers:
                drivers.append(driver_name)
    
    return drivers

def calculate_importance(event_type, drivers_involved, text):
    """Calculate importance score based on event type and context"""
    base_scores = {
        'RACE_START': 9,
        'PODIUM_FINISH': 10,
        'COLLISION': 9,
        'SAFETY_CAR': 8,
        'VIRTUAL_SAFETY_CAR': 7,
        'OVERTAKE': 7,
        'DNF': 8,
        'PENALTY': 6,
        'FASTEST_LAP': 6,
        'PIT_STOP': 5,
        'POLE_POSITION': 7,
        'WEATHER_CHANGE': 6
    }
    
    importance = base_scores.get(event_type, 5)
    
    # Boost importance if multiple drivers involved
    if len(drivers_involved) > 1:
        importance += 1
    
    # Boost for specific context words
    boost_words = ['spectacular', 'incredible', 'amazing', 'brilliant', 'dramatic']
    if any(word in text.lower() for word in boost_words):
        importance += 1
    
    return min(importance, 10)  # Cap at 10

def format_timestamp(seconds):
    """Convert seconds to MM:SS format"""
    minutes = int(seconds // 60)
    seconds = int(seconds % 60)
    return f"{minutes}:{seconds:02d}"

def extract_highlights(video_id):
    try:
        # Get transcript from YouTube
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        events = []
        
        # Track processed events to avoid duplicates
        processed_events = set()
        
        for entry in transcript:
            text = entry['text']
            text_lower = text.lower()
            start_time = entry['start']
            
            # Check for each keyword
            for keyword, event_type in highlight_keywords.items():
                if keyword in text_lower:
                    # Extract drivers involved
                    drivers_involved = extract_drivers_from_text(text)
                    
                    # Calculate importance
                    importance = calculate_importance(event_type, drivers_involved, text)
                    
                    # Create event signature to avoid duplicates
                    event_signature = f"{event_type}_{int(start_time//30)}"  # Group by 30-second windows
                    
                    if event_signature not in processed_events:
                        event = {
                            'timestamp': format_timestamp(start_time),
                            'eventType': event_type,
                            'title': generate_event_title(event_type, drivers_involved),
                            'description': text.strip(),
                            'driversInvolved': drivers_involved,
                            'importance': importance,
                            'raw_start_time': start_time
                        }
                        
                        events.append(event)
                        processed_events.add(event_signature)
        
        # Sort events by time and importance
        events.sort(key=lambda x: (x['raw_start_time'], -x['importance']))
        
        # Remove raw_start_time from final output
        for event in events:
            del event['raw_start_time']
        
        # Add race start event if not present
        if not any(e['eventType'] == 'RACE_START' for e in events):
            events.insert(0, {
                'timestamp': '0:00',
                'eventType': 'RACE_START',
                'title': 'Race Start',
                'description': 'The race begins with all drivers fighting for position',
                'driversInvolved': [],
                'importance': 9
            })
        
        return events
        
    except Exception as e:
        # Return error info for debugging
        return {
            'error': str(e),
            'video_id': video_id,
            'events': []
        }

def generate_event_title(event_type, drivers):
    """Generate a descriptive title for the event"""
    titles = {
        'RACE_START': 'Race Start',
        'OVERTAKE': f"Spectacular Overtake{' - ' + ', '.join(drivers) if drivers else ''}",
        'COLLISION': f"Racing Incident{' - ' + ', '.join(drivers) if drivers else ''}",
        'SAFETY_CAR': 'Safety Car Deployment',
        'VIRTUAL_SAFETY_CAR': 'Virtual Safety Car',
        'DNF': f"Driver Retirement{' - ' + ', '.join(drivers) if drivers else ''}",
        'PODIUM_FINISH': f"Race Winner{' - ' + ', '.join(drivers) if drivers else ''}",
        'PENALTY': f"Race Penalty{' - ' + ', '.join(drivers) if drivers else ''}",
        'FASTEST_LAP': f"Fastest Lap{' - ' + ', '.join(drivers) if drivers else ''}",
        'PIT_STOP': f"Strategic Pit Stop{' - ' + ', '.join(drivers) if drivers else ''}",
        'POLE_POSITION': f"Pole Position{' - ' + ', '.join(drivers) if drivers else ''}",
        'WEATHER_CHANGE': 'Weather Change'
    }
    
    return titles.get(event_type, 'Race Event')

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({'error': 'Video ID required as argument'}))
        sys.exit(1)
    
    video_id = sys.argv[1]
    events = extract_highlights(video_id)
    print(json.dumps(events, indent=2))