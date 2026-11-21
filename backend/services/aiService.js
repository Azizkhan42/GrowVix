import axios from 'axios';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export function isGeminiConfigured() {
  const apiKey = process.env.GEMINI_API_KEY;
  return Boolean(apiKey && apiKey !== 'your_gemini_api_key_here');
}
function parseJsonResponse(text) {
  if (typeof text !== 'string' || !text.trim()) return null;

  const withoutFence = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  const candidates = [withoutFence];
  const firstObject = withoutFence.indexOf('{');
  const firstArray = withoutFence.indexOf('[');
  const starts = [firstObject, firstArray].filter(index => index >= 0);
  if (starts.length > 0) {
    const start = Math.min(...starts);
    const end = Math.max(withoutFence.lastIndexOf('}'), withoutFence.lastIndexOf(']'));
    if (end > start) candidates.push(withoutFence.slice(start, end + 1));
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {}
  }
  return null;
}

export async function callGemini(messages, options = {}) {
  if (!isGeminiConfigured()) return null;

  const configuredModel = options.model || process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const model = configuredModel === 'gemini-2.5-flash' ? 'gemini-3.6-flash' : configuredModel;
  const systemInstruction = messages
    .filter(message => message.role === 'system')
    .map(message => message.content)
    .join('\n');
  const contents = messages
    .filter(message => message.role !== 'system')
    .map(message => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }]
    }));
  const request = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.max_tokens ?? 4000
    }
  };

  if (systemInstruction) {
    request.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const endpoint = `${GEMINI_API_URL}/${encodeURIComponent(model)}:generateContent`;
  const requestOptions = {
    params: { key: process.env.GEMINI_API_KEY },
    headers: { 'Content-Type': 'application/json' },
    timeout: options.timeout || 90000
  };

  try {
    const response = await axios.post(endpoint, request, requestOptions);
    return response.data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('') || null;
  } catch (error) {
    if (error.response?.status === 429) {
      console.error('[AI] Gemini rate limited. Retrying in 2s...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        const retry = await axios.post(endpoint, request, requestOptions);
        return retry.data.candidates?.[0]?.content?.parts
          ?.map(part => part.text || '')
          .join('') || null;
      } catch (retryError) {
        const retryDetails = retryError.response?.data?.error?.message || retryError.message;
        console.error('[AI] Gemini retry failed:', retryDetails);
        return null;
      }
    }

    const details = error.response?.data?.error?.message || error.message;
    console.error('[AI] Gemini error:', details);
    return null;
  }
}

export async function analyzeCompetitorContent(posts, competitorName) {
  const postsSummary = posts.slice(0, 20).map((p, i) => 
    `Post ${i + 1}: "${(p.caption || '').substring(0, 200)}" | Likes: ${p.likes} | Comments: ${p.comments} | Shares: ${p.shares} | Type: ${p.contentType} | Category: ${p.contentCategory}`
  ).join('\n');

  const prompt = `You are a competitive intelligence analyst. Analyze this competitor's social media content.

Competitor: ${competitorName}

Posts analyzed:
${postsSummary}

Provide a JSON analysis with:
{
  "contentDistribution": {
    "educational": <percentage>,
    "promotional": <percentage>,
    "entertainment": <percentage>,
    "social_proof": <percentage>,
    "behind_scenes": <percentage>,
    "engagement": <percentage>
  },
  "topPatterns": [
    {"pattern": "<description>", "impact": "<high/medium/low>", "evidence": "<why>"}
  ],
  "postingPatterns": {
    "averageFrequency": "<posts per week estimate>",
    "bestContentType": "<type>",
    "bestPerformingCategory": "<category>",
    "engagementStyle": "<how they engage audience>"
  },
  "strengths": ["<list of strengths>"],
  "weaknesses": ["<list of weaknesses>"],
  "contentThemes": ["<recurring themes>"],
  "executiveSummary": "<2-3 sentence executive summary>",
  "opportunities": ["<list of opportunities>"],
  "threats": ["<list of threats>"],
  "marketingGaps": [
    {"gap": "<gap description>", "action": "<recommended action>"}
  ],
  "recommendations": ["<recommendation 1>", "<recommendation 2>"],
  "contentIdeas": [
    {"title": "<idea title>", "format": "<format>", "description": "<description>"}
  ],
  "aiSummary": "<2-3 sentence executive summary>"
}

Return ONLY valid JSON. No markdown.`;

  const result = await callGemini([
    { role: 'system', content: 'You are a marketing intelligence analyst. Return only valid JSON.' },
    { role: 'user', content: prompt }
  ], { temperature: 0.5 });

  const parsed = parseJsonResponse(result);
  if (parsed) return parsed;

  if (result) {
    console.error('[AI] Gemini returned invalid JSON:', result.slice(0, 300));
  }
  return null;
}

