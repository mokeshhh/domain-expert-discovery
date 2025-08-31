import React, { useState, useEffect, useRef } from 'react';

export default function Chat() {
  // Load chat history with experts from sessionStorage or initialize empty
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

  // Persist chat history to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem('chatHistory', JSON.stringify(history));
  }, [history]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const message = input.trim();
    if (!message) return;

    setLoading(true);
    // Add user message to history
    setHistory(prev => [...prev, { from: 'user', text: message }]);
    setInput('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: message }] }),
      });
      const data = await res.json();

      // Add AI message with its associated experts
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', color: '#23233a' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 8px' }}>
        {history.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex',
              justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                backgroundColor: msg.from === 'user' ? '#4f46e5' : '#f4f6fa',
                color: msg.from === 'user' ? '#fff' : '#23233a',
                padding: '10px 16px',
                borderRadius: 12,
                maxWidth: '70%',
                fontSize: '1.05rem',
                boxShadow: msg.from === 'user' ? '0 2px 8px rgba(79, 70, 229, 0.3)' : '0 1px 3px rgba(35, 35, 58, 0.08)',
              }}>
                {msg.text}
              </div>
            </div>

            {/* Show experts associated with this AI message */}
            {msg.from === 'ai' && msg.experts && msg.experts.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <strong style={{ color: '#4f46e5', display: 'block', marginBottom: 8 }}>
                  Matching Experts
                </strong>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 16
                }}>
                  {msg.experts.map(expert => (
                    <div key={expert._id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      background: '#fff',
                      padding: 12,
                      borderRadius: 12,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <img
                        src={expert.avatar || '/assets/default-user.png'}
                        alt={expert.name}
                        width={48}
                        height={48}
                        style={{ borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>{expert.name}</div>
                        <div style={{ color: '#4f46e5', fontSize: '0.9rem' }}>{expert.domain}</div>
                        <div style={{ color: '#666', fontSize: '0.8rem' }}>{expert.location}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ))}

        {loading && (
          <div style={{ color: '#4f46e5', fontWeight: 500, marginTop: 8 }}>Loading response...</div>
        )}

        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} style={{
        display: 'flex',
        padding: 16,
        borderTop: '1px solid #eee',
        background: '#fafafa' ,
        position: 'absolute',
  bottom: 30,
  left: 0,
  right: 0,
  zIndex: 10
      }}>
        <input
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #ccc',
            fontSize: '1rem'
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit" disabled={loading} style={{
          marginLeft: 8,
          padding: '8px 16px',
          background: '#4f46e5',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer'
        }}>
          Send
        </button>
      </form>
    </div>
  );
}
