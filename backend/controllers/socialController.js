import SocialAccount from '../models/SocialAccount.js';
import ScheduledPost from '../models/ScheduledPost.js';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const FB_GRAPH = 'https://graph.facebook.com/v19.0';
const FB_AUTH = 'https://www.facebook.com/v19.0/dialog/oauth';
const LI_AUTH = 'https://www.linkedin.com/oauth/v2/authorization';
const LI_TOKEN = 'https://www.linkedin.com/oauth/v2/accessToken';

const BACKEND_URL = process.env.BACKEND_URL || 'https://growvix-production.up.railway.app/';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://frontend-web-growvix.vercel.app/login';

function getRedirectUri(platform) {
  return `${BACKEND_URL}/api/social/callback/${platform}`;
}

function signState(userId, platform) {
  return jwt.sign({ uid: userId, platform }, process.env.JWT_SECRET, { expiresIn: '10m' });
}

function verifyState(state) {
  try {
    return jwt.verify(state, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// @desc    Get OAuth authorization URL for a platform
// @route   GET /api/social/auth-url/:platform
// @access  Private
export const getAuthUrl = async (req, res) => {
  try {
    const { platform } = req.params;
    const state = signState(req.user.id, platform);

    let url = '';
    if (platform === 'facebook' || platform === 'instagram') {
      if (!process.env.FACEBOOK_CLIENT_ID) return res.status(400).json({ message: 'Facebook app not configured. Set FACEBOOK_CLIENT_ID in backend/.env' });
      const scope = platform === 'facebook'
        ? 'pages_show_list,pages_read_engagement,pages_manage_posts'
        : 'pages_show_list,pages_read_engagement,instagram_basic,instagram_content_publish';
      url = `${FB_AUTH}?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(getRedirectUri('facebook'))}&state=${state}&scope=${encodeURIComponent(scope)}`;
    } else if (platform === 'linkedin') {
      if (!process.env.LINKEDIN_CLIENT_ID) return res.status(400).json({ message: 'LinkedIn app not configured. Set LINKEDIN_CLIENT_ID in backend/.env' });
      url = `${LI_AUTH}?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(getRedirectUri('linkedin'))}&state=${state}&scope=${encodeURIComponent('w_member_social openid profile email')}`;
    } else if (platform === 'twitter') {
      return res.status(400).json({ message: 'Twitter (X) only supports manual token connection. Use POST /api/social/connect.' });
    }

    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Handle OAuth callback (redirect from provider)
// @route   GET /api/social/callback/:platform
// @access  Public (uses signed state)
export const handleOAuthCallback = async (req, res) => {
  const { platform } = req.params;
  const { code, state, error } = req.query;

  const redirectTo = (status, msg = '') => {
    res.redirect(`${FRONTEND_URL}/settings?social=${platform}&status=${status}${msg ? `&msg=${encodeURIComponent(msg)}` : ''}`);
  };

  if (error) return redirectTo('error', error);
  const payload = verifyState(state);
  if (!payload) return redirectTo('error', 'Invalid or expired session. Please try again.');

  try {
    if (platform === 'facebook' || platform === 'instagram') {
      const tokensRes = await axios.get(`${FB_GRAPH}/oauth/access_token`, {
        params: {
          client_id: process.env.FACEBOOK_CLIENT_ID,
          client_secret: process.env.FACEBOOK_CLIENT_SECRET,
          redirect_uri: getRedirectUri('facebook'),
          code
        }
      });
      const shortToken = tokensRes.data.access_token;

      const longRes = await axios.get(`${FB_GRAPH}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.FACEBOOK_CLIENT_ID,
          client_secret: process.env.FACEBOOK_CLIENT_SECRET,
          fb_exchange_token: shortToken
        }
      });
      const userToken = longRes.data.access_token;

      const pagesRes = await axios.get(`${FB_GRAPH}/me/accounts`, {
        params: { access_token: userToken, fields: 'id,name,access_token,instagram_business_account{id,username}' }
      });
      const pages = Array.isArray(pagesRes.data.data) ? pagesRes.data.data : [];

      if (pages.length === 0) {
        return redirectTo('error', 'No Facebook Pages found for this account. Create a Page first.');
      }

      const primary = pages[0];
      const availablePages = pages.map(p => ({
        id: p.id,
        name: p.name,
        igUsername: p.instagram_business_account?.username || ''
      }));

      await SocialAccount.findOneAndUpdate(
        { userId: payload.uid, platform: 'facebook' },
        {
          accessToken: primary.access_token || userToken,
          userToken,
          tokenType: 'page',
          pageId: primary.id,
          accountId: primary.id,
          accountName: primary.name,
          availablePages,
          isConnected: true,
          connectedAt: new Date()
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (primary.instagram_business_account) {
        await SocialAccount.findOneAndUpdate(
          { userId: payload.uid, platform: 'instagram' },
          {
            accessToken: primary.access_token || userToken,
            userToken,
            tokenType: 'page',
            pageId: primary.instagram_business_account.id,
            accountId: primary.instagram_business_account.id,
            igBusinessAccountId: primary.instagram_business_account.id,
            igUsername: primary.instagram_business_account.username,
            accountName: primary.instagram_business_account.username,
            isConnected: true,
            connectedAt: new Date()
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }

      if (platform === 'instagram' && !primary.instagram_business_account) {
        return redirectTo('error', 'This Facebook Page is not linked to an Instagram business account. Link it in Meta Business Suite.');
      }

      return redirectTo('success');
    }

    if (platform === 'linkedin') {
      const tokenRes = await axios.post(LI_TOKEN, null, {
        params: {
          grant_type: 'authorization_code',
          code,
          redirect_uri: getRedirectUri('linkedin'),
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const accessToken = tokenRes.data.access_token;

      const infoRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const sub = infoRes.data.sub;
      const name = infoRes.data.name || infoRes.data.given_name || 'LinkedIn user';

      await SocialAccount.findOneAndUpdate(
        { userId: payload.uid, platform: 'linkedin' },
        {
          accessToken,
          userToken: accessToken,
          tokenType: 'user',
          pageId: `urn:li:person:${sub}`,
          accountId: `urn:li:person:${sub}`,
          accountName: name,
          profileUrl: `https://www.linkedin.com/in/${infoRes.data.preferred_username || sub}`,
          isConnected: true,
          connectedAt: new Date()
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return redirectTo('success');
    }

    redirectTo('error', 'Unsupported platform');
  } catch (error) {
    console.error('[OAuth Callback Error]:', error.response?.data || error.message);
    redirectTo('error', error.response?.data?.error?.message || error.message);
  }
};

// @desc    Switch active Facebook Page (syncs Instagram too)
// @route   POST /api/social/facebook/select-page
// @access  Private
export const selectFacebookPage = async (req, res) => {
  try {
    const { pageId } = req.body;
    const account = await SocialAccount.findOne({ userId: req.user.id, platform: 'facebook' });
    if (!account) return res.status(404).json({ message: 'Facebook not connected' });

    const pagesRes = await axios.get(`${FB_GRAPH}/me/accounts`, {
      params: { access_token: account.userToken, fields: 'id,name,access_token,instagram_business_account{id,username}' }
    });
    const pages = Array.isArray(pagesRes.data.data) ? pagesRes.data.data : [];
    const selected = pages.find(p => p.id === pageId);
    if (!selected) return res.status(400).json({ message: 'Page not found on this account' });

    await SocialAccount.findOneAndUpdate(
      { userId: req.user.id, platform: 'facebook' },
      {
        accessToken: selected.access_token,
        pageId: selected.id,
        accountId: selected.id,
        accountName: selected.name,
        availablePages: pages.map(p => ({
          id: p.id,
          name: p.name,
          igUsername: p.instagram_business_account?.username || ''
        }))
      }
    );

    if (selected.instagram_business_account) {
      await SocialAccount.findOneAndUpdate(
        { userId: req.user.id, platform: 'instagram' },
        {
          accessToken: selected.access_token,
          pageId: selected.instagram_business_account.id,
          accountId: selected.instagram_business_account.id,
          igBusinessAccountId: selected.instagram_business_account.id,
          igUsername: selected.instagram_business_account.username,
          accountName: selected.instagram_business_account.username,
          isConnected: true
        },
        { upsert: true, setDefaultsOnInsert: true }
      );
    } else {
      await SocialAccount.updateOne(
        { userId: req.user.id, platform: 'instagram' },
        { isConnected: false }
      );
    }

    res.json({ message: `Switched to ${selected.name}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Connect social account with manual credentials (Twitter/X fallback)
// @route   POST /api/social/connect
// @access  Private
export const connectAccount = async (req, res) => {
  try {
    const { platform, accessToken, pageId, accountName } = req.body;
    if (!platform || !accessToken) return res.status(400).json({ message: 'Platform and access token are required' });

    const account = await SocialAccount.findOneAndUpdate(
      { userId: req.user.id, platform },
      {
        accessToken,
        tokenType: 'none',
        pageId: pageId || '',
        accountName: accountName || platform + '_user',
        isConnected: true,
        connectedAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      _id: account._id,
      platform: account.platform,
      accountName: account.accountName,
      isConnected: account.isConnected,
      connectedAt: account.connectedAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConnectedAccounts = async (req, res) => {
  try {
    const accounts = await SocialAccount.find({ userId: req.user.id }).select('-accessToken -userToken');
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const disconnectAccount = async (req, res) => {
  try {
    await SocialAccount.findOneAndDelete({ userId: req.user.id, platform: req.params.platform });
    res.json({ message: `${req.params.platform} disconnected` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logic shared between API and background worker
export const performPublish = async (userId, platform, content, imageUrl) => {
  const account = await SocialAccount.findOne({ userId, platform });
  if (!account) {
    throw new Error(`No ${platform} account connected. Go to Settings > Integrations to connect.`);
  }
  if (!account.accessToken) {
    throw new Error(`${platform} account is not fully configured. Reconnect it in Settings.`);
  }

  let result = { success: true, message: '', postId: '' };

  if (platform === 'facebook') {
    if (!account.pageId) throw new Error('Facebook Page ID missing. Reconnect your Facebook account.');

    const params = imageUrl
      ? { url: imageUrl, caption: content, access_token: account.accessToken }
      : { message: content, access_token: account.accessToken };

    if (imageUrl) {
      const photoRes = await axios.post(`${FB_GRAPH}/${account.pageId}/photos`, params);
      result.postId = photoRes.data.id;
    } else {
      const postRes = await axios.post(`${FB_GRAPH}/${account.pageId}/feed`, params);
      result.postId = postRes.data.id;
    }
    result.message = `Posted to Facebook (${account.accountName || account.pageId})! Post ID: ${result.postId}`;
  } else if (platform === 'linkedin') {
    const authorUrn = account.accountId || `urn:li:person:${(account.pageId || '').replace('urn:li:person:', '')}`;

    const postBody = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: content },
          shareMediaCategory: imageUrl ? 'IMAGE' : 'NONE',
          media: imageUrl ? [{
            status: 'READY',
            description: { text: content.substring(0, 100) },
            media: imageUrl,
            title: { text: 'Post Image' }
          }] : []
        }
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
    };

    const postRes = await axios.post('https://api.linkedin.com/v2/ugcPosts', postBody, {
      headers: {
        'Authorization': `Bearer ${account.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    result.message = `Posted to LinkedIn (${account.accountName || 'profile'})! Post ID: ${postRes.data.id}`;
    result.postId = postRes.data.id;
  } else if (platform === 'twitter') {
    const tweetRes = await axios.post('https://api.twitter.com/2/tweets',
      { text: imageUrl ? `${content}\n\n${imageUrl}` : content },
      { headers: { 'Authorization': `Bearer ${account.accessToken}`, 'Content-Type': 'application/json' } }
    );
    result.message = `Tweeted successfully (${account.accountName || '@user'})! Tweet ID: ${tweetRes.data.data.id}`;
    result.postId = tweetRes.data.data.id;
  } else if (platform === 'instagram') {
    if (!imageUrl) throw new Error('Instagram requires an image. Enable "Include AI-generated image" or provide an image URL.');
    const igId = account.igBusinessAccountId || account.pageId;
    if (!igId) throw new Error('Instagram business account ID missing. Reconnect your Instagram account.');

    const containerRes = await axios.post(
      `${FB_GRAPH}/${igId}/media`,
      { image_url: imageUrl, caption: content, access_token: account.accessToken }
    );
    const publishRes = await axios.post(
      `${FB_GRAPH}/${igId}/media_publish`,
      { creation_id: containerRes.data.id, access_token: account.accessToken }
    );
    result.message = `Posted to Instagram (${account.accountName || account.igUsername || 'profile'})! Media ID: ${publishRes.data.id}`;
    result.postId = publishRes.data.id;
  }

  return result;
};

export const publishPost = async (req, res) => {
  try {
    const { platform, content, imageUrl } = req.body;
    if (!platform || !content) return res.status(400).json({ message: 'Platform and content are required' });
    const result = await performPublish(req.user.id, platform, content, imageUrl);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.response?.status || 400).json({ message: error.message });
  }
};

export const schedulePost = async (req, res) => {
  try {
    const { platform, content, scheduledTime, imageUrl } = req.body;
    if (!platform || !content || !scheduledTime) return res.status(400).json({ message: 'Platform, content and scheduled time are required' });
    const scheduled = await ScheduledPost.create({
      userId: req.user.id,
      platform,
      content,
      imageUrl,
      scheduledTime
    });
    res.status(201).json(scheduled);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getScheduledPosts = async (req, res) => {
  try {
    const posts = await ScheduledPost.find({ userId: req.user.id }).sort({ scheduledTime: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteScheduledPost = async (req, res) => {
  try {
    const post = await ScheduledPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    await post.deleteOne();
    res.json({ message: 'Scheduled post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};