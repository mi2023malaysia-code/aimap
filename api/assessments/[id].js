const { updateAssessmentSession } = require('../../lib/assessment-service');
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
      return updateAssessmentSession(assessmentId, body);
    })
    .then((result) => {
      sendJson(res, 200, result);
    })
    .catch((error) => {
      sendJson(res, error.statusCode || 400, { error: error.message });
    });
};
