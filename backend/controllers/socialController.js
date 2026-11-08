
import SocialAccount from '../models/SocialAccount.js';
import ScheduledPost from '../models/ScheduledPost.js';
import axios from 'axios';
import jwt from 'jsonwebtoken';

// ==========================================
// CONFIGURATION
// ==========================================

const FB_GRAPH = 'https://graph.facebook.com/v26.0';
const FB_AUTH = 'https://www.facebook.com/v26.0/dialog/oauth';

const LI_AUTH = 'https://www.linkedin.com/oauth/v2/authorization';
const LI_TOKEN = 'https://www.linkedin.com/oauth/v2/accessToken';

const BACKEND_URL = (
  process.env.BACKEND_URL ||
  'https://growvix-production.up.railway.app'
).replace(/\/+$/, '');

const FRONTEND_URL = (
  process.env.FRONTEND_URL ||
  'https://frontend-web-growvix.vercel.app'
).replace(/\/+$/, '');


// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getRedirectUri(platform) {
  return `${BACKEND_URL}/api/social/callback/${platform}`;
}

function signState(userId, platform) {
  return jwt.sign(
    { uid: userId, platform },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }
  );
}

function verifyState(state) {
  try {
    return jwt.verify(state, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function getFrontendRedirect(status, platform, message = '') {
  const url = new URL('/settings', FRONTEND_URL);

  url.searchParams.set('social', platform);
  url.searchParams.set('status', status);

  if (message) {
    url.searchParams.set('msg', message);
  }

  return url.toString();
}


// ==========================================
// GET OAUTH AUTHORIZATION URL
// GET /api/social/auth-url/:platform
// ==========================================

export const getAuthUrl = async (req, res) => {
  try {
    const { platform } = req.params;

    const allowedPlatforms = [
      'facebook',
      'instagram',
      'linkedin'
    ];

    if (!allowedPlatforms.includes(platform)) {
      return res.status(400).json({
        message: 'Unsupported social platform.'
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: 'JWT_SECRET is not configured.'
      });
    }

    const state = signState(req.user.id, platform);

    let authUrl;

    // FACEBOOK AND INSTAGRAM
    if (platform === 'facebook' || platform === 'instagram') {

      if (!process.env.FACEBOOK_CLIENT_ID) {
        return res.status(400).json({
          message: 'Facebook App ID is missing. Configure FACEBOOK_CLIENT_ID.'
        });
      }

      const scopes = platform === 'facebook'
        ? [
            'pages_show_list',
            'pages_read_engagement',
            'pages_manage_posts',
            'pages_manage_metadata',
            'pages_read_user_content'
          ]
        : [
            'pages_show_list',
            'pages_read_engagement',
            'pages_manage_posts',
            'pages_manage_metadata',
            'pages_read_user_content',
            'instagram_basic',
            'instagram_content_publish'
          ];

      const params = new URLSearchParams({
        client_id: process.env.FACEBOOK_CLIENT_ID,
        redirect_uri: getRedirectUri('facebook'),
        state,
        scope: scopes.join(','),
        response_type: 'code'
      });

      authUrl = `${FB_AUTH}?${params.toString()}`;
    }

    // LINKEDIN
    else if (platform === 'linkedin') {

      if (!process.env.LINKEDIN_CLIENT_ID) {
        return res.status(400).json({
          message: 'LinkedIn App ID is missing.'
        });
      }

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.LINKEDIN_CLIENT_ID,
        redirect_uri: getRedirectUri('linkedin'),
        state,
        scope: 'w_member_social openid profile email'
      });

      authUrl = `${LI_AUTH}?${params.toString()}`;
    }

    return res.json({
      url: authUrl
    });

  } catch (error) {
    console.error('Get OAuth URL Error:', error.message);

    return res.status(500).json({
      message: error.message
    });
  }
};


// ==========================================
// HANDLE OAUTH CALLBACK
// GET /api/social/callback/:platform
// ==========================================

export const handleOAuthCallback = async (req, res) => {

  const routePlatform = req.params.platform;
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(
      getFrontendRedirect(
        'error',
        routePlatform,
        String(error)
      )
    );
  }

  const payload = verifyState(state);

  if (!payload) {
    return res.redirect(
      getFrontendRedirect(
        'error',
        routePlatform,
        'Invalid or expired session. Please connect again.'
      )
    );
  }

  const platform = payload.platform;

  if (
    !['facebook', 'instagram', 'linkedin'].includes(platform) ||
    (platform === 'linkedin' && routePlatform !== 'linkedin') ||
    (['facebook', 'instagram'].includes(platform) && routePlatform !== 'facebook')
  ) {
    return res.redirect(
      getFrontendRedirect(
        'error',
        routePlatform,
        'Invalid OAuth callback platform.'
      )
    );
  }

  const redirectTo = (status, msg = '') => {
    return res.redirect(
      getFrontendRedirect(status, platform, msg)
    );
  };

  if (!code) {
    return redirectTo('error', 'Authorization code is missing.');
  }

  try {

    // ======================================
    // FACEBOOK AND INSTAGRAM CALLBACK
    // ======================================

    if (platform === 'facebook' || platform === 'instagram') {

      if (
        !process.env.FACEBOOK_CLIENT_ID ||
        !process.env.FACEBOOK_CLIENT_SECRET
      ) {
        return redirectTo(
          'error',
          'Facebook App credentials are not configured.'
        );
      }

      // STEP 1: EXCHANGE CODE FOR SHORT-LIVED TOKEN

      const tokensRes = await axios.get(
        `${FB_GRAPH}/oauth/access_token`,
        {
          params: {
            client_id: process.env.FACEBOOK_CLIENT_ID,
            client_secret: process.env.FACEBOOK_CLIENT_SECRET,
            redirect_uri: getRedirectUri('facebook'),
            code
          }
        }
      );

      const shortToken = tokensRes.data.access_token;

      // STEP 2: EXCHANGE FOR LONG-LIVED TOKEN

      const longRes = await axios.get(
        `${FB_GRAPH}/oauth/access_token`,
        {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: process.env.FACEBOOK_CLIENT_ID,
            client_secret: process.env.FACEBOOK_CLIENT_SECRET,
            fb_exchange_token: shortToken
          }
        }
      );

      const userToken = longRes.data.access_token;

      // STEP 3: GET FACEBOOK PAGES

      const pagesRes = await axios.get(
        `${FB_GRAPH}/me/accounts`,
        {
          params: {
            access_token: userToken,
            fields: 'id,name,access_token,instagram_business_account{id,username}'
          }
        }
      );

      const pages = Array.isArray(pagesRes.data.data)
        ? pagesRes.data.data
        : [];

      if (pages.length === 0) {
        return redirectTo(
          'error',
          'No Facebook Pages found. Make sure your account manages a Facebook Page and has granted the required permissions.'
        );
      }

      // STEP 4: SAVE AVAILABLE PAGES

      const availablePages = pages.map(page => ({
        id: page.id,
        name: page.name,
        igUsername:
          page.instagram_business_account?.username || ''
      }));

      // STEP 5: CHECK INSTAGRAM CONNECTION

      const primary = pages[0];

      if (
        platform === 'instagram' &&
        !primary.instagram_business_account
      ) {
        const instagramPage = pages.find(
          page => page.instagram_business_account
        );

        if (!instagramPage) {
          return redirectTo(
            'error',
            'No Instagram Business account is linked to your Facebook Pages. Link a professional Instagram account through Meta Business Suite.'
          );
        }

        // Use the Page connected to Instagram.
        Object.assign(primary, instagramPage);
      }

      // STEP 6: SAVE FACEBOOK ACCOUNT

      await SocialAccount.findOneAndUpdate(
        {
          userId: payload.uid,
          platform: 'facebook'
        },
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
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

      // STEP 7: SAVE INSTAGRAM ACCOUNT IF LINKED

      if (primary.instagram_business_account) {

        const instagram = primary.instagram_business_account;

        await SocialAccount.findOneAndUpdate(
          {
            userId: payload.uid,
            platform: 'instagram'
          },
          {
            accessToken: primary.access_token || userToken,
            userToken,
            tokenType: 'page',
            pageId: instagram.id,
            accountId: instagram.id,
            igBusinessAccountId: instagram.id,
            igUsername: instagram.username,
            accountName: instagram.username,
            isConnected: true,
            connectedAt: new Date()
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
          }
        );

      }

      return redirectTo('success');
    }


    // ======================================
    // LINKEDIN CALLBACK
    // ======================================

    if (platform === 'linkedin') {

      if (
        !process.env.LINKEDIN_CLIENT_ID ||
        !process.env.LINKEDIN_CLIENT_SECRET
      ) {
        return redirectTo(
          'error',
          'LinkedIn credentials are not configured.'
        );
      }

      // STEP 1: EXCHANGE CODE FOR ACCESS TOKEN

      const tokenRes = await axios.post(
        LI_TOKEN,
        null,
        {
          params: {
            grant_type: 'authorization_code',
            code,
            redirect_uri: getRedirectUri('linkedin'),
            client_id: process.env.LINKEDIN_CLIENT_ID,
            client_secret: process.env.LINKEDIN_CLIENT_SECRET
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const accessToken = tokenRes.data.access_token;

      // STEP 2: GET LINKEDIN PROFILE

      const infoRes = await axios.get(
        'https://api.linkedin.com/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      const sub = infoRes.data.sub;

      const name =
        infoRes.data.name ||
        infoRes.data.given_name ||
        'LinkedIn user';

      // STEP 3: SAVE LINKEDIN ACCOUNT

      await SocialAccount.findOneAndUpdate(
        {
          userId: payload.uid,
          platform: 'linkedin'
        },
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
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

      return redirectTo('success');
    }

    return redirectTo('error', 'Unsupported platform.');

  } catch (error) {

    console.error(
      '[OAuth Callback Error]:',
      error.response?.data || error.message
    );

    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message;

    return redirectTo('error', errorMessage);
  }
};


// ==========================================
// SELECT FACEBOOK PAGE
// POST /api/social/facebook/select-page
// ==========================================

export const selectFacebookPage = async (req, res) => {
  try {

    const { pageId } = req.body;

    if (!pageId) {
      return res.status(400).json({
        message: 'Facebook Page ID is required.'
      });
    }

    const account = await SocialAccount.findOne({
      userId: req.user.id,
      platform: 'facebook'
    });

    if (!account || !account.userToken) {
      return res.status(404).json({
        message: 'Facebook account is not connected. Reconnect it first.'
      });
    }

    const pagesRes = await axios.get(
      `${FB_GRAPH}/me/accounts`,
      {
        params: {
          access_token: account.userToken,
          fields: 'id,name,access_token,instagram_business_account{id,username}'
        }
      }
    );

    const pages = Array.isArray(pagesRes.data.data)
      ? pagesRes.data.data
      : [];

    const selected = pages.find(
      page => page.id === pageId
    );

    if (!selected) {
      return res.status(400).json({
        message: 'Selected Facebook Page was not found.'
      });
    }

    // UPDATE FACEBOOK ACCOUNT

    await SocialAccount.findOneAndUpdate(
      {
        userId: req.user.id,
        platform: 'facebook'
      },
      {
        accessToken: selected.access_token,
        pageId: selected.id,
        accountId: selected.id,
        accountName: selected.name,
        availablePages: pages.map(page => ({
          id: page.id,
          name: page.name,
          igUsername:
            page.instagram_business_account?.username || ''
        }))
      }
    );

    // UPDATE INSTAGRAM ACCOUNT IF LINKED

    if (selected.instagram_business_account) {

      const instagram = selected.instagram_business_account;

      await SocialAccount.findOneAndUpdate(
        {
          userId: req.user.id,
          platform: 'instagram'
        },
        {
          accessToken: selected.access_token,
          userToken: account.userToken,
          tokenType: 'page',
          pageId: instagram.id,
          accountId: instagram.id,
          igBusinessAccountId: instagram.id,
          igUsername: instagram.username,
          accountName: instagram.username,
          isConnected: true,
          connectedAt: new Date()
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

    } else {

      await SocialAccount.updateOne(
        {
          userId: req.user.id,
          platform: 'instagram'
        },
        {
          $set: {
            isConnected: false
          }
        }
      );

    }

    return res.json({
      message: `Successfully switched to ${selected.name}`,
      pageId: selected.id,
      pageName: selected.name
    });

  } catch (error) {

    console.error(
      'Select Facebook Page Error:',
      error.response?.data || error.message
    );

    return res.status(
      error.response?.status || 500
    ).json({
      message:
        error.response?.data?.error?.message ||
        error.message
    });
  }
};


// ==========================================
// MANUAL SOCIAL ACCOUNT CONNECTION
// POST /api/social/connect
// ==========================================

export const connectAccount = async (req, res) => {
  try {

    const {
      platform,
      accessToken,
      pageId,
      accountName
    } = req.body;

    if (!platform || !accessToken) {
      return res.status(400).json({
        message: 'Platform and access token are required.'
      });
    }

    const account = await SocialAccount.findOneAndUpdate(
      {
        userId: req.user.id,
        platform
      },
      {
        accessToken,
        tokenType: 'none',
        pageId: pageId || '',
        accountName: accountName || `${platform}_user`,
        isConnected: true,
        connectedAt: new Date()
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    return res.status(201).json({
      _id: account._id,
      platform: account.platform,
      accountName: account.accountName,
      isConnected: account.isConnected,
      connectedAt: account.connectedAt
    });

  } catch (error) {

    return res.status(500).json({
      message: error.message
    });
  }
};


// ==========================================
// GET CONNECTED SOCIAL ACCOUNTS
// GET /api/social/accounts
// ==========================================

export const getConnectedAccounts = async (req, res) => {
  try {

    const accounts = await SocialAccount.find({
      userId: req.user.id
    }).select('-accessToken -userToken');

    return res.json(accounts);

  } catch (error) {

    return res.status(500).json({
      message: error.message
    });
  }
};


// ==========================================
// DISCONNECT SOCIAL ACCOUNT
// DELETE /api/social/disconnect/:platform
// ==========================================

export const disconnectAccount = async (req, res) => {
  try {

    const { platform } = req.params;

    await SocialAccount.findOneAndDelete({
      userId: req.user.id,
      platform
    });

    return res.json({
      message: `${platform} disconnected successfully.`
    });

  } catch (error) {

    return res.status(500).json({
      message: error.message
    });
  }
};


// ==========================================
// PUBLISH SOCIAL MEDIA POST
// SHARED API AND WORKER FUNCTION
// ==========================================

export const performPublish = async (
  userId,
  platform,
  content,
  imageUrl
) => {

  const account = await SocialAccount.findOne({
    userId,
    platform
  });

  if (!account) {
    throw new Error(
      `No ${platform} account connected. Go to Settings > Integrations to connect.`
    );
  }

  if (!account.accessToken) {
    throw new Error(
      `${platform} account is not fully configured. Reconnect it in Settings.`
    );
  }

  let result = {
    success: true,
    message: '',
    postId: ''
  };


  // ======================================
  // FACEBOOK PUBLISHING
  // ======================================

  if (platform === 'facebook') {

    if (!account.pageId) {
      throw new Error(
        'Facebook Page ID is missing. Reconnect your Facebook account.'
      );
    }

    const params = imageUrl
      ? {
          url: imageUrl,
          caption: content,
          access_token: account.accessToken
        }
      : {
          message: content,
          access_token: account.accessToken
        };

    if (imageUrl) {

      const photoRes = await axios.post(
        `${FB_GRAPH}/${account.pageId}/photos`,
        params
      );

      result.postId = photoRes.data.id;

    } else {

      const postRes = await axios.post(
        `${FB_GRAPH}/${account.pageId}/feed`,
        params
      );

      result.postId = postRes.data.id;
    }

    result.message =
      `Posted to Facebook (${account.accountName || account.pageId})! Post ID: ${result.postId}`;
  }


  // ======================================
  // LINKEDIN PUBLISHING
  // ======================================

  else if (platform === 'linkedin') {

    const authorUrn =
      account.accountId ||
      `urn:li:person:${(account.pageId || '').replace('urn:li:person:', '')}`;

    const postBody = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const postRes = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      postBody,
      {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );

    result.message =
      `Posted to LinkedIn (${account.accountName || 'profile'})!`;

    result.postId = postRes.data.id;
  }


  // ======================================
  // TWITTER / X PUBLISHING
  // ======================================

  else if (platform === 'twitter') {

    const tweetRes = await axios.post(
      'https://api.twitter.com/2/tweets',
      {
        text: imageUrl
          ? `${content}\n\n${imageUrl}`
          : content
      },
      {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    result.message =
      `Tweeted successfully (${account.accountName || '@user'})!`;

    result.postId = tweetRes.data.data.id;
  }


  // ======================================
  // INSTAGRAM PUBLISHING
  // ======================================

  else if (platform === 'instagram') {

    if (!imageUrl) {
      throw new Error(
        'Instagram requires an image. Enable Include AI-generated image or provide an image URL.'
      );
    }

    const igId =
      account.igBusinessAccountId || account.pageId;

    if (!igId) {
      throw new Error(
        'Instagram Business Account ID is missing. Reconnect your Instagram account.'
      );
    }

    // CREATE MEDIA CONTAINER

    const containerRes = await axios.post(
      `${FB_GRAPH}/${igId}/media`,
      {
        image_url: imageUrl,
        caption: content,
        access_token: account.accessToken
      }
    );

    // PUBLISH MEDIA

    const publishRes = await axios.post(
      `${FB_GRAPH}/${igId}/media_publish`,
      {
        creation_id: containerRes.data.id,
        access_token: account.accessToken
      }
    );

    result.message =
      `Posted to Instagram (${account.accountName || account.igUsername || 'profile'})!`;

    result.postId = publishRes.data.id;
  }

  else {
    throw new Error(
      `Unsupported social platform: ${platform}`
    );
  }

  return result;
};


// ==========================================
// PUBLISH POST API
// POST /api/social/publish
// ==========================================

export const publishPost = async (req, res) => {
  try {

    const {
      platform,
      content,
      imageUrl
    } = req.body;

    if (!platform || !content) {
      return res.status(400).json({
        message: 'Platform and content are required.'
      });
    }

    const result = await performPublish(
      req.user.id,
      platform,
      content,
      imageUrl
    );

    return res.status(200).json(result);

  } catch (error) {

    console.error(
      'Publish Post Error:',
      error.response?.data || error.message
    );

    return res.status(
      error.response?.status || 400
    ).json({
      message:
        error.response?.data?.error?.message ||
        error.message
    });
  }
};


// ==========================================
// SCHEDULE POST
// POST /api/social/schedule
// ==========================================

export const schedulePost = async (req, res) => {
  try {

    const {
      platform,
      content,
      scheduledTime,
      imageUrl
    } = req.body;

    if (!platform || !content || !scheduledTime) {
      return res.status(400).json({
        message: 'Platform, content and scheduled time are required.'
      });
    }

    const scheduledDate = new Date(scheduledTime);

    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        message: 'Invalid scheduled date.'
      });
    }

    if (scheduledDate <= new Date()) {
      return res.status(400).json({
        message: 'Scheduled time must be in the future.'
      });
    }

    const scheduled = await ScheduledPost.create({
      userId: req.user.id,
      platform,
      content,
      imageUrl,
      scheduledTime: scheduledDate
    });

    return res.status(201).json(scheduled);

  } catch (error) {

    return res.status(500).json({
      message: error.message
    });
  }
};


// ==========================================
// GET SCHEDULED POSTS
// GET /api/social/scheduled
// ==========================================

export const getScheduledPosts = async (req, res) => {
  try {

    const posts = await ScheduledPost.find({
      userId: req.user.id
    }).sort({
      scheduledTime: -1
    });

    return res.json(posts);

  } catch (error) {

    return res.status(500).json({
      message: error.message
    });
  }
};


// ==========================================
// DELETE SCHEDULED POST
// DELETE /api/social/scheduled/:id
// ==========================================

export const deleteScheduledPost = async (req, res) => {
  try {

    const post = await ScheduledPost.findById(
      req.params.id
    );

    if (!post) {
      return res.status(404).json({
        message: 'Scheduled post not found.'
      });
    }

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'You are not authorized to delete this post.'
      });
    }

    await post.deleteOne();

    return res.json({
      message: 'Scheduled post deleted successfully.'
    });

  } catch (error) {

    return res.status(500).json({
      message: error.message
    });
  }
};