export async function generateContentWithAI(options) {
  const { topic, platform, tone, audience, objective, competitorInsights, businessProfile } = options;

  const platformStrategies = {
    instagram: 'Focus on visual hooks, emojis, storytelling, and 10 relevant hashtags. Keep captions engaging and under 500 chars. Suggest carousel or reel format when appropriate.',
    linkedin: 'Professional tone, thought leadership, line breaks for readability, 3-5 industry hashtags. Use data-driven insights and personal experiences.',
    twitter: 'Concise, punchy, under 280 chars. Strong hook, no fluff. 2-3 hashtags. Use threads for complex topics.',
    facebook: 'Conversational, community-focused, ask questions to drive comments. Use storytelling. 2-3 hashtags max.'
  };

  const competitorContext = competitorInsights 
    ? `\nCompetitor patterns to consider (do NOT copy, only use for strategic inspiration):\n${JSON.stringify(competitorInsights, null, 2)}`
    : '';

  const businessContext = businessProfile 
    ? `\nBusiness: ${businessProfile.businessName || 'N/A'}\nIndustry: ${businessProfile.industry || 'N/A'}\nTarget: ${businessProfile.targetAudience || 'General audience'}\nBrand Tone: ${businessProfile.brandTone || 'professional'}`
    : '';

  const prompt = `Generate 3 variations of a ${platform} post.

Topic: ${topic}
Platform: ${platform}
Tone: ${tone || 'Professional'}
Audience: ${audience || 'General'}
Objective: ${objective || 'engagement'}
${platformStrategies[platform] || ''}
${competitorContext}
${businessContext}

For EACH variation, provide:
- A unique angle/hook
- The caption text
- Relevant hashtags (platform appropriate)
- Style label (e.g. "Professional", "Storytelling", "Educational", "Emotional", "Viral Short-form")

Also provide an engagement score estimate (0-100) with breakdown:
- hook (0-100)
- value (0-100)
- clarity (0-100)
- emotionalAppeal (0-100)
- cta (0-100)
- audienceRelevance (0-100)
- explanation (string explaining the score)

Return ONLY valid JSON:
{
  "variations": [
    {
      "label": "<style label>",
      "caption": "<post text>",
      "hashtags": ["tag1", "tag2"],
      "style": "<style>"
    }
  ],
  "engagementScore": {
    "overall": <number>,
    "hook": <number>,
    "value": <number>,
    "clarity": <number>,
    "emotionalAppeal": <number>,
    "cta": <number>,
    "audienceRelevance": <number>,
    "explanation": "<explanation>"
  }
}`;

  const result = await callGemini([
    { role: 'system', content: 'You are an expert social media content strategist. Return only valid JSON.' },
    { role: 'user', content: prompt }
  ], { temperature: 0.85, max_tokens: 2500 });

  const parsed = parseJsonResponse(result);
  if (parsed) return parsed;

  if (result) {
    console.error('[AI] Gemini returned invalid JSON:', result.slice(0, 300));
  }
  return null;
}

