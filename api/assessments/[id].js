const { nowIso } = require('../../lib/disc-core');
const { getRequestPath, readJsonBody, sendJson, sendText } = require('../_helpers');

function getAssessmentId(req) {
  if (req.query && req.query.id) {
    return String(req.query.id);
  }

  const pathParts = getRequestPath(req).split('/').filter(Boolean);
  return pathParts[2] || '';
}

module.exports = function updateAssessmentHandler(req, res) {
  if (req.method !== 'PATCH' && req.method !== 'POST') {
    sendText(res, 405, 'Method not allowed', 'text/plain; charset=utf-8');
    return;
  }

  const assessmentId = getAssessmentId(req);
  if (!assessmentId) {
    sendJson(res, 400, { error: 'Assessment ID is required.' });
    return;
  }

  readJsonBody(req)
    .then((body) => {
      sendJson(res, 200, {
        assessmentId,
        updatedAt: nowIso(),
        status: body.status || 'questioning',
      });
    })
    .catch((error) => {
      sendJson(res, 400, { error: error.message });
    });
};
