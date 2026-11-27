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
      maxOutputTokens: options.max_tokens ?? 4000,
      thinkingConfig: { thinkingBudget: 0 }
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
    instagram: 'Visual-first hook, emojis, short scannable lines, 8-12 relevant hashtags. Suggest a reel or carousel visual when it fits.',
    linkedin: 'Professional thought-leadership tone, line breaks for readability, 3-5 industry hashtags, no emoji spam.',
    facebook: 'Conversational and community-focused, emoji sparingly, a question that invites comments, 2-3 hashtags.',
    tiktok: 'Very short, spoken-style hook for a video caption, 1-2 lines, 3-5 trending-style hashtags.'
  };

  const competitorContext = competitorInsights
    ? `\nCompetitor patterns to learn from (do NOT copy, and do NOT let these override the topic above):\n${JSON.stringify(competitorInsights, null, 2)}`
    : '';

  const businessContext = businessProfile
    ? `\nBusiness background (supporting detail only, never a replacement for the topic):\nBusiness name: ${businessProfile.businessName || 'N/A'}\nIndustry: ${businessProfile.industry || 'N/A'}\nTarget audience: ${businessProfile.targetAudience || 'N/A'}\nBrand tone: ${businessProfile.brandTone || 'N/A'}`
    : '';

  const prompt = `Write 3 distinct variations of ONE social media post.

=== PRIMARY CONTEXT (highest priority) ===
User request / topic: """${topic}"""

=== POST SETTINGS ===
Platform: ${platform}
Tone: ${tone || 'Professional'}
Target audience: ${audience || 'General audience'}
Marketing objective: ${objective || 'engagement'}
${platformStrategies[platform] || ''}
${competitorContext}
${businessContext}

=== NON-NEGOTIABLE RULES ===
1. The user request above is the single source of truth. Every caption must be about exactly that product, service, business or subject.
2. First work out what the user is actually asking for (for example: sell a product, teach something, build awareness, drive engagement), then write content that serves that intent.
3. NEVER substitute a different, generic or unrelated topic. If the user wants to sell mobile phones, the post is about mobile phones - not students, textbooks, apps, or education.
4. Do not invent a different industry, product or audience than the one in the user request.
5. Match the objective: sales/leads -> persuasive selling copy with a strong call to action; awareness -> brand-focused storytelling; engagement -> questions and conversation starters; education -> informative and actionable.
6. Write specific, concrete copy. No filler that could apply to any business.
7. Respect the platform style and length guidance above.
8. Each variation needs a genuinely different angle, not a reworded duplicate.
9. Include relevant hashtags that relate to the user's topic.
10. Also write an imagePrompt: a detailed text-to-image prompt that visually depicts the exact product, service or subject from the user request, in a clean professional advertising style. It must never depict anything unrelated to the topic.

Return ONLY valid JSON, no markdown, no commentary:
{
  "variations": [
    {
      "label": "<short style label>",
      "caption": "<the post text>",
      "hashtags": ["tag1", "tag2"],
      "style": "<style label>",
      "imagePrompt": "<detailed image prompt matching this caption and the user topic>"
    }
  ],
  "engagementScore": {
    "overall": <0-100>,
    "hook": <0-100>,
    "value": <0-100>,
    "clarity": <0-100>,
    "emotionalAppeal": <0-100>,
    "cta": <0-100>,
    "audienceRelevance": <0-100>,
    "explanation": "<one or two sentences>"
  }
}`;

  const result = await callGemini([
    { role: 'system', content: 'You are an expert social media copywriter. You follow the user topic exactly and never drift to an unrelated subject. You return only valid JSON.' },
    { role: 'user', content: prompt }
  ], { temperature: 0.85, max_tokens: 3000 });

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
- platform (instagram, linkedin, facebook)
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


export async function generateVisualPrompt({ topic, caption, style, format }) {
  if (!isGeminiConfigured() || !topic) return null;

  const prompt = `Convert this social media post topic and caption into a single concrete text-to-image prompt for FLUX.1 Schnell.

Topic: "${topic}"
${caption ? `Post caption excerpt: "${String(caption).slice(0, 300)}"` : ''}
Visual style: ${style || 'Product photography'}
Composition format: ${format || 'square'}

Rules:
- Describe ONLY concrete, physical, real-world visual subjects, environment, lighting, and camera framing that directly match the topic.
- If the topic is abstract (e.g., "advantages and disadvantages", "campaign", "strategy"), translate it into a clear photographic scene of the actual product, place, or activity.
- Never include unrelated objects, cartoon animals/mascot characters, or generic placeholder scenes unless explicitly asked in the topic.
- Do NOT include any text overlays, words, letters, watermarks, or logos in the image.
- Return ONLY the plain-text prompt in 1-2 sentences (max 90 words), no JSON, no quotes, no markdown.`;

  const result = await callGemini(
    [
      {
        role: 'system',
        content:
          'You are an expert commercial photography art director. Return only a concise, concrete visual image generation prompt.',
      },
      { role: 'user', content: prompt },
    ],
    { temperature: 0.4, max_tokens: 180, timeout: 8000 }
  );

  if (!result || typeof result !== 'string') return null;
  const cleaned = result.replace(/^["'`]+|["'`]+$/g, '').trim();
  return cleaned.length >= 15 ? cleaned : null;
}
