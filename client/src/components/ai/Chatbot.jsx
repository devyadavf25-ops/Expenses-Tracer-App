import { useState, useRef, useEffect } from 'react';
import { aiChat } from '../../services/aiService';

const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const QUICK_QUESTIONS = [
  'How much did I spend this month?',
  'What is my top spending category?',
  'How can I save more money?',
  'Show my spending summary',
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! 👋 I'm your AI expense assistant. Ask me anything about your spending!" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiChat(text.trim());
      setMessages(prev => [...prev, { role: 'bot', text: res.data.data.reply }]);
    } catch (e) {
      console.error('Chatbot Error:', e);
      setMessages(prev => [...prev, { role: 'bot', text: "I'm having trouble connecting to my AI brain. Please ensure an AI API key is configured." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} style={{
        position: 'fixed', bottom: 16, right: 16,
        width: 56, height: 56, borderRadius: '50%',
        background: 'linear-gradient(135deg, #00c866, #00a855)',
        border: 'none', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(0,232,122,0.4)',
        cursor: 'pointer', zIndex: 100, transition: 'all 0.3s',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,232,122,0.6)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,232,122,0.4)'; }}
      >
        <ChatIcon />
      </button>
    );
  }

  return (
    <div className="animate-fade-in" style={{
      position: 'fixed', bottom: 16, right: 16,
      width: 380, maxWidth: 'calc(100vw - 32px)',
      height: 550, maxHeight: 'calc(100vh - 32px)',
      background: '#04101e',
      border: '1px solid rgba(0,232,122,0.15)',
      borderRadius: 24, zIndex: 100,
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 40px rgba(0,232,122,0.1)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        background: 'linear-gradient(180deg, #071525 0%, #04101e 100%)',
        borderBottom: '1px solid rgba(0,232,122,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(0,232,122,0.1)', border: '1px solid rgba(0,232,122,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>✨</div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#d0f0e0', margin: '0 0 2px' }}>Financial AI</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e87a', boxShadow: '0 0 8px #00e87a' }} className="animate-pulse" />
              <p style={{ fontSize: 9, fontWeight: 700, color: '#00e87a', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Active Now</p>
            </div>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          color: '#5a8a7a', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.color = '#f87171'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#5a8a7a'; }}
        >
          <CloseIcon />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: 20, overflowY: 'auto' }} className="custom-scrollbar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '85%', padding: '12px 16px', borderRadius: 18,
                fontSize: 13, lineHeight: 1.5,
                background: msg.role === 'user' ? 'linear-gradient(135deg, #00c866, #00a855)' : '#071525',
                color: msg.role === 'user' ? '#fff' : '#d0f0e0',
                border: msg.role === 'user' ? 'none' : '1px solid rgba(0,232,122,0.1)',
                borderBottomRightRadius: msg.role === 'user' ? 4 : 18,
                borderBottomLeftRadius: msg.role === 'bot' ? 4 : 18,
              }}>{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '16px', borderRadius: 18, borderBottomLeftRadius: 4,
                background: '#071525', border: '1px solid rgba(0,232,122,0.1)',
                display: 'flex', gap: 6,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e87a', animation: 'bounce 1s infinite' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e87a', animation: 'bounce 1s infinite 0.2s' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e87a', animation: 'bounce 1s infinite 0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{ padding: '0 16px 12px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {QUICK_QUESTIONS.map(q => (
            <button key={q} onClick={() => sendMessage(q)} style={{
              padding: '6px 12px', borderRadius: 12,
              background: 'rgba(0,232,122,0.05)', border: '1px solid rgba(0,232,122,0.15)',
              color: '#00e87a', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,232,122,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,232,122,0.05)'; }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: 16, background: '#071525', borderTop: '1px solid rgba(0,232,122,0.1)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10 }}>
          <input type="text" value={input} onChange={e => setInput(e.target.value)} disabled={loading}
            placeholder="Ask AI assistant..."
            style={{
              flex: 1, height: 44, borderRadius: 12,
              background: 'rgba(0,232,122,0.04)', border: '1px solid rgba(0,232,122,0.12)',
              padding: '0 16px', color: '#d0f0e0', fontSize: 13, outline: 'none',
              transition: 'all 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = '#00e87a'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(0,232,122,0.12)'; }}
          />
          <button type="submit" disabled={loading || !input.trim()} style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #00c866, #00a855)', border: 'none',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer',
            opacity: (loading || !input.trim()) ? 0.6 : 1, transition: 'all 0.2s',
          }}>
            <SendIcon />
          </button>
        </form>
      </div>

      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
    </div>
  );
};

export default Chatbot;
