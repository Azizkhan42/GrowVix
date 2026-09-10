import Post from '../models/Post.js';
import Competitor from '../models/Competitor.js';
import CompetitorAnalysis from '../models/CompetitorAnalysis.js';
import AIInsight from '../models/AIInsight.js';
import Content from '../models/Content.js';
import DigitalScore from '../models/DigitalScore.js';
import Recommendation from '../models/Recommendation.js';

export async function calculateDigitalScore(userId) {
  const competitors = await Competitor.find({ userId });
  const posts = await Post.find({ competitorId: { $in: competitors.map(c => c._id) } });
  const contents = await Content.find({ userId });

  const competitorIds = competitors.map(c => c._id);

  const socialMediaScore = calculateSocialMediaScore(competitors);
  const contentQualityScore = calculateContentQualityScore(contents);
  const engagementScore = calculateEngagementScore(posts);
  const consistencyScore = calculateConsistencyScore(contents);
  const competitorPositionScore = calculateCompetitorPositionScore(competitors, posts);
  const brandStrengthScore = calculateBrandStrengthScore(competitors, contents);
  const websiteScore = calculateWebsiteScore(competitors);
  const seoScore = calculateSEOScore(competitors, contents);

  const overall = Math.round(
    (socialMediaScore.score * 0.15) +
    (contentQualityScore.score * 0.15) +
    (engagementScore.score * 0.15) +
    (consistencyScore.score * 0.15) +
    (websiteScore.score * 0.1) +
    (seoScore.score * 0.1) +
    (competitorPositionScore.score * 0.1) +
    (brandStrengthScore.score * 0.1)
  );

  const scoreData = {
    userId,
    overall,
    dimensions: {
      socialMedia: socialMediaScore.score,
      contentQuality: contentQualityScore.score,
      engagement: engagementScore.score,
      consistency: consistencyScore.score,
      website: websiteScore.score,
      seo: seoScore.score,
      competitorPosition: competitorPositionScore.score,
      brandStrength: brandStrengthScore.score
    },
    breakdown: {
      socialMedia: { details: socialMediaScore.details },
      contentQuality: { details: contentQualityScore.details },
      engagement: { details: engagementScore.details },
      consistency: { details: consistencyScore.details },
      website: { details: websiteScore.details },
      seo: { details: seoScore.details },
      competitorPosition: { details: competitorPositionScore.details },
      brandStrength: { details: brandStrengthScore.details }
    }
  };

  const existing = await DigitalScore.findOne({ userId }).sort({ calculatedAt: -1 });
  if (existing) {
    Object.assign(existing, scoreData, { calculatedAt: new Date() });
    await existing.save();
    return existing;
  }
  return await DigitalScore.create(scoreData);
}

function calculateSocialMediaScore(competitors) {
  let score = 0;
  let details = '';

  if (competitors.length === 0) {
    details = 'No competitors tracked yet. Add competitors to benchmark your social media presence.';
    return { score: 0, details };
  }

  const platformsUsed = new Set();
  competitors.forEach(c => {
    if (c.instagramProfile) platformsUsed.add('instagram');
    if (c.linkedinPage) platformsUsed.add('linkedin');
    if (c.facebookPage) platformsUsed.add('facebook');
    if (c.twitterHandle) platformsUsed.add('twitter');
    if (c.platforms?.length) c.platforms.forEach(p => platformsUsed.add(p.platform));
  });

  score = Math.min(100, platformsUsed.size * 25);
  details = `Tracking ${competitors.length} competitor(s) across ${platformsUsed.size} platform(s). ${platformsUsed.size >= 3 ? 'Good multi-platform coverage.' : 'Consider tracking on more platforms.'}`;

  return { score, details };
}

function calculateContentQualityScore(contents) {
  if (contents.length === 0) {
    return { score: 10, details: 'No content generated yet. Start creating content to improve your quality score.' };
  }

  let score = 30;
  const hasVariations = contents.filter(c => c.variations?.length > 0).length;
  const hasEngagementScores = contents.filter(c => c.engagementScore?.overall > 0).length;
  const avgEngagementScore = contents.reduce((sum, c) => sum + (c.engagementScore?.overall || 0), 0) / contents.length;

  if (contents.length >= 5) score += 15;
  if (contents.length >= 20) score += 10;
  if (hasVariations > 0) score += 10;
  if (hasEngagementScores > 0) score += 10;
  if (avgEngagementScore > 60) score += 15;
  if (avgEngagementScore > 80) score += 10;

  const details = `Generated ${contents.length} content pieces. Average engagement potential: ${Math.round(avgEngagementScore)}/100. ${hasVariations > 0 ? 'Using content variations.' : 'Try generating with variations for better results.'}`;

  return { score: Math.min(100, score), details };
}

