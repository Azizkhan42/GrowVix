import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { generateVisualPrompt } from './aiService.js';

const UPLOAD_DIR = path.resolve('uploads/images');
const USAGE_FILE = path.resolve('uploads/image-usage.json');
const MAX_DAILY_REQUESTS = 10000;
const MIN_IMAGE_BYTES = 1024;
const MIN_IMAGE_DIMENSION = 256;
const MAX_IMAGE_DIMENSION = 8192;
const DEFAULT_CLOUDFLARE_IMAGE_MODEL = '@cf/black-forest-labs/flux-1-schnell';

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
  } catch {
    // Ignore malformed usage file and start fresh for the day
  }
  return 0;
}

function saveUsage(count) {
  try {
    ensureUploadDir();
    fs.writeFileSync(
      USAGE_FILE,
      JSON.stringify({ date: new Date().toISOString().slice(0, 10), count })
    );
  } catch {
    // Non-fatal if usage tracking cannot write
  }
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

export function getConfiguredImageModel() {
  return process.env.CLOUDFLARE_IMAGE_MODEL || DEFAULT_CLOUDFLARE_IMAGE_MODEL;
}

export function getRemainingQuota() {
  const used = loadUsage();
  return Math.max(0, MAX_DAILY_REQUESTS - used);
}

const IMAGE_STYLES = {
  'Product photography': {
    modifier:
      'Professional commercial product photography, studio lighting, clean uncluttered background, sharp focus, high detail, photorealistic, no text, no watermark',
  },
  'Professional advertising': {
    modifier:
      'High-end commercial advertising photograph, cinematic lighting, balanced composition, vibrant natural colors, marketing campaign visual, no text, no watermark',
  },
  Corporate: {
    modifier:
      'Clean corporate editorial photography, modern professional environment, natural studio lighting, trustworthy aesthetic, sharp focus, no text, no watermark',
  },
  Minimalist: {
    modifier:
      'Minimalist commercial photography, clean composition, generous negative space, refined modern aesthetic, soft studio lighting, no text, no watermark',
  },
  Lifestyle: {
    modifier:
      'Authentic lifestyle photography, warm natural sunlight, real-world setting, candid high-resolution visual, sharp subject focus, no text, no watermark',
  },
  'Educational illustrations': {
    modifier:
      'Clean modern visual illustration, clear focal subject, balanced lighting, crisp studio quality, professional educational visual, no text, no words, no watermark',
  },
  'Creative graphics': {
    modifier:
      'Modern creative editorial photography and visual art direction, bold clean composition, studio lighting, high detail, no text, no watermark',
  },
};

const FORMAT_COMPOSITIONS = {
  square: { width: 1024, height: 1024, description: 'balanced square 1:1 composition' },
  portrait: { width: 896, height: 1120, description: 'vertical portrait 4:5 composition' },
  landscape: { width: 1280, height: 720, description: 'wide landscape 16:9 composition' },
};

const PLATFORM_DEFAULT_FORMATS = {
  facebook: 'square',
  instagram: 'square',
  linkedin: 'landscape',
};

function resolveFormatConfig(imageFormat, platform) {
  const normalized = typeof imageFormat === 'string' ? imageFormat.toLowerCase().trim() : '';
  if (FORMAT_COMPOSITIONS[normalized]) {
    return { formatKey: normalized, ...FORMAT_COMPOSITIONS[normalized] };
  }
  const fallbackKey = PLATFORM_DEFAULT_FORMATS[platform] || 'square';
  return { formatKey: fallbackKey, ...FORMAT_COMPOSITIONS[fallbackKey] };
}

function cleanCaptionSnippet(caption) {
  if (!caption || typeof caption !== 'string') return '';
  return caption
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/#[a-zA-Z0-9_]+/g, ' ')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
}

function extractConcreteSubject(topic) {
  const raw = String(topic || '').trim();
  if (!raw) return 'professional marketing subject';

  const stripped = raw
    .replace(
      /\b(advantages and disadvantages|pros and cons|benefits of|promotional campaign|marketing campaign|advertisement|ad campaign|social media post|how to|guide to|tips for)\b/gi,
      ' '
    )
    .replace(/\s+/g, ' ')
    .trim();

  return stripped.length >= 3 ? stripped : raw;
}

async function buildVisualPrompt({
  topic,
  imagePrompt,
  caption,
  style,
  formatKey,
  platform,
}) {
  const styleConfig = IMAGE_STYLES[style] || IMAGE_STYLES['Product photography'];
  const formatConfig = FORMAT_COMPOSITIONS[formatKey] || FORMAT_COMPOSITIONS.square;

  const validSuppliedPrompt =
    typeof imagePrompt === 'string' &&
    imagePrompt.trim().length >= 20 &&
    !/^null\b/i.test(imagePrompt.trim()) &&
    !/pollinations/i.test(imagePrompt)
      ? imagePrompt.trim()
      : '';

  let sceneDescription = validSuppliedPrompt;

  if (!sceneDescription) {
    const aiScene = await generateVisualPrompt({
      topic,
      caption: cleanCaptionSnippet(caption),
      style,
      format: formatKey,
    });
    if (aiScene) {
      sceneDescription = aiScene;
    }
  }

  if (!sceneDescription) {
    const subject = extractConcreteSubject(topic);
    const captionHint = cleanCaptionSnippet(caption);
    const contextClause =
      captionHint && captionHint.toLowerCase() !== topic.toLowerCase()
        ? ` Relevant visual context: ${captionHint}.`
        : '';

    sceneDescription = `A crisp, photorealistic real-world visual whose primary main subject is ${subject}.${contextClause} Show ${subject} clearly in an authentic, fitting environment`;
  }

  const finalPrompt = `${sceneDescription}. ${formatConfig.description}. ${styleConfig.modifier}. Focus strictly on depicting ${topic || 'the requested subject'}; never include unrelated objects, cartoon mascots, text overlays, labels, or watermarks.`;
  return finalPrompt.slice(0, 2000);
}

function parsePngDimensions(buffer) {
  // PNG signature (8) + IHDR length (4) + 'IHDR' (4) + width (4) + height (4)
  if (buffer.length < 33) return null;
  const ihdrType = buffer.toString('ascii', 12, 16);
  if (ihdrType !== 'IHDR') return null;

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const hasIend = buffer.indexOf(Buffer.from([0x49, 0x45, 0x4e, 0x44])) !== -1;
  if (!hasIend) return null;

  return { width, height, mimeType: 'image/png', extension: 'png' };
}

function parseJpegDimensions(buffer) {
  if (buffer.length < 16) return null;
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8 || buffer[2] !== 0xff) return null;

  // Confirm JPEG EOI marker (0xFF 0xD9) exists in trailing bytes to reject truncated streams
  const tailStart = Math.max(2, buffer.length - 64);
  const hasEoi = buffer.subarray(tailStart).indexOf(Buffer.from([0xff, 0xd9])) !== -1;
  if (!hasEoi) return null;

  let offset = 2;
  while (offset + 3 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    while (offset < buffer.length && buffer[offset] === 0xff) {
      offset += 1;
    }
    if (offset >= buffer.length) break;

    const marker = buffer[offset];
    offset += 1;

    // Standalone markers (TEM, RST0..RST7, SOI, EOI)
    if (marker === 0x00 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      continue;
    }

    if (offset + 1 >= buffer.length) break;
    const segmentLength = buffer.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > buffer.length) break;

    // SOF0, SOF1, SOF2, SOF3, SOF5..SOF15 (exclude DHT 0xC4, JPG 0xC8, DAC 0xCC)
    const isSof =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;

    if (isSof && offset + 6 < buffer.length) {
      const height = buffer.readUInt16BE(offset + 3);
      const width = buffer.readUInt16BE(offset + 5);
      return { width, height, mimeType: 'image/jpeg', extension: 'jpg' };
    }

    offset += segmentLength;
  }

  return null;
}

