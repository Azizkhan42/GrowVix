import ScheduledPost from './models/ScheduledPost.js';
import { performPublish } from './controllers/socialController.js';
import Competitor from './models/Competitor.js';
import { fetchInstagramData } from './services/apifyService.js';
import Post from './models/Post.js';

const CHECK_INTERVAL = 60 * 1000; // Check every 1 minute
const COMPETITOR_REFRESH_INTERVAL = 6 * 60 * 60 * 1000; // Refresh competitor data every 6 hours

export const startWorker = () => {
  console.log('--- GrowVix Background Worker Started ---');

  setInterval(async () => {
    try {
      await processDuePosts();
    } catch (error) {
      console.error('[Worker Error]:', error.message);
    }
  }, CHECK_INTERVAL);

  setInterval(async () => {
    try {
      await refreshCompetitorData();
    } catch (error) {
      console.error('[Competitor Refresh Error]:', error.message);
    }
  }, COMPETITOR_REFRESH_INTERVAL);
};

async function processDuePosts() {
  const now = new Date();
  const duePosts = await ScheduledPost.find({
    status: 'pending',
    scheduledTime: { $lte: now }
  });

  if (duePosts.length > 0) {
    console.log(`[Worker] Found ${duePosts.length} due posts. Processing...`);
  }

  for (const post of duePosts) {
    try {
      console.log(`[Worker] Attempting to publish ${post.platform} post for user ${post.userId}...`);

      const result = await performPublish(post.userId, post.platform, post.content, post.imageUrl);

      post.status = 'published';
      post.publishedPostId = result.postId || '';
      post.publishedAt = new Date();
      await post.save();

      console.log(`[Worker] Successfully published ${post.platform} post.`);
    } catch (error) {
      post.attempts += 1;
      post.lastError = error.message?.substring(0, 500) || 'Unknown error';

      if (post.attempts >= post.maxAttempts) {
        post.status = 'failed';
        console.error(`[Worker] Post failed permanently after ${post.attempts} attempts:`, error.message);
      } else {
        const backoffMs = Math.min(1000 * 60 * 5, 1000 * 60 * Math.pow(2, post.attempts));
        post.scheduledTime = new Date(Date.now() + backoffMs);
        console.warn(`[Worker] Publish failed (attempt ${post.attempts}/${post.maxAttempts}). Retrying in ${Math.round(backoffMs / 60000)}min. Error: ${error.message}`);
      }
      await post.save();
    }
  }
}

async function refreshCompetitorData() {
  const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const competitors = await Competitor.find({
    profileData: { $exists: true },
    $or: [
      { 'profileData.lastUpdated': { $lt: threshold } },
      { 'profileData.lastUpdated': { $exists: false } }
    ]
  }).limit(20);

  for (const competitor of competitors) {
    const handle = competitor.instagramProfile || competitor.platforms?.find(p => p.platform === 'instagram')?.username;
    if (!handle) continue;

    console.log(`[Worker] Refreshing competitor data for "${competitor.name || handle}"...`);
    try {
      const data = await fetchInstagramData(handle, 15);
      if (data.unavailable) continue;

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

      for (const post of data.posts) {
        const exists = await Post.findOne({
          competitorId: competitor._id,
          platform: 'instagram',
          $or: [{ postUrl: post.postUrl }, { rawId: post.rawId }]
        });
        if (!exists) {
          await Post.create({ competitorId: competitor._id, ...post });
        }
      }

      console.log(`[Worker] Refreshed "${competitor.name || handle}" (${data.posts.length} posts).`);
    } catch (error) {
      console.error(`[Worker] Failed to refresh "${competitor.name || handle}":`, error.message);
    }
  }
}