const crypto = require('crypto');
const {
  questionBank,
  profileLibrary,
  typeMeta,
  typeOrder,
} = require('../data/disc-data');

const PAGE_SIZE = 3;
const TOTAL_QUESTIONS = 10;

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

  (Array.isArray(questions) ? questions : []).forEach((question) => {
    const rawValue = Number.parseInt(answers && answers[question.id], 10);
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

function normalizeQuestions(rawQuestions) {
  if (!Array.isArray(rawQuestions)) {
    return [];
  }

  return rawQuestions
    .map((question, index) => {
      if (typeof question === 'string') {
        const base = questionBank.find((item) => item.id === question);
        if (!base) {
          return null;
        }
        return {
          ...base,
          order: index + 1,
        };
      }

      if (!question || typeof question !== 'object' || !question.id || !question.type || !question.text) {
        return null;
      }

      const order = Number(question.order);
      return {
        ...question,
        order: Number.isFinite(order) && order > 0 ? order : index + 1,
      };
    })
    .filter(Boolean);
}

function sanitizeAnswers(questions, answers) {
  const normalized = {};
  const allowedIds = new Set((Array.isArray(questions) ? questions : []).map((question) => question.id));

  Object.entries(answers || {}).forEach(([id, value]) => {
    const rating = Number.parseInt(value, 10);
    if (allowedIds.has(id) && rating >= 1 && rating <= 7) {
      normalized[id] = rating;
    }
  });

  return normalized;
}

module.exports = {
  PAGE_SIZE,
  TOTAL_QUESTIONS,
  buildReport,
  computeScores,
  determineBand,
  normalizeQuestions,
  normalizeScore,
  nowIso,
  profileLibrary,
  questionBank,
  randomId,
  sanitizeAnswers,
  sample,
  selectQuestions,
  shuffle,
  typeMeta,
  typeOrder,
};
