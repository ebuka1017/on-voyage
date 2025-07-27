import qloo from './qloo';
import googleMaps from './googleMaps';
import gemini from './gemini';
import ticketmaster from './ticketmaster';

// Re-export types for easy access
export type { QlooPreferences, QlooDestination, QlooMeetup } from './qloo';
export type { PlaceDetails, PlaceAutocompleteResult } from './googleMaps';
export type { TicketmasterEvent } from './ticketmaster';

// Unified types for the application
export interface TravelPreferences {
  activities: string[];
  cuisine: string[];
  vibes: string[];
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  matchScore: number;
  coords: {
    lat: number;
    lng: number;
  };
}

export interface ItineraryItem {
  id: string;
  title: string;
  type: 'activity' | 'dining' | 'attraction' | 'meetups';
  description: string;
  image: string;
  duration?: string;
  coords: {
    lat: number;
    lng: number;
  };
  meetups?: {
    available: boolean;
    suggestions: Array<{
      title: string;
      time: string;
      participants: number;
    }>;
  };
  event?: {
    id: string;
    url: string;
    deepLink: string;
  };
}

export interface MeetupSuggestion {
  id: string;
  title: string;
  type: 'spot' | 'event' | 'virtual';
  location: string;
  description: string;
  image: string;
}

// Unified API service
class TravelAPIService {
  // Get destination recommendations with real APIs
  async getDestinationRecommendations(
    preferences: TravelPreferences,
    meetupsEnabled: boolean = false,
    location?: string
  ): Promise<{ destinations: Destination[]; meetups: MeetupSuggestion[] }> {
    try {
      console.log('Getting destination recommendations...', { preferences, meetupsEnabled, location });

      // Get Qloo recommendations
      const qlooResponse = await qloo.getDestinationRecommendations({
        preferences,
        meetupsEnabled,
        location,
      });

      // Enhance destinations with Google Maps data and Gemini descriptions
      const enhancedDestinations = await Promise.all(
        qlooResponse.destinations.map(async (dest) => {
          // Get better images from Google Places if available
          let enhancedImage = dest.image_url;
          try {
            const placeDetails = await googleMaps.geocodeAddress(`${dest.name}, ${dest.country}`);
            if (placeDetails) {
              // Try to find a place photo
              const cityAttractions = await googleMaps.getCityAttractions(dest.name);
              if (cityAttractions.length > 0 && cityAttractions[0].photos) {
                enhancedImage = googleMaps.getPlacePhotoUrl(cityAttractions[0].photos[0].photo_reference);
              }
            }
          } catch (error) {
            console.warn('Could not enhance image for destination:', dest.name);
          }

          // Generate AI description
          let enhancedDescription = dest.description;
          try {
            enhancedDescription = await gemini.generateDestinationDescription(
              dest.name,
              [...preferences.activities, ...preferences.cuisine, ...preferences.vibes],
              meetupsEnabled
            );
          } catch (error) {
            console.warn('Could not generate AI description for destination:', dest.name);
          }

          return {
            id: dest.id,
            name: dest.name,
            country: dest.country,
            description: enhancedDescription,
            image: enhancedImage || `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center`,
            matchScore: dest.matchScore,
            coords: {
              lat: dest.coordinates.latitude,
              lng: dest.coordinates.longitude,
            },
          };
        })
      );

      // Enhance meetups with AI descriptions
      const enhancedMeetups = await Promise.all(
        (qlooResponse.meetups || []).map(async (meetup) => {
          let enhancedDescription = meetup.description;
          try {
            enhancedDescription = await gemini.generateMeetupDescription(
              meetup.title,
              meetup.type,
              meetup.location,
              [...preferences.activities, ...preferences.cuisine, ...preferences.vibes]
            );
          } catch (error) {
            console.warn('Could not generate AI description for meetup:', meetup.title);
          }

          return {
            id: meetup.id,
            title: meetup.title,
            type: meetup.type,
            location: meetup.location,
            description: enhancedDescription,
            image: `https://images.unsplash.com/photo-1566737236500-c8ac43014a8e?w=400&h=300&fit=crop&crop=center`,
          };
        })
      );

      return {
        destinations: enhancedDestinations,
        meetups: enhancedMeetups,
      };
    } catch (error) {
      console.error('Error getting destination recommendations:', error);
      throw new Error('Failed to get destination recommendations');
    }
  }