export async function generateContentIdeas(options) {
  const { industry, competitors, goals, platform } = options;

  const competitorContext = competitors?.length 
    ? `\nCompetitor landscape:\n${competitors.map(c => `- ${c.name}: strengths=${(c.strengths || []).join(', ')}, themes=${(c.themes || []).join(', ')}`).join('\n')}`
    : '';

  const prompt = `Generate 30 content ideas for a ${industry || 'business'} on ${platform || 'social media'}.

Goals: ${goals?.join(', ') || 'engagement, brand awareness, leads'}
${competitorContext}

For each idea provide:
- title (short, catchy)
- hook (first line that grabs attention)
- format (post, reel, carousel, story, thread, video)
- targetAudience (specific segment)
- objective (engagement, awareness, leads, sales, education, community, authority, promotion)
- cta (call to action)
- whyItCouldWork (1 sentence explanation)

Distribute across categories:
- 5 educational posts
- 5 engagement posts
- 5 promotional posts
- 5 storytelling posts
- 5 authority-building posts
- 5 video/reel concepts

Return ONLY valid JSON:
{
  "ideas": [
    {
      "title": "...",
      "hook": "...",
      "format": "...",
      "category": "...",
      "targetAudience": "...",
      "objective": "...",
      "cta": "...",
      "whyItCouldWork": "..."
    }
  ]
}`;

  const result = await callGemini([
    { role: 'system', content: 'You are a content strategy expert. Return only valid JSON.' },
    { role: 'user', content: prompt }
  ], { temperature: 0.9, max_tokens: 3000 });

  const parsed = parseJsonResponse(result);
  if (parsed) return parsed;

  if (result) {
    console.error('[AI] Gemini returned invalid JSON:', result.slice(0, 300));
  }
  return null;
}

export async function generateContentCalendar(options) {
  const { businessProfile, competitorInsights, contentPerformance, platform } = options;

  const prompt = `Create a 7-day content calendar for a ${businessProfile?.industry || 'business'}.

Business: ${businessProfile?.businessName || 'My Business'}
Brand Tone: ${businessProfile?.brandTone || 'professional'}
Target Audience: ${businessProfile?.targetAudience || 'General'}
Platform: ${platform || 'multi-platform'}

${competitorInsights ? `Competitor insights:\n${JSON.stringify(competitorInsights, null, 2)}` : ''}
${contentPerformance ? `Your past performance insights:\n${JSON.stringify(contentPerformance, null, 2)}` : ''}

Create entries for Monday through Sunday. For each day provide:
- day (monday-sunday)
- platform (instagram, linkedin, twitter, facebook)
- contentType (Reel, Carousel, Text Post, Image Post, Story, Thread, Video)
- topic (specific topic for the post)
- hook (attention-grabbing opening line)
- format (description of the content format)
- objective (engagement, awareness, leads, sales, education, community, authority, promotion)
- cta (call to action)
- bestTime (suggested posting time like "9:00 AM" or "2:00 PM")
- reasoning (why this content works for this day)

Vary the content types throughout the week. Include a mix of educational, promotional, engagement, and storytelling content.

Return ONLY valid JSON:
{
  "calendar": [
    {
      "day": "monday",
      "platform": "linkedin",
      "contentType": "Carousel",
      "topic": "...",
      "hook": "...",
      "format": "...",
      "objective": "education",
      "cta": "...",
      "bestTime": "9:00 AM",
      "reasoning": "..."
    }
  ]
}`;

  const result = await callGemini([
    { role: 'system', content: 'You are a social media content strategist. Return only valid JSON.' },
    { role: 'user', content: prompt }
  ], { temperature: 0.8, max_tokens: 3000 });

  const parsed = parseJsonResponse(result);
  if (parsed) return parsed;

  if (result) {
    console.error('[AI] Gemini returned invalid JSON:', result.slice(0, 300));
  }
  return null;
}

