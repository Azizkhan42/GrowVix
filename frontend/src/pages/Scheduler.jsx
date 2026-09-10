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
    linkedin: { bg: 'bg-blue-900/40', text: 'text-blue-400', label: 'LinkedIn' },
    twitter: { bg: 'bg-sky-500/20', text: 'text-sky-300', label: 'Twitter' },
    instagram: { bg: 'bg-pink-500/20', text: 'text-pink-400', label: 'Instagram' },
    facebook: { bg: 'bg-blue-600/20', text: 'text-blue-300', label: 'Facebook' },
  };

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
            Social Scheduler <CalendarDays className="text-green-400" />
          </h1>
          <p className="text-gray-400">Plan and automate your social media content.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
        >
          <Plus size={18} /> New Post
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12151c] border border-white/10 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-2"><Send size={20} className="text-purple-400" /> Schedule New Post</h2>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Platform</label>
                <select
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter (X)</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Content</label>
                <textarea
                  required
                  rows={4}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write your post content here..."
                  className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  value={form.imageUrl || ''}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Schedule Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={form.scheduledTime}
                  onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                  className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg text-white font-medium bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 transition disabled:opacity-70"
              >
                {submitting ? 'Scheduling...' : 'Schedule Post'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Posts Table */}
      {posts.length === 0 ? (
        <div className="glass-card p-16 text-center relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-500">
            <CalendarDays size={28} />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No scheduled posts yet</h3>
          <p className="text-gray-400 max-w-sm">Click "New Post" to schedule your first social media post.</p>
        </div>
      ) : (
        <div className="glass-card relative z-10 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-white/5 text-xs font-medium text-gray-400 uppercase tracking-wider">
            <div className="col-span-5">Content</div>
            <div className="col-span-2">Platform</div>
            <div className="col-span-3">Scheduled For</div>
            <div className="col-span-2">Actions</div>
          </div>
          <div className="divide-y divide-white/5">
            {posts.map(post => {
              const date = new Date(post.scheduledTime);
              const pf = platformColors[post.platform] || platformColors.linkedin;
              return (
                <div key={post._id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors group">
                  <div className="col-span-5 flex gap-3">
                    {post.imageUrl && (
                      <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden shrink-0 border border-white/10 mt-1">
                        <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-gray-200 text-sm line-clamp-2">{post.content}</p>
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-md capitalize ${pf.bg} ${pf.text}`}>
                      {pf.label}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-1.5 text-sm mb-0.5">
                      {post.status === 'published' ? <><CheckCircle2 size={14} className="text-green-500" /><span className="text-green-400 font-medium">Published</span></> : post.status === 'failed' ? <><X size={14} className="text-red-500" /><span className="text-red-400 font-medium">Failed</span></> : <><Clock size={14} className="text-yellow-500" /><span className="text-yellow-400 font-medium">Pending</span></>}
                      {post.attempts > 0 && post.status !== 'published' && <span className="text-xs text-gray-500">(attempt {post.attempts}/{post.maxAttempts})</span>}
                    </div>
                    <span className="text-xs text-gray-500">{date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {post.status === 'failed' && post.lastError && <p className="text-xs text-red-400/70 mt-0.5 line-clamp-1" title={post.lastError}>{post.lastError}</p>}
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
