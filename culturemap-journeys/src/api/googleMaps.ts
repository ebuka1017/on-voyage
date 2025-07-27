import axios from 'axios';

// Google Maps API configuration
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';
const GOOGLE_GEOCODING_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode';

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('Google Maps API key not found. Please set REACT_APP_GOOGLE_MAPS_API_KEY in your environment variables.');
}

// Types for Google Maps API
export interface PlaceAutocompleteResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  rating?: number;
  price_level?: number;
  types: string[];
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  website?: string;
  formatted_phone_number?: string;
}

export interface GeocodingResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

// Get autocomplete suggestions for places
export const getPlaceAutocomplete = async (
  input: string,
  types: string = '(cities)'
): Promise<PlaceAutocompleteResult[]> => {
  try {
    if (!input || input.length < 2) {
      return [];
    }

    const params = new URLSearchParams({
      input,
      types,
      key: GOOGLE_MAPS_API_KEY || '',
    });

    const response = await axios.get(
      `${GOOGLE_PLACES_BASE_URL}/autocomplete/json?${params}`
    );

    if (response.data.status !== 'OK') {
      console.warn('Google Places Autocomplete API warning:', response.data.status);
      return [];
    }

    return response.data.predictions || [];
  } catch (error) {
    console.error('Google Places Autocomplete API error:', error);
    return [];
  }
};

// Get detailed place information
export const getPlaceDetails = async (placeId: string): Promise<PlaceDetails | null> => {
  try {
    const fields = [
      'place_id',
      'name',
      'formatted_address',
      'geometry',
      'photos',
      'rating',
      'price_level',
      'types',
      'opening_hours',
      'website',
      'formatted_phone_number'
    ].join(',');

    const params = new URLSearchParams({
      place_id: placeId,
      fields,
      key: GOOGLE_MAPS_API_KEY || '',
    });

    const response = await axios.get(
      `${GOOGLE_PLACES_BASE_URL}/details/json?${params}`
    );

    if (response.data.status !== 'OK') {
      console.warn('Google Places Details API warning:', response.data.status);
      return null;
    }

    return response.data.result;
  } catch (error) {
    console.error('Google Places Details API error:', error);
    return null;
  }
};

// Search for places nearby
export const searchNearbyPlaces = async (
  location: { lat: number; lng: number },
  radius: number = 5000,
  type?: string,
  keyword?: string
): Promise<PlaceDetails[]> => {
  try {
    const params = new URLSearchParams({
      location: `${location.lat},${location.lng}`,
      radius: radius.toString(),
      key: GOOGLE_MAPS_API_KEY || '',
    });

    if (type) params.append('type', type);
    if (keyword) params.append('keyword', keyword);

    const response = await axios.get(
      `${GOOGLE_PLACES_BASE_URL}/nearbysearch/json?${params}`
    );

    if (response.data.status !== 'OK') {
      console.warn('Google Places Nearby Search API warning:', response.data.status);
      return [];
    }

    // Get detailed information for each place
    const places = await Promise.all(
      (response.data.results || []).slice(0, 10).map(async (place: any) => {
        const details = await getPlaceDetails(place.place_id);
        return details;
      })
    );

    return places.filter(Boolean) as PlaceDetails[];
  } catch (error) {
    console.error('Google Places Nearby Search API error:', error);
    return [];
  }
};

// Geocode an address to get coordinates
export const geocodeAddress = async (address: string): Promise<GeocodingResult | null> => {
  try {
    const params = new URLSearchParams({
      address,
      key: GOOGLE_MAPS_API_KEY || '',
    });

    const response = await axios.get(
      `${GOOGLE_GEOCODING_BASE_URL}/json?${params}`
    );

    if (response.data.status !== 'OK') {
      console.warn('Google Geocoding API warning:', response.data.status);
      return null;
    }

    return response.data.results[0] || null;
  } catch (error) {
    console.error('Google Geocoding API error:', error);
    return null;
  }
};

// Reverse geocode coordinates to get address
export const reverseGeocode = async (
  location: { lat: number; lng: number }
): Promise<GeocodingResult | null> => {
  try {
    const params = new URLSearchParams({
      latlng: `${location.lat},${location.lng}`,
      key: GOOGLE_MAPS_API_KEY || '',
    });

    const response = await axios.get(
      `${GOOGLE_GEOCODING_BASE_URL}/json?${params}`
    );

    if (response.data.status !== 'OK') {
      console.warn('Google Reverse Geocoding API warning:', response.data.status);
      return null;
    }

    return response.data.results[0] || null;
  } catch (error) {
    console.error('Google Reverse Geocoding API error:', error);
    return null;
  }
};