  // Get detailed itinerary for a destination
  async getDestinationItinerary(
    destination: string,
    preferences: TravelPreferences,
    meetupsEnabled: boolean = false
  ): Promise<ItineraryItem[]> {
    try {
      console.log('Getting destination itinerary...', { destination, preferences, meetupsEnabled });

      // Get base itinerary from Qloo
      const qlooItinerary = await qloo.getDestinationItinerary(destination, preferences, meetupsEnabled);

      // Get additional data from Google Maps
      const [attractions, restaurants] = await Promise.all([
        googleMaps.getCityAttractions(destination),
        googleMaps.getCityRestaurants(destination, preferences.cuisine),
      ]);

      // Get events from Ticketmaster
      const events = await ticketmaster.getEventsForPreferences(destination, {
        activities: preferences.activities,
        vibes: preferences.vibes,
        meetupsEnabled,
      });

      // Combine and enhance all data
      const combinedItinerary: ItineraryItem[] = [];

      // Add Qloo recommendations (enhanced)
      for (const item of qlooItinerary) {
        let enhancedDescription = item.description;
        try {
          enhancedDescription = await gemini.generateItineraryItemDescription(
            item.title,
            item.type,
            destination,
            [...preferences.activities, ...preferences.cuisine, ...preferences.vibes]
          );
        } catch (error) {
          console.warn('Could not enhance description for:', item.title);
        }

        combinedItinerary.push({
          ...item,
          description: enhancedDescription,
        });
      }

      // Add Google Places attractions
      for (const attraction of attractions.slice(0, 5)) {
        let description = `Visit ${attraction.name} and experience one of the top attractions in ${destination}.`;
        try {
          description = await gemini.generateItineraryItemDescription(
            attraction.name,
            'attraction',
            destination,
            [...preferences.activities, ...preferences.cuisine, ...preferences.vibes]
          );
        } catch (error) {
          console.warn('Could not generate description for attraction:', attraction.name);
        }

        const image = attraction.photos?.[0] 
          ? googleMaps.getPlacePhotoUrl(attraction.photos[0].photo_reference)
          : `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center`;

        combinedItinerary.push({
          id: `attraction_${attraction.place_id}`,
          title: attraction.name,
          type: 'attraction',
          description,
          image,
          duration: '2-3 hours',
          coords: {
            lat: attraction.geometry.location.lat,
            lng: attraction.geometry.location.lng,
          },
          meetups: {
            available: meetupsEnabled,
            suggestions: meetupsEnabled ? [{
              title: `${attraction.name} Photography Group`,
              time: '10:00 AM',
              participants: Math.floor(Math.random() * 15) + 5,
            }] : [],
          },
        });
      }

      // Add Google Places restaurants
      for (const restaurant of restaurants.slice(0, 3)) {
        let description = `Enjoy a meal at ${restaurant.name}, a highly-rated restaurant in ${destination}.`;
        try {
          description = await gemini.generateItineraryItemDescription(
            restaurant.name,
            'dining',
            destination,
            [...preferences.activities, ...preferences.cuisine, ...preferences.vibes]
          );
        } catch (error) {
          console.warn('Could not generate description for restaurant:', restaurant.name);
        }

        const image = restaurant.photos?.[0] 
          ? googleMaps.getPlacePhotoUrl(restaurant.photos[0].photo_reference)
          : `https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&crop=center`;

        combinedItinerary.push({
          id: `restaurant_${restaurant.place_id}`,
          title: restaurant.name,
          type: 'dining',
          description,
          image,
          duration: '1-2 hours',
          coords: {
            lat: restaurant.geometry.location.lat,
            lng: restaurant.geometry.location.lng,
          },
          meetups: {
            available: meetupsEnabled,
            suggestions: meetupsEnabled ? [{
              title: 'Foodie Meetup',
              time: '7:00 PM',
              participants: Math.floor(Math.random() * 12) + 6,
            }] : [],
          },
        });
      }

      // Add Ticketmaster events as meetups
      for (const event of events.slice(0, 3)) {
        const formattedEvent = ticketmaster.formatEventForDisplay(event);
        
        let description = formattedEvent.description;
        try {
          description = await gemini.generateMeetupDescription(
            formattedEvent.name,
            'event',
            formattedEvent.venue?.city || destination,
            [...preferences.activities, ...preferences.vibes]
          );
        } catch (error) {
          console.warn('Could not generate description for event:', formattedEvent.name);
        }

        combinedItinerary.push({
          id: `event_${formattedEvent.id}`,
          title: formattedEvent.name,
          type: 'meetups',
          description,
          image: formattedEvent.image,
          duration: '2-4 hours',
          coords: formattedEvent.venue?.coordinates || { lat: 0, lng: 0 },
          event: {
            id: formattedEvent.id,
            url: formattedEvent.links.webLink,
            deepLink: formattedEvent.links.deepLink,
          },
        });
      }

      return combinedItinerary;
    } catch (error) {
      console.error('Error getting destination itinerary:', error);
      throw new Error('Failed to get destination itinerary');
    }
  }

