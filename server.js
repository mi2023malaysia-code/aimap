const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {
  questionBank,
  profileLibrary,
  typeMeta,
  typeOrder,
} = require('./data/disc-data');

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, 'public');
const STORE_PATH = path.join(__dirname, 'data', 'assessments-runtime.json');
const PAGE_SIZE = 3;
const TOTAL_QUESTIONS = 10;

function ensureStore() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify({ assessments: [] }, null, 2));
  }
}

function loadStore() {
  ensureStore();
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.assessments)) {
      return { assessments: [] };
    }
    return parsed;
  } catch (error) {
    return { assessments: [] };
  }
}

function saveStore(store) {
  ensureStore();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

function nowIso() {
  return new Date().toISOString();
}

function randomId(prefix) {
  return [
    prefix,
    Date.now().toString(36),
    crypto.randomBytes(4).toString('hex'),
  ].join('_');
}

function sendJson(res, statusCode, body) {
  const payload = Buffer.from(JSON.stringify(body));
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': payload.length,
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

function sendText(res, statusCode, body, contentType) {
  const payload = Buffer.from(body);
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Content-Length': payload.length,
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function shuffle(items) {
  const array = items.slice();
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const temp = array[index];
    array[index] = array[swapIndex];
    array[swapIndex] = temp;
  }
  return array;
}

function sample(items, count) {
  return shuffle(items).slice(0, count);
}

function selectQuestions() {
  const quotas = {
    D: 2,
    I: 2,
    S: 2,
    C: 2,
  };

  shuffle(typeOrder).slice(0, 2).forEach((type) => {
    quotas[type] += 1;
  });

  const chosen = [];
  typeOrder.forEach((type) => {
    const pool = questionBank.filter((question) => question.type === type);
    const picks = sample(pool, quotas[type]).map((question) => ({ ...question }));
    chosen.push(...picks);
  });

  return shuffle(chosen).map((question, index) => ({
    ...question,
    order: index + 1,
  }));
}

function normalizeScore(avg) {
  const value = Math.round((((avg - 1) / 6) * 99) + 1);
  return Math.max(1, Math.min(100, value));
}

function computeScores(questions, answers) {
  const summary = typeOrder.reduce((acc, type) => {
    acc[type] = {
      sum: 0,
      count: 0,
      average: 0,
      score: 50,
    };
    return acc;
  }, {});

  questions.forEach((question) => {
    const rawValue = Number.parseInt(answers[question.id], 10);
    if (rawValue >= 1 && rawValue <= 7) {
      summary[question.type].sum += rawValue;
      summary[question.type].count += 1;
    }
  });

  typeOrder.forEach((type) => {
    if (summary[type].count > 0) {
      summary[type].average = summary[type].sum / summary[type].count;
      summary[type].score = normalizeScore(summary[type].average);
    }
  });

  return summary;
}

function determineBand(score) {
  if (score >= 80) {
    return 'high';
  }
  if (score >= 65) {
    return 'medium';
  }
  return 'balanced';
}

function buildReport(scores) {
  const ranking = typeOrder
    .map((type) => ({
      type,
      score: scores[type].score,
      average: scores[type].average,
      label: typeMeta[type].label,
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return typeOrder.indexOf(left.type) - typeOrder.indexOf(right.type);
    });

  const dominant = ranking[0];
  const runnerUp = ranking[1];
  const band = determineBand(dominant.score);
  const profile = profileLibrary[dominant.type][band];

  let blendNote = '';
  if (runnerUp && dominant.score - runnerUp.score <= 6) {
    blendNote = `Your profile is a blend of ${dominant.label} and ${runnerUp.label}, so you may show up as a flexible mix of both styles.`;
  }

  return {
    dominantType: dominant.type,
    dominantLabel: dominant.label,
    runnerUpType: runnerUp.type,
    runnerUpLabel: runnerUp.label,
    band,
    blendNote,
    headline: profile.headline,
    summary: profile.summary,
    careerSuggestions: profile.careerSuggestions,
    growthSuggestions: profile.growthSuggestions,
    jobSearchTip: profile.jobSearchTip,
    ranking,
  };
}

function sanitizeAnswers(questions, answers) {
  const normalized = {};
  const allowedIds = new Set(questions.map((question) => question.id));
  Object.entries(answers || {}).forEach(([id, value]) => {
    const rating = Number.parseInt(value, 10);
    if (allowedIds.has(id) && rating >= 1 && rating <= 7) {
      normalized[id] = rating;
    }
  });
  return normalized;
}

function snapshotAssessment(record) {
  return {
    id: record.id,
    status: record.status,
    updatedAt: record.updatedAt,
    currentPage: record.currentPage,
    identity: record.identity,
    questionsPresented: record.questionsPresented.map((question) => question.id),
    answeredCount: Object.keys(record.answers || {}).length,
    scores: record.scores || null,
    feedback: record.feedback || null,
  };
}

function appendHistory(record, event, extra) {
  record.pageHistory = record.pageHistory || [];
  record.pageHistory.push({
    event,
    timestamp: nowIso(),
    snapshot: snapshotAssessment(record),
    ...(extra || {}),
  });
}

function findAssessment(store, id) {
  return store.assessments.find((assessment) => assessment.id === id);
}

function handleCreateAssessment(req, res) {
  return readBody(req)
    .then((body) => {
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim();
      const phone = String(body.phone || '').trim();
      const consent = Boolean(body.consent);

      if (!name || !email || !consent) {
        sendJson(res, 400, {
          error: 'Name, email, and consent are required to start the assessment.',
        });
        return;
      }

      const selectedQuestions = selectQuestions();
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
        pageHistory: [],
      };

      appendHistory(assessment, 'assessment_created', {
        transition: {
          from: 'idle',
          to: 'identity',
        },
      });

      const store = loadStore();
      store.assessments.push(assessment);
      saveStore(store);

      sendJson(res, 200, {
        assessmentId: assessment.id,
        createdAt,
        pageSize: PAGE_SIZE,
        totalQuestions: TOTAL_QUESTIONS,
        pageCount: Math.ceil(selectedQuestions.length / PAGE_SIZE),
        questions: selectedQuestions,
      });
    })
    .catch((error) => {
      sendJson(res, 400, { error: error.message });
    });
}

function handleUpdateAssessment(req, res, id) {
  return readBody(req)
    .then((body) => {
      const store = loadStore();
      const assessment = findAssessment(store, id);
      if (!assessment) {
        sendJson(res, 404, { error: 'Assessment not found.' });
        return;
      }

      if (body.identity) {
        assessment.identity = {
          ...assessment.identity,
          ...body.identity,
        };
      }

      if (body.currentPage !== undefined) {
        assessment.currentPage = Number(body.currentPage);
      }

      if (body.answers) {
        assessment.answers = {
          ...assessment.answers,
          ...sanitizeAnswers(assessment.questionsPresented, body.answers),
        };
      }

      if (body.feedback) {
        assessment.feedback = {
          ...assessment.feedback,
          ...body.feedback,
        };
      }

      if (body.scores) {
        assessment.scores = body.scores;
      }

      if (body.report) {
        assessment.report = body.report;
      }

      if (body.status) {
        assessment.status = body.status;
      }

      assessment.updatedAt = nowIso();
      appendHistory(assessment, body.event || 'assessment_updated', {
        transition: body.transition || null,
      });

      saveStore(store);
      sendJson(res, 200, {
        assessmentId: assessment.id,
        updatedAt: assessment.updatedAt,
        status: assessment.status,
      });
    })
    .catch((error) => {
      sendJson(res, 400, { error: error.message });
    });
}

function handleCompleteAssessment(req, res, id) {
  return readBody(req)
    .then((body) => {
      const store = loadStore();
      const assessment = findAssessment(store, id);
      if (!assessment) {
        sendJson(res, 404, { error: 'Assessment not found.' });
        return;
      }

      assessment.answers = {
        ...assessment.answers,
        ...sanitizeAnswers(assessment.questionsPresented, body.answers || {}),
      };

      const scores = computeScores(assessment.questionsPresented, assessment.answers);
      const report = buildReport(scores);
      const completedAt = nowIso();

      assessment.scores = scores;
      assessment.report = report;
      assessment.completedAt = completedAt;
      assessment.updatedAt = completedAt;
      assessment.status = 'result_ready';

      appendHistory(assessment, 'result_generated', {
        transition: {
          from: body.from || 'questions',
          to: 'result',
        },
      });

      saveStore(store);

      sendJson(res, 200, {
        assessmentId: assessment.id,
        completedAt,
        scores,
        report,
      });
    })
    .catch((error) => {
      sendJson(res, 400, { error: error.message });
    });
}

function handleFeedbackAssessment(req, res, id) {
  return readBody(req)
    .then((body) => {
      const accuracyRating = Number.parseInt(body.accuracyRating, 10);
      if (!(accuracyRating >= 1 && accuracyRating <= 7)) {
        sendJson(res, 400, { error: 'Accuracy rating must be between 1 and 7.' });
        return;
      }

      const store = loadStore();
      const assessment = findAssessment(store, id);
      if (!assessment) {
        sendJson(res, 404, { error: 'Assessment not found.' });
        return;
      }

      assessment.feedback = {
        accuracyRating,
        additionalFeedback: String(body.additionalFeedback || '').trim(),
        submittedAt: nowIso(),
      };
      assessment.status = 'completed';
      assessment.updatedAt = assessment.feedback.submittedAt;
      assessment.completedAt = assessment.completedAt || assessment.feedback.submittedAt;

      appendHistory(assessment, 'feedback_submitted', {
        transition: {
          from: 'feedback',
          to: 'done',
        },
      });

      saveStore(store);

      sendJson(res, 200, {
        assessmentId: assessment.id,
        completedAt: assessment.completedAt,
        feedback: assessment.feedback,
      });
    })
    .catch((error) => {
      sendJson(res, 400, { error: error.message });
    });
}

function serveStatic(req, res, pathname) {
  const normalizedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, normalizedPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendText(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendText(res, 404, 'Not found', 'text/plain; charset=utf-8');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
  };

  res.writeHead(200, {
    'Content-Type': mimeTypes[ext] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const { pathname } = url;

  if (req.method === 'GET' && pathname === '/api/health') {
    sendJson(res, 200, { ok: true, service: 'disc-prototype', time: nowIso() });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/assessments') {
    handleCreateAssessment(req, res);
    return;
  }

  if (req.method === 'PATCH' && pathname.startsWith('/api/assessments/')) {
    const parts = pathname.split('/').filter(Boolean);
    const id = parts[2];
    if (parts.length === 3) {
      handleUpdateAssessment(req, res, id);
      return;
    }
    if (parts.length === 4 && parts[3] === 'complete') {
      handleCompleteAssessment(req, res, id);
      return;
    }
    if (parts.length === 4 && parts[3] === 'feedback') {
      handleFeedbackAssessment(req, res, id);
      return;
    }
  }

  if (req.method === 'POST' && pathname.startsWith('/api/assessments/')) {
    const parts = pathname.split('/').filter(Boolean);
    const id = parts[2];
    if (parts.length === 4 && parts[3] === 'complete') {
      handleCompleteAssessment(req, res, id);
      return;
    }
    if (parts.length === 4 && parts[3] === 'feedback') {
      handleFeedbackAssessment(req, res, id);
      return;
    }
  }

  if (req.method === 'GET') {
    serveStatic(req, res, pathname);
    return;
  }

  sendText(res, 405, 'Method not allowed', 'text/plain; charset=utf-8');
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`DISC prototype running at http://localhost:${PORT}`);
  });
}

module.exports = server;
