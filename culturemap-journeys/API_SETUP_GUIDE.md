# CultureMap Journeys - API Setup Guide

This guide will help you set up all the required APIs for the CultureMap Journeys application.

## 🚀 Quick Start

1. **Copy the environment file**:
   ```bash
   cp .env .env.local
   ```

2. **Get your API keys** (follow the sections below)

3. **Update `.env.local`** with your actual API keys

4. **Start the application**:
   ```bash
   npm start
   ```

## 🔑 Required API Keys

### 1. Qloo Taste AI API

**Purpose**: Core recommendation engine for personalized destination suggestions

**Setup**:
1. Visit [Qloo API Portal](https://api.qloo.com/)
2. Sign up for a developer account
3. Create a new application
4. Copy your API key

**Environment Variable**:
```
REACT_APP_QLOO_API_KEY=your_qloo_api_key_here
```

**Features Used**:
- Destination recommendations based on user preferences
- Venue and restaurant suggestions
- Meetup location recommendations

---

### 2. Google Maps Platform

**Purpose**: Location services, autocomplete, maps, and place data

**Setup**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Routes API (optional)
   - 3D Tiles API (optional)
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. (Optional) Restrict the API key to specific APIs and domains

**Environment Variable**:
```
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Features Used**:
- City/location autocomplete
- Place details and photos
- Nearby attractions and restaurants
- Coordinates and geocoding

**Cost**: Free tier includes $200/month credit

---

### 3. Google Gemini AI

**Purpose**: AI-generated content descriptions and travel copy

**Setup**:
1. Visit [Google AI Studio](https://ai.google.dev/)
2. Click "Get API Key" 
3. Create a new project or use existing
4. Generate API key

**Environment Variable**:
```
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

**Features Used**:
- Destination descriptions
- Activity and restaurant descriptions
- Meetup descriptions
- 3D tour narrations
- Special trip descriptions

**Model Used**: `gemini-1.5-flash`

---

### 4. Ticketmaster Discovery API

**Purpose**: Live events and entertainment data

**Setup**:
1. Go to [Ticketmaster Developer Portal](https://developer.ticketmaster.com/)
2. Create a developer account
3. Register a new application
4. Copy your Consumer Key (this is your API key)

**Environment Variable**:
```
REACT_APP_TICKETMASTER_API_KEY=your_ticketmaster_api_key_here
```

**Features Used**:
- Local events and concerts
- Event details and venues
- Deep links to ticket purchasing
- Category-based event filtering

**Rate Limits**: 5,000 requests per day (free tier)

---

## 🛠️ Optional APIs

### 5. Supabase (Optional)

**Purpose**: User data storage and authentication

**Setup**:
1. Visit [Supabase](https://app.supabase.com/)
2. Create a new project
3. Copy your Project URL and anon key from Settings → API

**Environment Variables**:
```
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Features**: User profiles, saved itineraries, preferences storage

---

## 🧪 Testing Your Setup

1. **Start the application**:
   ```bash
   npm start
   ```

2. **Check API status**: Visit `http://localhost:3000` and try the full user flow:
   - Enter a destination (tests Google Places)
   - Complete preference swiping
   - View destination suggestions (tests Qloo + Gemini)

3. **Backend health check** (if running backend separately):
   ```bash
   cd backend
   python -m uvicorn main:app --reload
   # Visit http://localhost:8000/api/health
   ```

---

## 🚨 Troubleshooting

### Common Issues

**"API key not found" errors**:
- Ensure you've created `.env.local` and added all keys
- Restart the development server after adding keys
- Check for typos in environment variable names

**Google Maps autocomplete not working**:
- Ensure Places API is enabled in Google Cloud Console
- Check API key restrictions aren't blocking requests
- Verify billing is enabled (required for Places API)

**Qloo/Gemini API errors**:
- Check API key format and validity
- Verify you have available quota/credits
- Check console for specific error messages

**No events showing**:
- Ensure Ticketmaster API key is correct
- Try different cities (some may have no upcoming events)
- Check date range (default is next 30 days)

### Error Checking

The app includes comprehensive error handling:
- Fallback data when APIs fail
- Detailed error messages in development
- Graceful degradation for optional features

---

## 💰 Cost Estimates

**Free Tier Limits**:
- **Qloo**: Contact for pricing
- **Google Maps**: $200/month credit (sufficient for development)
- **Gemini**: Free up to 15 requests/minute, 1500 requests/day
- **Ticketmaster**: 5,000 requests/day
- **Supabase**: 50MB database, 500MB bandwidth

**Production Considerations**:
- Monitor API usage in cloud consoles
- Set up billing alerts
- Consider implementing request caching
- Use rate limiting for user requests

---

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Restrict API keys** by domain/IP when possible
4. **Monitor usage** to detect abuse
5. **Rotate keys** regularly in production

---

## 📚 API Documentation Links

- [Qloo API Docs](https://docs.qloo.com/)
- [Google Maps Platform](https://developers.google.com/maps/documentation)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Ticketmaster API](https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/)
- [Supabase Docs](https://supabase.com/docs)

---

## 🆘 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify all API keys are correctly set
3. Test each API individually using their documentation
4. Check this guide for troubleshooting steps

For development support, refer to the main README.md file.