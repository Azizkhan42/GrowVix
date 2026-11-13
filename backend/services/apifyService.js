import { ApifyClient } from 'apify-client';
import axios from 'axios';

function getApifyClient() {
  const token = process.env.APIFY_API_TOKEN;
  if (!token || token === 'your_apify_token_here') {
    throw new Error('APIFY_API_TOKEN is not configured in backend environment variables.');
  }
  return new ApifyClient({ token });
}

function normalizeProfileUrl(input) {
  if (!input) return null;
  const trimmed = input.trim().replace(/\/+$/, '');
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.replace(/\?.*$/, '');
  }
  const clean = trimmed.replace(/^@/, '');
  return `https://www.instagram.com/${clean}/`;
}

export async function fetchInstagramData(usernameOrUrl, resultsLimit = 15) {
  try {
    const client = getApifyClient();
    const profileUrl = normalizeProfileUrl(usernameOrUrl);
    if (!profileUrl) {
      return { unavailable: true, reason: 'No valid Instagram profile URL or username provided.', status: 'Failed' };
    }

    // 1. Fetch posts using official apify/instagram-scraper
    const postsRun = await client.actor('apify/instagram-scraper').call({
      directUrls: [profileUrl],
      resultsType: 'posts',
      resultsLimit
    });
    const { items: postItems } = await client.dataset(postsRun.defaultDatasetId).listItems();

    // 2. Fetch profile details
    let profileItem = {};
    try {
      const detailsRun = await client.actor('apify/instagram-scraper').call({
        directUrls: [profileUrl],
        resultsType: 'details',
        resultsLimit: 1
      });
      const { items: detailItems } = await client.dataset(detailsRun.defaultDatasetId).listItems();
      profileItem = detailItems[0] || {};
    } catch (err) {
      console.warn('[Apify] Could not fetch profile details, using defaults');
    }

    const followers = Number(profileItem.followersCount || 0);
    const profile = {
      followers,
      following: Number(profileItem.followsCount || 0),
      postCount: Number(profileItem.postsCount || postItems.length || 0),
      bio: profileItem.biography || '',
      profileUrl: profileItem.url || profileUrl,
      isVerified: Boolean(profileItem.verified || profileItem.isVerified || false),
      fullName: profileItem.fullName || '',
      lastUpdated: new Date()
    };

    const mappedPosts = (postItems || []).map((p, idx) => {
      const likes = Number(p.likesCount || p.likes || 0);
      const comments = Number(p.commentsCount || p.comments || 0);
      const views = Number(p.videoViewCount || p.views || 0);
      const engagementRate = followers > 0
        ? Number((((likes + comments) / Math.max(followers, 1)) * 100).toFixed(2))
        : (likes + comments) > 0 ? Math.min(100, likes + comments) : 0;

      const postType = String(p.type || (p.videoUrl ? 'video' : 'image')).toLowerCase();
      return {
        platform: 'instagram',
        caption: p.caption || p.text || '',
        likes,
        comments,
        shares: 0,
        views,
        engagementRate,
        postUrl: p.url || profileUrl,
        imageUrl: p.displayUrl || p.imageUrl || p.thumbnailUrl || '',
        videoUrl: p.videoUrl || '',
        postDate: p.timestamp ? new Date(p.timestamp) : new Date(),
        contentType: ['video', 'reel'].includes(postType) || p.videoUrl ? 'reel' : postType === 'carousel' || p.childPosts?.length ? 'carousel' : 'image',
        contentCategory: 'unknown',
        hashtags: p.hashtags || (p.caption || '').match(/#[\w\u0600-\u06FF]+/gi) || [],
        externalPostId: p.id || p.shortCode || String(idx),
        dataSource: 'Apify'
      };
    });

    return { profile, posts: mappedPosts, status: 'Completed' };
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
    
    const titleMatch = data.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = data.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) || data.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);

    const title = titleMatch ? titleMatch[1].trim() : targetUrl;
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
