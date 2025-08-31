import React, { useState, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Chat from '../Chat';
import styles from './ChatWidget.module.css';
import { AuthContext } from '../../context/AuthContext'; // Adjust path as necessary

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const isLoggedIn = !!user?.email;

  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.classList.add('no-scroll');
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.classList.remove('no-scroll');
    };
  }, [isOpen]);

  return (
    <>
      {!isOpen && (
        <motion.button
          className={styles.chatButton}
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant"
        >
          💬
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.chatPanel}
            ref={panelRef} // Attach ref here
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          >
            <header className={styles.panelHeader}>
              <div className={styles.panelTitleRow}>
                <span className={styles.logoCircle}>🤖</span>
                <span className={styles.panelTitle}>AI Assistant</span>
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
              >
                ×
              </button>
            </header>
            <div className={styles.chatScrollArea}>
              {isLoggedIn ? (
                <Chat />
              ) : (
                <div
                  style={{
                    color: '#4f46e5',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    padding: '48px 0',
                    textAlign: 'center',
                  }}
                >
                  Please log in to use assistant.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
