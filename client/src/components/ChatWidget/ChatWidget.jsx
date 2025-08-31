import React, { useState, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Chat from '../Chat';
import styles from './ChatWidget.module.css';
import { AuthContext } from '../../context/AuthContext';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const isLoggedIn = !!user?.email;
  const panelRef = useRef(null);
  const [lastQuery, setLastQuery] = useState('');

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
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

  const handleCloseChat = () => setIsOpen(false);
  const handleQueryUpdate = query => setLastQuery(query.trim().toLowerCase());

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
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          >
            <header className={styles.panelHeader}>
              <div className={styles.panelTitleRow}>
                🤖 AI Assistant
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </header>
            <div className={styles.chatScrollArea}>
              {isLoggedIn ? (
                <Chat
                  onCloseChat={handleCloseChat}
                  onQueryUpdate={handleQueryUpdate}
                  lastQuery={lastQuery}
                />
              ) : (
                <div className={styles.loginPrompt}>
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
