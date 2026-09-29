import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, Users, Target, Activity } from 'lucide-react';
import api from '../services/api';

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [detailed, setDetailed] = useState(null);
  const [score, setScore] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      const [overviewRes, detailedRes, scoreRes, compRes] = await Promise.allSettled([
        api.get('/analytics/overview'),
        api.get('/analytics/detailed'),
        api.get('/intelligence/score'),
        api.get('/intelligence/comparison')
      ]);
      if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value.data);
      if (detailedRes.status === 'fulfilled') setDetailed(detailedRes.value.data);
      if (scoreRes.status === 'fulfilled') setScore(scoreRes.value.data);
      if (compRes.status === 'fulfilled') setComparison(compRes.value.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'performance', label: 'Content Performance' },
    { id: 'comparison', label: 'Competitor Comparison' },
    { id: 'scores', label: 'Digital Score' }
  ];

  const chartTooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e8eaf2',
    borderRadius: '12px',
    color: '#334155',
    fontSize: '12px',
    boxShadow: '0 8px 24px -12px rgba(16,24,40,0.18)',
  };
  const axis = { stroke: '#cbd5e1', fontSize: 11 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 flex items-center gap-3">
            Analytics & Reports <BarChart3 className="text-violet-500" />
          </h1>
          <p className="text-slate-500">Comprehensive analytics and competitive intelligence reports.</p>
        </div>
      </div>

      <div className="flex gap-2 relative z-10 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-violet-50 text-violet-700'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{overview?.totalCompetitors || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Competitors Tracked</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{overview?.totalPostsAnalyzed || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Posts Analyzed</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{overview?.avgEngagementRate || 0}%</p>
              <p className="text-xs text-slate-500 mt-1">Avg Engagement</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{overview?.contentStats?.total || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Content Created</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {detailed?.engagementOverTime?.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Engagement Over Time</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={detailed.engagementOverTime}>
                      <XAxis dataKey="week" {...axis} tickFormatter={(v) => v.substring(5)} />
                      <YAxis {...axis} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Line type="monotone" dataKey="likes" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Likes" />
                      <Line type="monotone" dataKey="comments" stroke="#6366f1" strokeWidth={2} dot={false} name="Comments" />
                      <Line type="monotone" dataKey="shares" stroke="#06b6d4" strokeWidth={2} dot={false} name="Shares" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {detailed?.contentTypePerformance?.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Content Type Performance</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={detailed.contentTypePerformance}>
                      <XAxis dataKey="type" {...axis} />
                      <YAxis {...axis} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Posts" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {overview?.contentByPlatform && Object.keys(overview.contentByPlatform).length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Content by Platform</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={Object.entries(overview.contentByPlatform).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                        {Object.keys(overview.contentByPlatform).map((_, i) => (
                          <Cell key={i} fill={['#8b5cf6', '#6366f1', '#06b6d4', '#f59e0b'][i % 4]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {overview?.recentContent?.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Content</h3>
                <div className="space-y-3">
                  {overview.recentContent.map(item => (
                    <div key={item._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <span className="rounded-md bg-violet-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-violet-600">{item.platform}</span>
                      <p className="text-sm text-slate-600 flex-1 truncate">{item.caption}</p>
                      <span className="text-xs text-slate-500">{item.engagementScore > 0 ? `${item.engagementScore}/100` : '--'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'scores' && score && (
        <div className="space-y-6 relative z-10">
          <div className="glass-card p-8">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Digital Health Score</h3>
              <div className="inline-flex h-32 w-32 items-center justify-center rounded-full border-4 border-violet-400">
                <div className="text-center">
                  <p className={`text-4xl font-bold ${score.overall >= 70 ? 'text-emerald-600' : score.overall >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>{score.overall}</p>
                  <p className="text-xs text-slate-500">out of 100</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {score.dimensions && Object.entries(score.dimensions).map(([key, val]) => (
                <div key={key} className="text-center p-3 bg-slate-50 rounded-xl">
                  <p className={`text-xl font-bold ${val >= 70 ? 'text-emerald-600' : val >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>{val}</p>
                  <p className="text-xs text-slate-500 mt-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                </div>
              ))}
            </div>
          </div>

          {score.breakdown && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(score.breakdown).map(([key, val]) => (
                <div key={key} className="glass-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-slate-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                    <span className={`text-lg font-bold ${score.dimensions[key] >= 70 ? 'text-emerald-600' : score.dimensions[key] >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>{score.dimensions[key]}</span>
                  </div>
                  <p className="text-xs text-slate-500">{val.details}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${score.dimensions[key] >= 70 ? 'bg-emerald-500' : score.dimensions[key] >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${score.dimensions[key]}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'comparison' && comparison && (
        <div className="space-y-6 relative z-10">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Digital Score Comparison</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'My Business', score: comparison.myBusiness?.digitalScore || 0 },
                  ...(comparison.competitors || []).map(c => ({ name: c.name || 'Competitor', score: c.digitalScore || 0 }))
                ]}>
                  <XAxis dataKey="name" {...axis} />
                  <YAxis {...axis} domain={[0, 100]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="score" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparison.myBusiness && (
              <div className="glass-card border border-violet-200 p-5">
                <h4 className="text-slate-900 font-medium mb-3 flex items-center gap-2"><Target size={16} className="text-violet-500" /> My Business</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Digital Score</span><span className="text-slate-900 font-bold">{comparison.myBusiness.digitalScore}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Total Content</span><span className="text-slate-900">{comparison.myBusiness.totalContent}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Platforms</span><span className="text-slate-900">{comparison.myBusiness.platforms?.join(', ') || 'None'}</span></div>
                </div>
              </div>
            )}
            {(comparison.competitors || []).map((comp, i) => (
              <div key={i} className="glass-card p-5">
                <h4 className="text-slate-900 font-medium mb-3">{comp.name}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Digital Score</span><span className="text-slate-900 font-bold">{comp.digitalScore || 0}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Posts Analyzed</span><span className="text-slate-900">{comp.totalPosts}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Avg Engagement</span><span className="text-slate-900">{comp.avgEngagement}%</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Total Likes</span><span className="text-slate-900">{comp.totalLikes?.toLocaleString()}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'performance' && detailed && (
        <div className="space-y-6 relative z-10">
          {detailed.myContentScores?.length > 0 ? (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Content Performance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={detailed.myContentScores.map((c, i) => ({ name: `Content ${i + 1}`, score: c.score, platform: c.platform }))}>
                    <XAxis dataKey="name" {...axis} />
                    <YAxis {...axis} domain={[0, 100]} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="score" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Engagement Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-slate-500">
              <Activity size={32} className="mx-auto mb-3 opacity-30" />
              <p>Generate content to see performance data here.</p>
            </div>
          )}

          {detailed.weeklyGrowth?.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Weekly Growth</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={detailed.weeklyGrowth}>
                    <XAxis dataKey="week" {...axis} tickFormatter={(v) => v.substring(5)} />
                    <YAxis {...axis} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line type="monotone" dataKey="contentCreated" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} name="Content Created" />
                    <Line type="monotone" dataKey="avgEngagementScore" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4' }} name="Avg Score" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
