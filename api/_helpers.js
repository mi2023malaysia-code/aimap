function sendJson(res, statusCode, body) {
  const payload = Buffer.from(JSON.stringify(body));
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Length', payload.length);
  res.setHeader('Cache-Control', 'no-store');
  res.end(payload);
}

function sendText(res, statusCode, body, contentType) {
  const payload = Buffer.from(body);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', payload.length);
  res.setHeader('Cache-Control', 'no-store');
  res.end(payload);
}

function parseRequestBody(body) {
  if (Buffer.isBuffer(body)) {
    const text = body.toString('utf8');
    return text ? JSON.parse(text) : {};
  }

  if (typeof body === 'string') {
    return body ? JSON.parse(body) : {};
  }

  if (body && typeof body === 'object') {
    return body;
  }

  return {};
}

function readJsonBody(req) {
  if (Object.prototype.hasOwnProperty.call(req, 'body') && req.body !== undefined) {
    try {
      return Promise.resolve(parseRequestBody(req.body));
    } catch (error) {
      return Promise.reject(new Error('Invalid JSON body'));
    }
  }

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

function getRequestPath(req) {
  return new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname;
}

module.exports = {
  getRequestPath,
  readJsonBody,
  sendJson,
  sendText,
};
