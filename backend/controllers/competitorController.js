import Competitor from '../models/Competitor.js';
import Post from '../models/Post.js';
import CompetitorAnalysis from '../models/CompetitorAnalysis.js';
import { analyzeCompetitorContent } from '../services/aiService.js';
import { fetchInstagramData } from '../services/apifyService.js';

export const fetchRealData = async (req, res) => {
  try {
    const competitor = await Competitor.findOne({ _id: req.params.id, userId: req.user.id });
    if (!competitor) return res.status(404).json({ message: 'Competitor not found' });

    const instagramHandle = competitor.instagramProfile || competitor.platforms?.find(p => p.platform === 'instagram')?.username;
    if (!instagramHandle) {
      return res.status(400).json({ message: 'This competitor has no Instagram profile. Add an Instagram handle to fetch real data.' });
    }

    const data = await fetchInstagramData(instagramHandle, 15);

    if (data.unavailable) {
      return res.json({ unavailable: true, reason: data.reason, profile: competitor.profileData });
    }

    await Competitor.updateOne(
      { _id: competitor._id },
      {
        'profileData.followers': data.profile.followers,
        'profileData.following': data.profile.following,
        'profileData.postCount': data.profile.postCount,
        'profileData.bio': data.profile.bio,
        'profileData.profileUrl': data.profile.profileUrl,
        'profileData.isVerified': data.profile.isVerified,
        'profileData.lastUpdated': data.profile.lastUpdated,
        lastAnalyzed: new Date()
      }
    );

    let created = 0;
    for (const post of data.posts) {
      const exists = await Post.findOne({
        competitorId: competitor._id,
        platform: 'instagram',
        $or: [{ postUrl: post.postUrl }, { rawId: post.rawId }]
      });
      if (!exists) {
        await Post.create({ competitorId: competitor._id, ...post });
        created++;
      }
    }

    const fresh = await Competitor.findOne({ _id: competitor._id });
    res.json({ success: true, profile: fresh.profileData, postsFetched: data.posts.length, newPosts: created });
  } catch (error) {
    console.error('[Competitor Fetch Real Data] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const addCompetitor = async (req, res) => {
  try {
    const { name, website, facebookPage, instagramProfile, linkedinPage, twitterHandle, industry, location, notes, platforms } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please provide a competitor name' });
    }

    const platformsList = platforms || [];
    if (!platformsList.length && instagramProfile) platformsList.push({ platform: 'instagram', username: instagramProfile });
    if (!platformsList.length && twitterHandle) platformsList.push({ platform: 'twitter', username: twitterHandle });
    if (!platformsList.length && linkedinPage) platformsList.push({ platform: 'linkedin', username: linkedinPage });
    if (!platformsList.length && facebookPage) platformsList.push({ platform: 'facebook', username: facebookPage });

    const competitor = await Competitor.create({
      userId: req.user.id,
      name,
      website: website || '',
      facebookPage: facebookPage || '',
      instagramProfile: instagramProfile || '',
      linkedinPage: linkedinPage || '',
      twitterHandle: twitterHandle || '',
      industry: industry || '',
      location: location || '',
      notes: notes || '',
      platforms: platformsList
    });

    res.status(201).json(competitor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompetitors = async (req, res) => {
  try {
    const competitors = await Competitor.find({ userId: req.user.id }).sort({ addedAt: -1 });
    res.json(competitors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompetitor = async (req, res) => {
  try {
    const competitor = await Competitor.findOne({ _id: req.params.id, userId: req.user.id });
    if (!competitor) return res.status(404).json({ message: 'Competitor not found' });

    const posts = await Post.find({ competitorId: competitor._id }).sort({ postDate: -1 });

    const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
    const totalComments = posts.reduce((sum, p) => sum + p.comments, 0);
    const totalShares = posts.reduce((sum, p) => sum + p.shares, 0);
    const avgEngagement = posts.length > 0
      ? posts.reduce((sum, p) => sum + p.engagementRate, 0) / posts.length
      : 0;

    const contentTypes = {};
    const contentCategories = {};
    posts.forEach(p => {
      contentTypes[p.contentType] = (contentTypes[p.contentType] || 0) + 1;
      contentCategories[p.contentCategory] = (contentCategories[p.contentCategory] || 0) + 1;
    });

    res.json({
      ...competitor.toObject(),
      stats: {
        totalPosts: posts.length,
        totalLikes,
        totalComments,
        totalShares,
        avgEngagement: avgEngagement.toFixed(2),
        contentTypes,
        contentCategories,
        topPost: posts.sort((a, b) => b.engagementRate - a.engagementRate)[0] || null
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCompetitor = async (req, res) => {
  try {
    const competitor = await Competitor.findOne({ _id: req.params.id, userId: req.user.id });
    if (!competitor) return res.status(404).json({ message: 'Competitor not found' });

    const allowedFields = ['name', 'website', 'facebookPage', 'instagramProfile', 'linkedinPage', 'twitterHandle', 'industry', 'location', 'notes', 'platforms'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        competitor[field] = req.body[field];
      }
    });

    await competitor.save();
    res.json(competitor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCompetitor = async (req, res) => {
  try {
    const competitor = await Competitor.findById(req.params.id);
    if (!competitor) return res.status(404).json({ message: 'Competitor not found' });
    if (competitor.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    await Post.deleteMany({ competitorId: competitor._id });
    await CompetitorAnalysis.deleteMany({ competitorId: competitor._id });
    await competitor.deleteOne();

    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompetitorPosts = async (req, res) => {
  try {
    const posts = await Post.find({ competitorId: req.params.competitorId }).sort({ postDate: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const analyzeCompetitor = async (req, res) => {
  try {
    const competitor = await Competitor.findOne({ _id: req.params.id, userId: req.user.id });
    if (!competitor) return res.status(404).json({ message: 'Competitor not found' });

    const posts = await Post.find({ competitorId: competitor._id }).sort({ postDate: -1 }).limit(20);

    if (posts.length === 0) {
      return res.json({
        analysis: {
          contentDistribution: {},
          topPatterns: [],
          postingPatterns: {},
          strengths: ['No post data available for analysis'],
          weaknesses: [],
          contentThemes: [],
          aiSummary: 'No competitor posts available. Add posts or enable data collection to get AI-powered insights.'
        }
      });
    }

    const existingAnalysis = await CompetitorAnalysis.findOne({
      competitorId: competitor._id,
      analysisType: 'content'
    }).sort({ calculatedAt: -1 });

    if (existingAnalysis && (Date.now() - new Date(existingAnalysis.calculatedAt).getTime()) < 3600000) {
      return res.json({ analysis: existingAnalysis.data, aiSummary: existingAnalysis.aiSummary });
    }

    let analysis = null;
    try {
      analysis = await analyzeCompetitorContent(posts, competitor.name || competitor.username);
    } catch (err) {
      console.error('[Competitor Analysis] AI error:', err.message);
    }

    if (!analysis) {
      analysis = buildFallbackAnalysis(posts, competitor);
    }

    await CompetitorAnalysis.create({
      competitorId: competitor._id,
      userId: req.user.id,
      analysisType: 'content',
      data: analysis,
      aiSummary: analysis.aiSummary || ''
    });

    await Competitor.findOneAndUpdate(
      { _id: competitor._id },
      { lastAnalyzed: new Date(), digitalScore: calculateBasicScore(posts) }
    );

    res.json({ analysis, aiSummary: analysis.aiSummary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function buildFallbackAnalysis(posts, competitor) {
  const contentTypes = {};
  const categories = {};

  posts.forEach(p => {
    contentTypes[p.contentType || 'unknown'] = (contentTypes[p.contentType || 'unknown'] || 0) + 1;
    categories[p.contentCategory || 'unknown'] = (categories[p.contentCategory || 'unknown'] || 0) + 1;
  });

  const avgEngagement = posts.length > 0
    ? posts.reduce((sum, p) => sum + p.engagementRate, 0) / posts.length
    : 0;

  const totalPosts = posts.length;
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = posts.reduce((sum, p) => sum + p.comments, 0);

  const distribution = {};
  const total = Object.values(categories).reduce((a, b) => a + b, 0) || 1;
  Object.entries(categories).forEach(([key, val]) => {
    distribution[key] = Math.round((val / total) * 100);
  });

  return {
    contentDistribution: distribution,
    topPatterns: [
      {
        pattern: `Average engagement rate of ${avgEngagement.toFixed(1)}% across ${totalPosts} posts`,
        impact: avgEngagement > 3 ? 'high' : 'medium',
        evidence: `${totalLikes.toLocaleString()} total likes and ${totalComments.toLocaleString()} total comments`
      }
    ],
    postingPatterns: {
      averageFrequency: `${Math.max(1, Math.round(totalPosts / 4))} posts/week`,
      bestContentType: Object.entries(contentTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown',
      bestPerformingCategory: Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown',
      engagementStyle: totalComments > totalLikes * 0.05 ? 'Discussion-driven' : 'Like-driven'
    },
    strengths: [
      `${totalPosts} posts analyzed with ${avgEngagement.toFixed(1)}% average engagement`,
      `Active across ${Object.keys(contentTypes).length} content type(s)`
    ],
    weaknesses: avgEngagement < 2 ? ['Below average engagement rate'] : [],
    contentThemes: Object.keys(categories).filter(c => c !== 'unknown'),
    aiSummary: `Competitor "${competitor.name || competitor.username}" has ${totalPosts} analyzed posts with ${avgEngagement.toFixed(1)}% average engagement. Primary content types: ${Object.keys(contentTypes).join(', ') || 'varied'}.`
  };
}

function calculateBasicScore(posts) {
  if (posts.length === 0) return 0;
  const avgEng = posts.reduce((sum, p) => sum + p.engagementRate, 0) / posts.length;
  let score = Math.min(50, posts.length * 2);
  score += Math.min(30, avgEng * 6);
  const uniqueTypes = new Set(posts.map(p => p.contentType));
  score += uniqueTypes.size * 5;
  return Math.min(100, Math.round(score));
}
