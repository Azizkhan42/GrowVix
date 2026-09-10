import Content from '../models/Content.js';
import Competitor from '../models/Competitor.js';
import Post from '../models/Post.js';
import BusinessProfile from '../models/BusinessProfile.js';
import { generateContentWithAI, generateContentIdeas, generateContentCalendar } from '../services/aiService.js';

function generateSmartContent(topic, platform, tone, audience, objective) {
  const toneStyles = {
    Professional: {
      openers: [
        `Here's why ${topic} is reshaping the industry`,
        `${topic}: A deep dive into what matters most`,
        `The future of ${topic} is here, and it's transforming how we work`,
      ],
      closers: [
        `What's your take on this? Share your thoughts below.`,
        `I'd love to hear how this impacts your work. Drop a comment.`,
        `Follow for more insights on ${topic} and beyond.`,
      ],
    },
    Casual: {
      openers: [
        `Okay let's talk about ${topic} for a sec`,
        `So I've been diving into ${topic} lately and WOW`,
        `${topic} is literally everywhere right now and here's why`,
      ],
      closers: [
        `What do you guys think?`,
        `Anyone else obsessed with this?`,
        `Drop a if you agree!`,
      ],
    },
    Funny: {
      openers: [
        `POV: You just discovered ${topic} and now you can't stop talking about it`,
        `Me explaining ${topic} to my friends at dinner:`,
        `If ${topic} was a person, I'd buy them coffee every day`,
      ],
      closers: [
        `Tag someone who needs to see this`,
        `Like if you relate, share if you REALLY relate`,
        `Follow for more takes on ${topic}`,
      ],
    },
    Inspirational: {
      openers: [
        `${topic} isn't just a trend — it's the future we're building together`,
        `Every great journey starts with a single step. ${topic} is that step for many of us`,
        `The world is changing fast. ${topic} is leading the way forward`,
      ],
      closers: [
        `Remember: progress over perfection. Keep pushing forward.`,
        `Your potential is limitless. Embrace ${topic} and watch what happens.`,
        `Share this with someone who needs to hear it today.`,
      ],
    },
    Educational: {
      openers: [
        `Let me break down ${topic} in a way that actually makes sense`,
        `5 things you should know about ${topic}`,
        `${topic} explained simply: Here's everything beginners need to know`,
      ],
      closers: [
        `Save this for later and share with someone who'd find it useful!`,
        `Follow for daily insights on ${topic} and more.`,
        `Questions? Drop them below — I'll answer every single one.`,
      ],
    },
  };

  const platformFormats = {
    linkedin: { maxLength: 700, style: 'professional with line breaks', hashtagCount: 5 },
    twitter: { maxLength: 250, style: 'concise and punchy', hashtagCount: 3 },
    instagram: { maxLength: 500, style: 'engaging with emojis', hashtagCount: 10 },
    facebook: { maxLength: 500, style: 'conversational and community-driven', hashtagCount: 4 },
  };

  const style = toneStyles[tone] || toneStyles.Professional;
  const pf = platformFormats[platform] || platformFormats.linkedin;
  const opener = style.openers[Math.floor(Math.random() * style.openers.length)];
  const closer = style.closers[Math.floor(Math.random() * style.closers.length)];
  const audienceText = audience
    ? `Whether you're a ${audience} or just curious about ${topic}, this is something you can't afford to ignore.`
    : `This is something every professional should be paying attention to right now.`;

  let body = '';
  if (platform === 'linkedin') {
    body = `${opener}.\n\n${audienceText}\n\nHere's the reality:\n\n-> ${topic} is evolving faster than most people realize\n-> Early adopters are already seeing massive results\n-> The gap between those who embrace it and those who don't is widening\n\nThe question isn't whether ${topic} matters — it's whether you're ready to act on it.\n\n${closer}`;
  } else if (platform === 'twitter') {
    body = `${opener}.\n\n${audienceText}\n\n${closer}`;
  } else if (platform === 'instagram') {
    body = `${opener}\n\n${audienceText}\n\nHere's what I've learned so far:\n\n1. ${topic} is changing the game\n2. The opportunities are massive\n3. Now is the time to start\n\n${closer}`;
  } else {
    body = `${opener}.\n\n${audienceText}\n\nI've been exploring ${topic} lately and I'm genuinely impressed by how much potential it has. The more I learn, the more excited I get about what's possible.\n\n${closer}`;
  }

  const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const baseHashtags = topicWords.slice(0, 3).map(w => `#${w.replace(/[^a-zA-Z0-9]/g, '')}`);
  const toneHashtags = {
    Professional: ['#leadership', '#growth', '#strategy', '#innovation', '#business'],
    Casual: ['#vibes', '#trending', '#fyp', '#real', '#lifestyle'],
    Funny: ['#relatable', '#humor', '#memes', '#lol', '#funny'],
    Inspirational: ['#motivation', '#mindset', '#success', '#dreams', '#inspire'],
    Educational: ['#learn', '#education', '#tips', '#howto', '#knowledge'],
  };
  const extraTags = (toneHashtags[tone] || toneHashtags.Professional).slice(0, pf.hashtagCount - baseHashtags.length);
  const hashtags = [...new Set([...baseHashtags, ...extraTags])].slice(0, pf.hashtagCount);

  return {
    variations: [
      { label: 'Professional', caption: body, hashtags, style: 'Professional' },
      { label: 'Storytelling', caption: body.replace(opener, `${topic} changed the way I think about everything.`), hashtags, style: 'Storytelling' },
      { label: 'Educational', caption: `Quick guide on ${topic}:\n\n1. Understand the basics\n2. Apply what you learn\n3. Measure your results\n\n${closer}`, hashtags, style: 'Educational' }
    ],
    engagementScore: {
      overall: 65 + Math.floor(Math.random() * 15),
      hook: 60 + Math.floor(Math.random() * 25),
      value: 60 + Math.floor(Math.random() * 25),
      clarity: 65 + Math.floor(Math.random() * 20),
      emotionalAppeal: 55 + Math.floor(Math.random() * 25),
      cta: 60 + Math.floor(Math.random() * 20),
      audienceRelevance: 65 + Math.floor(Math.random() * 25),
      explanation: 'Content generated with smart fallback. Enable OpenAI API for AI-powered content with higher engagement scores.'
    }
  };
}

