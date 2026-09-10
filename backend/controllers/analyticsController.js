import Competitor from '../models/Competitor.js';
import Post from '../models/Post.js';
import AIInsight from '../models/AIInsight.js';
import Content from '../models/Content.js';
import SocialAccount from '../models/SocialAccount.js';
import ScheduledPost from '../models/ScheduledPost.js';

export const getOverview = async (req, res) => {
  try {
    const competitors = await Competitor.find({ userId: req.user.id });
    const competitorIds = competitors.map(c => c._id);
    const posts = await Post.find({ competitorId: { $in: competitorIds } });
    const contents = await Content.find({ userId: req.user.id });
    const scheduledPosts = await ScheduledPost.find({ userId: req.user.id });
    const socialAccounts = await SocialAccount.find({ userId: req.user.id });

    const totalPostsAnalyzed = posts.length;
    let totalEngagement = 0;
    posts.forEach(p => { totalEngagement += p.engagementRate; });
    const avgEngagementRate = totalPostsAnalyzed > 0
      ? (totalEngagement / totalPostsAnalyzed).toFixed(2)
      : 0;

    const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
    const totalComments = posts.reduce((sum, p) => sum + p.comments, 0);
    const totalShares = posts.reduce((sum, p) => sum + p.shares, 0);

    const platformBreakdown = {};
    competitors.forEach(c => {
      const platforms = c.platforms?.length ? c.platforms.map(p => p.platform) : [c.platform];
      platforms.forEach(p => {
        platformBreakdown[p] = (platformBreakdown[p] || 0) + 1;
      });
    });

    const contentByPlatform = {};
    contents.forEach(c => {
      contentByPlatform[c.platform] = (contentByPlatform[c.platform] || 0) + 1;
    });

    const recentContent = contents.slice(0, 5).map(c => ({
      _id: c._id,
      platform: c.platform,
      caption: (c.caption || '').substring(0, 80),
      engagementScore: c.engagementScore?.overall || 0,
      createdAt: c.createdAt
    }));

    const pendingScheduled = scheduledPosts.filter(s => s.status === 'pending').length;
    const publishedScheduled = scheduledPosts.filter(s => s.status === 'published').length;

    res.json({
      totalCompetitors: competitors.length,
      totalPostsAnalyzed,
      avgEngagementRate,
      totalLikes,
      totalComments,
      totalShares,
      topPosts: posts.sort((a, b) => b.engagementRate - a.engagementRate).slice(0, 5),
      platformBreakdown,
      contentByPlatform,
      recentContent,
      contentStats: {
        total: contents.length,
        drafts: contents.filter(c => c.status === 'draft').length,
        saved: contents.filter(c => c.status === 'saved').length,
        scheduled: pendingScheduled,
        published: publishedScheduled
      },
      connectedPlatforms: socialAccounts.length,
      connectedPlatformNames: socialAccounts.map(a => a.platform)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDetailedAnalytics = async (req, res) => {
  try {
    const competitors = await Competitor.find({ userId: req.user.id });
    const competitorIds = competitors.map(c => c._id);
    const posts = await Post.find({ competitorId: { $in: competitorIds } });
    const contents = await Content.find({ userId: req.user.id });

    const engagementOverTime = buildEngagementTimeline(posts);

    const contentTypePerformance = buildContentTypePerformance(posts);

    const myContentScores = contents
      .filter(c => c.engagementScore?.overall > 0)
      .map(c => ({
        platform: c.platform,
        score: c.engagementScore.overall,
        topic: c.topic,
        createdAt: c.createdAt
      }));

    const weeklyGrowth = buildWeeklyGrowth(contents, posts);

    res.json({
      engagementOverTime,
      contentTypePerformance,
      myContentScores,
      weeklyGrowth,
      summary: {
        totalCompetitors: competitors.length,
        totalAnalyzedPosts: posts.length,
        totalGeneratedContent: contents.length,
        avgEngagementRate: posts.length > 0
          ? (posts.reduce((s, p) => s + p.engagementRate, 0) / posts.length).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function buildEngagementTimeline(posts) {
  const weekly = {};
  posts.forEach(p => {
    if (!p.postDate) return;
    const date = new Date(p.postDate);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = weekStart.toISOString().split('T')[0];

    if (!weekly[key]) {
      weekly[key] = { week: key, likes: 0, comments: 0, shares: 0, count: 0 };
    }
    weekly[key].likes += p.likes;
    weekly[key].comments += p.comments;
    weekly[key].shares += p.shares;
    weekly[key].count += 1;
  });

  return Object.values(weekly).sort((a, b) => a.week.localeCompare(b.week)).slice(-12);
}

function buildContentTypePerformance(posts) {
  const types = {};
  posts.forEach(p => {
    const type = p.contentType || 'unknown';
    if (!types[type]) {
      types[type] = { type, count: 0, totalEngagement: 0, totalLikes: 0, totalComments: 0, avgEngagementRate: 0 };
    }
    types[type].count += 1;
    types[type].totalEngagement += p.likes + p.comments + p.shares;
    types[type].totalLikes += p.likes;
    types[type].totalComments += p.comments;
  });

  return Object.values(types).map(t => ({
    ...t,
    avgEngagementRate: t.count > 0 ? (posts.filter(p => (p.contentType || 'unknown') === t.type).reduce((s, p) => s + p.engagementRate, 0) / t.count).toFixed(2) : 0
  }));
}

function buildWeeklyGrowth(contents, posts) {
  const weekly = {};
  contents.forEach(c => {
    const date = new Date(c.createdAt);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = weekStart.toISOString().split('T')[0];

    if (!weekly[key]) {
      weekly[key] = { week: key, contentCreated: 0, avgEngagementScore: 0, scores: [] };
    }
    weekly[key].contentCreated += 1;
    if (c.engagementScore?.overall > 0) {
      weekly[key].scores.push(c.engagementScore.overall);
    }
  });

  return Object.values(weekly).map(w => ({
    ...w,
    avgEngagementScore: w.scores.length > 0 ? Math.round(w.scores.reduce((a, b) => a + b, 0) / w.scores.length) : 0,
    scores: undefined
  })).sort((a, b) => a.week.localeCompare(b.week)).slice(-12);
}
