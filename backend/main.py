from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import os

app = FastAPI(
    title="CultureMap Journeys API",
    description="Backend API for CultureMap Journeys travel planning application",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://culturemap-journeys.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class Preferences(BaseModel):
    activities: List[str]
    cuisine: List[str]
    vibes: List[str]

class RecommendationRequest(BaseModel):
    preferences: Preferences
    meetupsEnabled: bool
    context: Optional[str] = "travel"

class Destination(BaseModel):
    id: str
    name: str
    country: str
    description: str
    image: str
    matchScore: int
    coords: Dict[str, float]

class MeetupSuggestion(BaseModel):
    id: str
    title: str
    type: str  # "spot", "event", "virtual"
    location: str
    description: str
    image: str

class ItineraryRequest(BaseModel):
    destination: str
    meetupsEnabled: bool
    preferences: Optional[Preferences] = None

# Mock data for development
MOCK_DESTINATIONS = [
    {
        "id": "1",
        "name": "Tokyo",
        "country": "Japan",
        "description": "A perfect blend of traditional culture and modern technology. Amazing food scene and vibrant nightlife.",
        "image": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
        "matchScore": 95,
        "coords": {"lat": 35.6762, "lng": 139.6503}
    },
    {
        "id": "2",
        "name": "Barcelona",
        "country": "Spain",
        "description": "Rich history, stunning architecture, and incredible cuisine. Perfect for art lovers and food enthusiasts.",
        "image": "https://images.unsplash.com/photo-1539650116574-75c0c6d81d3f?w=400&h=300&fit=crop",
        "matchScore": 92,
        "coords": {"lat": 41.3851, "lng": 2.1734}
    },
    {
        "id": "3",
        "name": "Bali",
        "country": "Indonesia",
        "description": "Tropical paradise with beautiful beaches, ancient temples, and amazing street food.",
        "image": "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop",
        "matchScore": 88,
        "coords": {"lat": -8.3405, "lng": 115.0920}
    }
]

MOCK_MEETUPS = [
    {
        "id": "1",
        "title": "Coffee Meetup for Digital Nomads",
        "type": "spot",
        "location": "Blue Bottle Coffee, Shibuya",
        "description": "Connect with fellow travelers and digital nomads over amazing coffee",
        "image": "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400&h=300&fit=crop"
    },
    {
        "id": "2",
        "title": "Traditional Cooking Workshop",
        "type": "event",
        "location": "Tsukiji Cooking School",
        "description": "Learn to make authentic Japanese dishes with local chefs",
        "image": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop"
    }
]

# API Endpoints
@app.get("/")
async def root():
    return {"message": "CultureMap Journeys API", "version": "1.0.0"}

@app.post("/api/recommendations")
async def get_recommendations(request: RecommendationRequest):
    """
    Get personalized destination recommendations based on user preferences.
    In production, this would integrate with Qloo's Taste AI API.
    """
    try:
        # Mock logic to filter destinations based on preferences
        destinations = MOCK_DESTINATIONS.copy()
        
        # Simulate personalization based on preferences
        for dest in destinations:
            # Simple scoring algorithm (in production, use Qloo API)
            score_boost = 0
            if "museums" in request.preferences.activities and dest["name"] in ["Barcelona", "Paris"]:
                score_boost += 10
            if "japanese" in [c.lower() for c in request.preferences.cuisine] and dest["name"] == "Tokyo":
                score_boost += 15
            if "beach" in [v.lower() for v in request.preferences.vibes] and dest["name"] == "Bali":
                score_boost += 12
                
            dest["matchScore"] = min(100, dest["matchScore"] + score_boost)
        
        # Sort by match score
        destinations.sort(key=lambda x: x["matchScore"], reverse=True)
        
        meetups = MOCK_MEETUPS if request.meetupsEnabled else []
        
        return {
            "destinations": destinations,
            "meetups": meetups,
            "requestId": "mock_request_123"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/itinerary")
async def get_itinerary(request: ItineraryRequest):
    """
    Generate a detailed itinerary for a specific destination.
    In production, this would integrate with Qloo, Google Places, and Gemini APIs.
    """
    try:
        # Mock itinerary data
        mock_itinerary = [
            {
                "id": "1",
                "title": "Visit Senso-ji Temple",
                "type": "activity",
                "description": "Explore Tokyo's oldest temple in the historic Asakusa district",
                "image": "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=300&fit=crop",
                "duration": "2 hours",
                "coords": {"lat": 35.7148, "lng": 139.7967},
                "meetups": {
                    "available": request.meetupsEnabled,
                    "suggestions": [
                        {
                            "title": "Temple Photography Group",
                            "time": "9:00 AM",
                            "participants": 8
                        }
                    ] if request.meetupsEnabled else []
                }
            },
            {
                "id": "2",
                "title": "Lunch at Tsukiji Outer Market",
                "type": "dining",
                "description": "Experience the world's largest fish market and enjoy fresh sushi",
                "image": "https://images.unsplash.com/photo-1559314809-0f31657def5e?w=400&h=300&fit=crop",
                "duration": "1.5 hours",
                "coords": {"lat": 35.6654, "lng": 139.7707},
                "meetups": {
                    "available": request.meetupsEnabled,
                    "suggestions": [
                        {
                            "title": "Foodie Walking Tour",
                            "time": "12:00 PM",
                            "participants": 12
                        }
                    ] if request.meetupsEnabled else []
                }
            }
        ]
        
        if request.meetupsEnabled:
            # Add meetup-specific items
            mock_itinerary.append({
                "id": "meetup_1",
                "title": "Evening Drinks with Fellow Travelers",
                "type": "meetups",
                "subtype": "social",
                "description": "Join other travelers for drinks and cultural exchange",
                "image": "https://images.unsplash.com/photo-1566737236500-c8ac43014a8e?w=400&h=300&fit=crop",
                "location": "Golden Gai, Shinjuku",
                "coords": {"lat": 35.6938, "lng": 139.7034},
                "event": {
                    "id": "tm_123",
                    "url": "https://www.ticketmaster.com/event/123"
                }
            })
        
        return mock_itinerary
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/events")
async def get_events(city: str):
    """
    Get events for a specific city using Ticketmaster API.
    In production, this would integrate with Ticketmaster Discovery API.
    """
    try:
        # Mock events data
        mock_events = [
            {
                "id": "1",
                "name": "Tokyo Jazz Festival",
                "date": "2024-03-15",
                "venue": "Tokyo International Forum",
                "description": "Annual jazz festival featuring international and local artists",
                "ticketUrl": "https://www.ticketmaster.com/event/1",
                "image": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop"
            },
            {
                "id": "2",
                "name": "Traditional Tea Ceremony",
                "date": "2024-03-16",
                "venue": "Meiji Shrine",
                "description": "Experience authentic Japanese tea ceremony",
                "ticketUrl": "https://www.ticketmaster.com/event/2",
                "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&h=300&fit=crop"
            }
        ]
        
        return {"events": mock_events, "city": city}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/meetups")
async def get_meetups(preferences: Preferences):
    """
    Get meetup suggestions based on user preferences.
    In production, this would integrate with Qloo's social recommendations.
    """
    try:
        # Filter meetups based on preferences
        filtered_meetups = MOCK_MEETUPS.copy()
        
        # Add more meetups based on preferences
        if "museums" in preferences.activities:
            filtered_meetups.append({
                "id": "3",
                "title": "Art Gallery Walking Tour",
                "type": "event",
                "location": "Roppongi Art Triangle",
                "description": "Explore contemporary art with fellow enthusiasts",
                "image": "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop"
            })
        
        if "japanese" in [c.lower() for c in preferences.cuisine]:
            filtered_meetups.append({
                "id": "4",
                "title": "Ramen Tasting Group",
                "type": "spot",
                "location": "Ichiran Ramen, Shibuya",
                "description": "Discover the best ramen spots with local food lovers",
                "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop"
            })
        
        return {"meetups": filtered_meetups}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/special/{trip_type}")
async def get_special_trip(trip_type: str, meetupsEnabled: bool = True):
    """
    Get special multi-destination trip itineraries.
    """
    try:
        trip_data = {
            "world": {
                "title": "Virtual World Tour",
                "description": "Experience the world's top destinations",
                "destinations": ["Paris", "Tokyo", "New York", "Sydney"],
                "duration": "14 days"
            },
            "euro": {
                "title": "European Adventure",
                "description": "Discover the cultural heart of Europe",
                "destinations": ["Paris", "Rome", "Barcelona", "Amsterdam"],
                "duration": "10 days"
            },
            "asia": {
                "title": "Asian Exploration",
                "description": "Journey through diverse Asian cultures",
                "destinations": ["Tokyo", "Bangkok", "Bali", "Singapore"],
                "duration": "12 days"
            },
            "africa": {
                "title": "African Safari",
                "description": "Wildlife and cultural experiences",
                "destinations": ["Cape Town", "Serengeti", "Marrakech", "Cairo"],
                "duration": "14 days"
            }
        }
        
        if trip_type not in trip_data:
            raise HTTPException(status_code=404, detail="Trip type not found")
        
        # Mock itinerary for special trips
        trip_info = trip_data[trip_type]
        mock_itinerary = []
        
        for i, dest in enumerate(trip_info["destinations"]):
            mock_itinerary.append({
                "id": f"day_{i+1}",
                "day": i + 1,
                "destination": dest,
                "title": f"Explore {dest}",
                "description": f"Discover the highlights of {dest}",
                "image": f"https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=400&h=300&fit=crop",
                "activities": ["Sightseeing", "Local Cuisine", "Cultural Sites"],
                "meetups": MOCK_MEETUPS if meetupsEnabled else []
            })
        
        return {
            "trip": trip_info,
            "itinerary": mock_itinerary,
            "meetupsEnabled": meetupsEnabled
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)