const { createAssessmentSession } = require('../../lib/assessment-service');
const { readJsonBody, sendJson, sendText } = require('../_helpers');

module.exports = function createAssessmentHandler(req, res) {
  if (req.method !== 'POST') {
    sendText(res, 405, 'Method not allowed', 'text/plain; charset=utf-8');
    return;
  }

  readJsonBody(req)
    .then((body) => {
      return createAssessmentSession(body);
    })
    .then((result) => {
      sendJson(res, 200, result);
    })
    .catch((error) => {
      sendJson(res, error.statusCode || 400, { error: error.message });
    });
};
