const fs = require('fs');
const path = require('path');
const {
  normalizeQuestions,
  questionSeed,
  nowIso,
} = require('./disc-core');
const {
  getSupabaseConfig,
  request,
} = require('./supabase-rest');

const STORE_PATH = path.join(__dirname, '..', 'data', 'assessments-runtime.json');

function isSupabaseEnabled() {
  return getSupabaseConfig().available;
}

function createInitialLocalState() {
  return {
    questions: questionSeed.slice(),
    assessments: [],
    events: [],
  };
}

function normalizeLocalState(raw) {
  const fallback = createInitialLocalState();
  if (!raw || typeof raw !== 'object') {
    return fallback;
  }

  return {
    questions: normalizeQuestions(raw.questions || questionSeed),
    assessments: Array.isArray(raw.assessments) ? raw.assessments : [],
    events: Array.isArray(raw.events) ? raw.events : [],
  };
}

function ensureLocalStore() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(createInitialLocalState(), null, 2));
    return;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    const normalized = normalizeLocalState(parsed);
    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      fs.writeFileSync(STORE_PATH, JSON.stringify(normalized, null, 2));
    }
  } catch (error) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(createInitialLocalState(), null, 2));
  }
}

function loadLocalState() {
  ensureLocalStore();
  try {
    const parsed = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    return normalizeLocalState(parsed);
  } catch (error) {
    return createInitialLocalState();
  }
}

function saveLocalState(state) {
  ensureLocalStore();
  fs.writeFileSync(STORE_PATH, JSON.stringify(state, null, 2));
}

function mapQuestionRow(row, index) {
  if (!row) {
    return null;
  }

  const question = normalizeQuestions([{
    id: row.question_code || row.id,
    type: row.question_type || row.type,
    text: row.question_text || row.text,
    order: row.sort_order || row.order || index + 1,
  }])[0];

  return question || null;
}

function mapQuestionRecord(question, index) {
  return {
    question_code: question.id,
    question_type: question.type,
    question_text: question.text,
    sort_order: Number(question.order) || index + 1,
    is_active: true,
  };
}

function mapAssessmentRow(row) {
  if (!row) {
    return null;
  }

  const questionsPresented = normalizeQuestions(row.questions_presented || row.questionsPresented || []);
  const pageSize = Number(row.page_size || row.pageSize) || 4;
  const totalQuestions = Number(row.total_questions || row.totalQuestions) || 20;
  const pageCount = Number(row.page_count || row.pageCount)
    || Math.max(1, Math.ceil((questionsPresented.length || totalQuestions) / pageSize));

  return {
    id: row.assessment_id || row.id,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
    status: row.status,
    currentPage: Number(row.current_page !== undefined ? row.current_page : row.currentPage) || 0,
    identity: row.identity || {},
    questionsPresented,
    answers: row.answers || {},
    scores: row.scores || null,
    report: row.report || null,
    feedback: row.feedback || null,
    pageSize,
    totalQuestions,
    pageCount,
    completedAt: row.completed_at || row.completedAt || null,
  };
}

function toAssessmentRow(record) {
  return {
    assessment_id: record.id,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    status: record.status,
    current_page: record.currentPage,
    identity: record.identity || {},
    questions_presented: record.questionsPresented || [],
    answers: record.answers || {},
    scores: record.scores,
    report: record.report,
    feedback: record.feedback,
    page_size: record.pageSize,
    total_questions: record.totalQuestions,
    page_count: record.pageCount,
    completed_at: record.completedAt || null,
  };
}

function toAssessmentPatchRow(patch) {
  const row = {};

  if (patch.currentPage !== undefined) {
    row.current_page = Number(patch.currentPage) || 0;
  }
  if (patch.identity !== undefined) {
    row.identity = patch.identity || {};
  }
  if (patch.questionsPresented !== undefined) {
    row.questions_presented = patch.questionsPresented || [];
  }
  if (patch.answers !== undefined) {
    row.answers = patch.answers || {};
  }
  if (patch.scores !== undefined) {
    row.scores = patch.scores;
  }
  if (patch.report !== undefined) {
    row.report = patch.report;
  }
  if (patch.feedback !== undefined) {
    row.feedback = patch.feedback;
  }
  if (patch.status !== undefined) {
    row.status = patch.status;
  }
  if (patch.completedAt !== undefined) {
    row.completed_at = patch.completedAt || null;
  }
  if (patch.pageSize !== undefined) {
    row.page_size = Number(patch.pageSize) || 4;
  }
  if (patch.totalQuestions !== undefined) {
    row.total_questions = Number(patch.totalQuestions) || 20;
  }
  if (patch.pageCount !== undefined) {
    row.page_count = Number(patch.pageCount) || 5;
  }
  if (patch.updatedAt !== undefined) {
    row.updated_at = patch.updatedAt;
  }
  if (patch.createdAt !== undefined) {
    row.created_at = patch.createdAt;
  }

  return row;
}

