const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_BODY_BYTES = 50 * 1024;
const requestTimes = new Map();
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of requestTimes) {
    const recent = timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
    if (recent.length) requestTimes.set(ip, recent);
    else requestTimes.delete(ip);
  }
}, 5 * 60_000);
cleanupTimer.unref?.();

class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });
  res.end(JSON.stringify(payload));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let settled = false;

    req.on('data', (chunk) => {
      if (settled) return;
      body += chunk.toString();
      if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
        settled = true;
        reject(new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.'));
        req.resume();
      }
    });

    req.on('end', () => {
      if (settled) return;
      try {
        const payload = body ? JSON.parse(body) : {};
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
          throw new Error('Expected a JSON object.');
        }
        settled = true;
        resolve(payload);
      } catch {
        settled = true;
        reject(new ApiError(400, 'INVALID_JSON', 'Request body must be a JSON object.'));
      }
    });

    req.on('error', (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    });
  });
}

function sanitize(value, maxLength) {
  return typeof value === 'string'
    ? value.trim().replace(/[<>]/g, '').slice(0, maxLength)
    : '';
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (requestTimes.get(ip) || []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    requestTimes.set(ip, recent);
    return true;
  }
  recent.push(now);
  requestTimes.set(ip, recent);
  return false;
}

async function dispatchContactNotification(contact, referenceId) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.info(`[Send contact accepted] ${referenceId}`);
    return;
  }

  const message = [
    'Новое сообщение с сайта Send',
    `Номер: ${referenceId}`,
    `Имя: ${contact.name}`,
    `Почта: ${contact.email}`,
    `Сообщение: ${contact.message || '—'}`
  ].join('\n');

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message }),
    signal: AbortSignal.timeout(8_000)
  });

  if (!response.ok) {
    throw new ApiError(502, 'NOTIFICATION_FAILED', 'Could not deliver the message. Please try again later.');
  }
}

/** Handles /api routes shared by the Vite middleware and standalone server. */
export async function handleApiRequest(req, res) {
  const url = new URL(req.url || '/', 'http://localhost');
  if (!url.pathname.startsWith('/api/')) return false;

  if (url.pathname === '/api/health' && req.method === 'GET') {
    sendJson(res, 200, { success: true, data: { status: 'healthy', service: 'send-messenger' } });
    return true;
  }

  if (url.pathname !== '/api/contact') {
    sendJson(res, 404, { success: false, error: { code: 'NOT_FOUND', message: 'API route not found.' } });
    return true;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST for this route.' } });
    return true;
  }

  const clientIp = req.socket.remoteAddress || 'unknown';
  if (isRateLimited(clientIp)) {
    sendJson(res, 429, { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Слишком много запросов. Попробуйте позже.' } });
    return true;
  }

  try {
    const payload = await parseJsonBody(req);
    if (payload.hp_website || payload.hp_field) {
      sendJson(res, 200, { success: true, data: { status: 'received' } });
      return true;
    }

    const contact = {
      name: sanitize(payload.name, 120),
      email: sanitize(payload.email, 254),
      message: sanitize(payload.message, 4000)
    };

    if (contact.name.length < 2) {
      throw new ApiError(422, 'VALIDATION_ERROR', 'Введите имя (не менее двух символов).');
    }
    if (!isValidEmail(contact.email)) {
      throw new ApiError(422, 'VALIDATION_ERROR', 'Проверьте адрес электронной почты.');
    }

    const referenceId = `SND-${Date.now().toString(36).toUpperCase()}`;
    await dispatchContactNotification(contact, referenceId);
    sendJson(res, 200, {
      success: true,
      data: { referenceId, status: 'received', message: 'Ваше сообщение принято.' }
    });
  } catch (error) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const code = error instanceof ApiError ? error.code : 'INTERNAL_ERROR';
    const message = error instanceof ApiError ? error.message : 'Не удалось отправить сообщение. Попробуйте позже.';
    sendJson(res, statusCode, { success: false, error: { code, message } });
  }

  return true;
}
