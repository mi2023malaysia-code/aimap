const {
  PAGE_SIZE,
  TOTAL_QUESTIONS,
  nowIso,
  randomId,
  selectQuestions,
} = require('../../lib/disc-core');
const { readJsonBody, sendJson, sendText } = require('../_helpers');

module.exports = function createAssessmentHandler(req, res) {
  if (req.method !== 'POST') {
    sendText(res, 405, 'Method not allowed', 'text/plain; charset=utf-8');
    return;
  }

  readJsonBody(req)
    .then((body) => {
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim();
      const consent = Boolean(body.consent);
      const phone = String(body.phone || '').trim();

      if (!name || !email || !consent) {
        sendJson(res, 400, {
          error: 'Name, email, and consent are required to start the assessment.',
        });
        return;
      }

      const selectedQuestions = selectQuestions();
      const createdAt = nowIso();

      sendJson(res, 200, {
        assessmentId: randomId('asm'),
        createdAt,
        pageSize: PAGE_SIZE,
        totalQuestions: TOTAL_QUESTIONS,
        pageCount: Math.ceil(selectedQuestions.length / PAGE_SIZE),
        questions: selectedQuestions,
        identity: {
          name,
          email,
          phone,
          consent,
        },
      });
    })
    .catch((error) => {
      sendJson(res, 400, { error: error.message });
    });
};
