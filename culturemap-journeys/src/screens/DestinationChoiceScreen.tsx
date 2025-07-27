import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Button from '../components/Button';

const DestinationChoiceScreen: React.FC = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mock autocomplete function (would use Google Places API in production)
  const fetchAutocomplete = async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Mock suggestions - in production, this would call Google Places API
    const mockSuggestions = [
      'Tokyo, Japan',
      'Paris, France',
      'New York, USA',
      'London, England',
      'Barcelona, Spain',
      'Rome, Italy',
      'Bali, Indonesia',
      'Sydney, Australia',
      'Amsterdam, Netherlands',
      'Bangkok, Thailand',
    ].filter(place => 
      place.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5);

    setSuggestions(mockSuggestions);
    setShowSuggestions(true);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchAutocomplete(location);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [location]);

  const handleSuggestionClick = (suggestion: string) => {
    setLocation(suggestion);
    setShowSuggestions(false);
  };

  const handleYes = () => {
    if (location.trim()) {
      navigate('/swipe', { state: { location: location.trim() } });
    }
  };

  const handleNo = () => {
    navigate('/swipe');
  };

  return (
    <div className="min-h-screen bg-cover bg-center relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=800&fit=crop&crop=center)',
          filter: 'blur(4px)',
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md shadow-2xl"
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-3xl font-bold text-white text-center mb-8 font-montserrat"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Have you decided on a place?
          </motion.h2>

          <motion.div
            className="mb-6 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-4 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              placeholder="Enter city or country (e.g., Tokyo, Paris)"
              onFocus={() => location && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />

            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl max-h-60 overflow-y-auto z-20"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors duration-150 text-gray-800 border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {suggestion}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button
              label="Yes, let's go!"
              variant="primary"
              onClick={handleYes}
              disabled={!location.trim()}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              }
            />
            
            <Button
              label="No, surprise me"
              variant="secondary"
              onClick={handleNo}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </motion.div>

          <motion.p
            className="text-white/70 text-sm text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Don't worry, you can always change your mind later!
          </motion.p>
        </motion.div>
      </div>

      <NavBar active="plan" />
    </div>
  );
};

export default DestinationChoiceScreen;