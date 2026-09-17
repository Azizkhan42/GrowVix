import { useState, useEffect } from 'react';
import { Calendar, Loader2, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function ContentCalendar() {
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [platform, setPlatform] = useState('multi-platform');

  useEffect(() => { fetchLastCalendar(); }, []);

  const fetchLastCalendar = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/content/calendar/latest').catch(() => ({ data: null }));
      if (data) setCalendar(data);
    } catch {
      console.log('No existing calendar');
    } finally {
      setLoading(false);
    }
  };

  const generateCalendar = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/content/calendar', { platform });
      setCalendar(data);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const dayColors = {
    monday: 'border-blue-500/30',
    tuesday: 'border-green-500/30',
    wednesday: 'border-purple-500/30',
    thursday: 'border-orange-500/30',
    friday: 'border-pink-500/30',
    saturday: 'border-yellow-500/30',
    sunday: 'border-cyan-500/30'
  };

  const dayIcons = {
    monday: 'M', tuesday: 'T', wednesday: 'W', thursday: 'T', friday: 'F', saturday: 'S', sunday: 'S'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 flex items-center gap-3">
            Content Calendar <Calendar className="text-primary-400" />
          </h1>
          <p className="text-gray-400">AI-generated weekly content plan tailored to your business.</p>
        </div>
        <button onClick={generateCalendar} disabled={generating} className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2 justify-center disabled:opacity-50 sm:w-auto w-full">
          {generating ? <><Loader2 size={16} className="animate-spin" />Generating...</> : <><Sparkles size={16} />Generate Calendar</>}
        </button>
      </div>

      <div className="flex items-center gap-4 relative z-10 flex-wrap">
        <label className="text-sm text-gray-400">Platform:</label>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 text-sm">
          <option value="multi-platform">Multi-Platform</option>
          <option value="instagram">Instagram</option>
          <option value="linkedin">LinkedIn</option>
          <option value="twitter">Twitter/X</option>
          <option value="facebook">Facebook</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !calendar || !calendar.entries || calendar.entries.length === 0 ? (
        <div className="glass-card p-8 md:p-16 text-center relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center mb-6 text-primary-400">
            <Calendar size={32} />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">No calendar yet</h3>
          <p className="text-gray-400 max-w-sm mx-auto mb-6">Generate an AI-powered content calendar based on your business, competitors, and best practices.</p>
          <button onClick={generateCalendar} className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2">
            <Sparkles size={16} />Generate Your First Calendar
          </button>
        </div>
      ) : (
        <div className="space-y-4 relative z-10">
          {calendar.entries.map((entry, idx) => (
            <div key={idx} className={`glass-card p-5 border-l-4 ${dayColors[entry.day] || 'border-gray-500/30'}`}>
              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                  entry.day === 'monday' ? 'bg-blue-500/30' :
                  entry.day === 'tuesday' ? 'bg-green-500/30' :
                  entry.day === 'wednesday' ? 'bg-purple-500/30' :
                  entry.day === 'thursday' ? 'bg-orange-500/30' :
                  entry.day === 'friday' ? 'bg-pink-500/30' :
                  entry.day === 'saturday' ? 'bg-yellow-500/30' : 'bg-cyan-500/30'
                }`}>
                  {dayIcons[entry.day] || 'D'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-white font-semibold capitalize">{entry.day}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-400">{entry.contentType}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 capitalize">{entry.platform}</span>
                    {entry.bestTime && <span className="text-xs text-gray-500">{entry.bestTime}</span>}
                  </div>
                  <h4 className="text-white font-medium mb-1">{entry.topic}</h4>
                  {entry.hook && <p className="text-sm text-gray-300 italic mb-2">Hook: "{entry.hook}"</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    {entry.objective && <span>Objective: <span className="text-gray-300 capitalize">{entry.objective}</span></span>}
                    {entry.format && <span>Format: <span className="text-gray-300">{entry.format}</span></span>}
                    {entry.cta && <span>CTA: <span className="text-gray-300">{entry.cta}</span></span>}
                  </div>
                  {entry.reasoning && <p className="text-xs text-gray-500 mt-2 italic">{entry.reasoning}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
