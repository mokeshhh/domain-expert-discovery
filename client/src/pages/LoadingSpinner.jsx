import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = () => (
  <motion.div 
    className="loading-container"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="loading-spinner"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
    <motion.span 
      className="loading-text"
      animate={{ opacity: [1, 0.5, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      Loading experts...
    </motion.span>
  </motion.div>
);

export default LoadingSpinner;
