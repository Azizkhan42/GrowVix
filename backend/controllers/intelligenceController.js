import { calculateDigitalScore, generateCompetitorComparison, performGapAnalysis } from '../services/scoreService.js';
import { generateRecommendations, generateGapAnalysis } from '../services/aiService.js';
import Recommendation from '../models/Recommendation.js';
import DigitalScore from '../models/DigitalScore.js';
import Competitor from '../models/Competitor.js';
import Post from '../models/Post.js';
import Content from '../models/Content.js';
import BusinessProfile from '../models/BusinessProfile.js';

export const getDigitalScore = async (req, res) => {
  try {
    const score = await calculateDigitalScore(req.user.id);
    res.json(score);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompetitorComparison = async (req, res) => {
  try {
    const comparison = await generateCompetitorComparison(req.user.id);
    res.json(comparison);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGapAnalysis = async (req, res) => {
  try {
    const gapData = await performGapAnalysis(req.user.id);

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      try {
        const aiGaps = await generateGapAnalysis(gapData.myData, gapData.competitorData);
        if (aiGaps) {
          gapData.aiGaps = aiGaps;
        }
      } catch (err) {
        console.error('[Gap Analysis] AI error:', err.message);
      }
    }

    res.json(gapData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const existingRecs = await Recommendation.find({
      userId: req.user.id,
      isDismissed: false
    }).sort({ generatedAt: -1 }).limit(20);

    if (existingRecs.length > 0) {
      return res.json(existingRecs);
    }

    const score = await calculateDigitalScore(req.user.id);
    const gapData = await performGapAnalysis(req.user.id);

    const contents = await Content.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10);
    const contentPerformance = contents.length > 0 ? {
      totalContent: contents.length,
      avgEngagementScore: contents.reduce((s, c) => s + (c.engagementScore?.overall || 0), 0) / contents.length,
      platforms: [...new Set(contents.map(c => c.platform))],
      recentTopics: contents.slice(0, 5).map(c => c.topic || '').filter(Boolean)
    } : null;

    let businessProfile = null;
    try {
      businessProfile = await BusinessProfile.findOne({ userId: req.user.id });
    } catch (err) {}

    let recommendationData = null;

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      try {
        recommendationData = await generateRecommendations({
          digitalScore: { overall: score.overall, dimensions: score.dimensions },
          competitorGap: { gaps: gapData.gaps, advantages: gapData.advantages },
          contentPerformance,
          businessProfile
        });
      } catch (err) {
        console.error('[Recommendations] AI error:', err.message);
      }
    }

    if (!recommendationData || !recommendationData.recommendations) {
      recommendationData = buildFallbackRecommendations(score, gapData, contentPerformance);
    }

    const savedRecs = await Promise.all(
      recommendationData.recommendations.map(rec =>
        Recommendation.create({
          userId: req.user.id,
          type: rec.type || 'medium',
          category: rec.category || 'strategy',
          problem: rec.problem,
          evidence: rec.evidence,
          recommendation: rec.recommendation,
          expectedBenefit: rec.expectedBenefit || '',
          estimatedEffort: rec.estimatedEffort || 'medium',
          reason: rec.reason || ''
        })
      )
    );

    res.json(savedRecs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const dismissRecommendation = async (req, res) => {
  try {
    const rec = await Recommendation.findOne({ _id: req.params.id, userId: req.user.id });
    if (!rec) return res.status(404).json({ message: 'Recommendation not found' });
    rec.isDismissed = true;
    await rec.save();
    res.json({ message: 'Recommendation dismissed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const refreshRecommendations = async (req, res) => {
  try {
    await Recommendation.updateMany(
      { userId: req.user.id },
      { isDismissed: true }
    );

    const score = await calculateDigitalScore(req.user.id);
    const gapData = await performGapAnalysis(req.user.id);
    const contents = await Content.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10);

    const contentPerformance = contents.length > 0 ? {
      totalContent: contents.length,
      avgEngagementScore: contents.reduce((s, c) => s + (c.engagementScore?.overall || 0), 0) / contents.length,
      platforms: [...new Set(contents.map(c => c.platform))]
    } : null;

    let businessProfile = null;
    try {
      businessProfile = await BusinessProfile.findOne({ userId: req.user.id });
    } catch (err) {}

    let recommendationData = null;

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      try {
        recommendationData = await generateRecommendations({
          digitalScore: { overall: score.overall, dimensions: score.dimensions },
          competitorGap: { gaps: gapData.gaps, advantages: gapData.advantages },
          contentPerformance,
          businessProfile
        });
      } catch (err) {
        console.error('[Recommendations Refresh] AI error:', err.message);
      }
    }

    if (!recommendationData || !recommendationData.recommendations) {
      recommendationData = buildFallbackRecommendations(score, gapData, contentPerformance);
    }

    const savedRecs = await Promise.all(
      recommendationData.recommendations.map(rec =>
        Recommendation.create({
          userId: req.user.id,
          type: rec.type || 'medium',
          category: rec.category || 'strategy',
          problem: rec.problem,
          evidence: rec.evidence,
          recommendation: rec.recommendation,
          expectedBenefit: rec.expectedBenefit || '',
          estimatedEffort: rec.estimatedEffort || 'medium',
          reason: rec.reason || ''
        })
      )
    );

    res.json(savedRecs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function buildFallbackRecommendations(score, gapData, contentPerformance) {
  const recs = [];

  if (score.overall < 30) {
    recs.push({
      type: 'critical',
      category: 'profile',
      problem: 'Your digital presence score is very low',
      evidence: `Current score: ${score.overall}/100. This indicates a weak overall digital footprint.`,
      recommendation: 'Start by setting up your business profile and adding at least 3 competitors for benchmarking.',
      expectedBenefit: 'Foundation for all future digital growth strategies.',
      estimatedEffort: 'low',
      reason: 'A solid foundation is essential before any advanced strategies.'
    });
  }

  if (score.dimensions.consistency < 40) {
    recs.push({
      type: 'high',
      category: 'posting',
      problem: 'Low posting consistency',
      evidence: `Consistency score: ${score.dimensions.consistency}/100. ${contentPerformance?.totalContent || 0} content pieces generated.`,
      recommendation: 'Generate a content calendar and commit to posting at least 3 times per week across platforms.',
      expectedBenefit: 'Improved algorithmic reach and audience familiarity.',
      estimatedEffort: 'medium',
      reason: 'Consistency is one of the strongest predictors of social media growth.'
    });
  }

  if (score.dimensions.contentQuality < 50) {
    recs.push({
      type: 'high',
      category: 'content',
      problem: 'Content quality needs improvement',
      evidence: `Content quality score: ${score.dimensions.contentQuality}/100.`,
      recommendation: 'Use the AI content generator with variations to create multiple versions. Compare engagement scores before publishing.',
      expectedBenefit: 'Higher engagement rates and better audience response.',
      estimatedEffort: 'medium',
      reason: 'Quality content compounds over time and builds brand authority.'
    });
  }

  if (score.dimensions.engagement < 40) {
    recs.push({
      type: 'high',
      category: 'engagement',
      problem: 'Low engagement metrics',
      evidence: `Engagement score: ${score.dimensions.engagement}/100. Few competitor posts analyzed.`,
      recommendation: 'Add more competitors and analyze their top-performing content. Apply engagement patterns to your own strategy.',
      expectedBenefit: 'Better understanding of what drives audience interaction.',
      estimatedEffort: 'low',
      reason: 'Engagement data from competitors reveals what your audience responds to.'
    });
  }

  if (gapData.gaps.length > 0) {
    const topGap = gapData.gaps[0];
    recs.push({
      type: 'medium',
      category: 'competitor',
      problem: `Competitor gap: ${topGap.area}`,
      evidence: topGap.competitorDoing,
      recommendation: topGap.action,
      expectedBenefit: 'Close the gap and improve competitive positioning.',
      estimatedEffort: topGap.impact === 'high' ? 'medium' : 'low',
      reason: 'Addressing competitive gaps prevents losing market share.'
    });
  }

  if (score.dimensions.socialMedia < 50) {
    recs.push({
      type: 'medium',
      category: 'platform',
      problem: 'Limited social media presence',
      evidence: `Social media score: ${score.dimensions.socialMedia}/100.`,
      recommendation: 'Connect your social media accounts in Settings > Integrations for real-time publishing and analytics.',
      expectedBenefit: 'Streamlined content publishing and performance tracking.',
      estimatedEffort: 'low',
      reason: 'Connected accounts enable automated scheduling and performance monitoring.'
    });
  }

  recs.push({
    type: 'low',
    category: 'strategy',
    problem: 'No content performance learning loop active',
    evidence: 'Content performance data is not being tracked for AI learning.',
    recommendation: 'After publishing content, update its performance data so the AI can learn what works for your audience.',
    expectedBenefit: 'Continuously improving content recommendations based on your real results.',
    estimatedEffort: 'low',
    reason: 'The learning loop is what transforms static AI into a personalized strategy engine.'
  });

  return { recommendations: recs };
}