function toEventRow(event) {
  return {
    assessment_id: event.assessmentId,
    event_type: event.eventType,
    transition: event.transition || null,
    payload: event.payload || {},
    snapshot: event.snapshot || {},
    created_at: event.timestamp || nowIso(),
  };
}

async function seedQuestionsIfNeeded() {
  if (!isSupabaseEnabled()) {
    return questionSeed.slice();
  }

  const existing = await request('/rest/v1/questions', {
    method: 'GET',
    query: {
      select: 'question_code,question_type,question_text,sort_order,is_active',
      order: 'sort_order.asc',
      is_active: 'eq.true',
    },
  });
  const rows = Array.isArray(existing.data) ? existing.data : [];
  const existingCodes = new Set(rows.map((row) => String(row.question_code || row.id || '').trim()).filter(Boolean));
  const missingRows = questionSeed.filter((question) => !existingCodes.has(question.id));

  if (missingRows.length > 0) {
    await request('/rest/v1/questions', {
      method: 'POST',
      query: {
        select: 'question_code',
      },
      headers: {
        Prefer: 'return=minimal',
      },
      body: missingRows.map(mapQuestionRecord),
    });

    const refreshed = await request('/rest/v1/questions', {
      method: 'GET',
      query: {
        select: 'question_code,question_type,question_text,sort_order,is_active',
        order: 'sort_order.asc',
        is_active: 'eq.true',
      },
    });
    return (Array.isArray(refreshed.data) ? refreshed.data : []).map(mapQuestionRow).filter(Boolean);
  }

  return rows.map(mapQuestionRow).filter(Boolean);
}

async function listQuestions() {
  if (!isSupabaseEnabled()) {
    const localState = loadLocalState();
    return normalizeQuestions(localState.questions || questionSeed);
  }

  const questions = await seedQuestionsIfNeeded();
  return normalizeQuestions(questions);
}

async function getAssessment(assessmentId) {
  if (!assessmentId) {
    return null;
  }

  if (!isSupabaseEnabled()) {
    const localState = loadLocalState();
    const record = localState.assessments.find((assessment) => assessment.id === assessmentId);
    return record ? mapAssessmentRow(record) : null;
  }

  const response = await request('/rest/v1/assessment_sessions', {
    method: 'GET',
    query: {
      select: '*',
      assessment_id: `eq.${assessmentId}`,
      limit: 1,
    },
  });

  const row = Array.isArray(response.data) ? response.data[0] : null;
  return row ? mapAssessmentRow(row) : null;
}

async function createAssessment(record) {
  if (!record || !record.id) {
    throw new Error('Assessment record is required.');
  }

  if (!isSupabaseEnabled()) {
    const localState = loadLocalState();
    localState.assessments.push(JSON.parse(JSON.stringify(record)));
    saveLocalState(localState);
    return mapAssessmentRow(record);
  }

  const response = await request('/rest/v1/assessment_sessions', {
    method: 'POST',
    query: {
      select: 'assessment_id',
    },
    headers: {
      Prefer: 'return=representation',
    },
    body: toAssessmentRow(record),
  });

  const row = Array.isArray(response.data) ? response.data[0] : response.data;
  return mapAssessmentRow(row || toAssessmentRow(record));
}

async function updateAssessment(assessmentId, patch) {
  if (!assessmentId) {
    throw new Error('Assessment ID is required.');
  }

  if (!isSupabaseEnabled()) {
    const localState = loadLocalState();
    const index = localState.assessments.findIndex((assessment) => assessment.id === assessmentId);
    if (index === -1) {
      throw new Error('Assessment not found.');
    }

    localState.assessments[index] = Object.assign({}, localState.assessments[index], patch);
    saveLocalState(localState);
    return mapAssessmentRow(localState.assessments[index]);
  }

  await request('/rest/v1/assessment_sessions', {
    method: 'PATCH',
    query: {
      assessment_id: `eq.${assessmentId}`,
    },
    headers: {
      Prefer: 'return=minimal',
    },
    body: toAssessmentPatchRow(patch),
  });

  const updated = await getAssessment(assessmentId);
  if (!updated) {
    throw new Error('Assessment not found.');
  }
  return updated;
}

async function appendAssessmentEvent(event) {
  if (!event || !event.assessmentId) {
    throw new Error('Assessment event requires an assessment ID.');
  }

  const payload = toEventRow(event);

  if (!isSupabaseEnabled()) {
    const localState = loadLocalState();
    localState.events.push(JSON.parse(JSON.stringify(payload)));
    saveLocalState(localState);
    return payload;
  }

  await request('/rest/v1/assessment_events', {
    method: 'POST',
    headers: {
      Prefer: 'return=minimal',
    },
    body: payload,
  });

  return payload;
}

module.exports = {
  appendAssessmentEvent,
  createAssessment,
  getAssessment,
  listQuestions,
  mapAssessmentRow,
  seedQuestionsIfNeeded,
  updateAssessment,
};
