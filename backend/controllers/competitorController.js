import Competitor from '../models/Competitor.js';
import Post from '../models/Post.js';
import CompetitorAnalysis from '../models/CompetitorAnalysis.js';
import { analyzeCompetitorContent } from '../services/aiService.js';
import { fetchInstagramData, fetchWebsiteData, extractUsername } from '../services/apifyService.js';

export const addCompetitor = async (req, res) => {
  try {
    const {
      name,
      industry,
      competitorType,
      location,
      website,
      description,
      businessDescription,
      instagramProfile,
      facebookPage,
      linkedinPage,
      tiktokProfile,
      youtubeChannel,
      twitterHandle,
      logo,
      notes,
      platforms
    } = req.body;

    if (!name || !industry) {
      return res.status(400).json({ message: 'Competitor Name and Industry are required.' });
    }

    // Duplicate detection
    const existing = await Competitor.findOne({
      userId: req.user.id,
      $or: [
        { name: new RegExp(`^${name.trim()}$`, 'i') },
        ...(website ? [{ website: website.trim() }] : [])
      ]
    });

    if (existing) {
      return res.status(409).json({ message: `Competitor "${name}" already exists in your workspace.` });
    }

    const platformsList = platforms || [];
    if (!platformsList.length && instagramProfile) platformsList.push({ platform: 'instagram', username: extractUsername(instagramProfile) });
    if (!platformsList.length && twitterHandle) platformsList.push({ platform: 'twitter', username: twitterHandle });
    if (!platformsList.length && linkedinPage) platformsList.push({ platform: 'linkedin', username: linkedinPage });
    if (!platformsList.length && facebookPage) platformsList.push({ platform: 'facebook', username: facebookPage });
    if (!platformsList.length && tiktokProfile) platformsList.push({ platform: 'tiktok', username: tiktokProfile });
    if (!platformsList.length && youtubeChannel) platformsList.push({ platform: 'youtube', username: youtubeChannel });
    if (!platformsList.length && website) platformsList.push({ platform: 'website', url: website });

    // Validate at least one usable analysis source
    if (!website && !instagramProfile && !facebookPage && !linkedinPage && !tiktokProfile && !youtubeChannel && !twitterHandle) {
      return res.status(400).json({ message: 'Please provide at least one usable analysis source (website or social profile).' });
    }

    const initialStatuses = [];
    if (instagramProfile) initialStatuses.push({ platform: 'instagram', status: 'Connected' });
    if (website) initialStatuses.push({ platform: 'website', status: 'Connected' });
    if (facebookPage) initialStatuses.push({ platform: 'facebook', status: 'Connected' });
    if (linkedinPage) initialStatuses.push({ platform: 'linkedin', status: 'Connected' });
    if (tiktokProfile) initialStatuses.push({ platform: 'tiktok', status: 'Connected' });
    if (youtubeChannel) initialStatuses.push({ platform: 'youtube', status: 'Connected' });
    if (twitterHandle) initialStatuses.push({ platform: 'twitter', status: 'Connected' });

    const competitor = await Competitor.create({
      userId: req.user.id,
      name: name.trim(),
      industry: industry.trim(),
      competitorType: competitorType || 'Direct Competitor',
      location: location || '',
      website: website || '',
      description: description || businessDescription || '',
      businessDescription: businessDescription || description || '',
      instagramProfile: instagramProfile || '',
      facebookPage: facebookPage || '',
      linkedinPage: linkedinPage || '',
      tiktokProfile: tiktokProfile || '',
      youtubeChannel: youtubeChannel || '',
      twitterHandle: twitterHandle || '',
      logo: logo || '',
      notes: notes || '',
      platforms: platformsList,
      platformStatuses: initialStatuses
    });

    res.status(201).json(competitor);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A competitor with this name already exists.' });
    }
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

    const allowedFields = [
      'name', 'industry', 'competitorType', 'location', 'website',
      'description', 'businessDescription', 'instagramProfile', 'facebookPage',
      'linkedinPage', 'tiktokProfile', 'youtubeChannel', 'twitterHandle',
      'logo', 'notes', 'status', 'platforms'
    ];

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
    const competitor = await Competitor.findOne({ _id: req.params.id, userId: req.user.id });
    if (!competitor) return res.status(404).json({ message: 'Competitor not found' });

    await Post.deleteMany({ competitorId: competitor._id });
    await CompetitorAnalysis.deleteMany({ competitorId: competitor._id });
    await competitor.deleteOne();

    res.json({ id: req.params.id, message: 'Competitor deleted successfully' });
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

export const fetchRealData = async (req, res) => {
  try {
    const competitor = await Competitor.findOne({ _id: req.params.id, userId: req.user.id });
    if (!competitor) return res.status(404).json({ message: 'Competitor not found' });

    let postsFetched = 0;
    let newPosts = 0;
    const resultsSummary = { instagram: 'Skipped', website: 'Skipped' };

    // 1. Instagram fetch via Apify
    const instagramHandle = competitor.instagramProfile || competitor.platforms?.find(p => p.platform === 'instagram')?.username;
    if (instagramHandle) {
      const igData = await fetchInstagramData(instagramHandle, 15);
      
      // Update platform status
      updatePlatformStatus(competitor, 'instagram', igData.status || (igData.unavailable ? 'Failed' : 'Completed'), igData.reason, igData.posts?.length || 0);

      if (!igData.unavailable && igData.profile) {
        await Competitor.updateOne(
          { _id: competitor._id },
          {
            'profileData.followers': igData.profile.followers,
            'profileData.following': igData.profile.following,
            'profileData.postCount': igData.profile.postCount,
            'profileData.bio': igData.profile.bio,
            'profileData.profileUrl': igData.profile.profileUrl,
            'profileData.isVerified': igData.profile.isVerified,
            'profileData.lastUpdated': igData.profile.lastUpdated
          }
        );
      }

      if (igData.posts && igData.posts.length > 0) {
        postsFetched += igData.posts.length;
        for (const post of igData.posts) {
          try {
            const exists = await Post.findOne({
              competitorId: competitor._id,
              platform: 'instagram',
              $or: [{ postUrl: post.postUrl }, { externalPostId: post.externalPostId }]
            });
            if (!exists) {
              await Post.create({ competitorId: competitor._id, userId: req.user.id, ...post });
              newPosts++;
            }
          } catch (err) {
            // ignore duplicate key errors on insert
          }
        }
        resultsSummary.instagram = `Success (${igData.posts.length} posts)`;
      } else {
        resultsSummary.instagram = igData.reason || 'No posts found';
      }
    }

    // 2. Website fetch
    if (competitor.website) {
      const webData = await fetchWebsiteData(competitor.website);
      updatePlatformStatus(competitor, 'website', webData.status, webData.reason, webData.posts?.length || 0);

      if (webData.posts && webData.posts.length > 0) {
        for (const post of webData.posts) {
          try {
            const exists = await Post.findOne({
              competitorId: competitor._id,
              platform: 'website',
              postUrl: post.postUrl
            });
            if (!exists) {
              await Post.create({ competitorId: competitor._id, userId: req.user.id, ...post });
              newPosts++;
            }
          } catch (err) {}
        }
        resultsSummary.website = 'Success (Landing Page Analyzed)';
      } else {
        resultsSummary.website = webData.reason || 'Failed';
      }
    }

    competitor.lastAnalyzed = new Date();
    await competitor.save();

    const fresh = await Competitor.findOne({ _id: competitor._id });
    res.json({
      success: true,
      profile: fresh.profileData,
      postsFetched,
      newPosts,
      platformStatuses: fresh.platformStatuses,
      resultsSummary
    });
  } catch (error) {
    console.error('[Competitor Fetch Real Data] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getFetchStatus = async (req, res) => {
  try {
    const competitor = await Competitor.findOne({ _id: req.params.id, userId: req.user.id });
    if (!competitor) return res.status(404).json({ message: 'Competitor not found' });
    res.json({ platformStatuses: competitor.platformStatuses || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const fetchPlatformData = async (req, res) => {
  try {
    const { id, platform } = req.params;
    const competitor = await Competitor.findOne({ _id: id, userId: req.user.id });
    if (!competitor) return res.status(404).json({ message: 'Competitor not found' });

    if (platform === 'instagram') {
      const handle = competitor.instagramProfile;
      if (!handle) return res.status(400).json({ message: 'No Instagram profile configured for this competitor.' });
      const igData = await fetchInstagramData(handle, 15);
      updatePlatformStatus(competitor, 'instagram', igData.status || (igData.unavailable ? 'Failed' : 'Completed'), igData.reason);
      await competitor.save();
      return res.json({ success: true, status: igData.status, reason: igData.reason });
    }

    if (platform === 'website') {
      if (!competitor.website) return res.status(400).json({ message: 'No website configured.' });
      const webData = await fetchWebsiteData(competitor.website);
      updatePlatformStatus(competitor, 'website', webData.status, webData.reason);
      await competitor.save();
      return res.json({ success: true, status: webData.status, reason: webData.reason });
    }

    res.status(400).json({ message: `Platform ${platform} collection not supported or requires manual API auth.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const analyzeCompetitor = async (req, res) => {
  try {
    const competitor = await Competitor.findOne({ _id: req.params.id, userId: req.user.id });
    if (!competitor) return res.status(404).json({ message: 'Competitor not found' });

    const posts = await Post.find({ competitorId: competitor._id }).sort({ postDate: -1 }).limit(25);

    let analysis = null;
    try {
      analysis = await analyzeCompetitorContent(posts, competitor.name);
    } catch (err) {
      console.error('[Competitor Analysis] AI error:', err.message);
    }

    if (!analysis) {
      analysis = buildFallbackAnalysis(posts, competitor);
    }

    const savedAnalysis = await CompetitorAnalysis.create({
      competitorId: competitor._id,
      userId: req.user.id,
      analysisType: 'full_intelligence',
      executiveSummary: analysis.executiveSummary || analysis.aiSummary || '',
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      opportunities: analysis.opportunities || [],
      threats: analysis.threats || [],
      contentStrategy: analysis.contentDistribution || {},
      audienceInsights: analysis.postingPatterns || {},
      marketingGaps: analysis.marketingGaps || [],
      recommendations: analysis.recommendations || [],
      contentIdeas: analysis.contentIdeas || [],
      data: analysis,
      aiSummary: analysis.aiSummary || ''
    });

    const score = calculateBasicScore(posts);
    competitor.lastAnalyzed = new Date();
    competitor.digitalScore = score;
    await competitor.save();

    res.json({ analysis: savedAnalysis, aiSummary: savedAnalysis.aiSummary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompetitorComparison = async (req, res) => {
  try {
    const competitors = await Competitor.find({ userId: req.user.id }).sort({ addedAt: -1 });
    const comparisonData = [];

    for (const comp of competitors) {
      const posts = await Post.find({ competitorId: comp._id });
      const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
      const totalComments = posts.reduce((sum, p) => sum + p.comments, 0);
      const avgEngagement = posts.length > 0
        ? posts.reduce((sum, p) => sum + p.engagementRate, 0) / posts.length
        : 0;

      comparisonData.push({
        id: comp._id,
        name: comp.name,
        industry: comp.industry,
        competitorType: comp.competitorType,
        location: comp.location,
        website: comp.website,
        followers: comp.profileData?.followers || null,
        totalPosts: posts.length,
        totalLikes,
        totalComments,
        avgEngagement: Number(avgEngagement.toFixed(2)),
        digitalScore: comp.digitalScore || 0,
        socialPlatforms: [
          comp.instagramProfile && 'Instagram',
          comp.facebookPage && 'Facebook',
          comp.linkedinPage && 'LinkedIn',
          comp.twitterHandle && 'Twitter',
          comp.tiktokProfile && 'TikTok',
          comp.youtubeChannel && 'YouTube'
        ].filter(Boolean)
      });
    }

    res.json(comparisonData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function updatePlatformStatus(competitor, platform, status, errorMessage = '', records = 0) {
  if (!competitor.platformStatuses) competitor.platformStatuses = [];
  let existing = competitor.platformStatuses.find(p => p.platform === platform);
  if (existing) {
    existing.status = status;
    existing.lastAttemptAt = new Date();
    if (status === 'Completed') {
      existing.lastSuccessfulFetchAt = new Date();
      existing.recordsCollected += records;
    }
    existing.errorMessage = errorMessage;
  } else {
    competitor.platformStatuses.push({
      platform,
      status,
      lastAttemptAt: new Date(),
      lastSuccessfulFetchAt: status === 'Completed' ? new Date() : null,
      recordsCollected: records,
      errorMessage
    });
  }
}

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
    strengths: [`${totalPosts} posts analyzed with ${avgEngagement.toFixed(1)}% average engagement`, 'Active digital presence'],
    weaknesses: avgEngagement < 2 ? ['Below average engagement rate'] : [],
    opportunities: ['Incorporate more video / reel content to boost reach'],
    threats: ['High posting frequency by other competitors'],
    marketingGaps: [{ gap: 'Short-form video', action: 'Produce weekly reels' }],
    recommendations: ['Increase posting consistency', 'Engage more actively in comments'],
    contentIdeas: [{ title: 'Behind the scenes', format: 'Reel', description: 'Showcase team workflow' }],
    aiSummary: `Competitor "${competitor.name}" has ${totalPosts} analyzed posts with ${avgEngagement.toFixed(1)}% average engagement.`
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
