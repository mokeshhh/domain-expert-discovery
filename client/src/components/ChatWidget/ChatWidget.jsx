import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Chat from '../Chat';
import styles from './ChatWidget.module.css';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

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
              <Chat />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
