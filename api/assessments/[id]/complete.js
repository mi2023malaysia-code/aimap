const {
  buildReport,
  computeScores,
  normalizeQuestions,
  sanitizeAnswers,
  nowIso,
} = require('../../../lib/disc-core');
const { getRequestPath, readJsonBody, sendJson, sendText } = require('../../_helpers');

function getAssessmentId(req) {
  if (req.query && req.query.id) {
    return String(req.query.id);
  }

  const pathParts = getRequestPath(req).split('/').filter(Boolean);
  return pathParts[2] || '';
}

module.exports = function completeAssessmentHandler(req, res) {
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
      const questions = normalizeQuestions(body.questions || body.questionsPresented || []);
      if (questions.length === 0) {
        sendJson(res, 400, {
          error: 'Questions are required to calculate the report.',
        });
        return;
      }

      const answers = sanitizeAnswers(questions, body.answers || {});
      const scores = computeScores(questions, answers);
      const report = buildReport(scores);
      const completedAt = nowIso();

      sendJson(res, 200, {
        assessmentId,
        completedAt,
        scores,
        report,
      });
    })
    .catch((error) => {
      sendJson(res, 400, { error: error.message });
    });
};
