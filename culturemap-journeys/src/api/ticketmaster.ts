import axios from 'axios';

// Ticketmaster API configuration
const TICKETMASTER_API_KEY = process.env.REACT_APP_TICKETMASTER_API_KEY;
const TICKETMASTER_BASE_URL = 'https://app.ticketmaster.com/discovery/v2';

if (!TICKETMASTER_API_KEY) {
  console.warn('Ticketmaster API key not found. Please set REACT_APP_TICKETMASTER_API_KEY in your environment variables.');
}

// Create axios instance for Ticketmaster API
const ticketmasterApi = axios.create({
  baseURL: TICKETMASTER_BASE_URL,
  timeout: 10000,
});

// Types for Ticketmaster API
export interface TicketmasterEvent {
  id: string;
  name: string;
  type: string;
  url: string;
  locale: string;
  images: Array<{
    ratio: string;
    url: string;
    width: number;
    height: number;
    fallback: boolean;
  }>;
  sales: {
    public: {
      startDateTime: string;
      startTBD: boolean;
      endDateTime: string;
    };
  };
  dates: {
    start: {
      localDate: string;
      localTime?: string;
      dateTime?: string;
      dateTBD: boolean;
      dateTBA: boolean;
      timeTBA: boolean;
      noSpecificTime: boolean;
    };
    timezone?: string;
    status?: {
      code: string;
    };
  };
  classifications: Array<{
    primary: boolean;
    segment: {
      id: string;
      name: string;
    };
    genre: {
      id: string;
      name: string;
    };
    subGenre?: {
      id: string;
      name: string;
    };
  }>;
  priceRanges?: Array<{
    type: string;
    currency: string;
    min: number;
    max: number;
  }>;
  promoter?: {
    id: string;
    name: string;
    description: string;
  };
  info?: string;
  pleaseNote?: string;
  _embedded?: {
    venues?: Array<{
      id: string;
      name: string;
      type: string;
      url?: string;
      locale: string;
      timezone: string;
      city: {
        name: string;
      };
      country: {
        name: string;
        countryCode: string;
      };
      address: {
        line1?: string;
        line2?: string;
      };
      location: {
        longitude: string;
        latitude: string;
      };
    }>;
    attractions?: Array<{
      id: string;
      name: string;
      type: string;
      url?: string;
      locale: string;
      images?: Array<{
        ratio: string;
        url: string;
        width: number;
        height: number;
      }>;
      classifications?: Array<{
        primary: boolean;
        segment: {
          id: string;
          name: string;
        };
        genre: {
          id: string;
          name: string;
        };
      }>;
    }>;
  };
}

export interface EventSearchParams {
  city?: string;
  stateCode?: string;
  countryCode?: string;
  postalCode?: string;
  latlong?: string;
  radius?: string;
  unit?: 'miles' | 'km';
  source?: string;
  locale?: string;
  marketId?: string;
  startDateTime?: string;
  endDateTime?: string;
  includeTBA?: 'yes' | 'no' | 'only';
  includeTBD?: 'yes' | 'no' | 'only';
  includeTest?: 'yes' | 'no' | 'only';
  size?: number;
  page?: number;
  sort?: 'name,asc' | 'name,desc' | 'date,asc' | 'date,desc' | 'relevance,asc' | 'relevance,desc' | 'distance,asc' | 'venueName,asc' | 'venueName,desc' | 'random';
  segmentId?: string;
  segmentName?: string;
  classificationName?: string;
  classificationId?: string;
  marketId?: string;
  promoterId?: string;
  dmaId?: string;
  includeLicensedContent?: 'yes' | 'no';
  includeSpellcheck?: 'yes' | 'no';
  keyword?: string;
  attractionId?: string;
  venueId?: string;
  promoterId?: string;
  localStartDateTime?: string;
  localStartEndDateTime?: string;
  publicSaleStartDateTime?: string;
  publicSaleStartEndDateTime?: string;
  presaleStartDateTime?: string;
  presaleStartEndDateTime?: string;
}

