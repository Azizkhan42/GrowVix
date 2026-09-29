import { useState, useEffect } from 'react';
import { Lightbulb, ChevronRight, BarChart2, Target, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function Insights() {
  const [competitors, setCompetitors] = useState([]);
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [insights, setInsights] = useState({});
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => { fetchCompetitors(); }, []);

  const fetchCompetitors = async () => {
    try {
      const { data } = await api.get('/competitors');
      setCompetitors(data);
      if (data.length > 0) {
        handleSelectCompetitor(data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectCompetitor = async (compId) => {
    setSelectedCompetitor(compId);
    setLoadingPosts(true);
    setPosts([]);
    setInsights({});
    try {
      const { data } = await api.get(`/competitors/posts/${compId}`);
      setPosts(data || []);
    } catch {
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleAnalyze = async (postId) => {
    setAnalyzingId(postId);
    try {
      const { data } = await api.post('/ai/analyze', { postId });
      const insightData = data.analysis ? (typeof data.analysis === 'string' ? JSON.parse(data.analysis) : data.analysis) : data;
      setInsights(prev => ({ ...prev, [postId]: insightData }));
    } catch {
      setInsights(prev => ({
        ...prev,
        [postId]: {
          strategy: 'Analysis unavailable. Try again later.',
          whyItWorked: 'Data could not be processed.',
          improvementIdea: 'Check your API connection and try again.'
        }
      }));
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          AI Marketing Insights <Lightbulb className="text-amber-500" />
        </h1>
        <p className="text-slate-500">Discover what's working for your competitors using AI analysis.</p>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-6 relative z-10 min-h-[500px]">
        <div className="w-full lg:w-1/3 glass-card flex flex-col border-t-2 border-t-amber-400 overflow-hidden">
          <div className="p-4 border-b border-dark-border">
            <h3 className="font-semibold text-slate-900">Select Competitor</h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-64 lg:max-h-none">
            {competitors.length === 0 ? (
              <div className="p-6 text-center">
                <Target size={24} className="mx-auto mb-2 text-slate-400" />
                <p className="text-slate-500 text-sm">No competitors yet.</p>
                <p className="text-slate-400 text-xs mt-1">Add competitors to view insights.</p>
              </div>
            ) : (
              competitors.map(comp => (
                <button
                  key={comp._id}
                  onClick={() => handleSelectCompetitor(comp._id)}
                  className={`w-full text-left px-5 py-4 border-b border-dark-border flex items-center justify-between transition-colors ${
                    selectedCompetitor === comp._id ? 'bg-violet-50 border-l-4 border-l-violet-500' : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div>
                    <div className="text-slate-900 font-medium">{comp.name || comp.username}</div>
                    <div className="text-xs text-slate-500 capitalize">{comp.industry || comp.platform || 'Competitor'}</div>
                  </div>
                  <ChevronRight size={16} className={selectedCompetitor === comp._id ? 'text-violet-600' : 'text-slate-400'} />
                </button>
              ))
            )}
          </div>
        </div>

        <div className="w-full lg:w-2/3 glass-card p-4 sm:p-6 overflow-y-auto">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Recent Posts & Analysis</h2>
          {loadingPosts ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-10">
              <BarChart2 size={32} className="mx-auto mb-3 text-slate-400" />
              <p className="text-slate-500">No posts found for this competitor.</p>
              <p className="text-slate-400 text-sm mt-1">Run a competitor analysis from the Competitors page to populate post data.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map(post => (
                <div key={post._id} className="border border-app-border rounded-xl bg-slate-50 overflow-hidden">
                  <div className="p-5">
                    <p className="text-slate-700 text-sm mb-4">{post.caption ? (post.caption.length > 200 ? post.caption.substring(0, 200) + '...' : post.caption) : 'No caption'}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 flex-wrap">
                      <span className="flex items-center gap-1.5"><strong className="text-slate-900">{post.likes}</strong> Likes</span>
                      <span className="flex items-center gap-1.5"><strong className="text-slate-900">{post.comments}</strong> Comments</span>
                      <span className="flex items-center gap-1.5"><strong className="text-slate-900">{post.shares}</strong> Shares</span>
                      <span className="flex items-center gap-1.5 text-violet-600 font-medium"><BarChart2 size={12}/> {post.engagementRate}% ER</span>
                      {post.contentType && <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize">{post.contentType}</span>}
                      {post.contentCategory && <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize">{post.contentCategory.replace(/_/g, ' ')}</span>}
                    </div>

                    {!insights[post._id] ? (
                      <button
                        onClick={() => handleAnalyze(post._id)}
                        disabled={analyzingId === post._id}
                        className="bg-white border border-app-border hover:bg-slate-50 text-slate-900 text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        {analyzingId === post._id ? (
                          <><Loader2 size={14} className="animate-spin text-violet-500" /> Analyzing...</>
                        ) : (
                          <><Lightbulb size={16} className="text-amber-500" /> Get AI Analysis</>
                        )}
                      </button>
                    ) : (
                      <div className="mt-4 p-4 border border-violet-200 bg-violet-50 rounded-lg text-sm space-y-3">
                        {insights[post._id].strategy && (
                          <div>
                            <strong className="text-slate-900 block border-b border-dark-border pb-1 mb-1">Strategy Used</strong>
                            <p className="text-slate-600">{insights[post._id].strategy}</p>
                          </div>
                        )}
                        {insights[post._id].whyItWorked && (
                          <div>
                            <strong className="text-slate-900 block border-b border-dark-border pb-1 mb-1">Why It Worked</strong>
                            <p className="text-slate-600">{insights[post._id].whyItWorked}</p>
                          </div>
                        )}
                        {insights[post._id].improvementIdea && (
                          <div>
                            <strong className="text-slate-900 block border-b border-dark-border pb-1 mb-1">Improvement Idea</strong>
                            <p className="text-violet-700 italic">{insights[post._id].improvementIdea}</p>
                          </div>
                        )}
                        {insights[post._id].recommendation && (
                          <div>
                            <strong className="text-slate-900 block border-b border-dark-border pb-1 mb-1">Recommendation</strong>
                            <p className="text-slate-600">{insights[post._id].recommendation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
