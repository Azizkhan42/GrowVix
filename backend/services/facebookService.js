import axios from 'axios';
import SocialAccount from '../models/SocialAccount.js';

const FB_GRAPH = 'https://graph.facebook.com/v26.0';

export async function fetchFacebookPageData(userId) {
  try {
    const account = await SocialAccount.findOne({
      userId,
      platform: 'facebook',
      isConnected: true
    });

    if (!account || !account.accessToken || !account.pageId) {
      return null;
    }

    const accessToken = account.accessToken;
    const pageId = account.pageId;

    // 1. Fetch Page Basic Info
    let pageInfo = {};
    try {
      const res = await axios.get(`${FB_GRAPH}/${pageId}`, {
        params: {
          access_token: accessToken,
          fields: 'id,name,fan_count,followers_count,about,website,picture{url}'
        }
      });
      pageInfo = res.data;
    } catch (err) {
      console.error('Error fetching Facebook page info:', err.response?.data || err.message);
    }

    // 2. Fetch Page Posts
    let posts = [];
    try {
      const res = await axios.get(`${FB_GRAPH}/${pageId}/posts`, {
        params: {
          access_token: accessToken,
          fields: 'id,message,created_time,shares,likes.summary(true),comments.summary(true),attachments'
        }
      });
      posts = Array.isArray(res.data?.data) ? res.data.data : [];
    } catch (err) {
      console.error('Error fetching Facebook page posts:', err.response?.data || err.message);
    }

    // 3. Fetch Page Insights (Impressions, Engaged users)
    let insights = {};
    try {
      const res = await axios.get(`${FB_GRAPH}/${pageId}/insights`, {
        params: {
          access_token: accessToken,
          metric: 'page_impressions,page_engaged_users,page_posts_impressions',
          period: 'day'
        }
      });
      if (Array.isArray(res.data?.data)) {
        res.data.data.forEach(item => {
          const values = item.values || [];
          const latestValue = values[values.length - 1]?.value || 0;
          insights[item.name] = latestValue;
        });
      }
    } catch (err) {
      console.error('Error fetching Facebook page insights:', err.response?.data || err.message);
    }

    // Format posts
    const formattedPosts = posts.map(p => {
      const likes = p.likes?.summary?.total_count || 0;
      const comments = p.comments?.summary?.total_count || 0;
      const shares = p.shares?.count || 0;
      const totalEngagement = likes + comments + shares;
      const followers = pageInfo.followers_count || pageInfo.fan_count || 1;
      const engagementRate = followers > 0 ? Number(((totalEngagement / followers) * 100).toFixed(2)) : 0;

      return {
        _id: p.id,
        platform: 'facebook',
        caption: p.message || 'Facebook Post',
        likes,
        comments,
        shares,
        totalEngagement,
        engagementRate,
        postDate: p.created_time,
        contentType: p.attachments?.data?.[0]?.type || 'text'
      };
    });

    const totalLikes = formattedPosts.reduce((sum, p) => sum + p.likes, 0);
    const totalComments = formattedPosts.reduce((sum, p) => sum + p.comments, 0);
    const totalShares = formattedPosts.reduce((sum, p) => sum + p.shares, 0);
    const totalEngagementSum = formattedPosts.reduce((sum, p) => sum + p.totalEngagement, 0);
    const avgEngagementRate = formattedPosts.length > 0
      ? (formattedPosts.reduce((sum, p) => sum + p.engagementRate, 0) / formattedPosts.length).toFixed(2)
      : 0;

    return {
      isRealData: true,
      pageId,
      pageName: pageInfo.name || account.accountName || 'Facebook Page',
      followersCount: pageInfo.followers_count || pageInfo.fan_count || 0,
      likesCount: pageInfo.fan_count || 0,
      pictureUrl: pageInfo.picture?.data?.url || '',
      about: pageInfo.about || '',
      totalPostsAnalyzed: formattedPosts.length,
      totalLikes,
      totalComments,
      totalShares,
      totalEngagement: totalEngagementSum,
      avgEngagementRate,
      topPosts: formattedPosts.sort((a, b) => b.totalEngagement - a.totalEngagement).slice(0, 5),
      allPosts: formattedPosts,
      insights
    };

  } catch (error) {
    console.error('fetchFacebookPageData fatal error:', error.message);
    return null;
  }
}
