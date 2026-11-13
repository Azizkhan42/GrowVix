import { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, Target, TrendingUp, Users, Edit3, Globe, MapPin, Briefcase, Save, X, BarChart2, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const COMMON_INDUSTRIES = [
  'SaaS & Technology',
  'E-Commerce & Retail',
  'Digital Marketing & Agency',
  'Finance & Fintech',
  'Health & Wellness',
  'Education & EdTech',
  'Real Estate',
  'Food & Beverage',
  'Entertainment & Media',
  'Professional Services',
  'Other'
];

const defaultForm = {
  name: '',
  industry: 'SaaS & Technology',
  customIndustry: '',
  competitorType: 'Direct Competitor',
  location: '',
  website: '',
  businessDescription: '',
  instagramProfile: '',
  facebookPage: '',
  linkedinPage: '',
  tiktokProfile: '',
  youtubeChannel: '',
  twitterHandle: '',
  logo: '',
  notes: ''
};

export default function Competitors() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [competitors, setCompetitors] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'compare'
  const [comparisonData, setComparisonData] = useState([]);
  const [loadingCompare, setLoadingCompare] = useState(false);

  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    fetchCompetitors();
  }, []);

  useEffect(() => {
    if (searchParams.get('add') === '1') {
      setShowAddForm(true);
      setEditingId(null);
      setFormData(defaultForm);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCompetitors = async () => {
    try {
      const { data } = await api.get('/competitors');
      setCompetitors(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load competitors', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchComparison = async () => {
    setLoadingCompare(true);
    try {
      const { data } = await api.get('/competitors/compare');
      setComparisonData(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load comparison data', 'error');
    } finally {
      setLoadingCompare(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const finalIndustry = formData.industry === 'Other' ? formData.customIndustry : formData.industry;
    if (!formData.name || !finalIndustry) {
      showToast('Please provide Competitor Name and Industry.', 'error');
      return;
    }

    const payload = {
      ...formData,
      industry: finalIndustry
    };

    try {
      let savedComp;
      if (editingId) {
        const { data } = await api.put(`/competitors/${editingId}`, payload);
        savedComp = data;
        showToast('Competitor updated successfully');
        setEditingId(null);
      } else {
        const { data } = await api.post('/competitors/add', payload);
        savedComp = data;
        showToast('Competitor added successfully');
      }
      setShowAddForm(false);
      setFormData(defaultForm);
      fetchCompetitors();
      if (savedComp?._id) {
        navigate(`/competitors/${savedComp._id}`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving competitor', 'error');
    }
  };

  const handleEdit = (comp) => {
    const isCommon = COMMON_INDUSTRIES.includes(comp.industry);
    setFormData({
      name: comp.name || '',
      industry: isCommon ? comp.industry : 'Other',
      customIndustry: isCommon ? '' : comp.industry,
      competitorType: comp.competitorType || 'Direct Competitor',
      location: comp.location || '',
      website: comp.website || '',
      businessDescription: comp.businessDescription || comp.description || '',
      instagramProfile: comp.instagramProfile || '',
      facebookPage: comp.facebookPage || '',
      linkedinPage: comp.linkedinPage || '',
      tiktokProfile: comp.tiktokProfile || '',
      youtubeChannel: comp.youtubeChannel || '',
      twitterHandle: comp.twitterHandle || '',
      logo: comp.logo || '',
      notes: comp.notes || ''
    });
    setEditingId(comp._id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this competitor and all associated posts?')) {
      try {
        await api.delete(`/competitors/${id}`);
        showToast('Competitor deleted successfully');
        fetchCompetitors();
      } catch (err) {
        showToast('Failed to delete competitor', 'error');
      }
    }
  };

  const handleAnalyze = async (id) => {
    setAnalyzing(id);
    try {
      await api.post(`/competitors/analyze/${id}`);
      showToast('AI analysis completed successfully');
      fetchCompetitors();
    } catch (err) {
      showToast('Failed to run AI analysis', 'error');
    } finally {
      setAnalyzing(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 text-sm animate-bounce ${toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {toast.type === 'error' ? <ShieldAlert size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 flex items-center gap-3">
            Competitor Intelligence <Target className="text-violet-600" />
          </h1>
          <p className="text-slate-500">Track, analyze, and outperform your market rivals with real-time data and AI.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Competitors
            </button>
            <button
              onClick={() => { setActiveTab('compare'); fetchComparison(); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'compare' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Comparison Matrix
            </button>
          </div>
          <button
            onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); setFormData(defaultForm); }}
            className="gradient-brand text-white px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 justify-center shadow-md hover:opacity-95"
          >
            <Plus size={18} />
            <span>Add New Competitor</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="glass-card p-6 md:p-8 relative z-10 mb-6 border border-violet-200 shadow-xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-app-border">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Competitor Profile' : 'Add New Competitor Intelligence'}</h3>
              <p className="text-xs text-slate-500 mt-1">Configure competitor details, social handles, and tracking sources.</p>
            </div>
            <button onClick={() => { setShowAddForm(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-900 p-2"><X size={20} /></button>
          </div>

          <form onSubmit={handleAdd} className="space-y-6">
            {/* Section A: Basic Information */}
            <div>
              <h4 className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-3">A. Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Competitor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, Acme Corp"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Industry *</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-violet-500"
                  >
                    {COMMON_INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                </div>
                {formData.industry === 'Other' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Custom Industry *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Biotechnology"
                      value={formData.customIndustry}
                      onChange={(e) => setFormData({ ...formData, customIndustry: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-violet-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Competitor Type *</label>
                  <select
                    value={formData.competitorType}
                    onChange={(e) => setFormData({ ...formData, competitorType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-violet-500"
                  >
                    <option value="Direct Competitor">Direct Competitor</option>
                    <option value="Indirect Competitor">Indirect Competitor</option>
                    <option value="Aspirational Competitor">Aspirational Competitor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Website URL</label>
                  <input
                    type="url"
                    placeholder="https://competitor.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>

            {/* Section B: Social Media Profiles */}
            <div>
              <h4 className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-1">B. Social Media Profiles</h4>
              <p className="text-xs text-slate-400 mb-3">Provide usernames or profile URLs (at least one source required for data collection).</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Instagram Profile</label>
                  <input
                    type="text"
                    placeholder="@username or profile URL"
                    value={formData.instagramProfile}
                    onChange={(e) => setFormData({ ...formData, instagramProfile: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Facebook Page</label>
                  <input
                    type="text"
                    placeholder="Page name or URL"
                    value={formData.facebookPage}
                    onChange={(e) => setFormData({ ...formData, facebookPage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">LinkedIn Company Page</label>
                  <input
                    type="text"
                    placeholder="Company page URL"
                    value={formData.linkedinPage}
                    onChange={(e) => setFormData({ ...formData, linkedinPage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">TikTok Profile</label>
                  <input
                    type="text"
                    placeholder="@username or URL"
                    value={formData.tiktokProfile}
                    onChange={(e) => setFormData({ ...formData, tiktokProfile: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">YouTube Channel</label>
                  <input
                    type="text"
                    placeholder="Channel URL or ID"
                    value={formData.youtubeChannel}
                    onChange={(e) => setFormData({ ...formData, youtubeChannel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">X / Twitter Handle</label>
                  <input
                    type="text"
                    placeholder="@handle"
                    value={formData.twitterHandle}
                    onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>

            {/* Section C: Additional Information */}
            <div>
              <h4 className="text-sm font-semibold text-violet-600 uppercase tracking-wider mb-3">C. Additional Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Business Description</label>
                  <textarea
                    rows={3}
                    placeholder="What does this competitor do? Products, pricing model..."
                    value={formData.businessDescription}
                    onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Internal Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Key strengths, weaknesses, strategic notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-app-border">
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setEditingId(null); }}
                className="bg-white text-slate-600 px-6 py-2.5 rounded-xl font-medium border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="gradient-brand text-white px-8 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-md hover:opacity-95"
              >
                <Save size={16} /> {editingId ? 'Update Competitor' : 'Save & Open Dashboard'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'compare' ? (
        <div className="glass-card p-6 relative z-10">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Competitor Comparison Matrix</h3>
          <p className="text-sm text-slate-500 mb-6">Side-by-side comparison of your market rivals across key performance indicators.</p>
          
          {loadingCompare ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : comparisonData.length === 0 ? (
            <div className="text-center py-16 text-slate-500">No competitors found to compare. Add competitors first.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-400 uppercase">
                    <th className="p-3">Competitor</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Industry</th>
                    <th className="p-3">Followers</th>
                    <th className="p-3">Total Posts</th>
                    <th className="p-3">Avg Engagement</th>
                    <th className="p-3">Digital Score</th>
                    <th className="p-3">Platforms</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {comparisonData.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/competitors/${c.id}`)}>
                      <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-white text-xs font-bold">
                          {c.name.charAt(0)}
                        </div>
                        {c.name}
                      </td>
                      <td className="p-3"><span className="text-xs px-2 py-1 bg-violet-50 text-violet-700 rounded-md">{c.competitorType}</span></td>
                      <td className="p-3 text-slate-600">{c.industry}</td>
                      <td className="p-3 font-medium text-slate-900">{c.followers ? c.followers.toLocaleString() : 'N/A'}</td>
                      <td className="p-3 text-slate-600">{c.totalPosts}</td>
                      <td className="p-3 font-semibold text-violet-600">{c.avgEngagement}%</td>
                      <td className="p-3 font-bold text-slate-900">{c.digitalScore}/100</td>
                      <td className="p-3">
                        <div className="flex gap-1 flex-wrap">
                          {c.socialPlatforms.map(p => <span key={p} className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">{p}</span>)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
              <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
              <p>Loading competitors...</p>
            </div>
          ) : competitors.length === 0 ? (
            <div className="glass-card p-12 md:p-20 text-center relative z-10 flex flex-col items-center border-dashed border-2 border-slate-200">
              <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mb-6 text-violet-500">
                <Target size={32} />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">Identify your competitors</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-8">Track competitors to get AI-powered content ideas, gap analysis, and strategic recommendations.</p>
              <button onClick={() => setShowAddForm(true)} className="gradient-brand flex items-center gap-2 text-white font-medium px-6 py-3 rounded-xl transition shadow-md hover:opacity-95">
                <Plus size={18} /> Add your first competitor to get started
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {competitors.map(comp => (
                <div key={comp._id} className="glass-card p-6 flex flex-col group hover:border-violet-300 hover:shadow-lift transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3 cursor-pointer min-w-0" onClick={() => navigate(`/competitors/${comp._id}`)}>
                      <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                        {comp.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-violet-600 transition-colors truncate">{comp.name}</h3>
                        <p className="text-xs text-slate-500 truncate">{comp.industry}</p>
                        {comp.location && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={10} />{comp.location}</p>}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => handleEdit(comp)} className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg"><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(comp._id)} className="text-slate-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-medium">{comp.competitorType || 'Direct Competitor'}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {comp.instagramProfile && <span className="text-xs px-2 py-0.5 rounded-md bg-pink-50 text-pink-600">Instagram</span>}
                    {comp.linkedinPage && <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-600">LinkedIn</span>}
                    {comp.facebookPage && <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600">Facebook</span>}
                    {comp.twitterHandle && <span className="text-xs px-2 py-0.5 rounded-md bg-sky-50 text-sky-600">Twitter</span>}
                    {comp.tiktokProfile && <span className="text-xs px-2 py-0.5 rounded-md bg-slate-900 text-white">TikTok</span>}
                    {comp.youtubeChannel && <span className="text-xs px-2 py-0.5 rounded-md bg-red-50 text-red-600">YouTube</span>}
                    {comp.website && <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 flex items-center gap-1"><Globe size={10} />Website</span>}
                  </div>

                  {(comp.description || comp.businessDescription || comp.notes) && (
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{comp.description || comp.businessDescription || comp.notes}</p>
                  )}

                  {comp.digitalScore > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs text-slate-500">Score:</span>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${comp.digitalScore >= 70 ? 'bg-emerald-500' : comp.digitalScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${comp.digitalScore}%` }}></div>
                      </div>
                      <span className="text-xs text-slate-900 font-medium">{comp.digitalScore}</span>
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">Added {new Date(comp.addedAt).toLocaleDateString()}</span>
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/competitors/${comp._id}`)} className="text-violet-600 hover:text-violet-800 text-xs font-semibold flex items-center gap-1 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-full transition-all">
                        Details <ExternalLink size={12} />
                      </button>
                      <button onClick={() => handleAnalyze(comp._id)} disabled={analyzing === comp._id} className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-all disabled:opacity-50">
                        {analyzing === comp._id ? <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> : <BarChart2 size={12} />}
                        Analyze
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
