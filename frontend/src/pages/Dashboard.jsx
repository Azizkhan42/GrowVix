import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, FileText, Zap, Plus, ArrowUpRight, Target, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [score, setScore] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [analyticsRes, scoreRes] = await Promise.allSettled([
          api.get('/analytics/overview'),
          api.get('/intelligence/score')
        ]);
        if (analyticsRes.status === 'fulfilled') setData(analyticsRes.value.data);
        if (scoreRes.status === 'fulfilled') setScore(scoreRes.value.data);

        try {
          const recsRes = await api.get('/intelligence/recommendations');
          setRecommendations(recsRes.data.slice(0, 3));
        } catch (err) {
          console.log('No recommendations yet', err);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const chartData = data?.topPosts?.map((post, i) => ({
    name: `Post ${i + 1}`,
    engagement: post.engagementRate
  })) || [];

  const platformData = (() => {
    const breakdown = data?.platformBreakdown || {};
    const colors = { instagram: '#E1306C', twitter: '#1DA1F2', linkedin: '#0A66C2', facebook: '#1877F2' };
    return Object.entries(breakdown).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: colors[name] || '#666'
    }));
  })();

  const quickActions = [
    { label: 'Add Competitor', icon: Users, path: '/competitors', color: 'from-purple-600 to-purple-500' },
    { label: 'Generate Content', icon: Zap, path: '/content-generator', color: 'from-blue-600 to-blue-500' },
    { label: 'View Insights', icon: TrendingUp, path: '/insights', color: 'from-green-600 to-green-500' },
    { label: 'Content Calendar', icon: FileText, path: '/content-calendar', color: 'from-orange-600 to-orange-500' },
    { label: 'Recommendations', icon: Target, path: '/recommendations', color: 'from-pink-600 to-pink-500' },
    { label: 'Analytics', icon: Activity, path: '/analytics', color: 'from-cyan-600 to-cyan-500' },
  ];

  const getScoreColor = (s) => {
    if (s >= 70) return 'text-green-400';
    if (s >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreRing = (s) => {
    if (s >= 70) return 'border-green-500';
    if (s >= 40) return 'border-yellow-500';
    return 'border-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user?.name?.split(' ')[0] || 'User'}. Here's your digital intelligence overview.</p>
        </div>
        <button
          onClick={() => navigate('/competitors')}
          className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
        >
          <Plus size={18} /> Add Competitor
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
        <div className="glass-card p-5 hover:border-purple-500/30 transition-colors group">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Users size={20} />
            </div>
            <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full font-medium">Active</span>
          </div>
          <p className="text-3xl font-bold text-white">{data?.totalCompetitors || 0}</p>
          <p className="text-sm text-gray-400 mt-1">Total Competitors</p>
        </div>

        <div className="glass-card p-5 hover:border-blue-500/30 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <FileText size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{data?.totalPostsAnalyzed || 0}</p>
          <p className="text-sm text-gray-400 mt-1">Posts Analyzed</p>
        </div>

        <div className="glass-card p-5 hover:border-green-500/30 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/15 text-green-400 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{data?.avgEngagementRate || 0}%</p>
          <p className="text-sm text-gray-400 mt-1">Avg. Engagement Rate</p>
        </div>

        <div className="glass-card p-5 hover:border-orange-500/30 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center">
              <Zap size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{data?.contentStats?.total || 0}</p>
          <p className="text-sm text-gray-400 mt-1">Content Pieces</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {score && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Digital Health Score</h3>
            <div className="flex items-center justify-center mb-4">
              <div className={`w-32 h-32 rounded-full border-4 ${getScoreRing(score.overall)} flex items-center justify-center`}>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${getScoreColor(score.overall)}`}>{score.overall}</p>
                  <p className="text-xs text-gray-400">out of 100</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {score.dimensions && Object.entries(score.dimensions).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${val >= 70 ? 'bg-green-500' : val >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${val}%` }}></div>
                    </div>
                    <span className="text-white font-medium w-8 text-right">{val}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/analytics')} className="w-full mt-4 text-center text-purple-400 hover:text-purple-300 text-sm font-medium">
              View Full Analysis
            </button>
          </div>
        )}

        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Top Performing Posts</h3>
            <button onClick={() => navigate('/insights')} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">View All <ArrowUpRight size={14} /></button>
          </div>
          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#c084fc' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="engagement" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#aa3bff" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500">
              <FileText size={32} className="mb-3 opacity-30" />
              <p className="text-sm">Add competitors and analyze their posts to see engagement data.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {platformData.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Platform Distribution</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={platformData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                    {platformData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {platformData.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                    <span className="text-gray-300">{p.name}</span>
                  </div>
                  <span className="text-gray-400">{p.value} competitor(s)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Key Recommendations</h3>
              <button onClick={() => navigate('/recommendations')} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">View All <ArrowUpRight size={14} /></button>
            </div>
            <div className="space-y-3">
              {recommendations.map(rec => (
                <div key={rec._id} className={`p-4 rounded-xl border ${
                  rec.type === 'critical' ? 'bg-red-500/5 border-red-500/20' :
                  rec.type === 'high' ? 'bg-orange-500/5 border-orange-500/20' :
                  'bg-blue-500/5 border-blue-500/20'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${rec.type === 'critical' ? 'text-red-400' : rec.type === 'high' ? 'text-orange-400' : 'text-blue-400'}`}>
                      {rec.type === 'critical' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          rec.type === 'critical' ? 'bg-red-500/20 text-red-400' :
                          rec.type === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>{rec.type}</span>
                        <span className="text-xs text-gray-500 capitalize">{rec.category}</span>
                      </div>
                      <p className="text-sm text-white font-medium">{rec.problem}</p>
                      <p className="text-xs text-gray-400 mt-1">{rec.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="glass-card p-5 text-left hover:border-purple-500/30 transition-all group"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon size={20} />
                </div>
                <p className="text-white font-medium text-sm">{action.label}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
