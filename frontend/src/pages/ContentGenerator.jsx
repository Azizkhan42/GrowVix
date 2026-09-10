import { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, Image as ImageIcon, Loader2, Calendar, Lightbulb, BarChart2, Send, Clock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ContentGenerator() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    topic: '',
    audience: '',
    tone: 'Professional',
    platform: 'linkedin',
    includeImage: false,
    objective: 'engagement'
  });

  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [activeVariation, setActiveVariation] = useState(0);
  const [showIdeas, setShowIdeas] = useState(false);
  const [ideas, setIdeas] = useState(null);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ scheduledTime: '' });
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => { fetchHistory(); fetchConnectedAccounts(); }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/content');
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchConnectedAccounts = async () => {
    try {
      const { data } = await api.get('/social/accounts');
      setConnectedAccounts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedContent(null);
    setActiveVariation(0);
    try {
      const { data } = await api.post('/content/generate', formData);
      setGeneratedContent(data);
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating content');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, hashtags) => {
    const fullText = `${text}\n\n${(hashtags || []).join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateIdeas = async () => {
    setLoadingIdeas(true);
    setShowIdeas(true);
    try {
      const { data } = await api.post('/content/ideas', { platform: formData.platform });
      setIdeas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingIdeas(false);
    }
  };

  const isConnected = (platform) => connectedAccounts.some(a => a.platform === platform && a.isConnected);

  const buildPostText = () => {
    const variation = variations[activeVariation] || generatedContent;
    const caption = variation?.caption || generatedContent?.caption || '';
    const hashtags = variation?.hashtags || generatedContent?.hashtags || [];
    return `${caption}${hashtags.length ? `\n\n${hashtags.join(' ')}` : ''}`;
  };

  const handlePublishNow = async () => {
    const platform = formData.platform;
    if (!isConnected(platform)) {
      alert(`No ${platform} account connected. Go to Settings > Integrations to connect it first.`);
      return;
    }
    if (platform === 'twitter') {
      alert('Twitter (X) publishing uses the profile token. Connect it in Settings if not already done.');
    }
    setPublishing(true);
    setPublishMsg('');
    try {
      const { data } = await api.post('/social/post', {
        platform,
        content: buildPostText(),
        imageUrl: generatedContent?.imageUrl || ''
      });
      setPublishMsg(data.message || 'Published successfully!');
      fetchHistory();
    } catch (err) {
      setPublishMsg(err.response?.data?.message || 'Publish failed. Check connection and try again.');
    } finally {
      setPublishing(false);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    const platform = formData.platform;
    if (!isConnected(platform)) {
      alert(`No ${platform} account connected. Go to Settings > Integrations to connect it first.`);
      return;
    }
    if (!scheduleForm.scheduledTime) {
      alert('Please pick a date and time.');
      return;
    }
    setScheduling(true);
    try {
      const { data } = await api.post('/social/schedule', {
        platform,
        content: buildPostText(),
        scheduledTime: new Date(scheduleForm.scheduledTime).toISOString(),
        imageUrl: generatedContent?.imageUrl || ''
      });
      setShowScheduleModal(false);
      setPublishMsg(`Scheduled for ${new Date(data.scheduledTime).toLocaleString()}.`);
      navigate('/scheduler');
    } catch (err) {
      setPublishMsg(err.response?.data?.message || 'Scheduling failed.');
    } finally {
      setScheduling(false);
    }
  };

  const variations = generatedContent?.variations || [];
  const currentVariation = variations[activeVariation] || generatedContent;
  const score = generatedContent?.engagementScore;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            AI Content Generator <Sparkles className="text-yellow-400" />
          </h1>
          <p className="text-gray-400">Generate platform-optimized content with AI-powered engagement scoring.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleGenerateIdeas} disabled={loadingIdeas} className="bg-white/5 border border-dark-border hover:bg-white/10 text-white px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 text-sm">
            {loadingIdeas ? <Loader2 size={14} className="animate-spin" /> : <Lightbulb size={14} className="text-yellow-400" />} Content Ideas
          </button>
          <button onClick={() => navigate('/content-calendar')} className="bg-white/5 border border-dark-border hover:bg-white/10 text-white px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 text-sm">
            <Calendar size={14} /> Calendar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Generate Content</h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Topic / Subject *</label>
              <input type="text" required placeholder="e.g. Benefits of AI in marketing" value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:outline-none focus:border-primary-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Platform</label>
                <select value={formData.platform} onChange={(e) => setFormData({...formData, platform: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:outline-none focus:border-primary-500">
                  <option value="linkedin">LinkedIn</option>
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter/X</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tone</label>
                <select value={formData.tone} onChange={(e) => setFormData({...formData, tone: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:outline-none focus:border-primary-500">
                  <option value="Professional">Professional</option>
                  <option value="Casual">Casual</option>
                  <option value="Funny">Funny</option>
                  <option value="Inspirational">Inspirational</option>
                  <option value="Educational">Educational</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Target Audience</label>
                <input type="text" placeholder="e.g. Small business owners" value={formData.audience} onChange={(e) => setFormData({...formData, audience: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Objective</label>
                <select value={formData.objective} onChange={(e) => setFormData({...formData, objective: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:outline-none focus:border-primary-500">
                  <option value="engagement">Engagement</option>
                  <option value="awareness">Awareness</option>
                  <option value="leads">Leads</option>
                  <option value="sales">Sales</option>
                  <option value="education">Education</option>
                  <option value="community">Community Building</option>
                  <option value="authority">Brand Authority</option>
                  <option value="promotion">Product Promotion</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="includeImage" checked={formData.includeImage} onChange={(e) => setFormData({...formData, includeImage: e.target.checked})} className="w-4 h-4 rounded bg-dark-bg border-dark-border text-primary-500 focus:ring-primary-500" />
              <label htmlFor="includeImage" className="text-sm text-gray-400 flex items-center gap-2"><ImageIcon size={14} /> Include AI-generated image</label>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg text-white font-medium bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 transition disabled:opacity-70 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" />Generating...</> : <><Sparkles size={16} />Generate Content</>}
            </button>
          </form>
        </div>

        <div className="glass-card p-6">
          {generatedContent ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Generated Content</h2>
                {variations.length > 1 && (
                  <div className="flex gap-1">
                    {variations.map((v, i) => (
                      <button key={i} onClick={() => setActiveVariation(i)} className={`text-xs px-3 py-1 rounded-full transition-colors ${activeVariation === i ? 'bg-primary-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                        {v.label || `V${i + 1}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {currentVariation && (
                <div className="bg-dark-bg/50 rounded-xl p-4 border border-dark-border">
                  <p className="text-gray-200 text-sm whitespace-pre-wrap">{currentVariation.caption}</p>
                  {currentVariation.hashtags?.length > 0 && (
                    <p className="text-primary-400 text-sm mt-3">{currentVariation.hashtags.join(' ')}</p>
                  )}
                </div>
              )}

              {score && (
                <div className="bg-dark-bg/50 rounded-xl p-4 border border-dark-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2"><BarChart2 size={14} className="text-purple-400" />AI Estimated Engagement Potential</h3>
                    <span className={`text-lg font-bold ${score.overall >= 70 ? 'text-green-400' : score.overall >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{score.overall}/100</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: 'Hook', value: score.hook },
                      { label: 'Value', value: score.value },
                      { label: 'Clarity', value: score.clarity },
                      { label: 'Emotion', value: score.emotionalAppeal },
                      { label: 'CTA', value: score.cta },
                      { label: 'Relevance', value: score.audienceRelevance }
                    ].map(item => (
                      <div key={item.label} className="text-center">
                        <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                        <div className="text-sm font-semibold text-white">{item.value}</div>
                      </div>
                    ))}
                  </div>
                  {score.explanation && <p className="text-xs text-gray-400 italic">{score.explanation}</p>}
                </div>
              )}

              {generatedContent.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-dark-border">
                  <img src={generatedContent.imageUrl} alt="Generated" className="w-full h-48 object-cover" />
                </div>
              )}

              {publishMsg && (
                <div className={`text-sm p-3 rounded-lg border ${publishMsg.startsWith('Published') || publishMsg.startsWith('Scheduled') ? 'bg-green-500/10 border-green-500/40 text-green-400' : 'bg-red-500/10 border-red-500/40 text-red-400'}`}>
                  {publishMsg}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => handleCopy(currentVariation?.caption || generatedContent.caption, currentVariation?.hashtags || generatedContent.hashtags)} className="flex-1 py-2.5 rounded-lg bg-white/5 border border-dark-border hover:bg-white/10 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                  {copied ? <><Check size={14} className="text-green-400" />Copied!</> : <><Copy size={14} />Copy to Clipboard</>}
                </button>
                <div className="flex flex-1 gap-3">
                  <button
                    onClick={handlePublishNow}
                    disabled={publishing}
                    className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-70"
                    title={isConnected(formData.platform) ? `Publish now to ${formData.platform}` : 'Connect this platform in Settings first'}
                  >
                    {publishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {publishing ? 'Publishing...' : 'Publish Now'}
                  </button>
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="flex-1 py-2.5 rounded-lg bg-white/10 border border-purple-500/30 hover:bg-purple-500/15 text-white text-sm font-medium flex items-center justify-center gap-2 transition"
                  >
                    <Clock size={14} />Schedule
                  </button>
                </div>
              </div>

              {!isConnected(formData.platform) && (
                <p className="text-xs text-gray-500 text-center">
                  <button onClick={() => navigate('/settings')} className="text-purple-400 hover:text-purple-300 underline">Connect your {formData.platform} account</button> to publish or schedule this post.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-500">
              <Sparkles size={40} className="mb-4 opacity-30" />
              <p className="text-sm">Fill in the form and click Generate to create content.</p>
              <p className="text-xs mt-1 text-gray-600">The AI considers your competitors and business profile.</p>
            </div>
          )}
        </div>
      </div>

      {showIdeas && (
        <div className="glass-card p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Lightbulb size={18} className="text-yellow-400" /> Content Ideas</h2>
            <button onClick={() => setShowIdeas(false)} className="text-gray-400 hover:text-white text-sm">Close</button>
          </div>
          {loadingIdeas ? (
            <div className="flex items-center justify-center py-8"><Loader2 size={24} className="animate-spin text-primary-400" /></div>
          ) : ideas?.ideas?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ideas.ideas.map((idea, i) => (
                <div key={i} className="bg-dark-bg/50 rounded-xl p-4 border border-dark-border hover:border-primary-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-400 capitalize">{idea.category}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 capitalize">{idea.format}</span>
                  </div>
                  <h4 className="text-white font-medium text-sm mb-1">{idea.title}</h4>
                  <p className="text-xs text-gray-400 italic mb-2">"{idea.hook}"</p>
                  <p className="text-xs text-gray-500">{idea.whyItCouldWork}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500">CTA: <span className="text-gray-400">{idea.cta}</span></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">No ideas generated. Try again.</p>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="glass-card p-6 relative z-10">
          <h2 className="text-lg font-semibold text-white mb-4">Generated Content History</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {history.map(item => (
              <div key={item._id} className="bg-dark-bg/50 rounded-xl p-4 border border-dark-border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-400 capitalize">{item.platform}</span>
                  <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                  {item.engagementScore?.overall > 0 && <span className="text-xs text-gray-400">Score: {item.engagementScore.overall}/100</span>}
                </div>
                <p className="text-sm text-gray-300 line-clamp-2">{item.caption}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12151c] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button onClick={() => setShowScheduleModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2"><Clock size={18} className="text-purple-400" /> Schedule Post</h3>
            <p className="text-sm text-gray-500 mb-4">Publish automatically to {formData.platform}.</p>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleForm.scheduledTime}
                  onChange={(e) => setScheduleForm({ scheduledTime: e.target.value })}
                  className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={scheduling}
                className="w-full py-3 rounded-lg text-white font-medium bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 transition disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {scheduling ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                {scheduling ? 'Scheduling...' : 'Schedule Post'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
