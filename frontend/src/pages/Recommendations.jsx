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
      case 'critical': return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: AlertTriangle, badge: 'bg-red-500/20 text-red-400' };
      case 'high': return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: AlertTriangle, badge: 'bg-orange-500/20 text-orange-400' };
      case 'medium': return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: CheckCircle, badge: 'bg-blue-500/20 text-blue-400' };
      default: return { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: CheckCircle, badge: 'bg-green-500/20 text-green-400' };
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
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            Recommendations <ListChecks className="text-primary-400" />
          </h1>
          <p className="text-gray-400">AI-powered strategic recommendations to grow your digital presence.</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50">
          {refreshing ? <><Loader2 size={16} className="animate-spin" />Generating...</> : <><RefreshCw size={16} />Refresh</>}
        </button>
      </div>

      {recommendations.length === 0 ? (
        <div className="glass-card p-16 text-center relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center mb-6 text-primary-400">
            <ListChecks size={32} />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">No recommendations yet</h3>
          <p className="text-gray-400 max-w-sm mx-auto mb-6">Add competitors and generate content to receive personalized AI recommendations.</p>
          <button onClick={handleRefresh} className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all">Generate Recommendations</button>
        </div>
      ) : (
        <div className="space-y-4 relative z-10">
          {[{ label: 'Critical Issues', items: critical, color: 'red' }, { label: 'High Priority', items: high, color: 'orange' }, { label: 'Medium Priority', items: medium, color: 'blue' }, { label: 'Suggestions', items: low, color: 'green' }]
            .filter(section => section.items.length > 0)
            .map(section => (
              <div key={section.label}>
                <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 text-${section.color}-400`}>{section.label} ({section.items.length})</h3>
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
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>{rec.type}</span>
                              <span className="text-xs text-gray-500 capitalize">{rec.category}</span>
                              {rec.estimatedEffort && <span className="text-xs text-gray-500">Effort: {rec.estimatedEffort}</span>}
                            </div>
                            <h4 className="text-white font-medium">{rec.problem}</h4>
                            <p className="text-sm text-gray-300 mt-1">{rec.recommendation}</p>

                            <button onClick={() => setExpandedId(isExpanded ? null : rec._id)} className="text-xs text-purple-400 hover:text-purple-300 mt-2 flex items-center gap-1">
                              {isExpanded ? <><ChevronUp size={12} />Hide details</> : <><ChevronDown size={12} />Show details</>}
                            </button>

                            {isExpanded && (
                              <div className="mt-3 space-y-2 p-3 bg-white/5 rounded-lg text-sm">
                                <div>
                                  <span className="text-gray-400 font-medium">Evidence: </span>
                                  <span className="text-gray-300">{rec.evidence}</span>
                                </div>
                                {rec.expectedBenefit && (
                                  <div>
                                    <span className="text-gray-400 font-medium">Expected Benefit: </span>
                                    <span className="text-green-300">{rec.expectedBenefit}</span>
                                  </div>
                                )}
                                {rec.reason && (
                                  <div>
                                    <span className="text-gray-400 font-medium">Why: </span>
                                    <span className="text-gray-300">{rec.reason}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <button onClick={() => handleDismiss(rec._id)} className="text-gray-500 hover:text-gray-300 text-xs whitespace-nowrap">Dismiss</button>
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
