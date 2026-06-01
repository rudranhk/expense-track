import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, User } from 'lucide-react';

const QUICK = [
  'Summarize my spending',
  "What's my biggest category?",
  'Where can I cut costs?',
  'How is my spending trending?'
];

export default function AIChat({ stats, expenses }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hi! I'm ExpenseFlow AI. Ask me anything about your finances — summaries, patterns, or savings tips."
    }
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  const scrollBottom = () => {
    setTimeout(() => {
      messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
    }, 40);
  };

  useEffect(() => { scrollBottom(); }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 350);
  }, [open]);

  const send = async (prompt) => {
    const text = (prompt ?? input).trim();
    if (!text || streaming) return;
    setInput('');

    setMessages(prev => [...prev, { role: 'user', text }]);
    setMessages(prev => [...prev, { role: 'ai', text: '', loading: true }]);
    setStreaming(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, stats, expenses: expenses?.slice(0, 30) })
      });

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6);
          if (raw === '[DONE]') break;
          try {
            const { text: chunk } = JSON.parse(raw);
            setMessages(prev => {
              const copy = [...prev];
              copy[copy.length - 1] = {
                role: 'ai',
                text: copy[copy.length - 1].text + chunk,
                loading: false
              };
              return copy;
            });
          } catch {}
        }
      }
    } catch {
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: 'ai', text: 'Sorry, something went wrong.', loading: false };
        return copy;
      });
    }
    setStreaming(false);
  };

  const showQuick = messages.length <= 1 && !streaming;

  return (
    <>
      <button
        className={`chat-fab${open ? ' open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Open AI Chat"
      >
        <span className="chat-fab-inner">
          {open ? <X size={18} /> : <MessageCircle size={18} />}
        </span>
        {!open && <span className="chat-fab-ping" />}
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-ai-info">
              <div className="chat-ai-avatar">
                <Sparkles size={12} color="#000" />
              </div>
              <div>
                <div className="chat-ai-name">ExpenseFlow AI</div>
                <div className="chat-ai-sub">Powered by Claude</div>
              </div>
            </div>
            <div className={`chat-online${streaming ? ' thinking' : ''}`}>
              <span className="chat-online-dot" />
              {streaming ? 'Thinking' : 'Online'}
            </div>
          </div>

          <div className="chat-messages-wrap" ref={messagesRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg-row ${m.role}`}>
                {m.role === 'ai' && (
                  <div className="chat-ai-avatar small">
                    <Sparkles size={8} color="#000" />
                  </div>
                )}
                <div className="chat-bubble-wrap">
                  <div className={`chat-bubble ${m.role}`}>
                    {m.loading && !m.text ? (
                      <span className="typing-dots">
                        <span /><span /><span />
                      </span>
                    ) : m.text}
                  </div>
                </div>
                {m.role === 'user' && (
                  <div className="chat-user-avatar">
                    <User size={9} color="#666" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {showQuick && (
            <div className="chat-quick-row">
              {QUICK.map((q, i) => (
                <button key={i} className="chat-quick-chip" onClick={() => send(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input-bar">
            <input
              ref={inputRef}
              className="chat-input"
              placeholder="Ask about your spending…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              disabled={streaming}
            />
            <button
              className="chat-send-btn"
              onClick={() => send()}
              disabled={!input.trim() || streaming}
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