// Get photo URL from Google Places photo reference
export const getPlacePhotoUrl = (
  photoReference: string,
  maxWidth: number = 400,
  maxHeight: number = 300
): string => {
  const params = new URLSearchParams({
    photoreference: photoReference,
    maxwidth: maxWidth.toString(),
    maxheight: maxHeight.toString(),
    key: GOOGLE_MAPS_API_KEY || '',
  });

  return `${GOOGLE_PLACES_BASE_URL}/photo?${params}`;
};

// Calculate route between two points
export const calculateRoute = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  travelMode: 'DRIVING' | 'WALKING' | 'TRANSIT' | 'BICYCLING' = 'WALKING'
): Promise<any> => {
  try {
    const params = new URLSearchParams({
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      mode: travelMode.toLowerCase(),
      key: GOOGLE_MAPS_API_KEY || '',
    });

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?${params}`
    );

    if (response.data.status !== 'OK') {
      console.warn('Google Directions API warning:', response.data.status);
      return null;
    }

    return response.data.routes[0] || null;
  } catch (error) {
    console.error('Google Directions API error:', error);
    return null;
  }
};

// Enhanced place search for specific types (restaurants, attractions, etc.)
export const searchPlacesByType = async (
  location: string | { lat: number; lng: number },
  type: 'restaurant' | 'tourist_attraction' | 'museum' | 'park' | 'night_club' | 'shopping_mall',
  radius: number = 10000
): Promise<PlaceDetails[]> => {
  try {
    let searchLocation: { lat: number; lng: number };

    if (typeof location === 'string') {
      const geocoded = await geocodeAddress(location);
      if (!geocoded) {
        console.warn('Could not geocode location:', location);
        return [];
      }
      searchLocation = geocoded.geometry.location;
    } else {
      searchLocation = location;
    }

    return await searchNearbyPlaces(searchLocation, radius, type);
  } catch (error) {
    console.error('Error searching places by type:', error);
    return [];
  }
};

// Get popular attractions for a city
export const getCityAttractions = async (cityName: string): Promise<PlaceDetails[]> => {
  try {
    // First get the city coordinates
    const cityLocation = await geocodeAddress(cityName);
    if (!cityLocation) {
      return [];
    }

    // Search for various types of attractions
    const attractionTypes = ['tourist_attraction', 'museum', 'park', 'amusement_park'];
    const allAttractions: PlaceDetails[] = [];

    for (const type of attractionTypes) {
      const attractions = await searchNearbyPlaces(
        cityLocation.geometry.location,
        15000, // 15km radius
        type
      );
      allAttractions.push(...attractions);
    }

    // Remove duplicates based on place_id and sort by rating
    const uniqueAttractions = allAttractions
      .filter((attraction, index, self) => 
        index === self.findIndex(a => a.place_id === attraction.place_id)
      )
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 15); // Top 15 attractions

    return uniqueAttractions;
  } catch (error) {
    console.error('Error getting city attractions:', error);
    return [];
  }
};

// Get restaurants for a city with specific cuisine preferences
export const getCityRestaurants = async (
  cityName: string,
  cuisinePreferences: string[] = []
): Promise<PlaceDetails[]> => {
  try {
    const cityLocation = await geocodeAddress(cityName);
    if (!cityLocation) {
      return [];
    }

    const restaurants: PlaceDetails[] = [];

    // Search for restaurants with cuisine keywords
    for (const cuisine of cuisinePreferences) {
      const cuisineRestaurants = await searchNearbyPlaces(
        cityLocation.geometry.location,
        10000, // 10km radius
        'restaurant',
        cuisine
      );
      restaurants.push(...cuisineRestaurants);
    }

    // If no specific cuisines, get general restaurants
    if (cuisinePreferences.length === 0) {
      const generalRestaurants = await searchNearbyPlaces(
        cityLocation.geometry.location,
        10000,
        'restaurant'
      );
      restaurants.push(...generalRestaurants);
    }

    // Remove duplicates and sort by rating
    const uniqueRestaurants = restaurants
      .filter((restaurant, index, self) => 
        index === self.findIndex(r => r.place_id === restaurant.place_id)
      )
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10); // Top 10 restaurants

    return uniqueRestaurants;
  } catch (error) {
    console.error('Error getting city restaurants:', error);
    return [];
  }
};

export default {
  getPlaceAutocomplete,
  getPlaceDetails,
  searchNearbyPlaces,
  geocodeAddress,
  reverseGeocode,
  getPlacePhotoUrl,
  calculateRoute,
  searchPlacesByType,
  getCityAttractions,
  getCityRestaurants,
};