import Content from '../models/Content.js';
import BusinessProfile from '../models/BusinessProfile.js';
import {
  generateImage,
  serveImage,
  isCloudflareConfigured,
  getRemainingQuota,
  IMAGE_STYLES,
} from '../services/cloudflareImageService.js';

export const generateContentImage = async (req, res) => {
  try {
    const {
      contentId,
      topic,
      platform,
      style,
      caption,
      seed,
      regenerate,
    } = req.body;

    if (!topic) {
      return res.status(400).json({ message: 'Topic is required.' });
    }

    if (!isCloudflareConfigured()) {
      return res.status(500).json({
        message:
          'Cloudflare Workers AI is not configured. Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.',
      });
    }

    const remaining = getRemainingQuota();
    if (remaining <= 0) {
      return res.status(429).json({
        message:
          'Daily free image generation allowance has been exhausted. Please try again tomorrow after the quota resets.',
        quotaExhausted: true,
      });
    }

    let businessProfile = null;
    try {
      businessProfile = await BusinessProfile.findOne({ userId: req.user.id });
    } catch (err) {
      console.error('[Image] Business profile error:', err.message);
    }

    const imageResult = await generateImage({
      topic,
      platform: platform || 'facebook',
      style: style || 'Product photography',
      caption: caption || '',
      businessName: businessProfile?.businessName || '',
      industry: businessProfile?.industry || '',
      targetAudience: businessProfile?.targetAudience || '',
      objective: 'engagement',
      seed,
    });

    if (contentId && !regenerate) {
      try {
        const content = await Content.findOne({
          _id: contentId,
          userId: req.user.id,
        });
        if (content) {
          content.imageUrl = imageResult.imageUrl;
          content.topic = topic;
          await content.save();
        }
      } catch (err) {
        console.error('[Image] Content update error:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      imageUrl: imageResult.imageUrl,
      fileName: imageResult.fileName,
      prompt: imageResult.prompt,
      platform: imageResult.platform,
      style: imageResult.style,
      width: imageResult.width,
      height: imageResult.height,
      remainingQuota: getRemainingQuota(),
    });
  } catch (error) {
    console.error('[Image] Generate error:', error.message);

    if (error.message.includes('quota') || error.message.includes('allowance')) {
      return res.status(429).json({
        message: error.message,
        quotaExhausted: true,
      });
    }

    if (error.message.includes('configured') || error.message.includes('credentials')) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message || 'Image generation failed.' });
  }
};

export const getImageQuota = async (req, res) => {
  try {
    return res.json({
      configured: isCloudflareConfigured(),
      remaining: getRemainingQuota(),
      dailyLimit: 10000,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getImageStyles = async (req, res) => {
  return res.json({ styles: IMAGE_STYLES });
};

export const serveGeneratedImage = (req, res) => {
  serveImage(req.params.fileName, res);
};
