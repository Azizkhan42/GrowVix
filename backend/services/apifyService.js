import axios from 'axios';

const APIFY_API = 'https://api.apify.com/v2';
const POLL_INTERVAL = 4000;
const MAX_POLLS = 40;

const INSTAGRAM_ACTOR = 'clockworks/free-instagram-profile-scraper';

function hasApifyToken() {
  return process.env.APIFY_API_TOKEN && process.env.APIFY_API_TOKEN !== 'your_apify_token_here';
}

function extractUsername(input) {
  if (!input) return null;
  const trimmed = input.trim().replace(/\/+$/, '');
  const match = trimmed.match(/(?:instagram\.com\/)([\w.\-]+)/i);
  if (match) return match[1].replace(/\?.*$/, '');
  return trimmed.replace(/^@/, '');
}

async function startActorRun(actorId, input) {
  const { data } = await axios.post(
    `${APIFY_API}/acts/${actorId}/runs`,
    input,
    { params: { token: process.env.APIFY_API_TOKEN } }
  );
  return data.data.id;
}

async function waitForRun(runId) {
  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    const { data } = await axios.get(
      `${APIFY_API}/actor-runs/${runId}`,
      { params: { token: process.env.APIFY_API_TOKEN } }
    );
    const run = data.data;
    if (run.status === 'SUCCEEDED') return run;
    if (['FAILED', 'ABORTED', 'TIMED_OUT'].includes(run.status)) {
      const reason = run.stats?.lastActorRunError?.message || run.status;
      throw new Error(`Apify run ${run.status}: ${reason}`);
    }
  }
  throw new Error('Apify run timed out while polling');
}

async function fetchRunItems(runId) {
  const { data } = await axios.get(
    `${APIFY_API}/actor-runs/${runId}/dataset/items`,
    { params: { token: process.env.APIFY_API_TOKEN } }
  );
  return Array.isArray(data) ? data : [];
}

async function runActorAndGetItems(actorId, input) {
  const runId = await startActorRun(actorId, input);
  await waitForRun(runId);
  return fetchRunItems(runId);
}

export async function fetchInstagramData(username, resultsLimit = 15) {
  if (!hasApifyToken()) {
    return { unavailable: true, reason: 'No Apify API token configured. Add APIFY_API_TOKEN to .env for real competitor data.', status: 'Authentication Required' };
  }

  const clean = extractUsername(username);
  if (!clean) {
    return { unavailable: true, reason: 'No valid Instagram username provided.', status: 'Failed' };
  }

  try {
    const items = await runActorAndGetItems(INSTAGRAM_ACTOR, {
      usernames: [clean],
      resultsLimit
    });

    if (!items.length) {
      return { unavailable: true, reason: 'Apify returned no data for this profile.', status: 'Restricted' };
    }

    const profileItem = items.find(i => i.followersCount !== undefined) || {};
    const posts = items.filter(i => i.caption !== undefined || i.shortCode !== undefined);

    const followers = Number(profileItem.followersCount || 0);
    const profile = {
      followers,
      following: Number(profileItem.followsCount || 0),
      postCount: Number(profileItem.postsCount || posts.length || 0),
      bio: profileItem.biography || profileItem.bio || '',
      profileUrl: profileItem.url || `https://www.instagram.com/${clean}/`,
      isVerified: Boolean(profileItem.isVerified || false),
      fullName: profileItem.fullName || profileItem.full_name || '',
      lastUpdated: new Date()
    };

    const mappedPosts = posts.map((p, idx) => {
      const likes = Number(p.likesCount || 0);
      const comments = Number(p.commentsCount || 0);
      const views = Number(p.videoViewCount || p.views || 0);
      const engagementRate = followers > 0
        ? Number((((likes + comments) / Math.max(followers, 1)) * 100).toFixed(2))
        : (likes + comments) > 0 ? Math.min(100, likes + comments) : 0;

      const postType = String(p.type || 'image').toLowerCase();
      return {
        platform: 'instagram',
        caption: p.caption || '',
        likes,
        comments,
        shares: 0,
        views,
        engagementRate,
        postUrl: p.url || `https://www.instagram.com/p/${p.shortCode || idx}/`,
        imageUrl: p.imageUrl || p.displayUrl || p.image_url || '',
        videoUrl: p.videoUrl || p.video_url || '',
        postDate: p.timestamp ? new Date(p.timestamp) : new Date(),
        contentType: ['video', 'reel'].includes(postType) ? 'reel' : postType === 'carousel' ? 'carousel' : 'image',
        contentCategory: 'unknown',
        hashtags: (p.caption || '').match(/#[\w\u0600-\u06FF]+/gi)?.map(h => h) || [],
        externalPostId: p.id || p.shortCode || String(idx),
        dataSource: 'Apify'
      };
    });

    return { profile, posts: mappedPosts, username: clean, status: 'Completed' };
  } catch (error) {
    console.error('[Apify] Instagram fetch error:', error.message);
    return {
      unavailable: true,
      status: error.message.includes('429') || error.message.includes('403') ? 'Restricted' : 'Failed',
      reason: error.message.includes('429') || error.message.includes('403')
        ? 'Apify rate limit or access restriction reached.'
        : `Could not fetch real data from Instagram: ${error.message}`
    };
  }
}

export async function fetchWebsiteData(websiteUrl) {
  if (!websiteUrl) return { unavailable: true, status: 'Unsupported', reason: 'No website URL provided' };
  try {
    const targetUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
    const { data } = await axios.get(targetUrl, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    
    // Extract title and meta description using regex
    const titleMatch = data.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = data.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) || data.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);

    const title = titleMatch ? titleMatch.text || titleMatch[1].trim() : targetUrl;
    const description = descMatch ? descMatch[1].trim() : '';

    return {
      unavailable: false,
      status: 'Completed',
      profile: {
        title,
        description,
        profileUrl: targetUrl,
        lastUpdated: new Date()
      },
      posts: [{
        platform: 'website',
        caption: `Website Landing Page: ${title} - ${description}`,
        likes: 0,
        comments: 0,
        shares: 0,
        postUrl: targetUrl,
        postDate: new Date(),
        contentType: 'link',
        contentCategory: 'promotional',
        externalPostId: `web-${Date.now()}`,
        dataSource: 'Website Scraper'
      }]
    };
  } catch (error) {
    return {
      unavailable: true,
      status: 'Failed',
      reason: `Could not reach website: ${error.message}`
    };
  }
}

export { extractUsername, hasApifyToken };
