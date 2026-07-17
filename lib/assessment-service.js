const {
  PAGE_SIZE,
  TOTAL_QUESTIONS,
  buildReport,
  computeScores,
  nowIso,
  randomId,
  sanitizeAnswers,
  selectQuestions,
} = require('./disc-core');
const {
  appendAssessmentEvent,
  createAssessment,
  getAssessment,
  listQuestions,
  updateAssessment,
} = require('./assessment-store');

function snapshotAssessment(record) {
  return {
    id: record.id,
    status: record.status,
    updatedAt: record.updatedAt,
    currentPage: record.currentPage,
    identity: record.identity,
    questionsPresented: (record.questionsPresented || []).map((question) => question.id),
    answeredCount: Object.keys(record.answers || {}).length,
    scores: record.scores || null,
    feedback: record.feedback || null,
    completedAt: record.completedAt || null,
  };
}

async function createAssessmentSession(body) {
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || '').trim();
  const consent = Boolean(body.consent);

  if (!name || !email || !consent) {
    const error = new Error('Name, email, and consent are required to start the assessment.');
    error.statusCode = 400;
    throw error;
  }

  const questionPool = await listQuestions();
  const selectedQuestions = selectQuestions(questionPool);
  const createdAt = nowIso();
  const assessment = {
    id: randomId('asm'),
    createdAt,
    updatedAt: createdAt,
    status: 'identity_captured',
    currentPage: 0,
    identity: {
      name,
      email,
      phone,
      consent,
    },
    questionsPresented: selectedQuestions,
    answers: {},
    scores: null,
    report: null,
    feedback: null,
    completedAt: null,
    pageSize: PAGE_SIZE,
    totalQuestions: TOTAL_QUESTIONS,
    pageCount: Math.ceil(selectedQuestions.length / PAGE_SIZE),
  };

  await createAssessment(assessment);
  await appendAssessmentEvent({
    assessmentId: assessment.id,
    eventType: 'assessment_created',
    transition: {
      from: 'idle',
      to: 'identity',
    },
    payload: {
      pageSize: PAGE_SIZE,
      totalQuestions: TOTAL_QUESTIONS,
      questionBankSize: questionPool.length,
    },
    snapshot: snapshotAssessment(assessment),
    timestamp: createdAt,
  });

  return {
    assessmentId: assessment.id,
    createdAt,
    pageSize: PAGE_SIZE,
    totalQuestions: TOTAL_QUESTIONS,
    questionBankSize: questionPool.length,
    pageCount: assessment.pageCount,
    questions: selectedQuestions,
    identity: assessment.identity,
  };
}

async function updateAssessmentSession(assessmentId, body) {
  const current = await getAssessment(assessmentId);
  if (!current) {
    const error = new Error('Assessment not found.');
    error.statusCode = 404;
    throw error;
  }

  const nextState = {
    currentPage: current.currentPage,
    identity: current.identity,
    answers: current.answers,
    scores: current.scores,
    report: current.report,
    feedback: current.feedback,
    status: current.status,
    completedAt: current.completedAt || null,
  };

  if (body.identity) {
    nextState.identity = Object.assign({}, nextState.identity, body.identity);
  }

  if (body.currentPage !== undefined) {
    nextState.currentPage = Number(body.currentPage);
  }

  if (body.answers) {
    nextState.answers = Object.assign(
      {},
      nextState.answers,
      sanitizeAnswers(current.questionsPresented, body.answers)
    );
  }

  if (body.feedback) {
    nextState.feedback = Object.assign({}, nextState.feedback, body.feedback);
  }

  if (body.scores) {
    nextState.scores = body.scores;
  }

  if (body.report) {
    nextState.report = body.report;
  }

  if (body.status) {
    nextState.status = body.status;
  }

  const updatedAt = nowIso();
  const updated = await updateAssessment(assessmentId, Object.assign({}, nextState, {
    updatedAt,
  }));

  let eventType = body.event || 'assessment_updated';
  if (!body.event && body.transition && body.transition.direction === 'next') {
    eventType = 'page_next';
  } else if (!body.event && body.transition && body.transition.direction === 'back') {
    eventType = 'page_back';
  } else if (!body.event && body.transition && body.transition.to === 'feedback') {
    eventType = 'result_viewed';
  }

  await appendAssessmentEvent({
    assessmentId,
    eventType,
    transition: body.transition || null,
    payload: {
      currentPage: updated.currentPage,
      status: updated.status,
      answeredCount: Object.keys(updated.answers || {}).length,
    },
    snapshot: snapshotAssessment(updated),
    timestamp: updatedAt,
  });

  return {
    assessmentId: updated.id,
    updatedAt,
    status: updated.status,
  };
}

async function completeAssessmentSession(assessmentId, body) {
  const current = await getAssessment(assessmentId);
  if (!current) {
    const error = new Error('Assessment not found.');
    error.statusCode = 404;
    throw error;
  }

  const mergedAnswers = Object.assign(
    {},
    current.answers,
    sanitizeAnswers(current.questionsPresented, body.answers || {})
  );
  const scores = computeScores(current.questionsPresented, mergedAnswers);
  const report = buildReport(scores);
  const completedAt = nowIso();

  const updated = await updateAssessment(assessmentId, {
    answers: mergedAnswers,
    scores,
    report,
    completedAt,
    updatedAt: completedAt,
    status: 'result_ready',
  });

  await appendAssessmentEvent({
    assessmentId,
    eventType: 'result_generated',
    transition: {
      from: body.from || 'questions',
      to: 'result',
    },
    payload: {
      completedAt,
    },
    snapshot: snapshotAssessment(updated),
    timestamp: completedAt,
  });

  return {
    assessmentId: updated.id,
    completedAt,
    scores,
    report,
  };
}

async function submitFeedbackSession(assessmentId, body) {
  const accuracyRating = Number.parseInt(body.accuracyRating, 10);
  if (!(accuracyRating >= 1 && accuracyRating <= 7)) {
    const error = new Error('Accuracy rating must be between 1 and 7.');
    error.statusCode = 400;
    throw error;
  }

  const current = await getAssessment(assessmentId);
  if (!current) {
    const error = new Error('Assessment not found.');
    error.statusCode = 404;
    throw error;
  }

  const submittedAt = nowIso();
  const feedback = {
    accuracyRating,
    additionalFeedback: String(body.additionalFeedback || '').trim(),
    submittedAt,
  };

  const updated = await updateAssessment(assessmentId, {
    feedback,
    status: 'completed',
    completedAt: current.completedAt || submittedAt,
    updatedAt: submittedAt,
  });

  await appendAssessmentEvent({
    assessmentId,
    eventType: 'feedback_submitted',
    transition: {
      from: 'feedback',
      to: 'done',
    },
    payload: {
      accuracyRating,
    },
    snapshot: snapshotAssessment(updated),
    timestamp: submittedAt,
  });

  return {
    assessmentId: updated.id,
    completedAt: updated.completedAt || submittedAt,
    feedback,
  };
}

module.exports = {
  completeAssessmentSession,
  createAssessmentSession,
  submitFeedbackSession,
  updateAssessmentSession,
};