function calculateEngagementScore(posts) {
  if (posts.length === 0) {
    return { score: 10, details: 'No competitor posts analyzed yet. Add competitors to benchmark engagement.' };
  }

  let score = 20;
  const avgEngagement = posts.reduce((sum, p) => sum + p.engagementRate, 0) / posts.length;
  const totalComments = posts.reduce((sum, p) => sum + p.comments, 0);
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);

  if (posts.length >= 10) score += 10;
  if (posts.length >= 30) score += 10;
  if (totalComments > 100) score += 15;
  if (totalLikes > 1000) score += 15;
  if (avgEngagement > 2) score += 10;
  if (avgEngagement > 5) score += 10;

  const details = `Analyzed ${posts.length} competitor posts. Average engagement rate: ${avgEngagement.toFixed(1)}%. Total likes: ${totalLikes.toLocaleString()}. Total comments: ${totalComments.toLocaleString()}.`;

  return { score: Math.min(100, score), details };
}

function calculateConsistencyScore(contents) {
  if (contents.length < 2) {
    return { score: 5, details: 'Insufficient content history. Generate more content to measure consistency.' };
  }

  let score = 15;
  const sortedDates = contents.map(c => new Date(c.createdAt).getTime()).sort();
  const daySpan = (sortedDates[sortedDates.length - 1] - sortedDates[0]) / (1000 * 60 * 60 * 24);

  const postsPerDay = daySpan > 0 ? contents.length / daySpan : contents.length;
  const postsPerWeek = postsPerDay * 7;

  if (postsPerWeek >= 1) score += 20;
  if (postsPerWeek >= 3) score += 20;
  if (postsPerWeek >= 5) score += 15;
  if (postsPerWeek >= 7) score += 10;

  const details = `Averaging ${postsPerWeek.toFixed(1)} posts per week over ${Math.max(1, Math.round(daySpan))} days. ${postsPerWeek >= 5 ? 'Excellent consistency!' : postsPerWeek >= 3 ? 'Good pace, room to improve.' : 'Increase posting frequency for better results.'}`;

  return { score: Math.min(100, score), details };
}

function calculateCompetitorPositionScore(competitors, posts) {
  if (competitors.length === 0) {
    return { score: 0, details: 'Add competitors to measure your competitive position.' };
  }

  let score = 20;
  const scorePerCompetitor = Math.min(25, 80 / competitors.length);
  score += competitors.length * scorePerCompetitor;

  if (posts.length > 20) score += 10;

  const details = `Tracking ${competitors.length} competitor(s) with ${posts.length} posts analyzed. ${competitors.length >= 3 ? 'Good competitive intelligence coverage.' : 'Add more competitors for better benchmarking.'}`;

  return { score: Math.min(100, score), details };
}

function calculateBrandStrengthScore(competitors, contents) {
  let score = 15;

  if (contents.length >= 5) score += 10;
  if (contents.length >= 20) score += 10;
  if (competitors.length >= 2) score += 15;

  const uniquePlatforms = new Set(contents.map(c => c.platform));
  score += uniquePlatforms.size * 8;

  const details = `Content across ${uniquePlatforms.size} platform(s). ${contents.length} pieces created. ${competitors.length >= 3 ? 'Strong competitive awareness.' : 'Track more competitors to strengthen brand positioning.'}`;

  return { score: Math.min(100, score), details };
}

function calculateWebsiteScore(competitors) {
  const withWebsite = competitors.filter(c => c.website);
  let score = withWebsite.length > 0 ? 30 : 0;
  score += Math.min(30, withWebsite.length * 10);

  const details = withWebsite.length > 0
    ? `${withWebsite.length} competitor website(s) tracked for benchmarking.`
    : 'Add competitor websites to benchmark your web presence.';

  return { score: Math.min(100, score), details };
}

