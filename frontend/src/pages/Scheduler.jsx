import { useState, useEffect } from 'react';
import { CalendarDays, Clock, CheckCircle2, Trash2, Plus, X, Send } from 'lucide-react';
import api from '../services/api';

export default function Scheduler() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ platform: 'linkedin', content: '', scheduledTime: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/social/scheduled');
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/social/schedule', form);
      setShowModal(false);
      setForm({ platform: 'linkedin', content: '', scheduledTime: '', imageUrl: '' });
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error scheduling post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this scheduled post?')) return;
    try {
      await api.delete(`/social/scheduled/${id}`);
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const platformColors = {
    linkedin: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'LinkedIn' },
    twitter: { bg: 'bg-sky-50', text: 'text-sky-700', label: 'Twitter' },
    instagram: { bg: 'bg-pink-50', text: 'text-pink-700', label: 'Instagram' },
    facebook: { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Facebook' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderInfo = (post) => {
    const date = new Date(post.scheduledTime);
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {post.status === 'published' ? <><CheckCircle2 size={14} className="text-emerald-500" /><span className="text-emerald-600 font-medium">Published</span></> : post.status === 'failed' ? <><X size={14} className="text-rose-500" /><span className="text-rose-600 font-medium">Failed</span></> : <><Clock size={14} className="text-amber-500" /><span className="text-amber-600 font-medium">Pending</span></>}
        {post.attempts > 0 && post.status !== 'published' && <span className="text-xs text-slate-500">(attempt {post.attempts}/{post.maxAttempts})</span>}
        <span className="text-xs text-slate-500">{date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 flex items-center gap-3">
            Social Scheduler <CalendarDays className="text-emerald-500" />
          </h1>
          <p className="text-slate-500">Plan and automate your social media content.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="gradient-brand text-white px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 justify-center sm:w-auto w-full hover:opacity-95"
        >
          <Plus size={18} /> New Post
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-app-border rounded-2xl w-full max-w-lg p-6 relative shadow-lift max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900">
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold text-slate-900 mb-5 flex items-center gap-2"><Send size={20} className="text-violet-500" /> Schedule New Post</h2>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-500 mb-1">Platform</label>
                <select
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  className="w-full bg-white border border-app-border rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-violet-200 focus:border-violet-300 outline-none transition"
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter (X)</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">Content</label>
                <textarea
                  required
                  rows={4}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write your post content here..."
                  className="w-full bg-white border border-app-border rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-violet-200 focus:border-violet-300 outline-none resize-none transition"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  value={form.imageUrl || ''}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-white border border-app-border rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-violet-200 focus:border-violet-300 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">Schedule Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={form.scheduledTime}
                  onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                  className="w-full bg-white border border-app-border rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-violet-200 focus:border-violet-300 outline-none transition"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="gradient-brand w-full py-3 rounded-lg text-white font-medium transition disabled:opacity-70 hover:opacity-95"
              >
                {submitting ? 'Scheduling...' : 'Schedule Post'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="glass-card p-8 md:p-16 text-center relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
            <CalendarDays size={28} />
          </div>
          <h3 className="text-xl font-medium text-slate-900 mb-2">No scheduled posts yet</h3>
          <p className="text-slate-500 max-w-sm">Click "New Post" to schedule your first social media post.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="glass-card relative z-10 overflow-hidden hidden md:block">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-app-border bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wider">
              <div className="col-span-5">Content</div>
              <div className="col-span-2">Platform</div>
              <div className="col-span-3">Scheduled For</div>
              <div className="col-span-2">Actions</div>
            </div>
            <div className="divide-y divide-app-border">
              {posts.map(post => {
                const pf = platformColors[post.platform] || platformColors.linkedin;
                return (
                  <div key={post._id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors group">
                    <div className="col-span-5 flex gap-3">
                      {post.imageUrl && (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-app-border mt-1">
                          <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <p className="text-slate-700 text-sm line-clamp-2">{post.content}</p>
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-md capitalize ${pf.bg} ${pf.text}`}>
                        {pf.label}
                      </span>
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center gap-1.5 text-sm mb-0.5">
                        {post.status === 'published' ? <><CheckCircle2 size={14} className="text-emerald-500" /><span className="text-emerald-600 font-medium">Published</span></> : post.status === 'failed' ? <><X size={14} className="text-rose-500" /><span className="text-rose-600 font-medium">Failed</span></> : <><Clock size={14} className="text-amber-500" /><span className="text-amber-600 font-medium">Pending</span></>}
                        {post.attempts > 0 && post.status !== 'published' && <span className="text-xs text-slate-500">(attempt {post.attempts}/{post.maxAttempts})</span>}
                      </div>
                      <span className="text-xs text-slate-500">{`${new Date(post.scheduledTime).toLocaleDateString()} at ${new Date(post.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</span>
                      {post.status === 'failed' && post.lastError && <p className="text-xs text-rose-600/80 mt-0.5 line-clamp-1" title={post.lastError}>{post.lastError}</p>}
                    </div>
                    <div className="col-span-2">
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-2 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="space-y-4 md:hidden relative z-10">
            {posts.map(post => {
              const pf = platformColors[post.platform] || platformColors.linkedin;
              return (
                <div key={post._id} className="glass-card p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {post.imageUrl && (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-app-border">
                          <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-md capitalize ${pf.bg} ${pf.text}`}>
                        {pf.label}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 rounded-lg"
                      aria-label="Delete post"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-slate-700 text-sm mb-3">{post.content}</p>
                  {renderInfo(post)}
                  {post.status === 'failed' && post.lastError && <p className="text-xs text-rose-600/80 mt-1 text-wrap" title={post.lastError}>{post.lastError}</p>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}