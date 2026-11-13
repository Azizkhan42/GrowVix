import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, MapPin, Briefcase, TrendingUp, BarChart2, Users, MessageCircle, Heart, Share2, Loader2, Download, Instagram, CheckCircle2, AlertCircle, ShieldAlert, Sparkles, Target, Layers } from 'lucide-react';
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
      await fetchData();
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
        setFetchMsg(`Collection notice: ${data.reason}`);
      } else {
        setFetchMsg(`Successfully imported ${data.newPosts} new posts (${data.postsFetched} fetched).`);
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
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!competitor) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p>Competitor not found.</p>
        <button onClick={() => navigate('/competitors')} className="text-violet-600 mt-4 hover:underline">Back to Competitors</button>
      </div>
    );
  }

  const stats = competitor.stats || {};
  const platformStatuses = competitor.platformStatuses || [];

  return (
    <div className="space-y-6 pb-20">
      <button onClick={() => navigate('/competitors')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Back to Competitors
      </button>

      {/* Competitor Header */}
      <div className="glass-card p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gradient-brand flex items-center justify-center text-white font-bold text-2xl shadow-lg shrink-0">
              {competitor.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 break-words">{competitor.name}</h1>
                <span className="text-xs px-3 py-1 rounded-full bg-violet-50 text-violet-700 font-semibold">{competitor.competitorType || 'Direct Competitor'}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                {competitor.industry && <span className="flex items-center gap-1"><Briefcase size={14} />{competitor.industry}</span>}
                {competitor.location && <span className="flex items-center gap-1"><MapPin size={14} />{competitor.location}</span>}
                {competitor.website && <a href={competitor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-violet-600 hover:underline"><Globe size={14} />Website</a>}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {competitor.instagramProfile && <span className="text-xs px-3 py-1 rounded-full bg-pink-50 text-pink-600 font-medium">Instagram</span>}
                {competitor.linkedinPage && <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">LinkedIn</span>}
                {competitor.facebookPage && <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">Facebook</span>}
                {competitor.twitterHandle && <span className="text-xs px-3 py-1 rounded-full bg-sky-50 text-sky-600 font-medium">Twitter</span>}
                {competitor.tiktokProfile && <span className="text-xs px-3 py-1 rounded-full bg-slate-900 text-white font-medium">TikTok</span>}
                {competitor.youtubeChannel && <span className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-600 font-medium">YouTube</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={fetchRealData}
              disabled={fetching}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 justify-center shadow-sm"
            >
              {fetching ? <><Loader2 size={16} className="animate-spin" />Fetching Data...</> : <><Download size={16} />Fetch Real Data</>}
            </button>
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="gradient-brand text-white px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 justify-center shadow-md hover:opacity-95"
            >
              {analyzing ? <><Loader2 size={16} className="animate-spin" />Analyzing...</> : <><Sparkles size={16} />Run AI Analysis</>}
            </button>
          </div>
        </div>

        {fetchMsg && (
          <div className={`mt-4 text-sm p-3.5 rounded-xl border flex items-center gap-2 ${fetchMsg.includes('Successfully') ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
            <AlertCircle size={16} />
            <span>{fetchMsg}</span>
          </div>
        )}

        {(competitor.description || competitor.businessDescription || competitor.notes) && (
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            {(competitor.description || competitor.businessDescription) && (
              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-400 mb-1">Business Description</h4>
                <p className="text-sm text-slate-600">{competitor.description || competitor.businessDescription}</p>
              </div>
            )}
            {competitor.notes && (
              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-400 mb-1">Internal Notes</h4>
                <p className="text-sm text-slate-600">{competitor.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 text-center">
          <p className="text-3xl font-extrabold text-slate-900">{stats.totalPosts || 0}</p>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Total Posts</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-3xl font-extrabold text-violet-600">{stats.avgEngagement || 0}%</p>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Avg Engagement Rate</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-3xl font-extrabold text-slate-900">{(stats.totalLikes || 0).toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Total Likes</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-3xl font-extrabold text-slate-900">{competitor.digitalScore || 0}/100</p>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Digital Strength Score</p>
        </div>
      </div>

      {/* Platform Status Cards */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Layers size={18} className="text-violet-600" /> Platform Integration Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {['instagram', 'website', 'facebook', 'linkedin', 'tiktok', 'youtube', 'twitter'].map(platform => {
            const statusObj = platformStatuses.find(p => p.platform === platform) || { status: 'Connected' };
            const isConfigured = Boolean(
              (platform === 'instagram' && competitor.instagramProfile) ||
              (platform === 'website' && competitor.website) ||
              (platform === 'facebook' && competitor.facebookPage) ||
              (platform === 'linkedin' && competitor.linkedinPage) ||
              (platform === 'tiktok' && competitor.tiktokProfile) ||
              (platform === 'youtube' && competitor.youtubeChannel) ||
              (platform === 'twitter' && competitor.twitterHandle)
            );

            if (!isConfigured) return null;

            return (
              <div key={platform} className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 capitalize">{platform}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {statusObj.lastSuccessfulFetchAt ? `Synced ${new Date(statusObj.lastSuccessfulFetchAt).toLocaleDateString()}` : 'Not synced yet'}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  statusObj.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                  statusObj.status === 'Restricted' || statusObj.status === 'Failed' ? 'bg-rose-100 text-rose-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {statusObj.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instagram Profile Box (if available) */}
      {competitor.profileData?.followers > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2"><Instagram size={18} className="text-pink-600" /> Instagram Profile Metrics</h2>
            {competitor.profileData.isVerified && <span className="text-xs flex items-center gap-1 text-blue-600 font-medium"><CheckCircle2 size={14} /> Verified Account</span>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold text-slate-900">{(competitor.profileData.followers || 0).toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Followers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{(competitor.profileData.following || 0).toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Following</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{(competitor.profileData.postCount || 0).toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Total Posts</p>
            </div>
            <div>
              <a href={competitor.profileData.profileUrl} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline text-sm font-semibold flex items-center gap-1">Open Profile <ExternalLink size={12} /></a>
              {competitor.profileData.lastUpdated && <p className="text-xs text-slate-400 mt-1">Updated {new Date(competitor.profileData.lastUpdated).toLocaleDateString()}</p>}
            </div>
          </div>
          {competitor.profileData.bio && <p className="text-sm text-slate-600 mt-4 border-t border-slate-100 pt-3">{competitor.profileData.bio}</p>}
        </div>
      )}

      {/* AI Content Analysis Dashboard */}
      {analysis && (
        <div className="glass-card p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Sparkles size={20} className="text-violet-600" /> AI Competitor Intelligence Report</h2>
            <span className="text-xs text-slate-400">Analyzed {new Date(analysis.calculatedAt || Date.now()).toLocaleDateString()}</span>
          </div>

          {analysis.executiveSummary && (
            <div className="p-4 bg-violet-50 border border-violet-100 rounded-xl">
              <h4 className="text-xs font-semibold uppercase text-violet-700 mb-1">Executive Summary</h4>
              <p className="text-sm text-slate-700">{analysis.executiveSummary}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysis.strengths?.length > 0 && (
              <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                <h4 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2"><CheckCircle2 size={16} /> Key Strengths</h4>
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => <li key={i} className="text-sm text-slate-700 flex items-start gap-2">• <span>{s}</span></li>)}
                </ul>
              </div>
            )}
            {analysis.weaknesses?.length > 0 && (
              <div className="p-5 bg-rose-50/50 border border-rose-100 rounded-2xl">
                <h4 className="text-sm font-bold text-rose-800 mb-3 flex items-center gap-2"><ShieldAlert size={16} /> Weaknesses & Gaps</h4>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((w, i) => <li key={i} className="text-sm text-slate-700 flex items-start gap-2">• <span>{w}</span></li>)}
                </ul>
              </div>
            )}
          </div>

          {analysis.opportunities?.length > 0 && (
            <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
              <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2"><TrendingUp size={16} /> Market Opportunities</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.opportunities.map((o, i) => (
                  <div key={i} className="p-3 bg-white rounded-xl border border-blue-100 text-sm text-slate-700">{o}</div>
                ))}
              </div>
            </div>
          )}

          {analysis.recommendations?.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3">Strategic Recommendations</h4>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium">
                    {typeof rec === 'string' ? rec : rec.recommendation || JSON.stringify(rec)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analyzed Posts Feed */}
      {posts.length > 0 && (
        <div className="glass-card p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Collected Posts Feed ({posts.length})</h2>
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post._id} className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-all">
                <p className="text-slate-800 text-sm mb-4 leading-relaxed">{post.caption || 'No caption provided.'}</p>
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 font-semibold text-slate-700"><Heart size={14} className="text-rose-500" /> {post.likes.toLocaleString()} Likes</span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700"><MessageCircle size={14} className="text-blue-500" /> {post.comments.toLocaleString()} Comments</span>
                    <span className="flex items-center gap-1 font-semibold text-violet-600"><TrendingUp size={14} /> {post.engagementRate}% ER</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 uppercase font-medium">{post.platform}</span>
                    {post.postUrl && <a href={post.postUrl} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline flex items-center gap-1">View <ExternalLink size={12} /></a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {posts.length === 0 && !analysis && (
        <div className="glass-card p-12 text-center text-slate-500">
          <p className="text-base font-medium">No posts or intelligence analysis available yet.</p>
          <p className="text-sm mt-1 text-slate-400">Click "Fetch Real Data" to collect posts via Apify or "Run AI Analysis" to generate insights.</p>
        </div>
      )}
    </div>
  );
}
