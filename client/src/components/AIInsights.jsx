import { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import axios from 'axios';

const TYPE = {
  warning:  { Icon: AlertTriangle, accent: '#ff6060', border: 'rgba(255,96,96,0.18)',   bg: 'rgba(255,96,96,0.04)'   },
  tip:      { Icon: Lightbulb,     accent: '#c0c0c0', border: 'rgba(255,255,255,0.11)', bg: 'rgba(255,255,255,0.025)' },
  positive: { Icon: CheckCircle,   accent: '#50e896', border: 'rgba(80,232,150,0.18)',  bg: 'rgba(80,232,150,0.04)'  }
};

export default function AIInsights({ stats, expenses }) {
  const [insights, setInsights] = useState([]);
  const [status, setStatus] = useState('idle');
  const hasLoaded = useRef(false);

  const generate = async () => {
    setStatus('loading');
    try {
      const { data } = await axios.post('/api/ai/insights', { stats, expenses });
      setInsights(data.insights || []);
      setStatus(data.insights?.length ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    if (stats && expenses?.length > 0 && !hasLoaded.current) {
      hasLoaded.current = true;
      generate();
    }
  }, [stats, expenses]);

  return (
    <div className="ai-insights-section">
      <div className="ai-section-head">
        <div className="ai-label">
          <Sparkles size={13} color="#fff" />
          <span>AI Insights</span>
          <span className="ai-badge">BETA</span>
        </div>
        <button className="ai-regen-btn" onClick={generate} disabled={status === 'loading'}>
          <RefreshCw
            size={11}
            style={{ animation: status === 'loading' ? 'spin 1s linear infinite' : 'none' }}
          />
          {status === 'loading' ? 'Analyzing…' : 'Regenerate'}
        </button>
      </div>

      <div className="ai-cards">
        {status === 'loading' && [1, 2, 3].map(i => (
          <div key={i} className="ai-card ai-card-skeleton">
            <div className="skeleton" style={{ height: 11, width: 70, marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 15, width: '75%', marginBottom: 9 }} />
            <div className="skeleton" style={{ height: 10, width: '95%' }} />
            <div className="skeleton" style={{ height: 10, width: '65%', marginTop: 5 }} />
          </div>
        ))}

        {status === 'error' && (
          <div className="ai-card ai-error-card">
            Could not generate insights — ensure <code>ANTHROPIC_API_KEY</code> is set in your .env file.
          </div>
        )}

        {status === 'done' && insights.map((ins, i) => {
          const cfg = TYPE[ins.type] || TYPE.tip;
          const { Icon } = cfg;
          return (
            <div
              key={i}
              className="ai-card"
              style={{ borderColor: cfg.border, background: cfg.bg }}
            >
              <div className="ai-card-top">
                <Icon size={13} color={cfg.accent} />
                <span className="ai-card-type" style={{ color: cfg.accent }}>
                  {ins.type}
                </span>
              </div>
              <div className="ai-card-title">{ins.title}</div>
              <div className="ai-card-body">{ins.body}</div>
            </div>
          );
        })}

        {status === 'idle' && (
          <div className="ai-empty-state">
            <Sparkles size={14} color="#2a2a2a" />
            <span>Insights will generate once your expense data loads</span>
          </div>
        )}
      </div>
    </div>
  );
}
