const http = require('http');
const fs = require('fs');
const path = require('path');
const {
  completeAssessmentSession,
  createAssessmentSession,
  submitFeedbackSession,
  updateAssessmentSession,
} = require('./lib/assessment-service');
const { nowIso } = require('./lib/disc-core');

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, 'public');

function sendJson(res, statusCode, body) {
  const payload = Buffer.from(JSON.stringify(body));
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': payload.length,
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

function sendText(res, statusCode, body, contentType) {
  const payload = Buffer.from(body);
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Content-Length': payload.length,
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

function getErrorMessage(error, fallbackMessage) {
  return String((error && (error.message || error.code)) || fallbackMessage);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function serveStatic(res, pathname) {
  const normalizedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, normalizedPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendText(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendText(res, 404, 'Not found', 'text/plain; charset=utf-8');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
  };

  res.writeHead(200, {
    'Content-Type': mimeTypes[ext] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(filePath).pipe(res);
}

function parseAssessmentId(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  return parts[2] || '';
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const { pathname } = url;

  if (req.method === 'GET' && pathname === '/api/health') {
    sendJson(res, 200, { ok: true, service: 'disc-prototype', time: nowIso() });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/assessments') {
    try {
      const body = await readBody(req);
      const result = await createAssessmentSession(body);
      sendJson(res, 200, result);
    } catch (error) {
      sendJson(res, error.statusCode || 400, { error: getErrorMessage(error, 'Unable to create the assessment session.') });
    }
    return;
  }

  if (pathname.startsWith('/api/assessments/')) {
    const assessmentId = parseAssessmentId(pathname);
    if (!assessmentId) {
      sendJson(res, 400, { error: 'Assessment ID is required.' });
      return;
    }

    if ((req.method === 'PATCH' || req.method === 'POST') && pathname.indexOf('/complete') === -1 && pathname.indexOf('/feedback') === -1) {
      try {
        const body = await readBody(req);
        const result = await updateAssessmentSession(assessmentId, body);
        sendJson(res, 200, result);
      } catch (error) {
        sendJson(res, error.statusCode || 400, { error: getErrorMessage(error, 'Unable to update the assessment session.') });
      }
      return;
    }

    if ((req.method === 'POST' || req.method === 'PATCH') && pathname.endsWith('/complete')) {
      try {
        const body = await readBody(req);
        const result = await completeAssessmentSession(assessmentId, body);
        sendJson(res, 200, result);
      } catch (error) {
        sendJson(res, error.statusCode || 400, { error: getErrorMessage(error, 'Unable to complete the assessment session.') });
      }
      return;
    }

    if ((req.method === 'POST' || req.method === 'PATCH') && pathname.endsWith('/feedback')) {
      try {
        const body = await readBody(req);
        const result = await submitFeedbackSession(assessmentId, body);
        sendJson(res, 200, result);
      } catch (error) {
        sendJson(res, error.statusCode || 400, { error: getErrorMessage(error, 'Unable to save feedback for the assessment session.') });
      }
      return;
    }
  }

  if (req.method === 'GET') {
    serveStatic(res, pathname);
    return;
  }

  sendText(res, 405, 'Method not allowed', 'text/plain; charset=utf-8');
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    sendJson(res, 500, { error: getErrorMessage(error, 'Unexpected server error.') });
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`DISC prototype running at http://localhost:${PORT}`);
  });
}

module.exports = server;
