import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

interface StoredFileMeta {
  fileId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  sellerId: string;
  propertyId: string;
  docType: string;
  storedFileName: string;
  createdAt: string;
}

const META_FILE = path.join(UPLOAD_DIR, 'metadata.json');

function readMetaStore(): Record<string, StoredFileMeta> {
  try {
    if (fs.existsSync(META_FILE)) {
      return JSON.parse(fs.readFileSync(META_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading upload metadata:', err);
  }
  return {};
}

function writeMetaStore(store: Record<string, StoredFileMeta>) {
  try {
    fs.writeFileSync(META_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing upload metadata:', err);
  }
}

// Simple rate-limit map per IP
const rateLimitStore: Record<string, { count: number; resetAt: number }> = {};
function checkRateLimit(ip: string, maxRequests = 60, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimitStore[ip];
  if (!entry || now > entry.resetAt) {
    rateLimitStore[ip] = { count: 1, resetAt: now + windowMs };
    return true;
  }
  if (entry.count >= maxRequests) {
    return false;
  }
  entry.count += 1;
  return true;
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    const ip = req.ip || 'unknown';
    if (req.path.startsWith('/api/') && !checkRateLimit(ip, 300, 60_000)) {
      res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
      return;
    }
    next();
  });

  // Health & runtime status endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      platform: 'SLT Culture – Land Screening and Transforming (LST)',
      timestamp: new Date().toISOString(),
    });
  });

  // Same-origin proxy for Firebase Identity Toolkit & SecureToken APIs
  // Prevents browser extensions, cross-origin iframe restrictions, or client clock skew from causing auth/internal-error
  app.post('/api/firebase-auth-proxy', async (req, res) => {
    try {
      const { targetUrl, method = 'POST', headers = {}, body } = req.body || {};
      if (
        typeof targetUrl !== 'string' ||
        (!targetUrl.startsWith('https://identitytoolkit.googleapis.com/') &&
          !targetUrl.startsWith('https://securetoken.googleapis.com/'))
      ) {
        res.status(400).json({ error: 'Invalid Firebase Auth target URL.' });
        return;
      }

      const forwardHeaders: Record<string, string> = {
        'Content-Type': headers['Content-Type'] || headers['content-type'] || 'application/json',
      };
      for (const [k, v] of Object.entries(headers)) {
        const lower = k.toLowerCase();
        if (
          typeof v === 'string' &&
          (lower.startsWith('x-client-') ||
            lower.startsWith('x-firebase-') ||
            lower.startsWith('x-goog-') ||
            lower === 'authorization')
        ) {
          forwardHeaders[k] = v;
        }
      }

      const upstream = await fetch(targetUrl, {
        method,
        headers: forwardHeaders,
        body:
          method !== 'GET' && method !== 'HEAD' && body !== undefined
            ? typeof body === 'string'
              ? body
              : JSON.stringify(body)
            : undefined,
      });

      const responseText = await upstream.text();
      res.status(upstream.status);
      const contentType = upstream.headers.get('content-type');
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
      res.send(responseText);
    } catch (error: any) {
      console.error('Firebase Auth proxy error:', error);
      res.status(502).json({
        error: {
          code: 502,
          message: error?.message || 'FIREBASE_AUTH_PROXY_ERROR',
        },
      });
    }
  });

  // Protected Document Upload Endpoint
  // Accepts base64-encoded file payload with strict MIME type and size validation
  app.post('/api/documents/upload', (req, res) => {
    try {
      const {
        fileId,
        fileName,
        mimeType,
        base64Data,
        sellerId,
        propertyId,
        docType,
      } = req.body || {};

      if (!fileId || !fileName || !mimeType || !base64Data || !sellerId || !propertyId || !docType) {
        res.status(400).json({ error: 'Missing required document upload fields.' });
        return;
      }

      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        res.status(400).json({
          error: 'Unsupported file type. Allowed formats: PDF, JPG, PNG, WEBP.',
        });
        return;
      }

      const cleanBase64 = String(base64Data).replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');

      const MAX_BYTES = 6 * 1024 * 1024; // 6 MB limit
      if (buffer.length > MAX_BYTES) {
        res.status(400).json({ error: 'File size exceeds the 6 MB security limit.' });
        return;
      }

      const safeId = String(fileId).replace(/[^a-zA-Z0-9_-]/g, '');
      const ext = path.extname(String(fileName)).replace(/[^a-zA-Z0-9.]/g, '') || '.bin';
      const storedFileName = `${safeId}${ext}`;
      const filePath = path.join(UPLOAD_DIR, storedFileName);

      fs.writeFileSync(filePath, buffer);

      const metaStore = readMetaStore();
      const record: StoredFileMeta = {
        fileId: safeId,
        fileName: String(fileName).slice(0, 180),
        mimeType,
        fileSize: buffer.length,
        sellerId: String(sellerId),
        propertyId: String(propertyId),
        docType: String(docType),
        storedFileName,
        createdAt: new Date().toISOString(),
      };
      metaStore[safeId] = record;
      writeMetaStore(metaStore);

      const isPublicPhoto = docType === 'land_photo';
      res.status(201).json({
        fileId: safeId,
        fileUrl: isPublicPhoto
          ? `/api/documents/public/${safeId}`
          : `/api/documents/protected/${safeId}`,
        fileSize: buffer.length,
        mimeType,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to store uploaded file securely.' });
    }
  });

  // Public land photo endpoint
  app.get('/api/documents/public/:fileId', (req, res) => {
    const safeId = String(req.params.fileId || '').replace(/[^a-zA-Z0-9_-]/g, '');
    const metaStore = readMetaStore();
    const meta = metaStore[safeId];

    if (!meta || meta.docType !== 'land_photo') {
      res.status(404).json({ error: 'Public land photo not found.' });
      return;
    }

    const filePath = path.join(UPLOAD_DIR, meta.storedFileName);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'File binary not found.' });
      return;
    }

    res.setHeader('Content-Type', meta.mimeType);
    res.sendFile(filePath);
  });

  // Protected document download endpoint — requires requester UID & role check
  app.get('/api/documents/protected/:fileId', (req, res) => {
    const safeId = String(req.params.fileId || '').replace(/[^a-zA-Z0-9_-]/g, '');
    const requesterUid = String(req.query.uid || req.headers['x-user-uid'] || '');
    const requesterRole = String(req.query.role || req.headers['x-user-role'] || '');
    const requesterEmail = String(req.query.email || req.headers['x-user-email'] || '');

    const metaStore = readMetaStore();
    const meta = metaStore[safeId];

    if (!meta) {
      res.status(404).json({ error: 'Protected document not found.' });
      return;
    }

    const isBootstrapAdmin = requesterEmail === 'tarunpediredla9966@gmail.com';
    const isAuthorized =
      isBootstrapAdmin ||
      requesterRole === 'admin' ||
      requesterRole === 'agent' ||
      (requesterUid && requesterUid === meta.sellerId);

    if (!isAuthorized) {
      res.status(403).json({
        error: 'Access denied. Only the property owner and authorized SLT Culture staff can view this document.',
      });
      return;
    }

    const filePath = path.join(UPLOAD_DIR, meta.storedFileName);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Stored document file not found on server.' });
      return;
    }

    res.setHeader('Content-Type', meta.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${meta.fileName.replace(/"/g, '')}"`);
    res.sendFile(filePath);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SLT Culture – LST Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
