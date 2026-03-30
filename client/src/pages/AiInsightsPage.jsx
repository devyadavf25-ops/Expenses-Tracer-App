import { useState, useEffect } from 'react';
import { getAiInsights } from '../../services/aiService';
import { HiOutlineRefresh, HiOutlineLightBulb, HiOutlineExclamation, HiOutlineInformationCircle, HiOutlineCheckCircle } from 'react-icons/hi';

const ICON_MAP = {
  warning: { icon: HiOutlineExclamation, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
  tip: { icon: HiOutlineLightBulb, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)' },
  info: { icon: HiOutlineInformationCircle, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
  success: { icon: HiOutlineCheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
};

const AiInsightsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await getAiInsights();
      setData(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <span className="gradient-text">AI Insights</span> ✨
          </h1>
          <p className="text-dark-400 text-sm mt-1">Powered by Google Gemini — Personalized spending analysis</p>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="btn-gradient flex items-center gap-2 disabled:opacity-50"
        >
          <HiOutlineRefresh size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="glass p-16 text-center">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-400">AI is analyzing your spending patterns...</p>
        </div>
      ) : (
        /* Insight Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data?.insights || []).map((insight, index) => {
            const config = ICON_MAP[insight.type] || ICON_MAP.info;
            const Icon = config.icon;
            return (
              <div
                key={index}
                className="glass p-6 hover:scale-[1.01] transition-transform duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms`, borderColor: config.border }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: config.bg }}
                  >
                    <Icon size={22} style={{ color: config.color }} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{insight.title}</h3>
                    <p className="text-dark-300 text-sm leading-relaxed">{insight.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AiInsightsPage;