export const generateContent = async (req, res) => {
  try {
    const { topic, audience, tone, platform, includeImage, objective } = req.body;

    if (!topic || !platform) {
      return res.status(400).json({ message: 'Please provide topic and platform' });
    }

    let generatedResult = null;

    let competitorInsights = null;
    try {
      const competitors = await Competitor.find({ userId: req.user.id });
      if (competitors.length > 0) {
        const compIds = competitors.map(c => c._id);
        const recentPosts = await Post.find({ competitorId: { $in: compIds } }).sort({ postDate: -1 }).limit(10);
        if (recentPosts.length > 0) {
          competitorInsights = {
            averageEngagement: recentPosts.reduce((s, p) => s + p.engagementRate, 0) / recentPosts.length,
            topContentTypes: [...new Set(recentPosts.map(p => p.contentType))],
            topCategories: [...new Set(recentPosts.map(p => p.contentCategory))],
            themes: recentPosts.slice(0, 5).map(p => (p.caption || '').substring(0, 80))
          };
        }
      }
    } catch (err) {
      console.error('[Content] Competitor context error:', err.message);
    }

    let businessProfile = null;
    try {
      businessProfile = await BusinessProfile.findOne({ userId: req.user.id });
    } catch (err) {
      console.error('[Content] Business profile error:', err.message);
    }

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      try {
        const aiResult = await generateContentWithAI({
          topic,
          platform,
          tone: tone || 'Professional',
          audience,
          objective: objective || 'engagement',
          competitorInsights,
          businessProfile
        });

        if (aiResult && aiResult.variations) {
          generatedResult = aiResult;
        }
      } catch (err) {
        console.error('[Content] AI generation error:', err.message);
      }
    }

    if (!generatedResult) {
      generatedResult = generateSmartContent(topic, platform, tone || 'Professional', audience, objective);
    }

    let imageUrl = '';
    if (includeImage) {
      const seed = Math.floor(Math.random() * 1000000);
      const imagePrompt = encodeURIComponent(`${topic}, ${platform} post, high quality, professional photography`);
      imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=1080&height=1080&nologo=true&seed=${seed}`;
    }

    const selectedVariation = generatedResult.variations?.[0] || { caption: generatedResult.caption || '', hashtags: generatedResult.hashtags || [] };

    const newContent = await Content.create({
      userId: req.user.id,
      platform,
      caption: selectedVariation.caption,
      hashtags: selectedVariation.hashtags || generatedResult.hashtags || [],
      imageUrl,
      contentType: 'post',
      objective: objective || 'engagement',
      tone: tone || 'Professional',
      topic,
      variations: generatedResult.variations || [],
      engagementScore: generatedResult.engagementScore || {
        overall: 0, hook: 0, value: 0, clarity: 0, emotionalAppeal: 0, cta: 0, audienceRelevance: 0, explanation: ''
      },
      status: 'draft'
    });

    res.status(201).json(newContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getContent = async (req, res) => {
  try {
    const contentList = await Content.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(contentList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteContent = async (req, res) => {
  try {
    const content = await Content.findOne({ _id: req.params.id, userId: req.user.id });
    if (!content) return res.status(404).json({ message: 'Content not found' });
    await content.deleteOne();
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getContentIdeas = async (req, res) => {
  try {
    const { platform, category } = req.body;

    let businessProfile = null;
    try {
      businessProfile = await BusinessProfile.findOne({ userId: req.user.id });
    } catch (err) {}

    let competitorData = [];
    try {
      const competitors = await Competitor.find({ userId: req.user.id });
      const compIds = competitors.map(c => c._id);
      const posts = await Post.find({ competitorId: { $in: compIds } }).sort({ postDate: -1 }).limit(20);

      competitorData = competitors.map(comp => {
        const compPosts = posts.filter(p => p.competitorId.toString() === comp._id.toString());
        return {
          name: comp.name || comp.username,
          strengths: compPosts.length > 0
            ? [`Avg engagement: ${(compPosts.reduce((s, p) => s + p.engagementRate, 0) / compPosts.length).toFixed(1)}%`]
            : [],
          themes: compPosts.slice(0, 5).map(p => (p.caption || '').substring(0, 50))
        };
      });
    } catch (err) {}

    let ideas = null;

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      try {
        const aiResult = await generateContentIdeas({
          industry: businessProfile?.industry || 'business',
          competitors: competitorData,
          goals: businessProfile?.goals || ['engagement', 'awareness'],
          platform: platform || 'social media'
        });
        if (aiResult?.ideas) ideas = aiResult;
      } catch (err) {
        console.error('[Content Ideas] AI error:', err.message);
      }
    }

    if (!ideas) {
      ideas = generateFallbackIdeas(platform || 'social media', businessProfile?.industry || 'business');
    }

    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function generateFallbackIdeas(platform, industry) {
  const categories = [
    { type: 'educational', count: 5 },
    { type: 'engagement', count: 5 },
    { type: 'promotional', count: 5 },
    { type: 'storytelling', count: 5 },
    { type: 'authority', count: 5 },
    { type: 'video', count: 5 }
  ];

  const ideas = [];
  const educationalTemplates = [
    { title: `5 ${industry} trends to watch in 2026`, hook: `Most people miss these. Here are 5 ${industry} trends changing everything:`, format: 'carousel', cta: 'Save this for later' },
    { title: `Beginner's guide to ${industry}`, hook: `Everything I wish I knew when I started in ${industry}:`, format: 'thread', cta: 'Follow for more tips' },
    { title: `Common mistakes in ${industry}`, hook: `Stop making these 3 mistakes in ${industry}:`, format: 'reel', cta: 'Share with someone who needs this' },
    { title: `How to get started in ${industry}`, hook: `Step-by-step: How to break into ${industry} in 2026:`, format: 'post', cta: 'Drop a if you found this useful' },
    { title: `${industry} myths debunked`, hook: `Let's bust 3 common ${industry} myths:`, format: 'carousel', cta: 'What myth have you heard?' }
  ];

  const engagementTemplates = [
    { title: `Quick poll for ${industry} professionals`, hook: `What's your biggest challenge in ${industry}?`, format: 'post', cta: 'Vote in comments' },
    { title: `This or that: ${industry} edition`, hook: `Quick fire round: ${industry} edition`, format: 'story', cta: 'Comment your answer' },
    { title: `Unpopular opinion in ${industry}`, hook: `Unpopular opinion: Here's why most ${industry} advice is wrong`, format: 'post', cta: 'Agree or disagree?' },
    { title: `Fill in the blank`, hook: `The best part of working in ${industry} is _____`, format: 'post', cta: 'Fill in the blank below' },
    { title: `Caption this`, hook: `When you finally nail that ${industry} project:`, format: 'post', cta: 'Add your caption' }
  ];

  const promotionalTemplates = [
    { title: `What we do differently in ${industry}`, hook: `Here's what sets us apart in ${industry}:`, format: 'post', cta: 'Learn more at link in bio' },
    { title: `Client spotlight`, hook: `Real results from our ${industry} solutions:`, format: 'carousel', cta: 'Want similar results? DM us' },
    { title: `Behind our process`, hook: `A peek behind the curtain at how we handle ${industry}:`, format: 'reel', cta: 'Ready to get started?' },
    { title: `Results speak louder`, hook: `Numbers don't lie. Here's what we've achieved in ${industry}:`, format: 'carousel', cta: 'Ready for these results?' },
    { title: `Why choose us`, hook: `3 reasons businesses trust us with their ${industry} needs:`, format: 'post', cta: 'Link in bio for a free consultation' }
  ];

  const storytellingTemplates = [
    { title: `Our ${industry} journey`, hook: `We started with nothing but an idea in ${industry}:`, format: 'reel', cta: 'Follow our journey' },
    { title: `A lesson learned the hard way`, hook: `This ${industry} failure taught me everything:`, format: 'post', cta: 'Have you experienced this?' },
    { title: `The moment everything changed`, hook: `There was a moment in our ${industry} journey that changed everything:`, format: 'post', cta: 'Share your turning point' },
    { title: `From idea to reality`, hook: `How a simple ${industry} idea became something real:`, format: 'carousel', cta: 'What idea are you working on?' },
    { title: `The truth about ${industry}`, hook: `Nobody talks about this side of ${industry}:`, format: 'post', cta: 'Tag someone who needs to hear this' }
  ];

  const authorityTemplates = [
    { title: `Industry insights`, hook: `After 10+ years in ${industry}, here's what I know for sure:`, format: 'post', cta: 'Follow for more insights' },
    { title: `Data-driven perspective`, hook: `The data says it all about ${industry}:`, format: 'carousel', cta: 'What does your experience say?' },
    { title: `Expert roundup`, hook: `Top ${industry} experts share their #1 tip:`, format: 'carousel', cta: 'Which tip resonates most?' },
    { title: `Future of ${industry}`, hook: `Here's my prediction for ${industry} in the next 5 years:`, format: 'post', cta: 'What do you predict?' },
    { title: `Deep dive analysis`, hook: `Breaking down the latest ${industry} developments:`, format: 'article', cta: 'Save this analysis' }
  ];

  const videoTemplates = [
    { title: `${industry} tips in 60 seconds`, hook: `Watch this before you start in ${industry}:`, format: 'reel', cta: 'Follow for more quick tips' },
    { title: `Day in the life`, hook: `A day in the life of a ${industry} professional:`, format: 'reel', cta: 'Would you do this job?' },
    { title: `${industry} tutorial`, hook: `How to do this ${industry} technique in 30 seconds:`, format: 'reel', cta: 'Save for later' },
    { title: `Before and after`, hook: `The power of good ${industry} — before vs after:`, format: 'reel', cta: 'Which do you prefer?' },
    { title: `Reaction to ${industry} trends`, hook: `Reacting to the latest ${industry} trends:`, format: 'reel', cta: 'What trend should I react to next?' }
  ];

  const templateMap = {
    educational: educationalTemplates,
    engagement: engagementTemplates,
    promotional: promotionalTemplates,
    storytelling: storytellingTemplates,
    authority: authorityTemplates,
    video: videoTemplates
  };

  categories.forEach(({ type, count }) => {
    const templates = templateMap[type] || educationalTemplates;
    for (let i = 0; i < count; i++) {
      const t = templates[i % templates.length];
      ideas.push({
        title: t.title,
        hook: t.hook,
        format: t.format,
        category: type,
        targetAudience: `${industry} professionals and enthusiasts`,
        objective: type === 'promotional' ? 'promotion' : type === 'engagement' ? 'engagement' : type === 'educational' ? 'education' : type === 'authority' ? 'authority' : type === 'storytelling' ? 'community' : 'engagement',
        cta: t.cta,
        whyItCouldWork: `${type} content performs well for ${industry} audiences on ${platform}`
      });
    }
  });

  return { ideas };
}

