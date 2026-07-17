const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');

function loadLocalEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  const contents = fs.readFileSync(envPath, 'utf8');
  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const withoutExport = trimmed.replace(/^export\s+/i, '');
    const equalsIndex = withoutExport.indexOf('=');
    if (equalsIndex === -1) {
      return;
    }

    const key = withoutExport.slice(0, equalsIndex).trim();
    if (!key || (process.env[key] !== undefined && process.env[key] !== '')) {
      return;
    }

    let value = withoutExport.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  });
}

loadLocalEnvFile();

function parseJsonEnv(value) {
  if (!value) {
    return '';
  }

  const trimmed = String(value).trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed[0] !== '{' && trimmed[0] !== '[') {
    return trimmed;
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') {
      if (typeof parsed.default === 'string' && parsed.default.trim()) {
        return parsed.default.trim();
      }

      const firstKey = Object.keys(parsed).find((key) => typeof parsed[key] === 'string' && String(parsed[key]).trim());
      if (firstKey) {
        return String(parsed[firstKey]).trim();
      }
    }
  } catch (error) {
    return '';
  }

  return '';
}

function getSupabaseConfig() {
  const url = String(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const secretKey = parseJsonEnv(process.env.SUPABASE_SECRET_KEY)
    || parseJsonEnv(process.env.SUPABASE_SERVICE_ROLE_KEY)
    || parseJsonEnv(process.env.SUPABASE_SECRET_KEYS)
    || String(process.env.SUPABASE_SERVICE_ROLE || '').trim();

  return {
    url,
    key: secretKey,
    available: Boolean(url && secretKey),
  };
}

function buildSearchParams(query) {
  if (!query) {
    return '';
  }

  if (typeof query === 'string') {
    return query.replace(/^\?/, '');
  }

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        params.append(key, String(item));
      });
      return;
    }

    params.set(key, String(value));
  });
  return params.toString();
}

function request(pathname, options) {
  const config = getSupabaseConfig();
  if (!config.available) {
    return Promise.reject(new Error('Supabase is not configured.'));
  }

  const method = String((options && options.method) || 'GET').toUpperCase();
  const queryString = buildSearchParams(options && options.query);
  const targetUrl = new URL(pathname, config.url);
  if (queryString) {
    targetUrl.search = queryString;
  }

  const headers = Object.assign({
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    Accept: 'application/json',
  }, options && options.headers ? options.headers : {});

  let payload = null;
  if (options && options.body !== undefined) {
    payload = JSON.stringify(options.body);
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    headers['Content-Length'] = Buffer.byteLength(payload);
  }

  return new Promise((resolve, reject) => {
    const transport = targetUrl.protocol === 'http:' ? http : https;
    const req = transport.request(targetUrl, {
      method,
      headers,
    }, (res) => {
      let text = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        text += chunk;
      });
      res.on('end', () => {
        const contentType = String(res.headers['content-type'] || '');
        let data = null;

        if (text) {
          const looksJson = contentType.includes('application/json') || /^[\[{]/.test(text.trim());
          if (looksJson) {
            try {
              data = JSON.parse(text);
            } catch (error) {
              data = text;
            }
          } else {
            data = text;
          }
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            status: res.statusCode,
            data,
            headers: res.headers,
          });
          return;
        }

        const message = data && typeof data === 'object'
          ? data.message || data.error || data.details || JSON.stringify(data)
          : text || `Supabase request failed with status ${res.statusCode}`;
        const error = new Error(message);
        error.statusCode = res.statusCode;
        error.body = data;
        reject(error);
      });
    });

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

function getRequestTarget(pathname, query) {
  const config = getSupabaseConfig();
  if (!config.available) {
    throw new Error('Supabase is not configured.');
  }

  const targetUrl = new URL(pathname, config.url);
  const queryString = buildSearchParams(query);
  if (queryString) {
    targetUrl.search = queryString;
  }
  return targetUrl;
}

module.exports = {
  buildSearchParams,
  getRequestTarget,
  getSupabaseConfig,
  request,
};
