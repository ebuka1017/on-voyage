import axios from 'axios';

// Qloo API configuration
const QLOO_BASE_URL = 'https://api.qloo.com/v1';
const QLOO_API_KEY = process.env.REACT_APP_QLOO_API_KEY;

if (!QLOO_API_KEY) {
  console.warn('Qloo API key not found. Please set REACT_APP_QLOO_API_KEY in your environment variables.');
}

// Create axios instance with default config
const qlooApi = axios.create({
  baseURL: QLOO_BASE_URL,
  headers: {
    'Authorization': `Bearer ${QLOO_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Types for Qloo API
export interface QlooPreferences {
  activities: string[];
  cuisine: string[];
  vibes: string[];
}

export interface QlooRecommendationRequest {
  preferences: QlooPreferences;
  meetupsEnabled: boolean;
  location?: string;
  context?: string;
}

export interface QlooDestination {
  id: string;
  name: string;
  country: string;
  description: string;
  matchScore: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  categories: string[];
  image_url?: string;
}

export interface QlooMeetup {
  id: string;
  title: string;
  type: 'spot' | 'event' | 'virtual';
  location: string;
  description: string;
  categories: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Map our preferences to Qloo categories
const mapPreferencesToQlooCategories = (preferences: QlooPreferences): string[] => {
  const categoryMap: { [key: string]: string[] } = {
    // Activities mapping
    'hiking': ['outdoor_recreation', 'nature', 'adventure'],
    'museums': ['museums', 'art', 'culture', 'history'],
    'nightlife': ['nightlife', 'bars', 'entertainment', 'music'],
    'shopping': ['shopping', 'retail', 'fashion'],
    'adventure': ['adventure', 'extreme_sports', 'outdoor_recreation'],
    
    // Cuisine mapping
    'italian': ['italian_food', 'restaurants', 'european_cuisine'],
    'japanese': ['japanese_food', 'sushi', 'asian_cuisine'],
    'street food': ['street_food', 'casual_dining', 'local_cuisine'],
    'fine dining': ['fine_dining', 'upscale_restaurants', 'gourmet'],
    'vegetarian': ['vegetarian_food', 'healthy_eating', 'plant_based'],
    
    // Vibes mapping
    'urban': ['urban', 'city_life', 'metropolitan'],
    'historic': ['historic', 'heritage', 'traditional', 'culture'],
    'beach': ['beach', 'coastal', 'tropical', 'seaside'],
    'mountains': ['mountains', 'alpine', 'nature', 'scenic'],
    'romantic': ['romantic', 'intimate', 'couples', 'luxury'],
  };

  const categories: string[] = [];
  
  // Map all preferences to Qloo categories
  [...preferences.activities, ...preferences.cuisine, ...preferences.vibes].forEach(pref => {
    const normalizedPref = pref.toLowerCase().replace(/[^a-z\s]/g, '');
    if (categoryMap[normalizedPref]) {
      categories.push(...categoryMap[normalizedPref]);
    } else {
      // Fallback: use the preference as-is
      categories.push(normalizedPref.replace(/\s+/g, '_'));
    }
  });

  // Remove duplicates and return
  return [...new Set(categories)];
};

// Get destination recommendations from Qloo
export const getDestinationRecommendations = async (
  request: QlooRecommendationRequest
): Promise<{ destinations: QlooDestination[]; meetups?: QlooMeetup[] }> => {
  try {
    const categories = mapPreferencesToQlooCategories(request.preferences);
    
    // Qloo recommendation request payload
    const payload = {
      input: {
        liked: categories,
        context: request.context || 'travel',
        geo: request.location ? {
          location: request.location
        } : undefined,
      },
      output: {
        type: 'location',
        count: 10,
        include_metadata: true,
      },
    };

    console.log('Sending Qloo request:', payload);

    const response = await qlooApi.post('/recommend', payload);
    
    if (!response.data || !response.data.results) {
      throw new Error('Invalid response from Qloo API');
    }

    // Transform Qloo response to our format
    const destinations: QlooDestination[] = response.data.results.map((item: any, index: number) => ({
      id: item.id || `dest_${index}`,
      name: item.name || item.display_name || 'Unknown Destination',
      country: item.country || item.location?.country || 'Unknown',
      description: item.description || `Discover the amazing experiences in ${item.name}`,
      matchScore: Math.round((item.score || 0.5) * 100),
      coordinates: {
        latitude: item.coordinates?.latitude || item.lat || 0,
        longitude: item.coordinates?.longitude || item.lng || 0,
      },
      categories: item.categories || categories,
      image_url: item.image_url,
    }));

    // Get meetups if enabled
    let meetups: QlooMeetup[] = [];
    if (request.meetupsEnabled) {
      meetups = await getMeetupRecommendations(request.preferences, destinations[0]?.name);
    }

    return { destinations, meetups };
  } catch (error) {
    console.error('Qloo API error:', error);
    
    // Return fallback data if API fails
    if (axios.isAxiosError(error)) {
      console.error('Qloo API request failed:', error.response?.data || error.message);
    }
    
    throw new Error('Failed to get recommendations from Qloo API');
  }
};

// Get meetup recommendations
export const getMeetupRecommendations = async (
  preferences: QlooPreferences,
  location?: string
): Promise<QlooMeetup[]> => {
  try {
    const categories = mapPreferencesToQlooCategories(preferences);
    
    const payload = {
      input: {
        liked: [...categories, 'social', 'meetup', 'community'],
        context: 'social',
        geo: location ? { location } : undefined,
      },
      output: {
        type: 'venue',
        count: 5,
        include_metadata: true,
      },
    };

    const response = await qlooApi.post('/recommend', payload);
    
    if (!response.data || !response.data.results) {
      return [];
    }

    // Transform to meetups format
    const meetups: QlooMeetup[] = response.data.results.map((item: any, index: number) => ({
      id: item.id || `meetup_${index}`,
      title: item.name || `${preferences.activities[0] || 'Social'} Meetup`,
      type: item.type || 'spot',
      location: item.address || item.location?.name || location || 'TBD',
      description: item.description || `Connect with fellow ${preferences.activities[0] || 'travelers'} enthusiasts`,
      categories: item.categories || categories,
      coordinates: item.coordinates ? {
        latitude: item.coordinates.latitude,
        longitude: item.coordinates.longitude,
      } : undefined,
    }));

    return meetups;
  } catch (error) {
    console.error('Qloo meetups API error:', error);
    return []; // Return empty array on failure
  }
};

// Get detailed itinerary for a specific destination
export const getDestinationItinerary = async (
  destination: string,
  preferences: QlooPreferences,
  meetupsEnabled: boolean = false
): Promise<any[]> => {
  try {
    const categories = mapPreferencesToQlooCategories(preferences);
    
    // Get activities/attractions for the destination
    const activitiesPayload = {
      input: {
        liked: [...categories, 'attractions', 'activities'],
        context: 'travel',
        geo: { location: destination },
      },
      output: {
        type: 'venue',
        count: 8,
        include_metadata: true,
      },
    };

    // Get restaurants for the destination
    const restaurantsPayload = {
      input: {
        liked: [...preferences.cuisine.map(c => c.toLowerCase()), 'restaurants', 'dining'],
        context: 'dining',
        geo: { location: destination },
      },
      output: {
        type: 'venue',
        count: 5,
        include_metadata: true,
      },
    };

    const [activitiesResponse, restaurantsResponse] = await Promise.all([
      qlooApi.post('/recommend', activitiesPayload),
      qlooApi.post('/recommend', restaurantsPayload),
    ]);

    const itinerary: any[] = [];

    // Add activities
    if (activitiesResponse.data?.results) {
      activitiesResponse.data.results.forEach((item: any, index: number) => {
        itinerary.push({
          id: `activity_${index}`,
          title: item.name || 'Explore Local Attraction',
          type: 'activity',
          description: item.description || `Discover ${item.name} and immerse yourself in local culture`,
          image: item.image_url || `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center`,
          duration: '2-3 hours',
          coords: {
            lat: item.coordinates?.latitude || 0,
            lng: item.coordinates?.longitude || 0,
          },
          meetups: {
            available: meetupsEnabled,
            suggestions: meetupsEnabled ? [{
              title: `${item.name} Enthusiasts Group`,
              time: '10:00 AM',
              participants: Math.floor(Math.random() * 15) + 5,
            }] : [],
          },
        });
      });
    }

    // Add restaurants
    if (restaurantsResponse.data?.results) {
      restaurantsResponse.data.results.forEach((item: any, index: number) => {
        itinerary.push({
          id: `dining_${index}`,
          title: item.name || 'Local Dining Experience',
          type: 'dining',
          description: item.description || `Enjoy authentic local cuisine at ${item.name}`,
          image: item.image_url || `https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&crop=center`,
          duration: '1-2 hours',
          coords: {
            lat: item.coordinates?.latitude || 0,
            lng: item.coordinates?.longitude || 0,
          },
          meetups: {
            available: meetupsEnabled,
            suggestions: meetupsEnabled ? [{
              title: 'Foodie Walking Tour',
              time: '12:00 PM',
              participants: Math.floor(Math.random() * 20) + 8,
            }] : [],
          },
        });
      });
    }

    // Add meetup-specific items if enabled
    if (meetupsEnabled) {
      const meetups = await getMeetupRecommendations(preferences, destination);
      meetups.forEach((meetup, index) => {
        itinerary.push({
          id: `meetup_${index}`,
          title: meetup.title,
          type: 'meetups',
          subtype: meetup.type,
          description: meetup.description,
          image: `https://images.unsplash.com/photo-1566737236500-c8ac43014a8e?w=400&h=300&fit=crop&crop=center`,
          location: meetup.location,
          coords: meetup.coordinates ? {
            lat: meetup.coordinates.latitude,
            lng: meetup.coordinates.longitude,
          } : { lat: 0, lng: 0 },
        });
      });
    }

    return itinerary;
  } catch (error) {
    console.error('Qloo itinerary API error:', error);
    throw new Error('Failed to get itinerary from Qloo API');
  }
};

export default {
  getDestinationRecommendations,
  getMeetupRecommendations,
  getDestinationItinerary,
};