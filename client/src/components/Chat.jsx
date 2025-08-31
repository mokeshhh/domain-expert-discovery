import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Chat.module.css';

const VALID_DOMAINS = [
  'artificial intelligence',
  'backend developer',
  'cloud engineer',
  'cybersecurity',
  'data scientist',
  'devops engineer',
  'frontend developer',
  'full stack developer',
  'ui',
  'ux',
  'ai',
];
const VALID_LOCATIONS = ['bengaluru', 'bangalore', 'karnataka'];

function getQueryType(query) {
  const q = query.trim().toLowerCase();
  if (!q) return 'empty';
  if (VALID_DOMAINS.includes(q)) return 'domain';
  if (VALID_LOCATIONS.includes(q)) return 'location';
  return 'other';
}

export default function Chat({ onCloseChat }) {
  const navigate = useNavigate();

  const [history, setHistory] = useState(() => {
    try {
      const saved = sessionStorage.getItem('chatHistoryV2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem('chatHistoryV2', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const message = input.trim();
    if (!message) return;
    setLoading(true);
    // add user message to history
    setHistory((prev) => [...prev, { from: 'user', text: message }]);
    setInput('');
    const thisQueryType = getQueryType(message);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: message }] }),
      });
      const data = await res.json();
      // add AI response with query type tagged
      setHistory((prev) => [
        ...prev,
        {
          from: 'ai',
          text: data.ai,
          experts: Array.isArray(data.experts) ? data.experts.slice(0, 8) : [],
          queryType: thisQueryType,
        },
      ]);
    } catch {
      setHistory((prev) => [
        ...prev,
        {
          from: 'ai',
          text: 'Sorry, an error occurred. Please try again.',
          experts: [],
          queryType: thisQueryType,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExpertClick = (id) => {
    if (onCloseChat) onCloseChat();
    navigate(`/experts/${id}`);
  };

  // Alternative text for "Click to view profile"
  const viewProfileText = "View Profile Details";

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatMessages}>
        {history.map((msg, idx) => (
          <div key={idx} className={styles.chatMessage}>
            <div
              className={msg.from === 'user' ? styles.messageRowUser : styles.messageRowAi}
            >
              <div
                className={
                  msg.from === 'user' ? styles.messageBubbleUser : styles.messageBubbleAi
                }
              >
                {msg.text}
              </div>
            </div>

            {msg.from === 'ai' && msg.experts && msg.experts.length > 0 && (
              <div className={styles.matchingExpertsSection}>
                <strong className={styles.matchingExpertsTitle}>Matching Experts</strong>
                <div className={styles.matchingExpertsGrid}>
                  {msg.experts.map((expert) => {
                    const showFullDetails =
                      msg.queryType === 'domain' || msg.queryType === 'location';
                    return (
                      <div
                        key={expert._id}
                        className={styles.expertCard}
                        onClick={() => handleExpertClick(expert._id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img
                          src={expert.avatar || '/assets/default-user.png'}
                          alt={expert.name}
                          className={styles.expertAvatar}
                        />
                        <div>
                          <div className={styles.expertName}>{expert.name}</div>
                          {showFullDetails ? (
                            <>
                              <div className={styles.expertDomain}>{expert.domain}</div>
                              <div className={styles.expertLocation}>{expert.location}</div>
                            </>
                          ) : (
                           <div className={styles.viewProfileText}>
  View Profile Details
  <svg
    width="22"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ marginLeft: 3, flexShrink: 0 }}
    viewBox="0 0 24 24"
  >
    <path d="M5 12h14M13 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
</div>

                          )}
                        </div>
                      </div>
                    );
                  })}
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
          onChange={(e) => setInput(e.target.value)}
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