// Search for events
export const searchEvents = async (params: EventSearchParams): Promise<TicketmasterEvent[]> => {
  try {
    const searchParams = new URLSearchParams({
      apikey: TICKETMASTER_API_KEY || '',
      size: (params.size || 20).toString(),
      page: (params.page || 0).toString(),
      sort: params.sort || 'date,asc',
      ...Object.fromEntries(
        Object.entries(params).filter(([key, value]) => 
          value !== undefined && key !== 'size' && key !== 'page' && key !== 'sort'
        )
      )
    });

    console.log('Searching Ticketmaster events with params:', params);

    const response = await ticketmasterApi.get(`/events.json?${searchParams}`);

    if (!response.data?._embedded?.events) {
      console.warn('No events found in Ticketmaster response');
      return [];
    }

    return response.data._embedded.events;
  } catch (error) {
    console.error('Ticketmaster events search error:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Ticketmaster API request failed:', error.response?.data || error.message);
    }
    
    return [];
  }
};

// Get events by city name
export const getEventsByCity = async (
  cityName: string,
  options: {
    size?: number;
    startDate?: string;
    endDate?: string;
    category?: string;
  } = {}
): Promise<TicketmasterEvent[]> => {
  try {
    const params: EventSearchParams = {
      city: cityName,
      size: options.size || 20,
      sort: 'date,asc',
      includeTBA: 'no',
      includeTBD: 'no',
    };

    // Add date filters if provided
    if (options.startDate) {
      params.startDateTime = `${options.startDate}T00:00:00Z`;
    }
    if (options.endDate) {
      params.endDateTime = `${options.endDate}T23:59:59Z`;
    }

    // Add category filter if provided
    if (options.category) {
      params.classificationName = options.category;
    }

    return await searchEvents(params);
  } catch (error) {
    console.error('Error getting events by city:', error);
    return [];
  }
};

// Get events by location coordinates
export const getEventsByLocation = async (
  latitude: number,
  longitude: number,
  options: {
    radius?: number;
    unit?: 'miles' | 'km';
    size?: number;
    category?: string;
  } = {}
): Promise<TicketmasterEvent[]> => {
  try {
    const params: EventSearchParams = {
      latlong: `${latitude},${longitude}`,
      radius: (options.radius || 25).toString(),
      unit: options.unit || 'km',
      size: options.size || 20,
      sort: 'distance,asc',
      includeTBA: 'no',
      includeTBD: 'no',
    };

    if (options.category) {
      params.classificationName = options.category;
    }

    return await searchEvents(params);
  } catch (error) {
    console.error('Error getting events by location:', error);
    return [];
  }
};

// Get events by keyword search
export const searchEventsByKeyword = async (
  keyword: string,
  location?: string,
  options: {
    size?: number;
    category?: string;
  } = {}
): Promise<TicketmasterEvent[]> => {
  try {
    const params: EventSearchParams = {
      keyword,
      size: options.size || 20,
      sort: 'relevance,desc',
      includeTBA: 'no',
      includeTBD: 'no',
    };

    if (location) {
      params.city = location;
    }

    if (options.category) {
      params.classificationName = options.category;
    }

    return await searchEvents(params);
  } catch (error) {
    console.error('Error searching events by keyword:', error);
    return [];
  }
};

// Get event details by ID
export const getEventDetails = async (eventId: string): Promise<TicketmasterEvent | null> => {
  try {
    const response = await ticketmasterApi.get(`/events/${eventId}.json`, {
      params: {
        apikey: TICKETMASTER_API_KEY,
      },
    });

    return response.data || null;
  } catch (error) {
    console.error('Error getting event details:', error);
    return null;
  }
};

