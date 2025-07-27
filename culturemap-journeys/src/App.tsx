import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomeScreen from './screens/WelcomeScreen';
import DestinationChoiceScreen from './screens/DestinationChoiceScreen';
import CardSwipesScreen from './screens/CardSwipesScreen';
import DestinationSuggestionsScreen from './screens/DestinationSuggestionsScreen';
// import ItineraryViewScreen from './screens/ItineraryViewScreen';
// import SpecialTripViewScreen from './screens/SpecialTripViewScreen';
// import ThreeDTourModeScreen from './screens/ThreeDTourModeScreen';
// import SavedPlansScreen from './screens/SavedPlansScreen';
// import SettingsScreen from './screens/SettingsScreen';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-100 dark:bg-gray-900">
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/destination" element={<DestinationChoiceScreen />} />
          <Route path="/swipe" element={<CardSwipesScreen />} />
          <Route path="/suggestions" element={<DestinationSuggestionsScreen />} />
          {/* <Route path="/itinerary" element={<ItineraryViewScreen />} />
          <Route path="/special/:type" element={<SpecialTripViewScreen />} />
          <Route path="/3d" element={<ThreeDTourModeScreen />} />
          <Route path="/saved" element={<SavedPlansScreen />} />
          <Route path="/settings" element={<SettingsScreen />} /> */}
          
          {/* Fallback route */}
          <Route path="*" element={<WelcomeScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
