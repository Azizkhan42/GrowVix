import { useState, useEffect } from 'react';
import { ListChecks, RefreshCw, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [dismissed, setDismissed] = useState({});

  useEffect(() => { fetchRecommendations(); }, []);

  const fetchRecommendations = async () => {
    try {
      const { data } = await api.get('/intelligence/recommendations');
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { data } = await api.post('/intelligence/recommendations/refresh');
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await api.post(`/intelligence/recommendations/${id}/dismiss`);
      setDismissed(prev => ({ ...prev, [id]: true }));
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'critical': return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', icon: AlertTriangle, badge: 'bg-rose-100 text-rose-700' };
      case 'high': return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', icon: AlertTriangle, badge: 'bg-amber-100 text-amber-700' };
      case 'medium': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', icon: CheckCircle, badge: 'bg-blue-100 text-blue-700' };
      default: return { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600', icon: CheckCircle, badge: 'bg-violet-100 text-violet-700' };
    }
  };

  const critical = recommendations.filter(r => r.type === 'critical' && !dismissed[r._id]);
  const high = recommendations.filter(r => r.type === 'high' && !dismissed[r._id]);
  const medium = recommendations.filter(r => r.type === 'medium' && !dismissed[r._id]);
  const low = recommendations.filter(r => r.type === 'low' && !dismissed[r._id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 flex items-center gap-3">
            Recommendations <ListChecks className="text-violet-500" />
          </h1>
          <p className="text-slate-500">AI-powered strategic recommendations to grow your digital presence.</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="gradient-brand text-white px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 justify-center disabled:opacity-50 sm:w-auto w-full hover:opacity-95">
          {refreshing ? <><Loader2 size={16} className="animate-spin" />Generating...</> : <><RefreshCw size={16} />Refresh</>}
        </button>
      </div>

      {recommendations.length === 0 ? (
        <div className="glass-card p-8 md:p-16 text-center relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mb-6 text-violet-500">
            <ListChecks size={32} />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900 mb-2">No recommendations yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">Add competitors and generate content to receive personalized AI recommendations.</p>
          <button onClick={handleRefresh} className="gradient-brand text-white px-6 py-2.5 rounded-lg font-medium transition-all hover:opacity-95">Generate Recommendations</button>
        </div>
      ) : (
        <div className="space-y-4 relative z-10">
          {[{ label: 'Critical Issues', items: critical, tone: 'text-rose-600' }, { label: 'High Priority', items: high, tone: 'text-amber-600' }, { label: 'Medium Priority', items: medium, tone: 'text-blue-600' }, { label: 'Suggestions', items: low, tone: 'text-violet-600' }]
            .filter(section => section.items.length > 0)
            .map(section => (
              <div key={section.label}>
                <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${section.tone}`}>{section.label} ({section.items.length})</h3>
                <div className="space-y-3">
                  {section.items.map(rec => {
                    const style = getTypeStyle(rec.type);
                    const Icon = style.icon;
                    const isExpanded = expandedId === rec._id;
                    return (
                      <div key={rec._id} className={`glass-card p-5 border ${style.border} transition-all`}>
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 ${style.text}`}><Icon size={18} /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>{rec.type}</span>
                              <span className="text-xs text-slate-500 capitalize">{rec.category}</span>
                              {rec.estimatedEffort && <span className="text-xs text-slate-500">Effort: {rec.estimatedEffort}</span>}
                            </div>
                            <h4 className="text-slate-900 font-medium">{rec.problem}</h4>
                            <p className="text-sm text-slate-600 mt-1">{rec.recommendation}</p>

                            <button onClick={() => setExpandedId(isExpanded ? null : rec._id)} className="text-xs text-violet-600 hover:text-violet-700 mt-2 flex items-center gap-1">
                              {isExpanded ? <><ChevronUp size={12} />Hide details</> : <><ChevronDown size={12} />Show details</>}
                            </button>

                            {isExpanded && (
                              <div className="mt-3 space-y-2 p-3 bg-slate-50 rounded-lg text-sm">
                                <div>
                                  <span className="text-slate-500 font-medium">Evidence: </span>
                                  <span className="text-slate-600">{rec.evidence}</span>
                                </div>
                                {rec.expectedBenefit && (
                                  <div>
                                    <span className="text-slate-500 font-medium">Expected Benefit: </span>
                                    <span className="text-emerald-600">{rec.expectedBenefit}</span>
                                  </div>
                                )}
                                {rec.reason && (
                                  <div>
                                    <span className="text-slate-500 font-medium">Why: </span>
                                    <span className="text-slate-600">{rec.reason}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <button onClick={() => handleDismiss(rec._id)} className="text-slate-400 hover:text-rose-600 text-xs whitespace-nowrap">Dismiss</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
