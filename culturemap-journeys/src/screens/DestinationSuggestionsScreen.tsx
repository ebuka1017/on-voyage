import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Button from '../components/Button';

interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  matchScore: number;
}

const DestinationSuggestionsScreen: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock destinations based on preferences
  const mockDestinations: Destination[] = [
    {
      id: '1',
      name: 'Tokyo',
      country: 'Japan',
      description: 'A perfect blend of traditional culture and modern technology. Amazing food scene and vibrant nightlife.',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
      matchScore: 95
    },
    {
      id: '2',
      name: 'Barcelona',
      country: 'Spain',
      description: 'Rich history, stunning architecture, and incredible cuisine. Perfect for art lovers and food enthusiasts.',
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d81d3f?w=400&h=300&fit=crop',
      matchScore: 92
    },
    {
      id: '3',
      name: 'Bali',
      country: 'Indonesia',
      description: 'Tropical paradise with beautiful beaches, ancient temples, and amazing street food.',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop',
      matchScore: 88
    },
    {
      id: '4',
      name: 'Paris',
      country: 'France',
      description: 'The city of love with world-class museums, fine dining, and romantic atmosphere.',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop',
      matchScore: 85
    },
    {
      id: '5',
      name: 'New York',
      country: 'USA',
      description: 'The city that never sleeps. Urban adventures, amazing food, and endless entertainment.',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop',
      matchScore: 82
    },
  ];

  useEffect(() => {
    // Simulate API call
    const fetchDestinations = async () => {
      setLoading(true);
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Filter and sort destinations based on preferences
      let filteredDestinations = [...mockDestinations];
      
      if (state?.preferences) {
        // In a real app, this would use Qloo API to get personalized recommendations
        filteredDestinations = filteredDestinations.sort((a, b) => b.matchScore - a.matchScore);
      }
      
      setDestinations(filteredDestinations);
      setLoading(false);
    };

    fetchDestinations();
  }, [state]);

  const handleDestinationSelect = (destination: Destination) => {
    navigate('/itinerary', { 
      state: { 
        destination, 
        meetupsEnabled: state?.meetupsEnabled,
        preferences: state?.preferences 
      } 
    });
  };

  const handleSpecialTrip = (type: string) => {
    navigate(`/special/${type}`, { 
      state: { 
        meetupsEnabled: state?.meetupsEnabled,
        preferences: state?.preferences 
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center pt-16">
        <NavBar active="explore" />
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Finding Perfect Destinations
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Analyzing your preferences with AI...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-16">
      <NavBar active="explore" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Your Perfect Destinations
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Based on your preferences, here are the destinations that match your travel style
            {state?.meetupsEnabled && ' — with social meetup opportunities!'}
          </p>
        </motion.div>

        {/* Special Trip Options */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            Or Try a Special Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { key: 'world', label: 'Virtual World Tour', emoji: '🌍', color: 'bg-blue-600' },
              { key: 'euro', label: 'Eurotrip', emoji: '🏰', color: 'bg-purple-600' },
              { key: 'asia', label: 'Asia Adventure', emoji: '🏯', color: 'bg-red-600' },
              { key: 'africa', label: 'African Safari', emoji: '🦁', color: 'bg-orange-600' },
            ].map((trip) => (
              <Button
                key={trip.key}
                label={trip.label}
                variant="primary"
                onClick={() => handleSpecialTrip(trip.key)}
                className={`${trip.color} hover:opacity-90 py-4 text-center`}
                icon={<span className="text-2xl">{trip.emoji}</span>}
              />
            ))}
          </div>
        </motion.div>

        {/* Destination Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination, index) => (
            <motion.div
              key={destination.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              onClick={() => handleDestinationSelect(destination)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-green-600 text-white px-2 py-1 rounded-full text-sm font-semibold">
                  {destination.matchScore}% match
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    {destination.name}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {destination.country}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {destination.description}
                </p>
                
                {state?.meetupsEnabled && (
                  <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    Meetups available
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DestinationSuggestionsScreen;