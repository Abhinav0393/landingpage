import { createHash } from 'node:crypto';
import nodemailer from 'nodemailer';

/**
 * RIVORA contact endpoint for Vercel Functions.
 *
 * Replaces public/api/contact.php on Vercel. The PHP endpoint remains in the
 * repository for Apache/PHP hosting. Both receive the same form fields and
 * share the same SMTP environment variable names.
 */

const MAX_BODY_BYTES = 65536;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 5;
const ENQUIRIES = [
  'General enquiry',
  'Title verification and due diligence',
  'Property documentation',
  'Pre-litigation advisory',
  'Institutional acquisition',
  'Litigation support',
  'Other',
];

const rateBuckets = new Map();

function wantsJson(req) {
  return String(req.headers.accept || '').toLowerCase().includes('application/json');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

function setBaseHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
}

function sendJson(res, status, payload, extraHeaders = {}) {
  setBaseHeaders(res);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  for (const [key, value] of Object.entries(extraHeaders)) {
    res.setHeader(key, value);
  }
  res.end(JSON.stringify(payload));
}

function sendHtml(res, status, title, heading, message, errors = [], ok = false) {
  setBaseHeaders(res);
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; style-src 'unsafe-inline'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
  );

  const accent = ok ? '#A98A50' : '#C99A8C';
  const errorMarkup = errors.length
    ? `<ul class="errors">${errors
        .map((error) => `<li>${escapeHtml(error)}</li>`)
        .join('')}</ul>`
    : '';

  res.end(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(title)} | RIVORA</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #151922; color: #EDE8DD; font-family: "DM Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { width: 100%; max-width: 560px; background: #1B202B; border: 1px solid #303748; border-radius: 24px; padding: 32px; }
  img { width: 172px; height: auto; display: block; }
  .rule { height: 2px; width: 100%; background: ${accent}; margin: 26px 0; }
  h1 { font-size: 26px; line-height: 1.2; margin: 0 0 12px; color: #FBFAF7; letter-spacing: -0.02em; }
  p { font-size: 15px; line-height: 1.65; margin: 0; color: #C9C4BA; }
  .errors { margin: 18px 0 0; padding-left: 20px; color: #F0C7BD; font-size: 14px; line-height: 1.6; }
  .actions { margin-top: 26px; display: flex; flex-wrap: wrap; gap: 12px; }
  a { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 10px 20px; border-radius: 999px; border: 1px solid #A98A50; color: #151922; background: #A98A50; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; }
  a.secondary { background: transparent; color: #EDE8DD; border-color: #6B7280; }
  @media (max-width: 420px) { main { padding: 24px; } }
</style>
</head>
<body>
<main>
  <img src="/logo/RIVORA-logo-light-for-dark-backgrounds.svg" alt="RIVORA" width="172" height="41">
  <div class="rule"></div>
  <h1>${escapeHtml(heading)}</h1>
  <p>${escapeHtml(message)}</p>
  ${errorMarkup}
  <div class="actions">
    <a href="/#contact">Return to the website</a>
    <a class="secondary" href="tel:+918099888851">Call +91 8099888851</a>
  </div>
</main>
</body>
</html>`);
}

function respond(req, res, status, message, errors = [], extraHeaders = {}) {
  if (wantsJson(req)) {
    const payload = { ok: status >= 200 && status < 300, message };
    if (errors.length) payload.errors = errors;
    sendJson(res, status, payload, extraHeaders);
    return;
  }

  const heading =
    status === 422 ? 'Please check the enquiry' : status < 300 ? 'Enquiry received' : 'The enquiry could not be sent';
  sendHtml(res, status, status < 300 ? 'Enquiry received' : 'Enquiry', heading, message, errors, status < 300);
}

function normalizeText(value) {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

function singleLine(value) {
  return normalizeText(value).replace(/\s+/g, ' ').trim();
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function readFields(req, contentType) {
  const declaredLength = Number(req.headers['content-length'] || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    const error = new Error('Request body too large');
    error.code = 'TOO_LARGE';
    throw error;
  }

  // Vercel may expose a parsed request.body. Use it when present so the
  // handler works on both Vercel Functions and a plain Node HTTP server.
  const parsedBody = req.body;
  if (parsedBody && typeof parsedBody === 'object' && !Buffer.isBuffer(parsedBody)) {
    return parsedBody;
  }

  const rawBody =
    typeof parsedBody === 'string'
      ? parsedBody
      : Buffer.isBuffer(parsedBody)
        ? parsedBody.toString('utf8')
        : await readBody(req);

  return parseForm(rawBody, contentType);
}

async function readBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BODY_BYTES) {
      const error = new Error('Request body too large');
      error.code = 'TOO_LARGE';
      throw error;
    }
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

function parseForm(rawBody, contentType) {
  const type = String(contentType || '').split(';')[0].trim().toLowerCase();

  if (type === 'application/x-www-form-urlencoded') {
    return Object.fromEntries(new URLSearchParams(rawBody));
  }

  if (type === 'application/json') {
    const parsed = JSON.parse(rawBody || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  }

  return null;
}

function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '')
    .split(',')[0]
    .trim();
  return forwarded || String(req.headers['x-real-ip'] || req.socket?.remoteAddress || '0.0.0.0');
}

function withinRateLimit(ip) {
  const key = createHash('sha256').update(ip).digest('hex');
  const now = Date.now();
  const recent = (rateBuckets.get(key) || []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS);

  if (recent.length >= RATE_MAX) {
    rateBuckets.set(key, recent);
    return false;
  }

  recent.push(now);
  rateBuckets.set(key, recent);

  // Keep the per-instance map bounded on long-lived serverless instances.
  if (rateBuckets.size > 5000) {
    for (const [bucketKey, timestamps] of rateBuckets) {
      if (!timestamps.some((timestamp) => now - timestamp < RATE_WINDOW_MS)) {
        rateBuckets.delete(bucketKey);
      }
    }
  }

  return true;
}

function mailConfig() {
  const config = {
    host: String(process.env.SMTP_HOST || '').trim(),
    port: Number.parseInt(process.env.SMTP_PORT || '587', 10),
    secure: String(process.env.SMTP_SECURE || 'tls').trim().toLowerCase(),
    auth: String(process.env.SMTP_AUTH || 'true').trim().toLowerCase() !== 'false',
    user: String(process.env.SMTP_USER || '').trim(),
    pass: String(process.env.SMTP_PASS || ''),
    from: String(process.env.MAIL_FROM || '').trim(),
    fromName: String(process.env.MAIL_FROM_NAME || 'RIVORA Website').trim(),
    to: String(process.env.MAIL_TO || '').trim(),
    toName: String(process.env.MAIL_TO_NAME || 'RIVORA Chambers').trim(),
  };

  if (!config.host || !config.from || !config.to || !Number.isFinite(config.port)) {
    return { error: 'SMTP configuration incomplete' };
  }
  if (!isEmail(config.from) || !isEmail(config.to)) {
    return { error: 'Mailbox configuration invalid' };
  }
  if (config.auth && (!config.user || !config.pass)) {
    return { error: 'SMTP credentials incomplete' };
  }

  return { config };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    respond(req, res, 405, 'This endpoint accepts form submissions only.');
    return;
  }

  const contentType = req.headers['content-type'] || '';
  let fields;
  try {
    fields = await readFields(req, contentType);
  } catch (error) {
    if (error.code === 'TOO_LARGE') {
      respond(req, res, 413, 'The enquiry is too large. Please shorten the summary.');
      return;
    }
    console.error('RIVORA contact: invalid request body');
    respond(req, res, 400, 'The enquiry could not be read. Please try again.');
    return;
  }

  if (!fields) {
    respond(req, res, 415, 'This endpoint accepts form submissions only.');
    return;
  }

  const encodedFields = new URLSearchParams(
    Object.entries(fields).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : String(value)])
  ).toString();
  if (Buffer.byteLength(encodedFields) > MAX_BODY_BYTES) {
    respond(req, res, 413, 'The enquiry is too large. Please shorten the summary.');
    return;
  }

  const origin = String(req.headers.origin || '');
  if (origin) {
    try {
      const originHost = new URL(origin).host.toLowerCase();
      const requestHost = String(req.headers['x-forwarded-host'] || req.headers.host || '')
        .split(',')[0]
        .trim()
        .toLowerCase();
      if (!requestHost || originHost !== requestHost) {
        respond(req, res, 403, 'This form can only be submitted from the RIVORA website.');
        return;
      }
    } catch {
      respond(req, res, 403, 'This form can only be submitted from the RIVORA website.');
      return;
    }
  }

  // Honeypot: bots that fill the hidden field get a normal success response.
  if (singleLine(fields.website) !== '') {
    console.warn('RIVORA contact: honeypot rejected');
    respond(req, res, 200, 'Thank you. Your enquiry has been received; our office will respond using the contact details provided.');
    return;
  }

  const name = singleLine(fields.name);
  const email = singleLine(fields.email);
  const phone = singleLine(fields.phone);
  const location = singleLine(fields.location);
  const enquiry = singleLine(fields.enquiry);
  const message = normalizeText(fields.message);
  const errors = [];

  if (!name || name.length > 120) {
    errors.push('Please enter your full name (up to 120 characters).');
  }
  if (!email || email.length > 200 || !isEmail(email)) {
    errors.push('Please enter a valid email address.');
  }

  const phoneDigits = phone.replace(/\D+/g, '');
  if (!phone || phoneDigits.length < 7 || phoneDigits.length > 15) {
    errors.push('Please enter a telephone number with 7 to 15 digits.');
  }
  if (location.length > 200) {
    errors.push('Please keep the property location under 200 characters.');
  }
  if (!ENQUIRIES.includes(enquiry)) {
    errors.push('Please choose an enquiry type from the list.');
  }
  if (!message || message.length < 10) {
    errors.push('Please share a brief summary of at least 10 characters.');
  } else if (message.length > 5000) {
    errors.push('Please keep the summary under 5,000 characters.');
  }
  if (!fields.consent) {
    errors.push('Please confirm that you agree to the processing of your details.');
  }

  if (errors.length) {
    respond(req, res, 422, 'Please check the highlighted fields and send the enquiry again.', errors);
    return;
  }

  if (!withinRateLimit(clientIp(req))) {
    respond(
      req,
      res,
      429,
      'Too many enquiries have been sent from this connection. Please wait a few minutes or call +91 8099888851.',
      [],
      { 'Retry-After': String(RATE_WINDOW_MS / 1000) }
    );
    return;
  }

  const siteEnv = String(process.env.PUBLIC_SITE_ENV || '').trim().toLowerCase();
  const dryRun =
    process.env.CONTACT_DRY_RUN === '1' ||
    siteEnv !== 'production' ||
    String(process.env.VERCEL_ENV || '').trim().toLowerCase() === 'preview';

  if (dryRun) {
    console.info('RIVORA contact: preview dry-run, no mail sent');
    respond(req, res, 200, 'Preview mode: message not sent');
    return;
  }

  const { config, error: configError } = mailConfig();
  if (configError) {
    console.error(`RIVORA contact: ${configError}`);
    respond(req, res, 503, 'The enquiry desk is temporarily unavailable. Please call +91 8099888851.');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure === 'ssl' || config.secure === 'smtps',
      requireTLS: config.secure === 'tls' || config.secure === '',
      ignoreTLS: config.secure === 'none',
      auth: config.auth ? { user: config.user, pass: config.pass } : undefined,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });

    const submitted = new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
    const text = [
      'New consultation request from the RIVORA website.',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Telephone: ${phone}`,
      `Property location / survey no.: ${location || 'Not provided'}`,
      `Enquiry type: ${enquiry}`,
      '',
      'Summary:',
      message,
      '',
      `Submitted: ${submitted}`,
    ].join('\n');

    await transporter.sendMail({
      from: { name: config.fromName, address: config.from },
      to: { name: config.toName, address: config.to },
      replyTo: { name, address: email },
      subject: 'Website consultation request',
      text,
    });

    console.info('RIVORA contact: sent');
    respond(req, res, 200, 'Thank you. Your enquiry has been received; our office will respond using the contact details provided.');
  } catch (error) {
    console.error(`RIVORA contact: send failed (${error?.name || 'Error'})`);
    respond(req, res, 500, 'The enquiry could not be sent. Please try again, or call +91 8099888851.');
  }
}
