import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SwipeCard from '../components/SwipeCard';
import MeetupsToggle from '../components/MeetupsToggle';
import ProgressIndicator from '../components/ProgressIndicator';
import Button from '../components/Button';
import NavBar from '../components/NavBar';

interface CardData {
  id: string;
  title: string;
  category: 'activities' | 'cuisine' | 'vibes';
  image: string;
}

interface PreferencesState {
  activities: string[];
  cuisine: string[];
  vibes: string[];
}

const CardSwipesScreen: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [preferences, setPreferences] = useState<PreferencesState>({
    activities: [],
    cuisine: [],
    vibes: [],
  });
  const [meetupsEnabled, setMeetupsEnabled] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [swipeHistory, setSwipeHistory] = useState<Array<{ cardIndex: number; direction: 'left' | 'right'; preferences: PreferencesState }>>([]);
  const [currentCategory, setCurrentCategory] = useState<'activities' | 'cuisine' | 'vibes'>('activities');

  // Mock card data - in production, this would come from an API
  const cardData: CardData[] = [
    // Activities
    { id: '1', title: 'Hiking & Nature Walks', category: 'activities', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop' },
    { id: '2', title: 'Museums & Art Galleries', category: 'activities', image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400&h=300&fit=crop' },
    { id: '3', title: 'Nightlife & Bars', category: 'activities', image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a8e?w=400&h=300&fit=crop' },
    { id: '4', title: 'Shopping & Markets', category: 'activities', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop' },
    { id: '5', title: 'Adventure Sports', category: 'activities', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop' },
    
    // Cuisine
    { id: '6', title: 'Italian Cuisine', category: 'cuisine', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop' },
    { id: '7', title: 'Japanese Food', category: 'cuisine', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop' },
    { id: '8', title: 'Street Food', category: 'cuisine', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop' },
    { id: '9', title: 'Fine Dining', category: 'cuisine', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop' },
    { id: '10', title: 'Vegetarian & Vegan', category: 'cuisine', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop' },
    
    // Vibes
    { id: '11', title: 'Urban & Modern', category: 'vibes', image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop' },
    { id: '12', title: 'Historic & Cultural', category: 'vibes', image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=300&fit=crop' },
    { id: '13', title: 'Beach & Coastal', category: 'vibes', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop' },
    { id: '14', title: 'Mountains & Nature', category: 'vibes', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop' },
    { id: '15', title: 'Romantic & Intimate', category: 'vibes', image: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=400&h=300&fit=crop' },
  ];

  const totalCards = cardData.length;
  const totalSelections = Object.values(preferences).flat().length;

  useEffect(() => {
    // Update current category based on progress
    if (currentCardIndex < 5) {
      setCurrentCategory('activities');
    } else if (currentCardIndex < 10) {
      setCurrentCategory('cuisine');
    } else {
      setCurrentCategory('vibes');
    }
  }, [currentCardIndex]);

  const handleSwipe = (direction: 'left' | 'right', card: { title: string; category: string }) => {
    // Save current state to history for undo functionality
    setSwipeHistory(prev => [...prev, { 
      cardIndex: currentCardIndex, 
      direction, 
      preferences: { ...preferences } 
    }]);

    if (direction === 'right') {
      setPreferences(prev => ({
        ...prev,
        [card.category]: [...prev[card.category as keyof PreferencesState], card.title],
      }));
    }

    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // All cards completed, navigate to suggestions
      handleDone();
    }
  };

  const handleUndo = () => {
    if (swipeHistory.length === 0) return;

    const lastAction = swipeHistory[swipeHistory.length - 1];
    setCurrentCardIndex(lastAction.cardIndex);
    setPreferences(lastAction.preferences);
    setSwipeHistory(prev => prev.slice(0, -1));
  };

  const handleDone = () => {
    const hasMinimumSelections = Object.values(preferences).some(category => category.length > 0);
    
    if (!hasMinimumSelections) {
      alert('Please select at least one preference to continue.');
      return;
    }

    navigate('/suggestions', { 
      state: { 
        preferences, 
        meetupsEnabled, 
        location: state?.location 
      } 
    });
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'activities': return 'What activities interest you?';
      case 'cuisine': return 'What food do you love?';
      case 'vibes': return 'What atmosphere appeals to you?';
      default: return 'Tell us your preferences';
    }
  };

  const currentCard = cardData[currentCardIndex];
  const canUndo = swipeHistory.length > 0;
  const canFinish = totalSelections >= 3; // Minimum 3 selections required

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col pt-16">
      <NavBar active="plan" />
      
      {/* Meetups Toggle */}
      <div className="px-4 py-2">
        <MeetupsToggle 
          enabled={meetupsEnabled} 
          onToggle={() => setMeetupsEnabled(!meetupsEnabled)} 
        />
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator 
        current={currentCardIndex} 
        total={totalCards}
        className="px-4 py-2"
      />

      {/* Category Header */}
      <motion.div
        className="text-center py-4"
        key={currentCategory}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {getCategoryName(currentCategory)}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Swipe right for yes, left for no
        </p>
      </motion.div>

      {/* Swipe Card Area */}
      <div className="flex-1 flex items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {currentCard && (
            <SwipeCard
              key={currentCard.id}
              image={currentCard.image}
              title={currentCard.title}
              category={currentCard.category}
              onSwipe={handleSwipe}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <Button
            label="Undo"
            variant="secondary"
            onClick={handleUndo}
            disabled={!canUndo}
            className="flex-1 mr-2"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            }
          />
          
          <Button
            label={currentCardIndex >= totalCards - 1 ? "Finish" : "Skip to Results"}
            variant="primary"
            onClick={handleDone}
            disabled={!canFinish}
            className="flex-1 ml-2"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            }
          />
        </div>
        
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {totalSelections} preferences selected • {canFinish ? 'Ready to continue!' : 'Select at least 3 to continue'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardSwipesScreen;