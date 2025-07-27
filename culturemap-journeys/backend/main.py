from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import os
import asyncio
from datetime import datetime, timedelta
import json

app = FastAPI(
    title="CultureMap Journeys API",
    description="AI-powered travel planning with social meetups",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Keys (in production, use proper secret management)
QLOO_API_KEY = os.getenv("QLOO_API_KEY")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
TICKETMASTER_API_KEY = os.getenv("TICKETMASTER_API_KEY")

# Request/Response Models
class TravelPreferences(BaseModel):
    activities: List[str]
    cuisine: List[str]
    vibes: List[str]

class RecommendationRequest(BaseModel):
    preferences: TravelPreferences
    meetups_enabled: bool = False
    location: Optional[str] = None

class Destination(BaseModel):
    id: str
    name: str
    country: str
    description: str
    image: str
    match_score: int
    coordinates: Dict[str, float]

class Meetup(BaseModel):
    id: str
    title: str
    type: str
    location: str
    description: str
    categories: List[str]

class ItineraryRequest(BaseModel):
    destination: str
    preferences: TravelPreferences
    meetups_enabled: bool = False

class ItineraryItem(BaseModel):
    id: str
    title: str
    type: str
    description: str
    image: str
    duration: Optional[str]
    coordinates: Dict[str, float]
    meetups: Optional[Dict[str, Any]] = None

class EventsRequest(BaseModel):
    city: str
    preferences: Optional[TravelPreferences] = None
    days_ahead: int = 30

class Event(BaseModel):
    id: str
    name: str
    date: str
    venue: Optional[Dict[str, Any]]
    description: str
    category: str
    image: str
    links: Dict[str, str]

# Helper Functions
async def call_qloo_api(payload: dict) -> dict:
    """Call Qloo Taste AI API"""
    if not QLOO_API_KEY:
        raise HTTPException(status_code=500, detail="Qloo API key not configured")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.qloo.com/v1/recommend",
                headers={
                    "Authorization": f"Bearer {QLOO_API_KEY}",
                    "Content-Type": "application/json"
                },
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Qloo API request failed: {str(e)}")

async def call_google_places_api(endpoint: str, params: dict) -> dict:
    """Call Google Places API"""
    if not GOOGLE_MAPS_API_KEY:
        raise HTTPException(status_code=500, detail="Google Maps API key not configured")
    
    params["key"] = GOOGLE_MAPS_API_KEY
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"https://maps.googleapis.com/maps/api/place/{endpoint}",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Google Places API request failed: {str(e)}")

async def call_gemini_api(prompt: str, max_tokens: int = 500) -> str:
    """Call Google Gemini API"""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "maxOutputTokens": max_tokens,
            "temperature": 0.7,
            "topP": 0.8,
            "topK": 40,
        }
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}",
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except (httpx.RequestError, KeyError) as e:
            raise HTTPException(status_code=500, detail=f"Gemini API request failed: {str(e)}")

async def call_ticketmaster_api(endpoint: str, params: dict) -> dict:
    """Call Ticketmaster Discovery API"""
    if not TICKETMASTER_API_KEY:
        raise HTTPException(status_code=500, detail="Ticketmaster API key not configured")
    
    params["apikey"] = TICKETMASTER_API_KEY
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"https://app.ticketmaster.com/discovery/v2/{endpoint}",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Ticketmaster API request failed: {str(e)}")

def map_preferences_to_qloo_categories(preferences: TravelPreferences) -> List[str]:
    """Map user preferences to Qloo categories"""
    category_map = {
        # Activities
        'hiking': ['outdoor_recreation', 'nature', 'adventure'],
        'museums': ['museums', 'art', 'culture', 'history'],
        'nightlife': ['nightlife', 'bars', 'entertainment', 'music'],
        'shopping': ['shopping', 'retail', 'fashion'],
        'adventure': ['adventure', 'extreme_sports', 'outdoor_recreation'],
        
        # Cuisine
        'italian': ['italian_food', 'restaurants', 'european_cuisine'],
        'japanese': ['japanese_food', 'sushi', 'asian_cuisine'],
        'street food': ['street_food', 'casual_dining', 'local_cuisine'],
        'fine dining': ['fine_dining', 'upscale_restaurants', 'gourmet'],
        'vegetarian': ['vegetarian_food', 'healthy_eating', 'plant_based'],
        
        # Vibes
        'urban': ['urban', 'city_life', 'metropolitan'],
        'historic': ['historic', 'heritage', 'traditional', 'culture'],
        'beach': ['beach', 'coastal', 'tropical', 'seaside'],
        'mountains': ['mountains', 'alpine', 'nature', 'scenic'],
        'romantic': ['romantic', 'intimate', 'couples', 'luxury'],
    }
    
    categories = []
    all_prefs = preferences.activities + preferences.cuisine + preferences.vibes
    
    for pref in all_prefs:
        normalized_pref = pref.lower().strip()
        if normalized_pref in category_map:
            categories.extend(category_map[normalized_pref])
        else:
            categories.append(normalized_pref.replace(' ', '_'))
    
    return list(set(categories))  # Remove duplicates

# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "CultureMap Journeys API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "recommendations": "/api/recommendations",
            "itinerary": "/api/itinerary",
            "events": "/api/events",
            "meetups": "/api/meetups",
            "autocomplete": "/api/autocomplete",
            "health": "/api/health"
        }
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    api_status = {
        "qloo": bool(QLOO_API_KEY),
        "google_maps": bool(GOOGLE_MAPS_API_KEY),
        "gemini": bool(GEMINI_API_KEY),
        "ticketmaster": bool(TICKETMASTER_API_KEY)
    }
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "api_keys_configured": api_status,
        "all_apis_ready": all(api_status.values())
    }

@app.post("/api/recommendations")
async def get_recommendations(request: RecommendationRequest):
    """Get personalized destination recommendations using Qloo AI"""
    try:
        categories = map_preferences_to_qloo_categories(request.preferences)
        
        # Qloo API payload
        qloo_payload = {
            "input": {
                "liked": categories,
                "context": "travel",
                "geo": {"location": request.location} if request.location else None
            },
            "output": {
                "type": "location",
                "count": 10,
                "include_metadata": True
            }
        }
        
        # Get recommendations from Qloo
        qloo_response = await call_qloo_api(qloo_payload)
        
        destinations = []
        for item in qloo_response.get("results", [])[:6]:
            # Generate AI description using Gemini
            description_prompt = f"""Write an engaging travel description for {item.get('name', 'Unknown')}. 
            The traveler is interested in: {', '.join(categories[:5])}.
            Make it 2-3 sentences, enthusiastic, and highlight what makes this destination special for their interests."""
            
            try:
                ai_description = await call_gemini_api(description_prompt, 200)
            except:
                ai_description = f"Discover the amazing experiences {item.get('name', 'this destination')} has to offer!"
            
            destination = Destination(
                id=item.get("id", f"dest_{len(destinations)}"),
                name=item.get("name", "Unknown Destination"),
                country=item.get("country", "Unknown"),
                description=ai_description,
                image=item.get("image_url", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"),
                match_score=int((item.get("score", 0.5) * 100)),
                coordinates={
                    "lat": item.get("coordinates", {}).get("latitude", 0),
                    "lng": item.get("coordinates", {}).get("longitude", 0)
                }
            )
            destinations.append(destination)
        
        # Get meetups if enabled
        meetups = []
        if request.meetups_enabled and destinations:
            try:
                meetup_payload = {
                    "input": {
                        "liked": categories + ["social", "meetup", "community"],
                        "context": "social",
                        "geo": {"location": destinations[0].name} if destinations else None
                    },
                    "output": {
                        "type": "venue",
                        "count": 5,
                        "include_metadata": True
                    }
                }
                
                meetup_response = await call_qloo_api(meetup_payload)
                
                for item in meetup_response.get("results", [])[:3]:
                    meetup = Meetup(
                        id=item.get("id", f"meetup_{len(meetups)}"),
                        title=item.get("name", f"{request.preferences.activities[0] if request.preferences.activities else 'Social'} Meetup"),
                        type=item.get("type", "spot"),
                        location=item.get("address", "TBD"),
                        description=f"Connect with fellow {request.preferences.activities[0] if request.preferences.activities else 'travelers'} enthusiasts",
                        categories=categories
                    )
                    meetups.append(meetup)
            except Exception as e:
                print(f"Error getting meetups: {e}")
        
        return {
            "destinations": destinations,
            "meetups": meetups,
            "total_destinations": len(destinations),
            "preferences_used": categories[:10]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting recommendations: {str(e)}")

@app.post("/api/itinerary")
async def get_itinerary(request: ItineraryRequest):
    """Get detailed itinerary for a destination"""
    try:
        categories = map_preferences_to_qloo_categories(request.preferences)
        
        # Get activities from Qloo
        activities_payload = {
            "input": {
                "liked": categories + ["attractions", "activities"],
                "context": "travel",
                "geo": {"location": request.destination}
            },
            "output": {
                "type": "venue",
                "count": 8,
                "include_metadata": True
            }
        }
        
        # Get restaurants from Qloo
        restaurants_payload = {
            "input": {
                "liked": [cuisine.lower() for cuisine in request.preferences.cuisine] + ["restaurants", "dining"],
                "context": "dining",
                "geo": {"location": request.destination}
            },
            "output": {
                "type": "venue",
                "count": 5,
                "include_metadata": True
            }
        }
        
        # Call APIs concurrently
        activities_response, restaurants_response = await asyncio.gather(
            call_qloo_api(activities_payload),
            call_qloo_api(restaurants_payload),
            return_exceptions=True
        )
        
        itinerary = []
        
        # Process activities
        if not isinstance(activities_response, Exception):
            for item in activities_response.get("results", []):
                try:
                    description_prompt = f"Write a compelling description for {item.get('name', 'Local Attraction')}, an attraction in {request.destination}. Make it 1-2 sentences and highlight why it's worth visiting."
                    ai_description = await call_gemini_api(description_prompt, 150)
                except:
                    ai_description = f"Experience {item.get('name', 'this attraction')} and discover what makes it special."
                
                itinerary_item = ItineraryItem(
                    id=f"activity_{item.get('id', len(itinerary))}",
                    title=item.get("name", "Local Attraction"),
                    type="activity",
                    description=ai_description,
                    image=item.get("image_url", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"),
                    duration="2-3 hours",
                    coordinates={
                        "lat": item.get("coordinates", {}).get("latitude", 0),
                        "lng": item.get("coordinates", {}).get("longitude", 0)
                    },
                    meetups={
                        "available": request.meetups_enabled,
                        "suggestions": [{
                            "title": f"{item.get('name', 'Activity')} Enthusiasts Group",
                            "time": "10:00 AM",
                            "participants": 8
                        }] if request.meetups_enabled else []
                    }
                )
                itinerary.append(itinerary_item)
        
        # Process restaurants
        if not isinstance(restaurants_response, Exception):
            for item in restaurants_response.get("results", []):
                try:
                    description_prompt = f"Write a compelling description for {item.get('name', 'Local Restaurant')}, a restaurant in {request.destination}. Make it 1-2 sentences and highlight the dining experience."
                    ai_description = await call_gemini_api(description_prompt, 150)
                except:
                    ai_description = f"Enjoy authentic cuisine at {item.get('name', 'this restaurant')}."
                
                itinerary_item = ItineraryItem(
                    id=f"dining_{item.get('id', len(itinerary))}",
                    title=item.get("name", "Local Restaurant"),
                    type="dining",
                    description=ai_description,
                    image=item.get("image_url", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop"),
                    duration="1-2 hours",
                    coordinates={
                        "lat": item.get("coordinates", {}).get("latitude", 0),
                        "lng": item.get("coordinates", {}).get("longitude", 0)
                    },
                    meetups={
                        "available": request.meetups_enabled,
                        "suggestions": [{
                            "title": "Foodie Meetup",
                            "time": "7:00 PM",
                            "participants": 12
                        }] if request.meetups_enabled else []
                    }
                )
                itinerary.append(itinerary_item)
        
        return {
            "destination": request.destination,
            "itinerary": itinerary,
            "total_items": len(itinerary),
            "meetups_enabled": request.meetups_enabled
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating itinerary: {str(e)}")

@app.post("/api/events")
async def get_events(request: EventsRequest):
    """Get events for a city using Ticketmaster API"""
    try:
        # Calculate date range
        start_date = datetime.now()
        end_date = start_date + timedelta(days=request.days_ahead)
        
        # Ticketmaster API parameters
        params = {
            "city": request.city,
            "size": 20,
            "sort": "date,asc",
            "startDateTime": start_date.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "endDateTime": end_date.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "includeTBA": "no",
            "includeTBD": "no"
        }
        
        # Add category filter based on preferences
        if request.preferences:
            if any("music" in pref.lower() or "concert" in pref.lower() for pref in request.preferences.activities + request.preferences.vibes):
                params["classificationName"] = "Music"
            elif any("art" in pref.lower() or "theater" in pref.lower() for pref in request.preferences.activities + request.preferences.vibes):
                params["classificationName"] = "Arts & Theatre"
        
        response = await call_ticketmaster_api("events.json", params)
        
        events = []
        for event_data in response.get("_embedded", {}).get("events", []):
            venue = event_data.get("_embedded", {}).get("venues", [{}])[0]
            
            event = Event(
                id=event_data.get("id", ""),
                name=event_data.get("name", "Event"),
                date=event_data.get("dates", {}).get("start", {}).get("localDate", ""),
                venue={
                    "name": venue.get("name", ""),
                    "city": venue.get("city", {}).get("name", ""),
                    "coordinates": {
                        "lat": float(venue.get("location", {}).get("latitude", 0)),
                        "lng": float(venue.get("location", {}).get("longitude", 0))
                    }
                } if venue else None,
                description=event_data.get("info", "Check out this exciting event!"),
                category=event_data.get("classifications", [{}])[0].get("segment", {}).get("name", "Event"),
                image=event_data.get("images", [{}])[0].get("url", "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop"),
                links={
                    "web": event_data.get("url", ""),
                    "mobile": f"ticketmaster://event/{event_data.get('id', '')}"
                }
            )
            events.append(event)
        
        return {
            "city": request.city,
            "events": events,
            "total_events": len(events),
            "date_range": {
                "start": start_date.strftime("%Y-%m-%d"),
                "end": end_date.strftime("%Y-%m-%d")
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting events: {str(e)}")

@app.get("/api/autocomplete")
async def get_autocomplete(input: str):
    """Get place autocomplete suggestions using Google Places API"""
    try:
        if len(input) < 2:
            return {"predictions": []}
        
        params = {
            "input": input,
            "types": "(cities)",
            "key": GOOGLE_MAPS_API_KEY
        }
        
        response = await call_google_places_api("autocomplete/json", params)
        
        return {
            "predictions": response.get("predictions", []),
            "status": response.get("status", "OK")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting autocomplete: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)