function parseWebpDimensions(buffer) {
  if (buffer.length < 30) return null;
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    return null;
  }

  const chunkHeader = buffer.toString('ascii', 12, 16);
  if (chunkHeader === 'VP8X' && buffer.length >= 30) {
    const width = 1 + (buffer[24] | (buffer[25] << 8) | (buffer[26] << 16));
    const height = 1 + (buffer[27] | (buffer[28] << 8) | (buffer[29] << 16));
    return { width, height, mimeType: 'image/webp', extension: 'webp' };
  }
  if (chunkHeader === 'VP8 ' && buffer.length >= 30 && buffer[23] === 0x9d && buffer[24] === 0x01 && buffer[25] === 0x2a) {
    const width = buffer.readUInt16LE(26) & 0x3fff;
    const height = buffer.readUInt16LE(28) & 0x3fff;
    return { width, height, mimeType: 'image/webp', extension: 'webp' };
  }
  if (chunkHeader === 'VP8L' && buffer.length >= 25 && buffer[20] === 0x2f) {
    const bits = buffer.readUInt32LE(21);
    const width = (bits & 0x3fff) + 1;
    const height = ((bits >> 14) & 0x3fff) + 1;
    return { width, height, mimeType: 'image/webp', extension: 'webp' };
  }

  return null;
}

