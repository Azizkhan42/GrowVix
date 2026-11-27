import fs from 'fs';
import path from 'path';
import axios from 'axios';

const UPLOAD_DIR = path.resolve('uploads/images');

const USAGE_FILE = path.resolve('uploads/image-usage.json');

const MAX_DAILY_REQUESTS = 10000;

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function loadUsage() {
  try {
    if (fs.existsSync(USAGE_FILE)) {
      const data = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'));
      const today = new Date().toISOString().slice(0, 10);
      if (data.date === today) {
        return data.count || 0;
      }
    }
  } catch {}
  return 0;
}

function saveUsage(count) {
  try {
    ensureUploadDir();
    fs.writeFileSync(
      USAGE_FILE,
      JSON.stringify({ date: new Date().toISOString().slice(0, 10), count })
    );
  } catch {}
}

export function isCloudflareConfigured() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  return Boolean(
    accountId &&
      apiToken &&
      accountId !== 'your_cloudflare_account_id' &&
      apiToken !== 'your_cloudflare_api_token'
  );
}

export function getRemainingQuota() {
  const used = loadUsage();
  return Math.max(0, MAX_DAILY_REQUESTS - used);
}

const IMAGE_STYLES = {
  'Product photography': {
    modifier:
      'Professional product photography, studio lighting, clean white background, high detail, commercial advertising style, sharp focus, photorealistic, 8k resolution, no text, no watermark',
    aspectPreference: 'square',
  },
  'Professional advertising': {
    modifier:
      'Professional commercial advertising photograph, cinematic lighting, premium quality, marketing campaign style, balanced composition, vibrant colors, high-end production, no text, no watermark',
    aspectPreference: 'square',
  },
  Corporate: {
    modifier:
      'Corporate professional photography, clean business aesthetic, office environment, professional lighting, neutral colors, trustworthy and reliable, no text, no watermark',
    aspectPreference: 'square',
  },
  Minimalist: {
    modifier:
      'Minimalist design, clean composition, plenty of negative space, simple colors, modern aesthetic, uncluttered, professional, no text, no watermark',
    aspectPreference: 'square',
  },
  Lifestyle: {
    modifier:
      'Lifestyle photography, natural lighting, real-world setting, authentic and relatable, warm atmosphere, candid style, lifestyle marketing, no text, no watermark',
    aspectPreference: 'square',
  },
  'Educational illustrations': {
    modifier:
      'Educational illustration style, clean infographic visual, informative design, clear visual hierarchy, friendly colors, professional educational content, no text, no watermark',
    aspectPreference: 'square',
  },
  'Creative graphics': {
    modifier:
      'Creative graphic design, artistic composition, modern marketing visual, bold colors, innovative style, eye-catching, professional creative advertising, no text, no watermark',
    aspectPreference: 'square',
  },
};

const PLATFORM_ASPECTS = {
  facebook: { width: 1080, height: 1080, description: 'square social media composition' },
  instagram: { width: 1080, height: 1080, description: 'square social media composition' },
  linkedin: { width: 1200, height: 628, description: 'landscape social media composition' },
  twitter: { width: 1200, height: 675, description: 'landscape social media composition' },
};

function buildVisualPrompt({
  topic,
  platform,
  style,
  caption,
  businessName,
  industry,
  targetAudience,
  objective,
}) {
  const styleConfig = IMAGE_STYLES[style] || IMAGE_STYLES['Product photography'];
  const platformConfig = PLATFORM_ASPECTS[platform] || PLATFORM_ASPECTS.facebook;

  const subjectPhrase = topic
    ? `The image subject is: ${topic}.`
    : 'Professional marketing visual.';

  const brandPhrase = businessName
    ? `Brand: ${businessName}.`
    : '';

  const industryPhrase = industry
    ? `Industry context: ${industry}.`
    : '';

  const audiencePhrase = targetAudience
    ? `Target audience: ${targetAudience}.`
    : '';

  const objectivePhrase = objective
    ? `Marketing objective: ${objective}.`
    : '';

  const captionPhrase = caption
    ? `Supporting message: "${caption.substring(0, 200)}".`
    : '';

  return `${subjectPhrase} ${brandPhrase} ${industryPhrase} ${audiencePhrase} ${objectivePhrase} ${captionPhrase} ${platformConfig.description}. ${styleConfig.modifier}. Do not include any unrelated objects, motorcycles, cars, random people, or text overlays. Focus exclusively on the topic: ${topic}.`;
}

export async function generateImage({
  topic,
  platform,
  style,
  caption,
  businessName,
  industry,
  targetAudience,
  objective,
  seed,
}) {
  if (!isCloudflareConfigured()) {
    throw new Error(
      'Cloudflare Workers AI is not configured. Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in your environment variables.'
    );
  }

  const remaining = getRemainingQuota();
  if (remaining <= 0) {
    throw new Error(
      'Daily free image generation allowance has been exhausted. Please try again tomorrow after the quota resets.'
    );
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const model = process.env.CLOUDFLARE_IMAGE_MODEL || '@cf/black-forest-labs/flux-1-schnell';

  const prompt = buildVisualPrompt({
    topic,
    platform,
    style,
    caption,
    businessName,
    industry,
    targetAudience,
    objective,
  });

  const platformConfig = PLATFORM_ASPECTS[platform] || PLATFORM_ASPECTS.facebook;

  const requestBody = {
    prompt,
    steps: 4,
    seed: seed || Math.floor(Math.random() * 1000000),
  };

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

  try {
    const response = await axios.post(endpoint, requestBody, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer',
      timeout: 120000,
    });

    const contentType = response.headers['content-type'] || 'image/png';
    const imageBuffer = Buffer.from(response.data, 'binary');

    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error('Cloudflare returned an empty image.');
    }

    ensureUploadDir();

    const fileName = `growvix_${Date.now()}_${Math.floor(Math.random() * 10000)}.png`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    fs.writeFileSync(filePath, imageBuffer);

    const used = loadUsage();
    saveUsage(used + 1);

    const backendUrl = (
      process.env.BACKEND_URL ||
      `http://localhost:${process.env.PORT || 5000}`
    ).replace(/\/+$/, '');

    const imageUrl = `${backendUrl}/api/images/serve/${fileName}`;

    return {
      imageUrl,
      fileName,
      prompt,
      platform,
      style,
      width: platformConfig.width,
      height: platformConfig.height,
    };
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401 || status === 403) {
        throw new Error(
          'Invalid Cloudflare API credentials. Please check your CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.'
        );
      }

      if (status === 429) {
        throw new Error(
          'Cloudflare Workers AI rate limit or daily quota exceeded. Please try again later.'
        );
      }

      const errorMessage =
        data?.error?.message ||
        data?.message ||
        `Cloudflare API error (status ${status})`;
      throw new Error(errorMessage);
    }

    if (error.code === 'ECONNABORTED') {
      throw new Error('Cloudflare Workers AI request timed out. Please try again.');
    }

    throw new Error(error.message || 'Failed to generate image with Cloudflare Workers AI.');
  }
}

export async function serveImage(fileName, res) {
  try {
    const filePath = path.join(UPLOAD_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    const stat = fs.statSync(filePath);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    console.error('[Image] Serve error:', error.message);
    return res.status(500).json({ message: 'Failed to serve image.' });
  }
}

export { IMAGE_STYLES, PLATFORM_ASPECTS };
