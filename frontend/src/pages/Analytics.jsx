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

  const chartTooltipStyle = { backgroundColor: '#1a1d27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            Analytics & Reports <BarChart3 className="text-primary-400" />
          </h1>
          <p className="text-gray-400">Comprehensive analytics and competitive intelligence reports.</p>
        </div>
      </div>

      <div className="flex gap-2 relative z-10 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-primary-600/20 text-white border border-primary-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-white">{overview?.totalCompetitors || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Competitors Tracked</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-white">{overview?.totalPostsAnalyzed || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Posts Analyzed</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-white">{overview?.avgEngagementRate || 0}%</p>
              <p className="text-xs text-gray-400 mt-1">Avg Engagement</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-white">{overview?.contentStats?.total || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Content Created</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {detailed?.engagementOverTime?.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Engagement Over Time</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={detailed.engagementOverTime}>
                      <XAxis dataKey="week" stroke="#6b7280" fontSize={11} tickFormatter={(v) => v.substring(5)} />
                      <YAxis stroke="#6b7280" fontSize={11} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Line type="monotone" dataKey="likes" stroke="#aa3bff" strokeWidth={2} dot={false} name="Likes" />
                      <Line type="monotone" dataKey="comments" stroke="#6366f1" strokeWidth={2} dot={false} name="Comments" />
                      <Line type="monotone" dataKey="shares" stroke="#22d3ee" strokeWidth={2} dot={false} name="Shares" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {detailed?.contentTypePerformance?.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Content Type Performance</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={detailed.contentTypePerformance}>
                      <XAxis dataKey="type" stroke="#6b7280" fontSize={11} />
                      <YAxis stroke="#6b7280" fontSize={11} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Bar dataKey="count" fill="#aa3bff" radius={[4, 4, 0, 0]} name="Posts" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {overview?.contentByPlatform && Object.keys(overview.contentByPlatform).length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Content by Platform</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={Object.entries(overview.contentByPlatform).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                        {Object.keys(overview.contentByPlatform).map((_, i) => (
                          <Cell key={i} fill={['#aa3bff', '#6366f1', '#22d3ee', '#f59e0b'][i % 4]} />
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
                <h3 className="text-lg font-semibold text-white mb-4">Recent Content</h3>
                <div className="space-y-3">
                  {overview.recentContent.map(item => (
                    <div key={item._id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-400 capitalize">{item.platform}</span>
                      <p className="text-sm text-gray-300 flex-1 truncate">{item.caption}</p>
                      <span className="text-xs text-gray-500">{item.engagementScore > 0 ? `${item.engagementScore}/100` : '--'}</span>
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
              <h3 className="text-lg font-semibold text-white mb-2">Digital Health Score</h3>
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-primary-500">
                <div className="text-center">
                  <p className={`text-4xl font-bold ${score.overall >= 70 ? 'text-green-400' : score.overall >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{score.overall}</p>
                  <p className="text-xs text-gray-400">out of 100</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {score.dimensions && Object.entries(score.dimensions).map(([key, val]) => (
                <div key={key} className="text-center p-3 bg-white/5 rounded-xl">
                  <p className={`text-xl font-bold ${val >= 70 ? 'text-green-400' : val >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{val}</p>
                  <p className="text-xs text-gray-400 mt-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                </div>
              ))}
            </div>
          </div>

          {score.breakdown && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(score.breakdown).map(([key, val]) => (
                <div key={key} className="glass-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-white capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                    <span className={`text-lg font-bold ${score.dimensions[key] >= 70 ? 'text-green-400' : score.dimensions[key] >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{score.dimensions[key]}</span>
                  </div>
                  <p className="text-xs text-gray-400">{val.details}</p>
                  <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${score.dimensions[key] >= 70 ? 'bg-green-500' : score.dimensions[key] >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${score.dimensions[key]}%` }}></div>
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
            <h3 className="text-lg font-semibold text-white mb-4">Digital Score Comparison</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'My Business', score: comparison.myBusiness?.digitalScore || 0 },
                  ...(comparison.competitors || []).map(c => ({ name: c.name || 'Competitor', score: c.digitalScore || 0 }))
                ]}>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                  <YAxis stroke="#6b7280" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="score" fill="#aa3bff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparison.myBusiness && (
              <div className="glass-card p-5 border border-primary-500/30">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2"><Target size={16} className="text-primary-400" /> My Business</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Digital Score</span><span className="text-white font-bold">{comparison.myBusiness.digitalScore}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Total Content</span><span className="text-white">{comparison.myBusiness.totalContent}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Platforms</span><span className="text-white">{comparison.myBusiness.platforms?.join(', ') || 'None'}</span></div>
                </div>
              </div>
            )}
            {(comparison.competitors || []).map((comp, i) => (
              <div key={i} className="glass-card p-5">
                <h4 className="text-white font-medium mb-3">{comp.name}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Digital Score</span><span className="text-white font-bold">{comp.digitalScore || 0}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Posts Analyzed</span><span className="text-white">{comp.totalPosts}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Avg Engagement</span><span className="text-white">{comp.avgEngagement}%</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Total Likes</span><span className="text-white">{comp.totalLikes?.toLocaleString()}</span></div>
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
              <h3 className="text-lg font-semibold text-white mb-4">Your Content Performance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={detailed.myContentScores.map((c, i) => ({ name: `Content ${i + 1}`, score: c.score, platform: c.platform }))}>
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                    <YAxis stroke="#6b7280" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="score" fill="#aa3bff" radius={[4, 4, 0, 0]} name="Engagement Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-gray-500">
              <Activity size={32} className="mx-auto mb-3 opacity-30" />
              <p>Generate content to see performance data here.</p>
            </div>
          )}

          {detailed.weeklyGrowth?.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Weekly Growth</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={detailed.weeklyGrowth}>
                    <XAxis dataKey="week" stroke="#6b7280" fontSize={11} tickFormatter={(v) => v.substring(5)} />
                    <YAxis stroke="#6b7280" fontSize={11} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line type="monotone" dataKey="contentCreated" stroke="#aa3bff" strokeWidth={2} dot={{ fill: '#aa3bff' }} name="Content Created" />
                    <Line type="monotone" dataKey="avgEngagementScore" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee' }} name="Avg Score" />
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
