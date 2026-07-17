const { nowIso } = require('../lib/disc-core');
const { sendJson, sendText } = require('./_helpers');

module.exports = function healthHandler(req, res) {
  if (req.method !== 'GET') {
    sendText(res, 405, 'Method not allowed', 'text/plain; charset=utf-8');
    return;
  }

  sendJson(res, 200, {
    ok: true,
    service: 'disc-prototype',
    time: nowIso(),
    runtime: 'vercel',
  });
};