  // Get place autocomplete suggestions
  async getPlaceAutocomplete(input: string): Promise<PlaceAutocompleteResult[]> {
    try {
      return await googleMaps.getPlaceAutocomplete(input);
    } catch (error) {
      console.error('Error getting place autocomplete:', error);
      return [];
    }
  }

  // Get events for a city
  async getEventsForCity(
    cityName: string,
    preferences?: TravelPreferences
  ): Promise<any[]> {
    try {
      const events = await ticketmaster.getEventsForPreferences(cityName, {
        activities: preferences?.activities,
        vibes: preferences?.vibes,
        meetupsEnabled: true,
      });

      return events.map(event => ticketmaster.formatEventForDisplay(event));
    } catch (error) {
      console.error('Error getting events for city:', error);
      return [];
    }
  }

  // Generate special trip itinerary
  async getSpecialTripItinerary(
    tripType: 'world' | 'euro' | 'asia' | 'africa',
    preferences: TravelPreferences,
    meetupsEnabled: boolean = false
  ): Promise<{
    title: string;
    description: string;
    destinations: string[];
    itinerary: ItineraryItem[];
  }> {
    try {
      const tripData = {
        world: {
          title: 'Virtual World Tour',
          destinations: ['Paris, France', 'Tokyo, Japan', 'New York, USA', 'Sydney, Australia'],
          duration: '14 days'
        },
        euro: {
          title: 'European Adventure',
          destinations: ['Paris, France', 'Rome, Italy', 'Barcelona, Spain', 'Amsterdam, Netherlands'],
          duration: '10 days'
        },
        asia: {
          title: 'Asian Exploration',
          destinations: ['Tokyo, Japan', 'Bangkok, Thailand', 'Bali, Indonesia', 'Singapore'],
          duration: '12 days'
        },
        africa: {
          title: 'African Safari',
          destinations: ['Cape Town, South Africa', 'Serengeti, Tanzania', 'Marrakech, Morocco', 'Cairo, Egypt'],
          duration: '14 days'
        }
      };

      const trip = tripData[tripType];
      
      // Generate AI description for the trip
      let description = `Embark on an unforgettable ${trip.title} covering ${trip.destinations.length} amazing destinations.`;
      try {
        description = await gemini.generateSpecialTripDescription(
          tripType,
          trip.destinations,
          trip.duration,
          [...preferences.activities, ...preferences.cuisine, ...preferences.vibes]
        );
      } catch (error) {
        console.warn('Could not generate trip description');
      }

      // Get mini itineraries for each destination
      const allItineraryItems: ItineraryItem[] = [];
      
      for (let i = 0; i < trip.destinations.length; i++) {
        const destination = trip.destinations[i];
        const dayStart = i * 3 + 1; // 3 days per destination
        
        try {
          // Get a few key attractions for each destination
          const cityName = destination.split(',')[0];
          const attractions = await googleMaps.getCityAttractions(cityName);
          const restaurants = await googleMaps.getCityRestaurants(cityName, preferences.cuisine);
          
          // Add 1-2 attractions per destination
          for (let j = 0; j < Math.min(2, attractions.length); j++) {
            const attraction = attractions[j];
            let description = `Day ${dayStart + j}: Explore ${attraction.name} in ${cityName}`;
            
            try {
              description = await gemini.generateItineraryItemDescription(
                attraction.name,
                'attraction',
                cityName,
                [...preferences.activities, ...preferences.cuisine, ...preferences.vibes]
              );
            } catch (error) {
              console.warn('Could not generate description for special trip attraction');
            }

            const image = attraction.photos?.[0] 
              ? googleMaps.getPlacePhotoUrl(attraction.photos[0].photo_reference)
              : `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center`;

            allItineraryItems.push({
              id: `${tripType}_${i}_${j}`,
              title: `${attraction.name} - ${cityName}`,
              type: 'attraction',
              description,
              image,
              duration: '3-4 hours',
              coords: {
                lat: attraction.geometry.location.lat,
                lng: attraction.geometry.location.lng,
              },
              meetups: {
                available: meetupsEnabled,
                suggestions: meetupsEnabled ? [{
                  title: `${tripType.charAt(0).toUpperCase() + tripType.slice(1)} Travelers Meetup`,
                  time: '2:00 PM',
                  participants: Math.floor(Math.random() * 20) + 10,
                }] : [],
              },
            });
          }

          // Add 1 restaurant per destination
          if (restaurants.length > 0) {
            const restaurant = restaurants[0];
            let description = `Day ${dayStart + 1}: Dine at ${restaurant.name} in ${cityName}`;
            
            try {
              description = await gemini.generateItineraryItemDescription(
                restaurant.name,
                'dining',
                cityName,
                [...preferences.activities, ...preferences.cuisine, ...preferences.vibes]
              );
            } catch (error) {
              console.warn('Could not generate description for special trip restaurant');
            }

            const image = restaurant.photos?.[0] 
              ? googleMaps.getPlacePhotoUrl(restaurant.photos[0].photo_reference)
              : `https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&crop=center`;

            allItineraryItems.push({
              id: `${tripType}_${i}_dining`,
              title: `${restaurant.name} - ${cityName}`,
              type: 'dining',
              description,
              image,
              duration: '2 hours',
              coords: {
                lat: restaurant.geometry.location.lat,
                lng: restaurant.geometry.location.lng,
              },
              meetups: {
                available: meetupsEnabled,
                suggestions: meetupsEnabled ? [{
                  title: 'International Foodie Group',
                  time: '7:00 PM',
                  participants: Math.floor(Math.random() * 15) + 8,
                }] : [],
              },
            });
          }
        } catch (error) {
          console.warn(`Could not get detailed data for ${destination}`);
        }
      }

      return {
        title: trip.title,
        description,
        destinations: trip.destinations,
        itinerary: allItineraryItems,
      };
    } catch (error) {
      console.error('Error generating special trip:', error);
      throw new Error('Failed to generate special trip itinerary');
    }
  }

  // Generate 3D tour narrations
  async generate3DTourNarration(placeName: string, placeType: string): Promise<string> {
    try {
      return await gemini.generate3DTourNarration(placeName, placeType);
    } catch (error) {
      console.error('Error generating 3D tour narration:', error);
      return `Welcome to ${placeName}! Explore this amazing ${placeType} at your own pace.`;
    }
  }
}

// Export singleton instance
export const travelAPI = new TravelAPIService();

// Export individual API services for direct access if needed
export { qloo, googleMaps, gemini, ticketmaster };

export default travelAPI;