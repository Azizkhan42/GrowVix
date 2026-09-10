import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, MapPin, Briefcase, TrendingUp, BarChart2, Users, MessageCircle, Heart, Share2, Loader2, Download, Instagram, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function CompetitorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [competitor, setCompetitor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchMsg, setFetchMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [compRes, postsRes] = await Promise.all([
        api.get(`/competitors/${id}`),
        api.get(`/competitors/posts/${id}`)
      ]);
      setCompetitor(compRes.data);
      setPosts(postsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const { data } = await api.post(`/competitors/analyze/${id}`);
      setAnalysis(data.analysis || data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchRealData = async () => {
    setFetching(true);
    setFetchMsg('');
    try {
      const { data } = await api.post(`/competitors/fetch-data/${id}`);
      if (data.unavailable) {
        setFetchMsg(`No real data: ${data.reason}`);
      } else {
        setFetchMsg(`Imported ${data.newPosts} new posts of ${data.postsFetched} from Instagram.`);
        await fetchData();
      }
    } catch (err) {
      setFetchMsg(err.response?.data?.message || 'Failed to fetch real data.');
    } finally {
      setFetching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!competitor) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Competitor not found.</p>
        <button onClick={() => navigate('/competitors')} className="text-purple-400 mt-4 hover:text-purple-300">Back to Competitors</button>
      </div>
    );
  }

  const stats = competitor.stats || {};

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/competitors')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={18} /> Back to Competitors
      </button>

      <div className="glass-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {(competitor.name || 'C').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{competitor.name || competitor.username}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
                {competitor.industry && <span className="flex items-center gap-1"><Briefcase size={14} />{competitor.industry}</span>}
                {competitor.location && <span className="flex items-center gap-1"><MapPin size={14} />{competitor.location}</span>}
                {competitor.website && <a href={competitor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-purple-400 hover:text-purple-300"><Globe size={14} />Website</a>}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {competitor.instagramProfile && <span className="text-xs px-3 py-1 rounded-full bg-pink-500/15 text-pink-400">Instagram: {competitor.instagramProfile}</span>}
                {competitor.linkedinPage && <span className="text-xs px-3 py-1 rounded-full bg-blue-500/15 text-blue-400">LinkedIn: {competitor.linkedinPage}</span>}
                {competitor.facebookPage && <span className="text-xs px-3 py-1 rounded-full bg-blue-600/15 text-blue-300">Facebook: {competitor.facebookPage}</span>}
                {competitor.twitterHandle && <span className="text-xs px-3 py-1 rounded-full bg-sky-500/15 text-sky-400">Twitter: {competitor.twitterHandle}</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchRealData} disabled={fetching} className="bg-white/5 border border-dark-border hover:bg-white/10 text-white px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50">
              {fetching ? <><Loader2 size={16} className="animate-spin" />Fetching...</> : <><Download size={16} />Fetch Real Data</>}
            </button>
            <button onClick={runAnalysis} disabled={analyzing} className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50">
              {analyzing ? <><Loader2 size={16} className="animate-spin" />Analyzing...</> : <><BarChart2 size={16} />Run AI Analysis</>}
            </button>
          </div>
        </div>
        {fetchMsg && (
          <div className={`mt-4 text-sm p-3 rounded-lg border ${fetchMsg.includes('Imported') ? 'bg-green-500/10 border-green-500/40 text-green-400' : 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300'}`}>
            {fetchMsg}
          </div>
        )}
      </div>

      {competitor.profileData?.followers > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Instagram size={18} className="text-pink-400" /> Instagram Profile</h2>
            {competitor.profileData.isVerified && <span className="text-xs flex items-center gap-1 text-blue-400"><CheckCircle2 size={12} /> Verified</span>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xl font-bold text-white">{(competitor.profileData.followers || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Followers</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{(competitor.profileData.following || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Following</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{(competitor.profileData.postCount || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Posts</p>
            </div>
            <div>
              <a href={competitor.profileData.profileUrl} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 text-sm">Open Profile</a>
              {competitor.profileData.lastUpdated && <p className="text-xs text-gray-500 mt-1">Updated {new Date(competitor.profileData.lastUpdated).toLocaleDateString()}</p>}
            </div>
          </div>
          {competitor.profileData.bio && <p className="text-sm text-gray-300 mt-3 border-t border-dark-border pt-3">{competitor.profileData.bio}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats.totalPosts || 0}</p>
          <p className="text-xs text-gray-400 mt-1">Total Posts</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats.avgEngagement || 0}%</p>
          <p className="text-xs text-gray-400 mt-1">Avg Engagement</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-white">{(stats.totalLikes || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Total Likes</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-white">{(stats.totalComments || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Total Comments</p>
        </div>
      </div>

      {analysis && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><BarChart2 size={20} className="text-purple-400" /> AI Content Analysis</h2>
          {analysis.aiSummary && <p className="text-gray-300 text-sm mb-4 p-3 bg-white/5 rounded-lg">{analysis.aiSummary}</p>}

          {analysis.contentDistribution && Object.keys(analysis.contentDistribution).length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-white mb-2">Content Distribution</h3>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(analysis.contentDistribution).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-white font-medium">{val}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.strengths?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-green-400 mb-2">Strengths</h3>
              <ul className="space-y-1">
                {analysis.strengths.map((s, i) => <li key={i} className="text-sm text-gray-300">- {s}</li>)}
              </ul>
            </div>
          )}

          {analysis.weaknesses?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-red-400 mb-2">Weaknesses</h3>
              <ul className="space-y-1">
                {analysis.weaknesses.map((w, i) => <li key={i} className="text-sm text-gray-300">- {w}</li>)}
              </ul>
            </div>
          )}

          {analysis.topPatterns?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-blue-400 mb-2">Top Patterns</h3>
              <div className="space-y-2">
                {analysis.topPatterns.map((p, i) => (
                  <div key={i} className="text-sm p-2 bg-white/5 rounded-lg">
                    <span className="text-white">{p.pattern}</span>
                    {p.evidence && <span className="text-gray-400 ml-2">({p.evidence})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {competitor.notes && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Notes</h2>
          <p className="text-gray-300 text-sm">{competitor.notes}</p>
        </div>
      )}

      {posts.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Analyzed Posts</h2>
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post._id} className="border border-dark-border rounded-xl p-4 bg-dark-bg/50">
                <p className="text-gray-200 text-sm mb-3">{(post.caption || '').substring(0, 200)}{post.caption?.length > 200 ? '...' : ''}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Heart size={12} /> {post.likes} Likes</span>
                  <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.comments} Comments</span>
                  <span className="flex items-center gap-1"><Share2 size={12} /> {post.shares} Shares</span>
                  <span className="flex items-center gap-1 text-purple-400 font-medium"><TrendingUp size={12} /> {post.engagementRate}% ER</span>
                  {post.contentType && <span className="px-2 py-0.5 rounded-full bg-white/5">{post.contentType}</span>}
                  {post.contentCategory && <span className="px-2 py-0.5 rounded-full bg-white/5 capitalize">{post.contentCategory.replace(/_/g, ' ')}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {posts.length === 0 && !analysis && (
        <div className="glass-card p-12 text-center text-gray-500">
          <p>No posts or analysis data yet for this competitor.</p>
          <p className="text-sm mt-2">Run an AI analysis to get started, or add post data manually.</p>
        </div>
      )}
    </div>
  );
}
