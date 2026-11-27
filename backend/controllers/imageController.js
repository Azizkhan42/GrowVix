import Content from '../models/Content.js';
import {
  generateImage,
  serveImage,
  isCloudflareConfigured,
  getConfiguredImageModel,
  getRemainingQuota,
  IMAGE_STYLES,
} from '../services/cloudflareImageService.js';

function resolveBackendBaseUrl(req) {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol =
    (typeof forwardedProto === 'string'
      ? forwardedProto.split(',')[0].trim()
      : req.protocol) || 'http';
  const host = req.get('host');
  const requestOrigin = host ? `${protocol}://${host}` : '';

  if (host && (host.startsWith('localhost') || host.startsWith('127.0.0.1'))) {
    return requestOrigin;
  }

  return (process.env.BACKEND_URL || requestOrigin || `http://localhost:${process.env.PORT || 5000}`).replace(
    /\/+$/,
    ''
  );
}

export const generateContentImage = async (req, res) => {
  try {
    const {
      contentId,
      topic,
      platform,
      style,
      imageFormat,
      format,
      imagePrompt,
      caption,
      seed,
    } = req.body;

    if (!topic || !String(topic).trim()) {
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

    const imageResult = await generateImage({
      topic: String(topic).trim(),
      platform: platform || 'facebook',
      style: style || 'Product photography',
      imageFormat: imageFormat || format || '',
      imagePrompt: imagePrompt || '',
      caption: caption || '',
      seed,
      baseUrl: resolveBackendBaseUrl(req),
    });

    if (contentId) {
      try {
        const content = await Content.findOne({
          _id: contentId,
          userId: req.user.id,
        });
        if (content) {
          content.imageUrl = imageResult.imageUrl;
          content.topic = String(topic).trim();
          await content.save();
        }
      } catch (err) {
        console.error('[Image] Content update error:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      provider: imageResult.provider,
      model: imageResult.model,
      imageUrl: imageResult.imageUrl,
      fileName: imageResult.fileName,
      prompt: imageResult.prompt,
      platform: imageResult.platform,
      style: imageResult.style,
      format: imageResult.format,
      width: imageResult.width,
      height: imageResult.height,
      mimeType: imageResult.mimeType,
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

    return res.status(502).json({ message: error.message || 'Image generation failed.' });
  }
};

export const getImageQuota = async (req, res) => {
  try {
    return res.json({
      provider: 'cloudflare',
      model: getConfiguredImageModel(),
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
