# CultureMap Journeys 🗺️

**A travel planning application designed for the Qloo LLM Hackathon**

CultureMap Journeys is a web and mobile-friendly travel planning tool that generates personalized itineraries based on user preferences for activities, cuisine, and vibes. It integrates with Qloo's Taste AI API for cultural recommendations and includes a social feature called "Meetups" to connect users with like-minded travelers.

## 🌟 Key Features

- **AI-Powered Recommendations**: Personalized travel suggestions using Qloo's Taste AI API
- **Swipe-Based Preferences**: Tinder-style interface for selecting travel preferences
- **Meetups Integration**: Connect with travelers who share similar interests
- **Interactive Maps**: 2D and 3D visualizations powered by Google Maps Platform
- **Special Multi-Destination Trips**: Eurotrip, Asia Trip, Africa Trip, and Virtual World Tour
- **Offline Caching**: Save itineraries for offline access
- **Dark Mode Support**: Beautiful UI that adapts to user preferences

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- API keys for:
  - Qloo Taste AI API
  - Google Maps Platform
  - Google Gemini API
  - Ticketmaster Discovery API

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd culturemap-journeys
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the `.env` file and add your API keys:
   ```bash
   # API Keys - Replace with your actual keys
   REACT_APP_QLOO_API_KEY=your_qloo_api_key_here
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
   REACT_APP_TICKETMASTER_API_KEY=your_ticketmaster_api_key_here
   
   # Supabase Configuration (optional)
   REACT_APP_SUPABASE_URL=your_supabase_url_here
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000` to see the application running.

## 📱 App Flow

1. **Welcome Screen** (`/`) - Choose between "Planning a Trip" or "Just Exploring"
2. **Destination Choice** (`/destination`) - Optionally specify a destination
3. **Preference Swipes** (`/swipe`) - Swipe through activities, cuisine, and vibes
4. **Destination Suggestions** (`/suggestions`) - View AI-powered recommendations
5. **Itinerary View** (`/itinerary`) - Detailed travel itinerary with Meetups
6. **3D Tour Mode** (`/3d`) - Immersive virtual destination tours

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation

### APIs & Integrations
- **Qloo Taste AI API** - Personalized recommendations
- **Google Maps Platform** - Maps, Places, Routes, 3D Tiles
- **Google Gemini** - Content generation
- **Ticketmaster Discovery API** - Event information

### Database & Storage
- **Supabase** - User data and itineraries
- **Local Storage** - Offline caching

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Secondary**: Gray (#6B7280)
- **Accent**: Green (#10B981)
- **Background**: Light Gray (#F3F4F6) / Dark Gray (#1F2937)

### Typography
- **Font Family**: Montserrat
- **Weights**: 400, 500, 600, 700, 800

### Animations
- **Swipe Cards**: 0.3s slide with spring physics
- **Map Pins**: 0.5s pulse animation
- **Button Interactions**: 0.2s scale transformations
- **Page Transitions**: 0.3s fade effects

## 🔧 Development

### Available Scripts

- `npm start` - Runs the development server
- `npm run build` - Builds the app for production
- `npm test` - Runs the test suite
- `npm run eject` - Ejects from Create React App (irreversible)

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── NavBar.tsx
│   ├── SwipeCard.tsx
│   ├── MeetupsToggle.tsx
│   └── ...
├── screens/            # Main application screens
│   ├── WelcomeScreen.tsx
│   ├── CardSwipesScreen.tsx
│   └── ...
├── api/               # API integration modules
├── types/             # TypeScript type definitions
├── context/           # React context providers
└── utils/             # Utility functions
```

## 🌐 API Integration

### Qloo Taste AI API
```typescript
// Example preference submission
const preferences = {
  activities: ['hiking', 'museums'],
  cuisine: ['japanese', 'street-food'],
  vibes: ['urban', 'cultural'],
  meetupsEnabled: true
};

const response = await fetch('/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(preferences)
});
```

### Google Maps Integration
- **Maps JavaScript API** - 2D map rendering
- **Places API** - Location details and autocomplete
- **Routes API** - Travel route calculation
- **3D Tiles API** - Photorealistic 3D experiences

## 🤝 Meetups Feature

The Meetups feature connects travelers with similar interests:

- **Meetup Spots**: Cafes, bars, and social venues
- **Events**: Concerts, workshops, and activities via Ticketmaster
- **Virtual Groups**: Online communities for destination planning
- **Privacy Controls**: Anonymous or public profile options

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Friendly**: Adaptive layouts for tablets
- **Desktop Enhanced**: Full features on larger screens
- **Touch Interactions**: Swipe gestures and touch-friendly controls

## 🔒 Privacy & Security

- **API Key Protection**: Environment variables for sensitive data
- **User Data**: Optional Supabase integration with privacy controls
- **Offline First**: Core functionality works without internet
- **GDPR Compliant**: Privacy-focused data handling

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Manual Build

```bash
npm run build
# Deploy the build/ folder to your hosting provider
```

## 🧪 Testing

- **Unit Tests**: Jest and React Testing Library
- **E2E Tests**: Cypress for user flow testing
- **API Tests**: Mock API responses for reliable testing

## 📈 Performance

- **Lazy Loading**: Components and routes loaded on demand
- **Image Optimization**: Responsive images with fallbacks
- **Caching**: API responses cached in memory and local storage
- **Bundle Splitting**: Optimized JavaScript bundles

## 🛣️ Roadmap

### Phase 1 (Current)
- ✅ Core swipe interface
- ✅ Basic destination suggestions
- ✅ Meetups integration
- ✅ Responsive design

### Phase 2 (Next)
- 🔄 Full Qloo API integration
- 🔄 3D virtual tours
- 🔄 Detailed itinerary view
- 🔄 Offline functionality

### Phase 3 (Future)
- 📅 Real-time meetup coordination
- 📅 Social sharing features
- 📅 Booking integrations
- 📅 AI trip optimization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Qloo** for the Taste AI API and hackathon opportunity
- **Google Maps Platform** for mapping and location services
- **Unsplash** for beautiful travel imagery
- **React Community** for amazing tools and libraries

## 📞 Support

For questions or support, please:
- Open an issue on GitHub
- Contact the development team
- Check the documentation

---

**Built with ❤️ for the Qloo LLM Hackathon**