export const getContentCalendar = async (req, res) => {
  try {
    const { platform } = req.body;

    let businessProfile = null;
    try {
      businessProfile = await BusinessProfile.findOne({ userId: req.user.id });
    } catch (err) {}

    let competitorInsights = null;
    try {
      const competitors = await Competitor.find({ userId: req.user.id });
      if (competitors.length > 0) {
        const posts = await Post.find({ competitorId: { $in: competitors.map(c => c._id) } }).sort({ postDate: -1 }).limit(15);
        competitorInsights = {
          avgPostsPerWeek: Math.round(posts.length / 2),
          topContentTypes: [...new Set(posts.map(p => p.contentType))],
          engagementRange: `${Math.min(...posts.map(p => p.engagementRate)).toFixed(1)}% - ${Math.max(...posts.map(p => p.engagementRate)).toFixed(1)}%`
        };
      }
    } catch (err) {}

    let contentPerformance = null;
    try {
      const contents = await Content.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20);
      if (contents.length > 0) {
        contentPerformance = {
          totalContent: contents.length,
          platforms: [...new Set(contents.map(c => c.platform))],
          avgEngagementScore: Math.round(contents.reduce((s, c) => s + (c.engagementScore?.overall || 0), 0) / contents.length)
        };
      }
    } catch (err) {}

    let calendar = null;

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      try {
        const aiResult = await generateContentCalendar({
          businessProfile,
          competitorInsights,
          contentPerformance,
          platform: platform || 'multi-platform'
        });
        if (aiResult?.calendar) calendar = aiResult;
      } catch (err) {
        console.error('[Calendar] AI error:', err.message);
      }
    }

    if (!calendar) {
      calendar = generateFallbackCalendar(platform || 'multi-platform', businessProfile);
    }

    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);

    const ContentCalendar = (await import('../models/ContentCalendar.js')).default;
    const saved = await ContentCalendar.create({
      userId: req.user.id,
      weekStarting: monday,
      entries: calendar.calendar
    });

    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function generateFallbackCalendar(platform, businessProfile) {
  const days = [
    { day: 'monday', contentType: 'Educational Carousel', topic: 'Industry tips and insights', hook: '5 things every professional should know about:', format: 'carousel', objective: 'education', cta: 'Save this for later', bestTime: '9:00 AM', reasoning: 'Start the week with value-driven content' },
    { day: 'tuesday', contentType: 'Engagement Post', topic: 'Industry question or poll', hook: 'Quick question for:', format: 'post', objective: 'engagement', cta: 'Drop your answer in the comments', bestTime: '12:00 PM', reasoning: 'Mid-week engagement boost with interactive content' },
    { day: 'wednesday', contentType: 'Behind the Scenes', topic: 'Team or process spotlight', hook: 'Here\'s what really happens behind the scenes:', format: 'reel', objective: 'community', cta: 'Follow for more behind-the-scenes content', bestTime: '2:00 PM', reasoning: 'Build trust and authenticity mid-week' },
    { day: 'thursday', contentType: 'Customer Story', topic: 'Client success or testimonial', hook: 'Real results from real people:', format: 'carousel', objective: 'authority', cta: 'Want similar results? DM us', bestTime: '10:00 AM', reasoning: 'Social proof builds credibility before the weekend' },
    { day: 'friday', contentType: 'Industry Trend', topic: 'Trending topic or news', hook: 'This changes everything in:', format: 'post', objective: 'awareness', cta: 'What do you think about this?', bestTime: '11:00 AM', reasoning: 'Friday engagement with trending topics' },
    { day: 'saturday', contentType: 'Short Video', topic: 'Quick tips or entertainment', hook: 'Watch this before you:', format: 'reel', objective: 'engagement', cta: 'Share with someone who needs this', bestTime: '10:00 AM', reasoning: 'Weekend casual content for wider reach' },
    { day: 'sunday', contentType: 'Inspirational Post', topic: 'Weekly motivation or reflection', hook: 'A reminder for everyone in:', format: 'post', objective: 'community', cta: 'Tag someone who needs to hear this', bestTime: '7:00 PM', reasoning: 'End the week with inspiration for next week' }
  ];

  return { calendar: days };
}
