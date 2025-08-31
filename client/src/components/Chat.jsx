import React, { useState, useEffect, useRef } from 'react';
import styles from './Chat.module.css'; // CSS Module for scoped styles

export default function Chat() {
  const [history, setHistory] = useState(() => {
    try {
      const saved = sessionStorage.getItem('chatHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem('chatHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const message = input.trim();
    if (!message) return;

    setLoading(true);
    setHistory(prev => [...prev, { from: 'user', text: message }]);
    setInput('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: message }] }),
      });
      const data = await res.json();

      setHistory(prev => [
        ...prev,
        {
          from: 'ai',
          text: data.ai,
          experts: Array.isArray(data.experts) ? data.experts.slice(0, 8) : []
        }
      ]);
    } catch {
      setHistory(prev => [
        ...prev,
        { from: 'ai', text: 'Sorry, an error occurred. Please try again.', experts: [] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatMessages}>
        {history.map((msg, idx) => (
          <div key={idx} className={styles.chatMessage}>
            <div
              className={
                msg.from === 'user' ? styles.messageRowUser : styles.messageRowAi
              }
            >
              <div
                className={
                  msg.from === 'user' ? styles.messageBubbleUser : styles.messageBubbleAi
                }
              >
                {msg.text}
              </div>
            </div>

            {/* Experts list */}
            {msg.from === 'ai' && msg.experts && msg.experts.length > 0 && (
              <div className={styles.matchingExpertsSection}>
                <strong className={styles.matchingExpertsTitle}>
                  Matching Experts
                </strong>
                <div className={styles.matchingExpertsGrid}>
                  {msg.experts.map(expert => (
                    <div key={expert._id} className={styles.expertCard}>
                      <img
                        src={expert.avatar || '/assets/default-user.png'}
                        alt={expert.name}
                        className={styles.expertAvatar}
                      />
                      <div>
                        <div className={styles.expertName}>{expert.name}</div>
                        <div className={styles.expertDomain}>{expert.domain}</div>
                        <div className={styles.expertLocation}>{expert.location}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && <div className={styles.loadingText}>Loading response...</div>}

        <div ref={scrollRef} />
      </div>

      <form className={styles.chatInputForm} onSubmit={sendMessage}>
        <input
          type="text"
          className={styles.chatInput}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          type="submit"
          className={styles.chatSubmitButton}
          disabled={loading}
        >
          Send
        </button>
      </form>
    </div>
  );
}
