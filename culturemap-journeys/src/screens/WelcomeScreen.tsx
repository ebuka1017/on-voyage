import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Button from '../components/Button';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=800&fit=crop&crop=center)',
          filter: 'blur(4px)',
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-white mb-4 font-montserrat"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Welcome to 
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-green-200">
              CultureMap Journeys
            </span>
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover personalized travel experiences powered by AI. 
            Connect with like-minded travelers and explore the world your way.
          </motion.p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-6 w-full max-w-md"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button
            label="Planning a Trip"
            variant="primary"
            onClick={() => navigate('/destination')}
            className="flex-1 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 shadow-xl"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            }
          />
          
          <Button
            label="Just Exploring"
            variant="secondary"
            onClick={() => navigate('/swipe')}
            className="flex-1 py-4 text-lg font-semibold bg-green-600 hover:bg-green-700 shadow-xl"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
            }
          />
        </motion.div>

        {/* Features Preview */}
        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
            <p className="text-sm text-blue-100">
              Personalized recommendations using Qloo's Taste AI
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="text-lg font-semibold mb-2">Social Meetups</h3>
            <p className="text-sm text-blue-100">
              Connect with travelers who share your interests
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="text-3xl mb-3">🌍</div>
            <h3 className="text-lg font-semibold mb-2">3D Virtual Tours</h3>
            <p className="text-sm text-blue-100">
              Immersive previews of your destinations
            </p>
          </div>
        </motion.div>
      </div>

      <NavBar active="home" />
    </div>
  );
};

export default WelcomeScreen;