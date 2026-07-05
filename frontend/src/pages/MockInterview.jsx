import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config';
import { Send, Sparkles, RefreshCw, Star, User, ShieldAlert } from 'lucide-react';

export default function MockInterview({ userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  // Load existing interview history on mount
  const loadHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/history?sessionType=INTERVIEW`, {
        headers: { 'X-User-Id': userId }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.history) {
          setMessages(data.history);
        }
      }
    } catch (err) {
      console.error('Failed to load interview history', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [userId]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setError('');

    // Add user response locally
    const tempUserMsg = { sender: 'USER', text: userMessage, timestamp: new Date() };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({ message: userMessage, reset: false })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to communicate with interviewer.');
      }

      if (data.history) {
        setMessages(data.history);
      } else {
        const aiMsg = { sender: 'AI', text: data.response, timestamp: new Date() };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setError('');
    setMessages([]);

    try {
      const response = await fetch(`${API_BASE_URL}/interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({ message: 'start', reset: true })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start interview.');
      }

      if (data.history) {
        setMessages(data.history);
      } else {
        const aiMsg = { sender: 'AI', text: data.response, timestamp: new Date() };
        setMessages([aiMsg]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '84vh' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="glowing-title">Mock Interview Simulator</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Practice real technical interviews. The interviewer asks one question, scores your answer, and proceeds.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
          disabled={loading}
        >
          <RefreshCw size={16} /> New Session
        </button>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          padding: '0.75rem',
          borderRadius: '12px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Chat Messages Panel */}
      <div className="glass-panel" style={{
        flexGrow: 1,
        padding: '1.5rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '1.25rem',
        maxHeight: 'calc(100% - 100px)'
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-muted)',
            gap: '1.25rem'
          }}>
            <Sparkles size={48} style={{ color: 'var(--secondary)' }} />
            <div style={{ textAlign: 'center', maxWidth: '460px' }}>
              <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Start your Java Mock Interview</h3>
              <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                The AI Java technical interviewer will grill you on core Java details, HashMaps, arrays, sliding window, and system configurations.
              </p>
              <button onClick={handleReset} className="btn btn-primary" disabled={loading}>
                Start Interview Session
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isAI = msg.sender === 'AI';
            return (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: isAI ? 'flex-start' : 'flex-end',
                width: '100%'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  maxWidth: '75%',
                  flexDirection: isAI ? 'row' : 'row-reverse'
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isAI ? 'linear-gradient(135deg, var(--secondary), #3b82f6)' : 'rgba(255, 255, 255, 0.05)',
                    border: isAI ? 'none' : '1px solid var(--border-light)',
                    color: 'white',
                    flexShrink: 0
                  }}>
                    {isAI ? <Sparkles size={18} /> : <User size={18} />}
                  </div>

                  {/* Message Bubble */}
                  <div style={{
                    background: isAI ? 'rgba(255, 255, 255, 0.03)' : 'var(--secondary)',
                    border: isAI ? '1px solid var(--border-light)' : 'none',
                    padding: '0.85rem 1.15rem',
                    borderRadius: isAI ? '0px 16px 16px 16px' : '16px 0px 16px 16px',
                    color: 'white',
                    fontSize: '0.95rem',
                    textAlign: 'left',
                    whiteSpace: 'pre-wrap',
                    boxShadow: isAI ? 'none' : '0 4px 12px rgba(6, 182, 212, 0.2)'
                  }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '75%' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--secondary), #3b82f6)',
                color: 'white',
                flexShrink: 0
              }}>
                <Sparkles size={18} />
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-light)',
                padding: '0.85rem 1.15rem',
                borderRadius: '0px 16px 16px 16px',
                color: 'var(--text-muted)',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                Evaluating response...
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      {messages.length > 0 && (
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="Type your answer here..."
            className="form-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            style={{ padding: '0.85rem 1.25rem' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '50px', height: '50px', borderRadius: '12px', flexShrink: 0, padding: 0 }}
            disabled={loading}
          >
            <Send size={18} />
          </button>
        </form>
      )}
    </div>
  );
}