function calculateSEOScore(competitors, contents) {
  let score = 10;

  const withHashtags = contents.filter(c => c.hashtags?.length > 0);
  if (withHashtags.length > 0) score += 20;
  if (withHashtags.length > 5) score += 15;

  const uniqueHashtags = new Set(contents.flatMap(c => c.hashtags || []));
  score += Math.min(25, uniqueHashtags.size * 2);

  const details = `Using ${uniqueHashtags.size} unique hashtags across ${withHashtags.length} content pieces. ${uniqueHashtags.size > 10 ? 'Good hashtag diversity.' : 'Expand hashtag strategy for better discoverability.'}`;

  return { score: Math.min(100, score), details };
}

export async function generateCompetitorComparison(userId) {
  const competitors = await Competitor.find({ userId });
  const competitorIds = competitors.map(c => c._id);
  const posts = await Post.find({ competitorId: { $in: competitorIds } });
  const contents = await Content.find({ userId });

  const myScore = await calculateDigitalScore(userId);

  const competitorScores = await Promise.all(competitors.map(async (comp) => {
    const compPosts = posts.filter(p => p.competitorId.toString() === comp._id.toString());
    const avgEngagement = compPosts.length > 0
      ? compPosts.reduce((sum, p) => sum + p.engagementRate, 0) / compPosts.length
      : 0;
    const totalPosts = compPosts.length;
    const totalLikes = compPosts.reduce((sum, p) => sum + p.likes, 0);
    const totalComments = compPosts.reduce((sum, p) => sum + p.comments, 0);

    const contentTypeBreakdown = {};
    compPosts.forEach(p => {
      contentTypeBreakdown[p.contentType] = (contentTypeBreakdown[p.contentType] || 0) + 1;
    });

    const contentCategoryBreakdown = {};
    compPosts.forEach(p => {
      contentCategoryBreakdown[p.contentCategory] = (contentCategoryBreakdown[p.contentCategory] || 0) + 1;
    });

    return {
      competitorId: comp._id,
      name: comp.name || comp.username,
      platform: comp.platform,
      digitalScore: comp.digitalScore || 0,
      totalPosts,
      avgEngagement: avgEngagement.toFixed(2),
      totalLikes,
      totalComments,
      contentTypeBreakdown,
      contentCategoryBreakdown,
      followers: comp.profileData?.followers || 0
    };
  }));

  const myContentTypes = {};
  const myCategories = {};
  contents.forEach(c => {
    myContentTypes[c.contentType || 'post'] = (myContentTypes[c.contentType || 'post'] || 0) + 1;
    myCategories[c.objective || 'engagement'] = (myCategories[c.objective || 'engagement'] || 0) + 1;
  });

  return {
    myBusiness: {
      name: 'My Business',
      digitalScore: myScore.overall,
      dimensions: myScore.dimensions,
      totalContent: contents.length,
      platforms: [...new Set(contents.map(c => c.platform))],
      contentTypes: myContentTypes,
      categories: myCategories
    },
    competitors: competitorScores
  };
}