export async function generateRecommendations(data) {
  const { digitalScore, competitorGap, contentPerformance, businessProfile } = data;

  const prompt = `Generate strategic recommendations for this business.

Digital Health Score: ${digitalScore?.overall || 0}/100
Dimensions: ${JSON.stringify(digitalScore?.dimensions || {}, null, 2)}

${competitorGap ? `Competitor Gap Analysis:\n${JSON.stringify(competitorGap, null, 2)}` : ''}
${contentPerformance ? `Content Performance:\n${JSON.stringify(contentPerformance, null, 2)}` : ''}
${businessProfile ? `Business: ${businessProfile.businessName}, Industry: ${businessProfile.industry}` : ''}

Generate 5-8 actionable recommendations. Each must have:
- type: "critical", "high", "medium", or "low"
- category: "content", "engagement", "posting", "strategy", "competitor", "profile", or "platform"
- problem: clear statement of the issue
- evidence: specific data or observation supporting this
- recommendation: actionable step to fix it
- expectedBenefit: what they'll gain
- estimatedEffort: "low", "medium", or "high"
- reason: why this matters

Prioritize based on impact and effort. Start with critical issues.

Return ONLY valid JSON:
{
  "recommendations": [
    {
      "type": "critical",
      "category": "...",
      "problem": "...",
      "evidence": "...",
      "recommendation": "...",
      "expectedBenefit": "...",
      "estimatedEffort": "medium",
      "reason": "..."
    }
  ]
}`;

  const result = await callGemini([
    { role: 'system', content: 'You are a digital marketing strategist. Return only valid JSON.' },
    { role: 'user', content: prompt }
  ], { temperature: 0.6, max_tokens: 3000 });

  const parsed = parseJsonResponse(result);
  if (parsed) return parsed;

  if (result) {
    console.error('[AI] Gemini returned invalid JSON:', result.slice(0, 300));
  }
  return null;
}

export async function analyzePostWithAI(post) {
  const prompt = `Analyze this social media post for marketing insights.

Caption: "${(post.caption || '').substring(0, 500)}"
Platform: ${post.platform}
Likes: ${post.likes}
Comments: ${post.comments}
Shares: ${post.shares}
Views: ${post.views || 'N/A'}
Content Type: ${post.contentType}
Content Category: ${post.contentCategory}
Engagement Rate: ${post.engagementRate}%

Provide detailed analysis as JSON:
{
  "strategy": "<marketing strategy used>",
  "whyItWorked": "<why this content performed>",
  "improvementIdea": "<specific improvement suggestion>",
  "contentTypeAssessment": "<evaluation of content type choice>",
  "engagementInsight": "<what engagement metrics reveal>",
  "recommendation": "<what to learn from this post>"
}`;

  const result = await callGemini([
    { role: 'system', content: 'You are a social media analytics expert. Return only valid JSON.' },
    { role: 'user', content: prompt }
  ], { temperature: 0.5 });

  const parsed = parseJsonResponse(result);
  if (parsed) return parsed;

  if (result) {
    console.error('[AI] Gemini returned invalid JSON:', result.slice(0, 300));
  }
  return null;
}

export async function generateGapAnalysis(myData, competitorData) {
  const prompt = `Perform a competitive gap analysis.

MY BUSINESS:
${JSON.stringify(myData, null, 2)}

COMPETITORS:
${JSON.stringify(competitorData, null, 2)}

Identify:
1. What competitors are doing that I'm not
2. Specific areas where I'm underperforming
3. Opportunities I'm missing
4. Concrete actions to close gaps

Return ONLY valid JSON:
{
  "gaps": [
    {
      "area": "<area of gap>",
      "competitorDoing": "<what competitors do>",
      "myStatus": "<what I do>",
      "impact": "<high/medium/low>",
      "action": "<specific action to close gap>",
      "priority": "<critical/high/medium/low>"
    }
  ],
  "advantages": [
    {
      "area": "<where I'm ahead>",
      "evidence": "<data>",
      "recommendation": "<how to maintain/leverage>"
    }
  ],
  "executiveSummary": "<overall competitive position summary>"
}`;

  const result = await callGemini([
    { role: 'system', content: 'You are a competitive strategy analyst. Return only valid JSON.' },
    { role: 'user', content: prompt }
  ], { temperature: 0.5 });

  const parsed = parseJsonResponse(result);
  if (parsed) return parsed;

  if (result) {
    console.error('[AI] Gemini returned invalid JSON:', result.slice(0, 300));
  }
  return null;
}