export function inspectAndValidateImageBuffer(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < MIN_IMAGE_BYTES) {
    throw new Error('Generated image payload is empty or too small to be a valid image.');
  }

  const headText = buffer.subarray(0, 64).toString('utf8').trimStart().toLowerCase();
  if (
    headText.startsWith('<!doctype') ||
    headText.startsWith('<html') ||
    headText.startsWith('<svg') ||
    headText.startsWith('{')
  ) {
    throw new Error('Image provider returned an HTML/text/JSON error payload instead of an image.');
  }

  let metadata = null;
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    metadata = parsePngDimensions(buffer);
  } else if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    metadata = parseJpegDimensions(buffer);
  } else if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    metadata = parseWebpDimensions(buffer);
  }

  if (!metadata) {
    throw new Error('Image decoding failed: unsupported or corrupted image format.');
  }

  if (
    metadata.width < MIN_IMAGE_DIMENSION ||
    metadata.height < MIN_IMAGE_DIMENSION ||
    metadata.width > MAX_IMAGE_DIMENSION ||
    metadata.height > MAX_IMAGE_DIMENSION
  ) {
    throw new Error(
      `Generated image dimensions (${metadata.width}x${metadata.height}) are outside valid bounds.`
    );
  }

  return metadata;
}

function extractCloudflareErrorMessage(status, rawBuffer) {
  const text = Buffer.isBuffer(rawBuffer)
    ? rawBuffer.toString('utf8', 0, 1000)
    : String(rawBuffer || '');
  try {
    const parsed = JSON.parse(text);
    const cfError = parsed?.errors?.[0]?.message || parsed?.error?.message || parsed?.message;
    if (cfError) return cfError;
  } catch {
    // Not JSON; fall through to raw status message
  }
  return `Cloudflare Workers AI returned HTTP ${status}${text ? `: ${text.slice(0, 200)}` : ''}`;
}