export async function performGapAnalysis(userId) {
  const competitors = await Competitor.find({ userId });
  const competitorIds = competitors.map(c => c._id);
  const posts = await Post.find({ competitorId: { $in: competitorIds } });
  const contents = await Content.find({ userId });
  const myScore = await calculateDigitalScore(userId);

  const myData = {
    totalContent: contents.length,
    platforms: [...new Set(contents.map(c => c.platform))],
    contentTypes: contents.reduce((acc, c) => { acc[c.contentType || 'post'] = (acc[c.contentType || 'post'] || 0) + 1; return acc; }, {}),
    avgEngagementPotential: contents.length > 0
      ? contents.reduce((sum, c) => sum + (c.engagementScore?.overall || 0), 0) / contents.length
      : 0,
    dimensions: myScore.dimensions
  };

  const competitorDataList = competitors.map(comp => {
    const compPosts = posts.filter(p => p.competitorId.toString() === comp._id.toString());
    return {
      name: comp.name || comp.username,
      totalPosts: compPosts.length,
      avgEngagement: compPosts.length > 0
        ? compPosts.reduce((sum, p) => sum + p.engagementRate, 0) / compPosts.length
        : 0,
      contentTypes: compPosts.reduce((acc, p) => { acc[p.contentType] = (acc[p.contentType] || 0) + 1; return acc; }, {}),
      categories: compPosts.reduce((acc, p) => { acc[p.contentCategory] = (acc[p.contentCategory] || 0) + 1; return acc; }, {}),
      totalLikes: compPosts.reduce((sum, p) => sum + p.likes, 0),
      totalComments: compPosts.reduce((sum, p) => sum + p.comments, 0),
      followers: comp.profileData?.followers || 0
    };
  });

  const gaps = [];
  const avgCompPosts = competitorDataList.reduce((sum, c) => sum + c.totalPosts, 0) / Math.max(1, competitorDataList.length);
  if (myData.totalContent < avgCompPosts) {
    gaps.push({
      area: 'Content Volume',
      competitorDoing: `Competitors average ${Math.round(avgCompPosts)} posts while you have ${myData.totalContent}`,
      myStatus: `${myData.totalContent} posts created`,
      impact: 'high',
      action: 'Increase content generation to at least match competitor posting frequency',
      priority: 'high'
    });
  }

  const compHasVideo = competitorDataList.some(c => (c.contentTypes.video || 0) + (c.contentTypes.reel || 0) > 2);
  const myVideoCount = (myData.contentTypes.video || 0) + (myData.contentTypes.reel || 0);
  if (compHasVideo && myVideoCount === 0) {
    gaps.push({
      area: 'Video Content',
      competitorDoing: 'Competitors are using video/reels effectively',
      myStatus: 'No video content created',
      impact: 'high',
      action: 'Start creating short-form video content (reels, short videos)',
      priority: 'critical'
    });
  }

  const avgCompEngagement = competitorDataList.reduce((sum, c) => sum + c.avgEngagement, 0) / Math.max(1, competitorDataList.length);
  if (myData.avgEngagementPotential < avgCompEngagement && myData.avgEngagementPotential > 0) {
    gaps.push({
      area: 'Engagement Quality',
      competitorDoing: `Competitors average ${avgCompEngagement.toFixed(1)}% engagement rate`,
      myStatus: `Average engagement potential: ${myData.avgEngagementPotential.toFixed(1)}`,
      impact: 'medium',
      action: 'Focus on creating more engaging content with stronger hooks and CTAs',
      priority: 'medium'
    });
  }

  const myPlatforms = new Set(myData.platforms);
  const allCompPlatforms = new Set();
  competitorDataList.forEach(c => {
    Object.keys(c.contentTypes).forEach(() => allCompPlatforms.add('multi'));
  });
  if (competitorDataList.length > 0 && myPlatforms.size < 2) {
    gaps.push({
      area: 'Multi-Platform Presence',
      competitorDoing: 'Competitors maintain presence across multiple platforms',
      myStatus: `Active on ${myPlatforms.size} platform(s)`,
      impact: 'medium',
      action: 'Expand to at least 2-3 social media platforms',
      priority: 'medium'
    });
  }

  const compCategories = new Set();
  competitorDataList.forEach(c => Object.keys(c.categories).forEach(cat => compCategories.add(cat)));
  const myCategories = new Set(Object.keys(myData.contentTypes));
  if (compCategories.size > myCategories.size) {
    gaps.push({
      area: 'Content Diversity',
      competitorDoing: `Competitors use ${compCategories.size} different content categories`,
      myStatus: `Using ${myCategories.size} content type(s)`,
      impact: 'medium',
      action: 'Diversify content types: educational, storytelling, behind-the-scenes, social proof',
      priority: 'medium'
    });
  }

  const advantages = [];
  if (myData.avgEngagementPotential > avgCompEngagement) {
    advantages.push({
      area: 'Content Quality',
      evidence: `Your engagement potential (${myData.avgEngagementPotential.toFixed(1)}) exceeds competitor average (${avgCompEngagement.toFixed(1)})`,
      recommendation: 'Maintain quality while increasing volume'
    });
  }

  if (myData.totalContent > avgCompPosts) {
    advantages.push({
      area: 'Content Volume',
      evidence: `You have ${myData.totalContent} posts vs competitor average of ${Math.round(avgCompPosts)}`,
      recommendation: 'Leverage your volume by analyzing what performs best and doubling down'
    });
  }

  if (myScore.overall > 60) {
    advantages.push({
      area: 'Overall Digital Presence',
      evidence: `Your digital score of ${myScore.overall}/100 is above average`,
      recommendation: 'Focus on weak dimensions to push toward 80+'
    });
  }

  return { gaps, advantages, myData, competitorData: competitorDataList };
}
