import AIInsight from '../models/AIInsight.js';
import Post from '../models/Post.js';
import Competitor from '../models/Competitor.js';
import { analyzePostWithAI } from '../services/aiService.js';

export const analyzePost = async (req, res) => {
  try {
    const { postId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingInsight = await AIInsight.findOne({ postId });
    if (existingInsight) {
      try {
        return res.json({
          ...existingInsight.toObject(),
          analysis: JSON.parse(existingInsight.analysis || '{}')
        });
      } catch {
        return res.json(existingInsight);
      }
    }

    let analysisResult = null;

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      try {
        const aiAnalysis = await analyzePostWithAI(post);
        if (aiAnalysis) {
          analysisResult = aiAnalysis;
        }
      } catch (err) {
        console.error('[AI Analysis] OpenAI error:', err.message);
      }
    }

    if (!analysisResult) {
      analysisResult = buildFallbackAnalysis(post);
    }

    const aiInsight = await AIInsight.create({
      postId,
      analysis: JSON.stringify(analysisResult),
      strategy: analysisResult.strategy,
      improvementIdea: analysisResult.improvementIdea
    });

    res.status(201).json({
      ...aiInsight.toObject(),
      analysis: analysisResult
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function buildFallbackAnalysis(post) {
  const totalEngagement = post.likes + post.comments + post.shares;
  let strategy = '';
  let whyItWorked = '';
  let improvementIdea = '';

  if (post.contentCategory === 'educational') {
    strategy = 'Educational content strategy: Providing value through knowledge sharing to build authority and trust.';
    whyItWorked = `Educational content typically generates high saves and shares. This post received ${post.comments} comments suggesting the audience found it valuable.`;
    improvementIdea = 'Add a stronger call-to-action asking readers to share their own experiences or questions.';
  } else if (post.contentCategory === 'promotional') {
    strategy = 'Direct promotional approach: Highlighting product/service benefits to drive conversions.';
    whyItWorked = `Clear value proposition with ${post.likes} likes showing audience interest in the offering.`;
    improvementIdea = 'Balance promotional content with educational posts. Consider adding customer testimonials or use cases.';
  } else if (post.contentCategory === 'engagement') {
    strategy = 'Community engagement strategy: Using interactive content to drive conversations and build relationships.';
    whyItWorked = `The ${post.comments} comments indicate strong audience interaction. Questions and polls drive participation.`;
    improvementIdea = 'Respond to every comment to boost the algorithm and deepen community connection.';
  } else if (post.contentCategory === 'entertainment') {
    strategy = 'Entertainment-first approach: Using humor or storytelling to create shareable content.';
    whyItWorked = `Entertainment content gets shared more widely. ${post.shares} shares show viral potential.`;
    improvementIdea = 'Add a subtle brand message or CTA while keeping the entertainment value.';
  } else if (post.contentCategory === 'social_proof') {
    strategy = 'Social proof strategy: Leveraging customer success and testimonials to build credibility.';
    whyItWorked = `Social proof reduces buying friction. ${post.likes} likes and ${post.comments} comments show trust-building in action.`;
    improvementIdea = 'Include specific metrics or results in testimonials for stronger impact.';
  } else if (post.contentCategory === 'behind_scenes') {
    strategy = 'Authenticity strategy: Showing the human side of the brand to build deeper connections.';
    whyItWorked = `Behind-the-scenes content humanizes the brand. ${totalEngagement} total engagements show audience appreciation for transparency.`;
    improvementIdea = 'Add storytelling elements to make the behind-the-scenes content more compelling.';
  } else {
    strategy = 'Content strategy focused on audience engagement through varied content types.';
    whyItWorked = `The post generated ${totalEngagement} total engagements (${post.likes} likes, ${post.comments} comments, ${post.shares} shares).`;
    improvementIdea = 'Experiment with different content formats and posting times to optimize engagement.';
  }

  if (post.engagementRate > 5) {
    whyItWorked += ` The ${post.engagementRate}% engagement rate is well above average, indicating strong audience resonance.`;
  } else if (post.engagementRate < 1) {
    improvementIdea += ' Consider testing different hook styles and posting times to improve engagement.';
  }

  return {
    strategy,
    whyItWorked,
    improvementIdea,
    contentTypeAssessment: `${post.contentType || 'unknown'} content on ${post.platform}`,
    engagementInsight: `Engagement rate of ${post.engagementRate}% with ${totalEngagement} total interactions`,
    recommendation: post.engagementRate > 3
      ? 'This content type performs well. Create more similar content while maintaining quality.'
      : 'Try adjusting the hook, visual appeal, or call-to-action to improve engagement.'
  };
}