export async function generateImage({
  topic,
  platform = 'facebook',
  style = 'Product photography',
  imageFormat = '',
  imagePrompt = '',
  caption = '',
  seed,
  baseUrl = '',
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

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID.trim();
  const apiToken = process.env.CLOUDFLARE_API_TOKEN.trim();
  const model = getConfiguredImageModel().trim();
  const formatConfig = resolveFormatConfig(imageFormat, platform);

  const prompt = await buildVisualPrompt({
    topic,
    imagePrompt,
    caption,
    style,
    formatKey: formatConfig.formatKey,
    platform,
  });

  const requestBody = {
    prompt,
    steps: 4,
  };

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

  let response;
  try {
    response = await axios.post(endpoint, requestBody, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer',
      validateStatus: () => true,
      timeout: 120000,
    });
  } catch (networkError) {
    if (networkError.code === 'ECONNABORTED') {
      throw new Error('Cloudflare Workers AI request timed out. Please try again.');
    }
    throw new Error(
      networkError.message || 'Network error while connecting to Cloudflare Workers AI.'
    );
  }

  const status = response.status;
  const rawBuffer = Buffer.from(response.data || '');

  if (status < 200 || status >= 300) {
    if (status === 401 || status === 403) {
      throw new Error(
        'Invalid Cloudflare API credentials. Please check CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.'
      );
    }
    if (status === 429) {
      throw new Error(
        'Cloudflare Workers AI rate limit or daily quota exceeded. Please try again later.'
      );
    }
    throw new Error(extractCloudflareErrorMessage(status, rawBuffer));
  }

  const contentType = String(response.headers['content-type'] || '').toLowerCase();
  let imageBuffer;

  if (contentType.includes('application/json')) {
    let parsed;
    try {
      parsed = JSON.parse(rawBuffer.toString('utf8'));
    } catch {
      throw new Error('Cloudflare Workers AI returned malformed JSON response.');
    }

    if (!parsed?.success || (Array.isArray(parsed.errors) && parsed.errors.length > 0)) {
      const cfMsg =
        parsed?.errors?.[0]?.message || 'Cloudflare Workers AI reported image generation failure.';
      throw new Error(cfMsg);
    }

    const base64Image = parsed?.result?.image;
    if (typeof base64Image !== 'string' || !base64Image.trim()) {
      throw new Error('Cloudflare Workers AI JSON response did not contain image data.');
    }

    const strippedBase64 = base64Image.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '').trim();
    imageBuffer = Buffer.from(strippedBase64, 'base64');
  } else if (
    contentType.startsWith('image/jpeg') ||
    contentType.startsWith('image/png') ||
    contentType.startsWith('image/webp')
  ) {
    imageBuffer = rawBuffer;
  } else {
    const preview = rawBuffer.toString('utf8', 0, 300);
    throw new Error(
      `Cloudflare returned unexpected Content-Type "${contentType || 'none'}": ${preview}`
    );
  }

  const imageMeta = inspectAndValidateImageBuffer(imageBuffer);

  ensureUploadDir();

  const fileName = `growvix_${Date.now()}_${Math.floor(Math.random() * 10000)}.${imageMeta.extension}`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  fs.writeFileSync(filePath, imageBuffer);

  const used = loadUsage();
  saveUsage(used + 1);

  const resolvedBaseUrl = (
    baseUrl ||
    process.env.BACKEND_URL ||
    `http://localhost:${process.env.PORT || 5000}`
  ).replace(/\/+$/, '');

  const imageUrl = `${resolvedBaseUrl}/api/images/serve/${fileName}`;

  return {
    provider: 'cloudflare',
    model,
    endpoint,
    imageUrl,
    fileName,
    prompt,
    platform,
    style,
    format: formatConfig.formatKey,
    width: imageMeta.width,
    height: imageMeta.height,
    mimeType: imageMeta.mimeType,
    bytes: imageBuffer.length,
  };
}

export async function serveImage(fileName, res) {
  try {
    const safeFileName = path.basename(String(fileName || ''));
    if (!safeFileName || safeFileName !== fileName) {
      return res.status(400).json({ message: 'Invalid image filename.' });
    }

    const filePath = path.join(UPLOAD_DIR, safeFileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    const buffer = fs.readFileSync(filePath);
    const meta = inspectAndValidateImageBuffer(buffer);

    res.setHeader('Content-Type', meta.mimeType);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Disposition', `inline; filename="${safeFileName}"`);

    return res.send(buffer);
  } catch (error) {
    console.error('[Image] Serve error:', error.message);
    return res.status(500).json({ message: error.message || 'Failed to serve image.' });
  }
}

export { IMAGE_STYLES, FORMAT_COMPOSITIONS };
