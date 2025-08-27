import React from 'react';
import { motion } from 'framer-motion';
import './testimonial.css'; // Ensure this is in the same folder

export default function TestimonialReveal({ testimonials }) {
  return (
    <motion.div
      className="testimonial-grid"
      initial="rest"
      animate="rest"
      whileHover="hover"
      variants={{
        rest: {},
        hover: { transition: { staggerChildren: 0.15 } }
      }}
    >
      {testimonials.map((t) => (
        <motion.blockquote
          key={t.id}
          className="testimonial-card"
          variants={{
            rest: { scale: 1 },
            hover: { scale: 1.05, transition: { type: 'spring', stiffness: 300, damping: 20 } }
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p>"{t.comment}"</p>
          <footer className="testimonial-author">- {t.name}</footer>
        </motion.blockquote>
      ))}
    </motion.div>
  );
}