// Get events that match user preferences
export const getEventsForPreferences = async (
  location: string,
  preferences: {
    activities?: string[];
    vibes?: string[];
    meetupsEnabled?: boolean;
  },
  options: {
    size?: number;
    days?: number; // How many days ahead to search
  } = {}
): Promise<TicketmasterEvent[]> => {
  try {
    const allEvents: TicketmasterEvent[] = [];
    
    // Map preferences to Ticketmaster categories
    const categoryMap: { [key: string]: string[] } = {
      'music': ['Music'],
      'nightlife': ['Music', 'Arts & Theatre'],
      'museums': ['Arts & Theatre', 'Miscellaneous'],
      'sports': ['Sports'],
      'comedy': ['Arts & Theatre'],
      'theater': ['Arts & Theatre'],
      'concerts': ['Music'],
      'festivals': ['Music', 'Miscellaneous'],
      'art': ['Arts & Theatre'],
      'cultural': ['Arts & Theatre', 'Miscellaneous'],
    };

    // Get relevant categories from preferences
    const categories = new Set<string>();
    const allPreferences = [...(preferences.activities || []), ...(preferences.vibes || [])];
    
    allPreferences.forEach(pref => {
      const normalizedPref = pref.toLowerCase();
      Object.keys(categoryMap).forEach(key => {
        if (normalizedPref.includes(key)) {
          categoryMap[key].forEach(cat => categories.add(cat));
        }
      });
    });

    // If no specific categories found, search general events
    if (categories.size === 0) {
      categories.add('Music');
      categories.add('Arts & Theatre');
    }

    // Calculate date range
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + (options.days || 30));

    // Search for events in each category
    for (const category of categories) {
      const categoryEvents = await getEventsByCity(location, {
        category,
        size: Math.ceil((options.size || 20) / categories.size),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });
      
      allEvents.push(...categoryEvents);
    }

    // Remove duplicates and sort by date
    const uniqueEvents = allEvents
      .filter((event, index, self) => 
        index === self.findIndex(e => e.id === event.id)
      )
      .sort((a, b) => {
        const dateA = new Date(a.dates.start.localDate + (a.dates.start.localTime || ''));
        const dateB = new Date(b.dates.start.localDate + (b.dates.start.localTime || ''));
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, options.size || 20);

    return uniqueEvents;
  } catch (error) {
    console.error('Error getting events for preferences:', error);
    return [];
  }
};

// Generate deep link to Ticketmaster app or website
export const generateTicketmasterLink = (event: TicketmasterEvent): {
  deepLink: string;
  webLink: string;
} => {
  const webLink = event.url;
  
  // Try to generate mobile deep link
  const deepLink = `ticketmaster://event/${event.id}`;

  return {
    deepLink,
    webLink,
  };
};

// Get the best image for an event
export const getEventImageUrl = (
  event: TicketmasterEvent,
  preferredRatio: string = '16_9',
  preferredWidth: number = 400
): string => {
  if (!event.images || event.images.length === 0) {
    // Fallback image
    return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&crop=center';
  }

  // Try to find image with preferred ratio
  let selectedImage = event.images.find(img => 
    img.ratio === preferredRatio && !img.fallback
  );

  // If not found, try to find any non-fallback image
  if (!selectedImage) {
    selectedImage = event.images.find(img => !img.fallback);
  }

  // If still not found, use the first image
  if (!selectedImage) {
    selectedImage = event.images[0];
  }

  return selectedImage.url;
};

// Format event for display
export const formatEventForDisplay = (event: TicketmasterEvent) => {
  const venue = event._embedded?.venues?.[0];
  const attraction = event._embedded?.attractions?.[0];
  
  return {
    id: event.id,
    name: event.name,
    date: event.dates.start.localDate,
    time: event.dates.start.localTime,
    venue: venue ? {
      name: venue.name,
      city: venue.city.name,
      address: venue.address.line1,
      coordinates: {
        lat: parseFloat(venue.location.latitude),
        lng: parseFloat(venue.location.longitude),
      },
    } : null,
    description: event.info || event.pleaseNote || 'Check out this exciting event!',
    category: event.classifications?.[0]?.segment?.name || 'Event',
    genre: event.classifications?.[0]?.genre?.name,
    image: getEventImageUrl(event),
    priceRange: event.priceRanges?.[0] ? {
      min: event.priceRanges[0].min,
      max: event.priceRanges[0].max,
      currency: event.priceRanges[0].currency,
    } : null,
    links: generateTicketmasterLink(event),
    attraction: attraction?.name,
  };
};

export default {
  searchEvents,
  getEventsByCity,
  getEventsByLocation,
  searchEventsByKeyword,
  getEventDetails,
  getEventsForPreferences,
  generateTicketmasterLink,
  getEventImageUrl,
  formatEventForDisplay,
};