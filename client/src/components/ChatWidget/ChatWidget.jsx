import React, { useState, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ChatWidget.module.css';
import { AuthContext } from '../../context/AuthContext';

const DOMAIN_KEYS = [
  'frontend developer', 'frontend',
  'backend developer', 'backend',
  'full stack developer', 'full stack', 'fullstack',
  'ui/ux designer', 'ui', 'ux', 'uiux', 'uxui', 'ui/ux',
  'cybersecurity',
  'artificial intelligence', 'ai',
  'devops engineer', 'devops',
  'cloud engineer', 'cloud',
];

function isDomainQuery(query) {
  if (!query) return false;
  return DOMAIN_KEYS.some(domain => query.toLowerCase().includes(domain.toLowerCase()));
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const isLoggedIn = !!user?.email;
  const panelRef = useRef(null);
  const [lastQuery, setLastQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I help you today?', experts: [] },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      // If click is inside chat panel, do nothing (keep chat open)
      if (panelRef.current && panelRef.current.contains(e.target)) return;

      // If click is inside any expert card or profile details link, keep chat open
      if (
        e.target.closest &&
        (
          e.target.closest(`.${styles.expertCardOld}`) ||
          e.target.closest(`.${styles.viewProfileLink}`)
        )
      ) return;

      // Close chat in all other cases
      setIsOpen(false);
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

  const handleClose = () => setIsOpen(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const trimmedInput = input.trim();
    setLastQuery(trimmedInput);
    const userMessage = { role: 'user', content: trimmedInput };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.ai, experts: data.experts || [] }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'An error occurred, please try again.', experts: [] }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <motion.button className={styles.chatButton} initial={{ scale: 1 }} whileHover={{ scale: 1.1 }} onClick={() => setIsOpen(true)} aria-label="Open AI Assistant">
          💬
        </motion.button>
      )}
      <AnimatePresence>
        {isOpen && (
          <motion.div className={styles.chatPanel} ref={panelRef} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 350, damping: 28 }}>
            <header className={styles.panelHeader}>
              <div className={styles.panelTitleRow}>🤖 AI Assistant</div>
              <button className={styles.closeBtn} onClick={handleClose} aria-label="Close chat">×</button>
            </header>
            <div className={styles.chatScrollArea}>
              {!isLoggedIn && (
                <div className={styles.loginPrompt}>
                  Please log in to use assistant.
                  <button
                    className={styles.loginNowButton}
                    onClick={() => navigate('/login')}
                  >
                    Login now
                  </button>
                </div>
              )}
              {isLoggedIn &&
                messages.map((msg, idx) => {
                  const relatedUserMessage = idx > 0 && messages[idx - 1]?.role === 'user' ? messages[idx - 1].content : '';
                  const isDomain = isDomainQuery(relatedUserMessage);

                  return (
                    <div key={idx}>
                      <div className={`${styles.message} ${styles[msg.role]}`}>
                        <div className={styles.messageContent}>
                          {msg.role === 'assistant' ? (
                            <ReactMarkdown
                              remarkPlugins={[remarkBreaks]}
                              components={{
                                a: ({ href, children, ...props }) => {
                                  if (href && href.startsWith('/')) {
                                    return (
                                      <Link to={href} className={styles.linkUnderline} {...props}>
                                        {children}
                                      </Link>
                                    );
                                  }
                                  return <a href={href} {...props} target="_blank" rel="noopener noreferrer">{children}</a>;
                                },
                                h1: props => <h1 className={styles.heading1} {...props} />,
                                h2: props => <h2 className={styles.heading2} {...props} />,
                                h3: props => <h3 className={styles.heading3} {...props} />,
                                ul: props => <ul className={styles.unorderedList} {...props} />,
                                ol: props => <ol className={styles.orderedList} {...props} />,
                                li: props => <li className={styles.listItem} {...props} />,
                                p: props => <p className={styles.paragraph} {...props} />,
                                strong: props => <strong className={styles.bold} {...props} />,
                                code: props => <code className={styles.inlineCode} {...props} />
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          ) : (
                            <div>{msg.content}</div>
                          )}
                        </div>
                      </div>
                      {msg.experts && msg.experts.length > 0 && (
                        <>
                          <div className={styles.matchingExpertsLabel}>Matching Experts</div>
                          <div className={styles.matchingExpertsGrid}>
                            {msg.experts.slice(0, 8).map(expert => {
                              const expertCard = (
                                <>
                                  <img className={styles.expertAvatar} src={expert.avatar || '/default-avatar.png'} alt={expert.name} />
                                  <div className={styles.expertCardInfo}>
                                    <div className={styles.expertName}>{expert.name}</div>
                                    {isDomain ? (
                                      <div className={styles.expertMeta}>
                                        <span className={styles.domainName}>{expert.domain}</span>{' '}
                                        <span className={styles.location}> {expert.location}</span>
                                      </div>
                                    ) : (
                                      <Link to={`/experts/${expert._id}`} className={styles.viewProfileLink}>
                                        View Profile Details
                                      </Link>
                                    )}
                                  </div>
                                </>
                              );
                              return isDomain ? (
                                <Link to={`/experts/${expert._id}`} key={expert._id + idx} className={styles.expertCardOld} style={{ textDecoration: 'none', color: 'inherit', cursor: 'grab' }}>
                                  {expertCard}
                                </Link>
                              ) : (
                                <div className={styles.expertCardOld} key={expert._id + idx}>
                                  {expertCard}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              {loading && (
                <div className={styles.messageLoading}>
                  <div className={styles.loadingBubble}>Loading...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {isLoggedIn && (
              <div className={styles.inputArea}>
                <textarea
                  className={styles.textInput}
                  rows={2}
                  placeholder="Type your message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={onKeyPress}
                  disabled={loading}
                />
                <button className={styles.sendButton} onClick={sendMessage} disabled={loading || !input.trim()}>
                  Send
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
