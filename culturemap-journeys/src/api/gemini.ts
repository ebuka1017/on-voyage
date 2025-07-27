import axios from 'axios';

// Gemini API configuration
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

if (!GEMINI_API_KEY) {
  console.warn('Gemini API key not found. Please set REACT_APP_GEMINI_API_KEY in your environment variables.');
}

// Create axios instance for Gemini API
const geminiApi = axios.create({
  baseURL: GEMINI_BASE_URL,
  timeout: 30000,
});

// Types for Gemini API
export interface GeminiRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  context?: string;
}

export interface GeminiResponse {
  text: string;
  finishReason?: string;
}

// Generate content using Gemini
export const generateContent = async (request: GeminiRequest): Promise<string> => {
  try {
    const payload = {
      contents: [{
        parts: [{
          text: request.prompt
        }]
      }],
      generationConfig: {
        maxOutputTokens: request.maxTokens || 500,
        temperature: request.temperature || 0.7,
        topP: 0.8,
        topK: 40,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };

    const response = await geminiApi.post(
      `/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      payload
    );

    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Gemini API request failed:', error.response?.data || error.message);
    }
    
    throw new Error('Failed to generate content with Gemini API');
  }
};

// Generate destination description
export const generateDestinationDescription = async (
  destinationName: string,
  preferences: string[],
  meetupsEnabled: boolean = false
): Promise<string> => {
  const meetupText = meetupsEnabled ? 
    ' Also include information about social opportunities and places where travelers can meet like-minded people.' : '';

  const prompt = `Write an engaging and informative travel description for ${destinationName}. 
  The traveler is interested in: ${preferences.join(', ')}.
  
  The description should be:
  - 2-3 sentences long
  - Enthusiastic and inspiring
  - Highlight specific attractions or experiences that match their interests
  - Written in second person (using "you")
  ${meetupText}
  
  Focus on what makes this destination special for someone with these interests.`;

  try {
    return await generateContent({
      prompt,
      maxTokens: 200,
      temperature: 0.8,
    });
  } catch (error) {
    // Fallback description
    return `Discover the amazing experiences ${destinationName} has to offer! This destination perfectly matches your interests in ${preferences.slice(0, 2).join(' and ')}, with countless opportunities for memorable adventures.`;
  }
};

// Generate itinerary item descriptions
export const generateItineraryItemDescription = async (
  itemName: string,
  itemType: 'activity' | 'dining' | 'attraction',
  destination: string,
  userPreferences: string[] = []
): Promise<string> => {
  const typeDescriptions = {
    activity: 'activity or experience',
    dining: 'restaurant or dining experience',
    attraction: 'attraction or point of interest'
  };

  const prompt = `Write a compelling description for ${itemName}, a ${typeDescriptions[itemType]} in ${destination}.
  
  Consider these user preferences: ${userPreferences.join(', ')}.
  
  The description should be:
  - 1-2 sentences long
  - Highlight what makes this place special
  - Connect to the user's interests where relevant
  - Be practical and informative
  - Written in second person (using "you")
  
  Focus on the unique experience and why it's worth visiting.`;

  try {
    return await generateContent({
      prompt,
      maxTokens: 150,
      temperature: 0.7,
    });
  } catch (error) {
    // Fallback description
    return `Experience ${itemName} and discover what makes it a must-visit ${itemType} in ${destination}.`;
  }
};

// Generate meetup descriptions
export const generateMeetupDescription = async (
  meetupTitle: string,
  meetupType: 'spot' | 'event' | 'virtual',
  location: string,
  userInterests: string[] = []
): Promise<string> => {
  const typeDescriptions = {
    spot: 'meetup location',
    event: 'social event',
    virtual: 'online community'
  };

  const prompt = `Write an inviting description for "${meetupTitle}", a ${typeDescriptions[meetupType]} in ${location}.
  
  This meetup is perfect for people interested in: ${userInterests.join(', ')}.
  
  The description should be:
  - 1-2 sentences long
  - Emphasize the social and community aspect
  - Highlight how it connects people with similar interests
  - Be welcoming and inclusive
  - Written in second person (using "you")
  
  Focus on the social benefits and shared experiences.`;

  try {
    return await generateContent({
      prompt,
      maxTokens: 120,
      temperature: 0.8,
    });
  } catch (error) {
    // Fallback description
    return `Join ${meetupTitle} and connect with fellow travelers who share your passion for ${userInterests[0] || 'exploration'}.`;
  }
};

// Generate 3D tour narration
export const generate3DTourNarration = async (
  placeName: string,
  placeType: string,
  historicalContext?: string
): Promise<string> => {
  const prompt = `Create an engaging narration for a 3D virtual tour of ${placeName}, a ${placeType}.
  ${historicalContext ? `Historical context: ${historicalContext}` : ''}
  
  The narration should be:
  - 2-3 sentences long
  - Informative yet captivating
  - Include interesting facts or cultural significance
  - Written as if you're a knowledgeable tour guide
  - Engaging for virtual tour viewers
  
  Focus on what makes this place unique and worth exploring.`;

  try {
    return await generateContent({
      prompt,
      maxTokens: 200,
      temperature: 0.7,
    });
  } catch (error) {
    // Fallback narration
    return `Welcome to ${placeName}! This remarkable ${placeType} offers a unique glimpse into the local culture and history. Take your time to explore and discover the stories this place has to tell.`;
  }
};

// Generate trip recommendations based on special trip types
export const generateSpecialTripDescription = async (
  tripType: 'world' | 'euro' | 'asia' | 'africa',
  destinations: string[],
  duration: string,
  userPreferences: string[] = []
): Promise<string> => {
  const tripTitles = {
    world: 'Virtual World Tour',
    euro: 'European Adventure', 
    asia: 'Asian Exploration',
    africa: 'African Safari'
  };

  const prompt = `Write an exciting description for a ${tripTitles[tripType]} covering ${destinations.join(', ')} over ${duration}.
  
  The traveler is interested in: ${userPreferences.join(', ')}.
  
  The description should be:
  - 3-4 sentences long
  - Highlight the diversity of experiences across destinations
  - Connect to the user's specific interests
  - Emphasize the journey and cultural immersion
  - Be inspiring and adventurous
  - Written in second person (using "you")
  
  Focus on the unique aspects of traveling through multiple destinations.`;

  try {
    return await generateContent({
      prompt,
      maxTokens: 250,
      temperature: 0.8,
    });
  } catch (error) {
    // Fallback description
    return `Embark on an unforgettable ${tripTitles[tripType]} that takes you through ${destinations.length} incredible destinations. Experience diverse cultures, cuisines, and adventures perfectly tailored to your interests in ${userPreferences.slice(0, 2).join(' and ')}.`;
  }
};

// Generate personalized travel tips
export const generateTravelTips = async (
  destination: string,
  userPreferences: string[],
  travelStyle: 'budget' | 'luxury' | 'adventure' | 'cultural' = 'cultural'
): Promise<string[]> => {
  const prompt = `Generate 5 practical travel tips for visiting ${destination} for someone interested in ${userPreferences.join(', ')} with a ${travelStyle} travel style.
  
  Each tip should be:
  - One sentence long
  - Specific and actionable
  - Relevant to their interests and travel style
  - Practical for actual travel planning
  
  Format as a simple list, one tip per line.`;

  try {
    const response = await generateContent({
      prompt,
      maxTokens: 300,
      temperature: 0.6,
    });

    // Parse the response into an array of tips
    return response
      .split('\n')
      .filter(tip => tip.trim().length > 0)
      .map(tip => tip.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 5);
  } catch (error) {
    // Fallback tips
    return [
      `Research the best ${userPreferences[0] || 'local'} experiences in ${destination} before you go.`,
      'Download offline maps and translation apps for easier navigation.',
      'Try to learn a few basic phrases in the local language.',
      'Pack comfortable walking shoes for exploring.',
      'Keep an open mind and embrace unexpected discoveries.'
    ];
  }
};

export default {
  generateContent,
  generateDestinationDescription,
  generateItineraryItemDescription,
  generateMeetupDescription,
  generate3DTourNarration,
  generateSpecialTripDescription,
  generateTravelTips,
};