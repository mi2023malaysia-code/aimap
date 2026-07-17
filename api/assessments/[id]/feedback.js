const { nowIso } = require('../../../lib/disc-core');
const { getRequestPath, readJsonBody, sendJson, sendText } = require('../../_helpers');

function getAssessmentId(req) {
  if (req.query && req.query.id) {
    return String(req.query.id);
  }

  const pathParts = getRequestPath(req).split('/').filter(Boolean);
  return pathParts[2] || '';
}

module.exports = function feedbackAssessmentHandler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PATCH') {
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
      const accuracyRating = Number.parseInt(body.accuracyRating, 10);
      if (!(accuracyRating >= 1 && accuracyRating <= 7)) {
        sendJson(res, 400, { error: 'Accuracy rating must be between 1 and 7.' });
        return;
      }

      const submittedAt = nowIso();
      sendJson(res, 200, {
        assessmentId,
        completedAt: submittedAt,
        feedback: {
          accuracyRating,
          additionalFeedback: String(body.additionalFeedback || '').trim(),
          submittedAt,
        },
      });
    })
    .catch((error) => {
      sendJson(res, 400, { error: error.message });
    });
};
