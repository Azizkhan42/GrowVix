import { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Image as ImageIcon,
  Loader2,
  Calendar,
  Lightbulb,
  BarChart2,
  Send,
  Clock,
  X,
  RotateCcw,
  Download,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const IMAGE_STYLES = [
  { label: 'Product Photography', value: 'Product photography' },
  { label: 'Professional Advertising', value: 'Professional advertising' },
  { label: 'Corporate', value: 'Corporate' },
  { label: 'Minimalist', value: 'Minimalist' },
  { label: 'Lifestyle', value: 'Lifestyle' },
  { label: 'Educational Illustrations', value: 'Educational illustrations' },
  { label: 'Creative Graphics', value: 'Creative graphics' },
];

const IMAGE_FORMATS = [
  { label: 'Square (1:1)', value: 'square' },
  { label: 'Portrait (4:5)', value: 'portrait' },
  { label: 'Landscape (16:9)', value: 'landscape' },
];

export default function ContentGenerator() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    topic: '',
    audience: '',
    tone: 'Professional',
    platform: 'linkedin',
    includeImage: true,
    objective: 'engagement',
    imageStyle: 'Product photography',
    imageFormat: 'square',
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

  // Image generation state
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [imageQuota, setImageQuota] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchHistory();
    fetchConnectedAccounts();
    fetchImageQuota();
  }, []);

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

  const fetchImageQuota = async () => {
    try {
      const { data } = await api.get('/images/quota');
      setImageQuota(data);
    } catch (err) {
      console.error('Failed to fetch image quota:', err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedContent(null);
    setImageError(null);
    setActiveVariation(0);
    try {
      const { data } = await api.post('/content/generate', formData);
      setGeneratedContent(data);
      fetchHistory();
      if (formData.includeImage) {
        await handleGenerateImage({ regenerate: false });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating content');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async ({ regenerate = true } = {}) => {
    if (!generatedContent && !regenerate) return;

    const topic = formData.topic || (generatedContent?.topic || '');
    const platform = formData.platform;
    const style = formData.imageStyle;
    const caption = generatedContent
      ? generatedContent.caption || ''
      : '';

    setImageError(null);
    setImageLoading(true);
    if (regenerate) setRegenerating(true);

    try {
      const { data } = await api.post('/images/generate', {
        contentId: generatedContent?._id || null,
        topic,
        platform,
        style,
        caption,
        regenerate,
        seed: regenerate ? Math.floor(Math.random() * 1000000) : undefined,
      });

      setGeneratedContent((prev) => ({
        ...prev,
        imageUrl: data.imageUrl,
      }));
      fetchImageQuota();
    } catch (err) {
      const msg = err.response?.data?.message || 'Image generation failed.';
      setImageError(msg);
      if (err.response?.data?.quotaExhausted) {
        fetchImageQuota();
      }
    } finally {
      setImageLoading(false);
      setRegenerating(false);
    }
  };

  const handleCopy = (text, hashtags) => {
    const fullText = `${text}\n\n${(hashtags || []).join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = () => {
    const imageUrl = generatedContent?.imageUrl;
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `growvix-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    setPublishing(true);
    setPublishMsg('');
    try {
      const { data } = await api.post('/social/post', {
        platform,
        content: buildPostText(),
        imageUrl: generatedContent?.imageUrl || '',
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
        imageUrl: generatedContent?.imageUrl || '',
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
  const quotaExhausted = imageQuota?.remaining === 0 && imageQuota?.configured;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 flex items-center gap-3">
            AI Content Generator <Sparkles className="text-amber-500" />
          </h1>
          <p className="text-slate-500">Generate platform-optimized content with AI-powered engagement scoring.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleGenerateIdeas} disabled={loadingIdeas} className="bg-white border border-app-border hover:bg-slate-50 text-slate-900 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 text-sm justify-center">
            {loadingIdeas ? <Loader2 size={14} className="animate-spin" /> : <Lightbulb size={14} className="text-amber-500" />} Content Ideas
          </button>
          <button onClick={() => navigate('/content-calendar')} className="bg-white border border-app-border hover:bg-slate-50 text-slate-900 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 text-sm justify-center">
            <Calendar size={14} /> Calendar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Generate Content</h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-500 mb-1">Topic / Subject *</label>
              <input type="text" required placeholder="e.g. Benefits of AI in marketing" value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-slate-900 focus:outline-none focus:border-primary-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-500 mb-1">Platform</label>
                <select value={formData.platform} onChange={(e) => setFormData({...formData, platform: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-slate-900 focus:outline-none focus:border-primary-500">
                  <option value="linkedin">LinkedIn</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">Tone</label>
                <select value={formData.tone} onChange={(e) => setFormData({...formData, tone: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-slate-900 focus:outline-none focus:border-primary-500">
                  <option value="Professional">Professional</option>
                  <option value="Casual">Casual</option>
                  <option value="Funny">Funny</option>
                  <option value="Inspirational">Inspirational</option>
                  <option value="Educational">Educational</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-500 mb-1">Target Audience</label>
                <input type="text" placeholder="e.g. Small business owners" value={formData.audience} onChange={(e) => setFormData({...formData, audience: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-slate-900 focus:outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">Objective</label>
                <select value={formData.objective} onChange={(e) => setFormData({...formData, objective: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-slate-900 focus:outline-none focus:border-primary-500">
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

            <div className="bg-slate-50/50 rounded-xl p-4 border border-app-border">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <ImageIcon size={14} className="text-amber-500" /> AI Image Generation
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <input type="checkbox" id="includeImage" checked={formData.includeImage} onChange={(e) => setFormData({...formData, includeImage: e.target.checked})} className="w-4 h-4 rounded bg-dark-bg border-dark-border text-primary-500 focus:ring-primary-500" />
                <label htmlFor="includeImage" className="text-sm text-slate-500 flex items-center gap-2">Generate image with content</label>
              </div>
              {formData.includeImage && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-2">Image Style</label>
                    <select value={formData.imageStyle} onChange={(e) => setFormData({...formData, imageStyle: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg p-2.5 text-slate-900 text-sm focus:outline-none focus:border-primary-500">
                      {IMAGE_STYLES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-2">Image Format</label>
                    <select value={formData.imageFormat} onChange={(e) => setFormData({...formData, imageFormat: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg p-2.5 text-slate-900 text-sm focus:outline-none focus:border-primary-500">
                      {IMAGE_FORMATS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {imageQuota && imageQuota.configured && imageQuota.remaining === 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-rose-600" />
                  <span className="text-xs text-rose-700 font-medium">Daily image allowance exhausted. Try again tomorrow.</span>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading || quotaExhausted} className="gradient-brand w-full py-3 rounded-lg text-white font-medium transition disabled:opacity-70 flex items-center justify-center gap-2 hover:opacity-95">
              {loading ? <><Loader2 size={16} className="animate-spin" />Generating...</> : <><Sparkles size={16} />Generate Content</>}
            </button>
          </form>
        </div>

        <div className="glass-card p-6">
          {generatedContent ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900">Generated Content</h2>
                {variations.length > 1 && (
                  <div className="flex flex-wrap gap-1">
                    {variations.map((v, i) => (
                      <button key={i} onClick={() => setActiveVariation(i)} className={`text-xs px-3 py-1 rounded-md transition-colors ${activeVariation === i ? 'gradient-brand text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {v.label || `V${i + 1}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {currentVariation && (
                <div className="bg-slate-50 rounded-xl p-4 border border-app-border">
                  <p className="text-slate-700 text-sm whitespace-pre-wrap">{currentVariation.caption}</p>
                  {currentVariation.hashtags?.length > 0 && (
                    <p className="text-violet-500 text-sm mt-3">{currentVariation.hashtags.join(' ')}</p>
                  )}
                </div>
              )}

              {score && (
                <div className="bg-slate-50 rounded-xl p-4 border border-app-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2"><BarChart2 size={14} className="text-violet-500" />AI Estimated Engagement Potential</h3>
                    <span className={`text-lg font-bold ${score.overall >= 70 ? 'text-emerald-600' : score.overall >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>{score.overall}/100</span>
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
                        <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                        <div className="text-sm font-semibold text-slate-900">{item.value}</div>
                      </div>
                    ))}
                  </div>
                  {score.explanation && <p className="text-xs text-slate-500 italic">{score.explanation}</p>}
                </div>
              )}

              {formData.includeImage && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <ImageIcon size={14} className="text-amber-500" /> Generated Image
                    </h3>
                    <button
                      onClick={() => handleGenerateImage({ regenerate: true })}
                      disabled={imageLoading || regenerating || quotaExhausted}
                      className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition-colors flex items-center gap-1"
                    >
                      {regenerating ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />} Regenerate
                    </button>
                  </div>

                  {imageError && (
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={14} className="text-rose-600" />
                        <span className="text-xs text-rose-700">{imageError}</span>
                      </div>
                    </div>
                  )}

                  {!imageError && (
                    <div className="relative rounded-xl overflow-hidden border border-dark-border aspect-square">
                      {imageLoading || regenerating ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                          <Loader2 size={32} className="animate-spin text-slate-400" />
                        </div>
                      ) : (
                        <img src={generatedContent.imageUrl} alt="Generated" className="w-full h-full object-cover" />
                      )}
                      <button
                        onClick={handleDownloadImage}
                        disabled={imageLoading || regenerating || !generatedContent.imageUrl}
                        className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white p-1.5 rounded-lg hover:bg-black/80 transition opacity-0 group-hover:opacity-100"
                        title="Download Image"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  )}

                  {!generatedContent.imageUrl && !imageError && !imageLoading && !regenerating && (
                    <div className="bg-slate-50 rounded-xl p-6 border border-dashed border-dark-border text-center">
                      <p className="text-sm text-slate-500">Click Generate to create an AI image for this content.</p>
                    </div>
                  )}
                </div>
              )}

              {publishMsg && (
                <div className={`text-sm p-3 rounded-lg border ${publishMsg.startsWith('Published') || publishMsg.startsWith('Scheduled') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                  {publishMsg}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => handleCopy(currentVariation?.caption || generatedContent.caption, currentVariation?.hashtags || generatedContent.hashtags)} className="flex-1 py-2.5 rounded-lg bg-white border border-app-border hover:bg-slate-50 text-slate-900 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                  {copied ? <><Check size={14} className="text-emerald-600" />Copied!</> : <><Copy size={14} />Copy to Clipboard</>}
                </button>
                <div className="flex flex-1 gap-3">
                  <button
                    onClick={handlePublishNow}
                    disabled={publishing}
                    className="gradient-brand flex-1 py-2.5 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-70 hover:opacity-95"
                    title={isConnected(formData.platform) ? `Publish now to ${formData.platform}` : 'Connect this platform in Settings first'}
                  >
                    {publishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {publishing ? 'Publishing...' : 'Publish Now'}
                  </button>
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="flex-1 py-2.5 rounded-lg bg-violet-50 border border-violet-200 text-violet-700 text-sm font-medium flex items-center justify-center gap-2 transition hover:bg-violet-100"
                  >
                    <Clock size={14} />Schedule
                  </button>
                </div>
              </div>

              {!isConnected(formData.platform) && (
                <p className="text-xs text-slate-500 text-center">
                  <button onClick={() => navigate('/settings')} className="text-violet-600 hover:text-violet-800 underline">Connect your {formData.platform} account</button> to publish or schedule this post.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-500">
              <Sparkles size={40} className="mb-4 opacity-30" />
              <p className="text-sm">Fill in the form and click Generate to create content.</p>
              <p className="text-xs mt-1 text-slate-400">The AI considers your competitors and business profile.</p>
            </div>
          )}
        </div>
      </div>

      {showIdeas && (
        <div className="glass-card p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2"><Lightbulb size={18} className="text-amber-500" /> Content Ideas</h2>
            <button onClick={() => setShowIdeas(false)} className="text-slate-500 hover:text-slate-900 text-sm">Close</button>
          </div>
          {loadingIdeas ? (
            <div className="flex items-center justify-center py-8"><Loader2 size={24} className="animate-spin text-violet-500" /></div>
          ) : ideas?.ideas?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ideas.ideas.map((idea, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-4 border border-app-border hover:border-violet-300 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-violet-50 text-violet-600 capitalize">{idea.category}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize">{idea.format}</span>
                  </div>
                  <h4 className="text-slate-900 font-medium text-sm mb-1">{idea.title}</h4>
                  <p className="text-xs text-slate-500 italic mb-2">"{idea.hook}"</p>
                  <p className="text-xs text-slate-600">{idea.whyItCouldWork}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-slate-500">CTA: <span className="text-slate-500">{idea.cta}</span></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-4">No ideas generated. Try again.</p>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="glass-card p-6 relative z-10">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Generated Content History</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {history.map(item => (
              <div key={item._id} className="bg-slate-50 rounded-xl p-4 border border-app-border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-violet-50 text-violet-600 capitalize">{item.platform}</span>
                  <span className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                  {item.engagementScore?.overall > 0 && <span className="text-xs text-slate-500">Score: {item.engagementScore.overall}/100</span>}
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{item.caption}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-app-border rounded-2xl w-full max-w-md p-6 relative shadow-lift">
            <button onClick={() => setShowScheduleModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-900">
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2"><Clock size={18} className="text-violet-500" /> Schedule Post</h3>
            <p className="text-sm text-slate-500 mb-4">Publish automatically to {formData.platform}.</p>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-500 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleForm.scheduledTime}
                  onChange={(e) => setScheduleForm({ scheduledTime: e.target.value })}
                  className="w-full bg-white border border-app-border rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-violet-200 focus:border-violet-300 outline-none transition"
                />
              </div>
              <button
                type="submit"
                disabled={scheduling}
                className="gradient-brand w-full py-3 rounded-lg text-white font-medium transition disabled:opacity-70 flex items-center justify-center gap-2 hover:opacity-95"
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
