import React, { useState } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';

interface SwipeCardProps {
  image: string;
  title: string;
  category: 'activities' | 'cuisine' | 'vibes';
  onSwipe: (direction: 'left' | 'right', card: { title: string; category: string }) => void;
  className?: string;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  image,
  title,
  category,
  onSwipe,
  className = '',
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    
    if (Math.abs(info.offset.x) > threshold) {
      setIsAnimating(true);
      const direction = info.offset.x > 0 ? 'right' : 'left';
      onSwipe(direction, { title, category });
    }
  };

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    setIsAnimating(true);
    onSwipe(direction, { title, category });
  };

  return (
    <div className={`relative w-full h-96 flex items-center justify-center ${className}`}>
      <motion.div
        className="absolute w-80 h-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ 
          x: isAnimating ? (Math.random() > 0.5 ? 300 : -300) : 0,
          opacity: 0,
          scale: 0.8,
          transition: { duration: 0.3 }
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Card Image */}
        <div className="relative h-60 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full capitalize">
              {category}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Swipe right if you're interested, left to skip
          </p>
          
          {/* Action Buttons */}
          <div className="flex justify-center space-x-6">
            <motion.button
              className="flex items-center justify-center w-12 h-12 bg-red-500 text-white rounded-full shadow-lg"
              onClick={() => handleButtonSwipe('left')}
              whileHover={{ scale: 1.1, backgroundColor: '#ef4444' }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
            
            <motion.button
              className="flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full shadow-lg"
              onClick={() => handleButtonSwipe('right')}
              whileHover={{ scale: 1.1, backgroundColor: '#22c55e' }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Swipe Indicators */}
      <motion.div
        className="absolute top-1/2 left-10 transform -translate-y-1/2 text-6xl font-bold text-red-500 pointer-events-none"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: useTransform(x, [-200, -50, 0], [1, 0.5, 0]),
          scale: useTransform(x, [-200, -50, 0], [1, 0.8, 0])
        }}
      >
        SKIP
      </motion.div>
      
      <motion.div
        className="absolute top-1/2 right-10 transform -translate-y-1/2 text-6xl font-bold text-green-500 pointer-events-none"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: useTransform(x, [0, 50, 200], [0, 0.5, 1]),
          scale: useTransform(x, [0, 50, 200], [0, 0.8, 1])
        }}
      >
        LIKE
      </motion.div>
    </div>
  );
};

export default SwipeCard;