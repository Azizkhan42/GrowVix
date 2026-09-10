import { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, Info, Target, TrendingUp, Users, Edit3, Globe, MapPin, Briefcase, Save, X, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Competitors() {
  const navigate = useNavigate();
  const [competitors, setCompetitors] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(null);

  const defaultForm = {
    name: '', website: '', facebookPage: '', instagramProfile: '', linkedinPage: '',
    twitterHandle: '', industry: '', location: '', notes: ''
  };
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => { fetchCompetitors(); }, []);

  const fetchCompetitors = async () => {
    try {
      const { data } = await api.get('/competitors');
      setCompetitors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/competitors/${editingId}`, formData);
        setEditingId(null);
      } else {
        await api.post('/competitors/add', formData);
      }
      setShowAddForm(false);
      setFormData(defaultForm);
      fetchCompetitors();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving competitor');
    }
  };

  const handleEdit = (comp) => {
    setFormData({
      name: comp.name || '',
      website: comp.website || '',
      facebookPage: comp.facebookPage || '',
      instagramProfile: comp.instagramProfile || '',
      linkedinPage: comp.linkedinPage || '',
      twitterHandle: comp.twitterHandle || '',
      industry: comp.industry || '',
      location: comp.location || '',
      notes: comp.notes || ''
    });
    setEditingId(comp._id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this competitor?')) {
      try {
        await api.delete(`/competitors/${id}`);
        fetchCompetitors();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAnalyze = async (id) => {
    setAnalyzing(id);
    try {
      await api.post(`/competitors/analyze/${id}`);
      fetchCompetitors();
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between z-10 relative">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            Competitor Intelligence <Target className="text-primary-400" />
          </h1>
          <p className="text-gray-400">Track, analyze and outperform your market rivals.</p>
        </div>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); setFormData(defaultForm); }}
          className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Add New Competitor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        <div className="glass-card p-4 flex gap-4 bg-primary-500/5 border-primary-500/10">
          <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400 shrink-0">
            <Users size={20} />
          </div>
          <div>
            <h4 className="text-white font-medium text-sm">Add Rivals</h4>
            <p className="text-gray-500 text-xs mt-1">Track competitors across all major platforms.</p>
          </div>
        </div>
        <div className="glass-card p-4 flex gap-4 bg-blue-500/5 border-blue-500/10">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <h4 className="text-white font-medium text-sm">AI Analysis</h4>
            <p className="text-gray-500 text-xs mt-1">Get AI-powered analysis of their content strategy.</p>
          </div>
        </div>
        <div className="glass-card p-4 flex gap-4 bg-purple-500/5 border-purple-500/10">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <BarChart2 size={20} />
          </div>
          <div>
            <h4 className="text-white font-medium text-sm">Gap Analysis</h4>
            <p className="text-gray-500 text-xs mt-1">Discover what competitors do better and close the gaps.</p>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="glass-card p-6 relative z-10 mb-6 border border-primary-500/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">{editingId ? 'Edit Competitor' : 'Add New Competitor'}</h3>
            <button onClick={() => { setShowAddForm(false); setEditingId(null); }} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Competitor Name *</label>
                <input type="text" required placeholder="e.g. ABC Clothing" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Industry</label>
                <input type="text" placeholder="e.g. Fashion, Tech, Food" value={formData.industry} onChange={(e) => setFormData({...formData, industry: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Location</label>
                <input type="text" placeholder="e.g. New York, USA" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Website</label>
                <input type="url" placeholder="https://example.com" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Instagram Profile</label>
                <input type="text" placeholder="@username" value={formData.instagramProfile} onChange={(e) => setFormData({...formData, instagramProfile: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Facebook Page</label>
                <input type="text" placeholder="Page name or URL" value={formData.facebookPage} onChange={(e) => setFormData({...formData, facebookPage: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">LinkedIn Page</label>
                <input type="text" placeholder="Company page URL" value={formData.linkedinPage} onChange={(e) => setFormData({...formData, linkedinPage: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Twitter/X Handle</label>
                <input type="text" placeholder="@handle" value={formData.twitterHandle} onChange={(e) => setFormData({...formData, twitterHandle: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:outline-none focus:border-primary-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Notes</label>
              <textarea rows={2} placeholder="Any additional notes about this competitor..." value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:outline-none focus:border-primary-500 resize-none" />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => { setShowAddForm(false); setEditingId(null); }} className="bg-white/5 text-gray-400 px-5 py-2.5 rounded-lg font-medium hover:bg-white/10 transition-colors">Cancel</button>
              <button type="submit" className="bg-primary-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/20 flex items-center gap-2">
                <Save size={16} /> {editingId ? 'Update' : 'Save Competitor'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-500">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading competitors...</p>
        </div>
      ) : competitors.length === 0 ? (
        <div className="glass-card p-16 text-center relative z-10 flex flex-col items-center border-dashed border-2 border-white/5">
          <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center mb-6 text-primary-400">
            <Target size={32} />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">Identify your competitors</h3>
          <p className="text-gray-400 max-w-sm mx-auto mb-8">Track competitors to get AI-powered content ideas, gap analysis, and strategic recommendations.</p>
          <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 text-primary-400 font-medium hover:text-white transition-colors">
            <Plus size={18} /> Add your first competitor to get started
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {competitors.map(comp => (
            <div key={comp._id} className="glass-card p-6 flex flex-col group hover:border-primary-500/30 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/competitors/${comp._id}`)}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {(comp.name || comp.username || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">{comp.name || comp.username}</h3>
                    {comp.industry && <p className="text-xs text-gray-400">{comp.industry}</p>}
                    {comp.location && <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10} />{comp.location}</p>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(comp)} className="text-gray-500 hover:text-blue-400 p-2 hover:bg-blue-500/10 rounded-lg"><Edit3 size={14} /></button>
                  <button onClick={() => handleDelete(comp._id)} className="text-gray-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {comp.instagramProfile && <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-400">Instagram</span>}
                {comp.linkedinPage && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">LinkedIn</span>}
                {comp.facebookPage && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600/15 text-blue-300">Facebook</span>}
                {comp.twitterHandle && <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400">Twitter</span>}
                {comp.website && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/15 text-gray-400 flex items-center gap-1"><Globe size={10} />Website</span>}
              </div>

              {comp.notes && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{comp.notes}</p>}

              {comp.digitalScore > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-500">Score:</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${comp.digitalScore >= 70 ? 'bg-green-500' : comp.digitalScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${comp.digitalScore}%` }}></div>
                  </div>
                  <span className="text-xs text-white font-medium">{comp.digitalScore}</span>
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-dark-border flex justify-between items-center">
                <span className="text-[10px] text-gray-500">Added {new Date(comp.addedAt).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/competitors/${comp._id}`)} className="text-primary-400 hover:text-white text-xs font-semibold flex items-center gap-1 bg-primary-500/10 px-3 py-1.5 rounded-full transition-all">
                    Details <ExternalLink size={12} />
                  </button>
                  <button onClick={() => handleAnalyze(comp._id)} disabled={analyzing === comp._id} className="text-blue-400 hover:text-white text-xs font-semibold flex items-center gap-1 bg-blue-500/10 px-3 py-1.5 rounded-full transition-all disabled:opacity-50">
                    {analyzing === comp._id ? <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> : <BarChart2 size={12} />}
                    Analyze
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
