import React from 'react';
import { motion } from 'framer-motion';

interface MeetupsToggleProps {
  enabled: boolean;
  onToggle: () => void;
  className?: string;
}

const MeetupsToggle: React.FC<MeetupsToggleProps> = ({
  enabled,
  onToggle,
  className = '',
}) => {
  return (
    <motion.div
      className={`flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center">
        <motion.button
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
          }`}
          onClick={onToggle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={enabled ? { boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)' } : {}}
          transition={{ duration: 0.2 }}
        >
          <motion.span
            className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
            animate={enabled ? { x: 20 } : { x: 4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </motion.button>
      </div>
      
      <div className="flex-1">
        <label className="text-base font-medium text-gray-900 dark:text-gray-100 cursor-pointer" onClick={onToggle}>
          🤝 Meetups - Hang Out with People of Similar Interests
        </label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Connect with like-minded travelers and locals during your journey
        </p>
      </div>
      
      {enabled && (
        <motion.div
          className="flex items-center text-green-600 dark:text-green-400"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MeetupsToggle;