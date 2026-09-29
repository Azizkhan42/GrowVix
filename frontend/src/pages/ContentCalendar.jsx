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
    monday: 'border-blue-400',
    tuesday: 'border-emerald-400',
    wednesday: 'border-violet-400',
    thursday: 'border-orange-400',
    friday: 'border-pink-400',
    saturday: 'border-amber-400',
    sunday: 'border-cyan-400'
  };

  const dayIcons = {
    monday: 'M', tuesday: 'T', wednesday: 'W', thursday: 'T', friday: 'F', saturday: 'S', sunday: 'S'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 flex items-center gap-3">
            Content Calendar <Calendar className="text-violet-500" />
          </h1>
          <p className="text-slate-500">AI-generated weekly content plan tailored to your business.</p>
        </div>
        <button onClick={generateCalendar} disabled={generating} className="gradient-brand text-white px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 justify-center disabled:opacity-50 sm:w-auto w-full hover:opacity-95">
          {generating ? <><Loader2 size={16} className="animate-spin" />Generating...</> : <><Sparkles size={16} />Generate Calendar</>}
        </button>
      </div>

      <div className="flex items-center gap-4 relative z-10 flex-wrap">
        <label className="text-sm text-slate-500">Platform:</label>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="bg-white border border-app-border rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:border-violet-400 text-sm">
          <option value="multi-platform">Multi-Platform</option>
          <option value="instagram">Instagram</option>
          <option value="linkedin">LinkedIn</option>
          <option value="twitter">Twitter/X</option>
          <option value="facebook">Facebook</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !calendar || !calendar.entries || calendar.entries.length === 0 ? (
        <div className="glass-card p-8 md:p-16 text-center relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mb-6 text-violet-500">
            <Calendar size={32} />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900 mb-2">No calendar yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">Generate an AI-powered content calendar based on your business, competitors, and best practices.</p>
          <button onClick={generateCalendar} className="gradient-brand text-white px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 hover:opacity-95">
            <Sparkles size={16} />Generate Your First Calendar
          </button>
        </div>
      ) : (
        <div className="space-y-4 relative z-10">
          {calendar.entries.map((entry, idx) => (
            <div key={idx} className={`glass-card p-5 border-l-4 ${dayColors[entry.day] || 'border-slate-300'}`}>
              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                  entry.day === 'monday' ? 'bg-blue-500' :
                  entry.day === 'tuesday' ? 'bg-emerald-500' :
                  entry.day === 'wednesday' ? 'bg-violet-500' :
                  entry.day === 'thursday' ? 'bg-orange-500' :
                  entry.day === 'friday' ? 'bg-pink-500' :
                  entry.day === 'saturday' ? 'bg-amber-500' : 'bg-cyan-500'
                }`}>
                  {dayIcons[entry.day] || 'D'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-slate-900 font-semibold capitalize">{entry.day}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-violet-50 text-violet-600">{entry.contentType}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize">{entry.platform}</span>
                    {entry.bestTime && <span className="text-xs text-slate-500">{entry.bestTime}</span>}
                  </div>
                  <h4 className="text-slate-900 font-medium mb-1">{entry.topic}</h4>
                  {entry.hook && <p className="text-sm text-slate-600 italic mb-2">Hook: "{entry.hook}"</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    {entry.objective && <span>Objective: <span className="text-slate-700 capitalize">{entry.objective}</span></span>}
                    {entry.format && <span>Format: <span className="text-slate-700">{entry.format}</span></span>}
                    {entry.cta && <span>CTA: <span className="text-slate-700">{entry.cta}</span></span>}
                  </div>
                  {entry.reasoning && <p className="text-xs text-slate-500 mt-2 italic">{entry.reasoning}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
