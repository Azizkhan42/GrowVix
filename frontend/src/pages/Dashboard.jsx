import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  FileText,
  TrendingUp,
  Zap,
  Plus,
  Lightbulb,
  PenTool,
  CalendarDays,
  ListChecks,
  BarChart3,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../services/api';

import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import StatCard from '../components/dashboard/StatCard';
import HealthScoreCard from '../components/dashboard/HealthScoreCard';
import TopPostsCard from '../components/dashboard/TopPostsCard';
import RecommendationsSection from '../components/dashboard/RecommendationsSection';
import QuickActions from '../components/dashboard/QuickActions';

function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard">
      <div className="h-[200px] animate-pulse rounded-2xl bg-slate-200/70" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[150px] animate-pulse rounded-2xl bg-slate-200/70" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="h-[420px] animate-pulse rounded-2xl bg-slate-200/70 lg:col-span-2" />
        <div className="h-[420px] animate-pulse rounded-2xl bg-slate-200/70 lg:col-span-3" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [score, setScore] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchAll = async () => {
      try {
        const [analyticsRes, scoreRes] = await Promise.allSettled([
          api.get('/analytics/overview'),
          api.get('/intelligence/score'),
        ]);

        if (!active) return;
        if (analyticsRes.status === 'fulfilled') setData(analyticsRes.value.data);
        if (scoreRes.status === 'fulfilled') setScore(scoreRes.value.data);

        try {
          const recsRes = await api.get('/intelligence/recommendations');
          if (active && Array.isArray(recsRes.data)) setRecommendations(recsRes.data.slice(0, 3));
        } catch (err) {
          if (active) console.log('No recommendations yet', err);
        }
      } catch (error) {
        if (active) console.error('Failed to fetch dashboard data', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAll();
    return () => { active = false; };
  }, []);

  const addCompetitor = () => navigate('/competitors?add=1');

  const stats = useMemo(() => {
    const overview = data || {};
    const contentStats = overview.contentStats || {};

    return [
      {
        key: 'competitors',
        label: 'Total Competitors',
        value: overview.totalCompetitors ?? 0,
        icon: Users,
        accent: 'violet',
        hint: 'Tracked accounts',
      },
      {
        key: 'posts',
        label: 'Posts Analyzed',
        value: overview.totalPostsAnalyzed ?? 0,
        icon: FileText,
        accent: 'blue',
        hint: 'Across all competitors',
      },
      {
        key: 'engagement',
        label: 'Avg. Engagement Rate',
        value: `${overview.avgEngagementRate ?? 0}%`,
        icon: TrendingUp,
        accent: 'green',
        hint: `${overview.totalLikes ?? 0} likes`,
      },
      {
        key: 'content',
        label: 'Content Pieces',
        value: contentStats.total ?? 0,
        icon: Zap,
        accent: 'orange',
        hint: `${contentStats.scheduled ?? 0} scheduled`,
      },
    ];
  }, [data]);

  const quickActions = useMemo(
    () => [
      { label: 'Add Competitor', icon: Plus, tone: 'violet', onClick: addCompetitor },
      { label: 'Generate Content', icon: PenTool, tone: 'blue', onClick: () => navigate('/content-generator') },
      { label: 'View Insights', icon: Lightbulb, tone: 'cyan', onClick: () => navigate('/insights') },
      { label: 'Content Calendar', icon: CalendarDays, tone: 'green', onClick: () => navigate('/content-calendar') },
      { label: 'Recommendations', icon: ListChecks, tone: 'pink', onClick: () => navigate('/recommendations') },
      { label: 'Analytics', icon: BarChart3, tone: 'orange', onClick: () => navigate('/analytics') },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate]
  );

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <WelcomeBanner name={user?.name || 'User'} onAddCompetitor={addCompetitor} />

      <section aria-label="Key metrics" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.key} {...stat} delay={i * 70} />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <HealthScoreCard score={score} />
        </div>
        <div className="lg:col-span-3">
          <TopPostsCard posts={data?.topPosts} onAddCompetitor={addCompetitor} />
        </div>
      </div>

      <RecommendationsSection recommendations={recommendations} />

      <QuickActions actions={quickActions} />
    </div>
  );
}
