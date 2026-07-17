const TYPE_META = {
  D: { label: 'Dominance', short: 'D', color: '#ff6a3d', deep: '#ff4d1f' },
  I: { label: 'Influence', short: 'I', color: '#f6b73c', deep: '#d99a00' },
  S: { label: 'Steadiness', short: 'S', color: '#25b38a', deep: '#13805f' },
  C: { label: 'Conscientiousness', short: 'C', color: '#4f7cff', deep: '#2e62ff' },
};

const TYPE_ORDER = ['D', 'I', 'S', 'C'];
const PAGE_SIZE = 3;

const app = document.getElementById('app');
const toast = document.getElementById('toast');
const progressFill = document.getElementById('progress-fill');
const progressLabel = document.getElementById('progress-label');
const recordId = document.getElementById('record-id');
const railNote = document.getElementById('rail-note');
const panelKicker = document.getElementById('panel-kicker');
const panelTitle = document.getElementById('panel-title');
const panelStatus = document.getElementById('panel-status');
const stepItems = Array.from(document.querySelectorAll('[data-step-item]'));

const state = {
  phase: 'identity',
  submitting: false,
  assessmentId: null,
  pageSize: PAGE_SIZE,
  pageCount: 0,
  totalQuestions: 10,
  questions: [],
  currentPage: 0,
  identity: {
    name: '',
    email: '',
    phone: '',
    consent: false,
  },
  answers: {},
  scores: null,
  report: null,
  feedback: {
    accuracyRating: null,
    additionalFeedback: '',
  },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const expanded = clean.length === 3
    ? clean.split('').map((part) => part + part).join('')
    : clean;
  const value = Number.parseInt(expanded, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function setThemeFromType(type) {
  const meta = TYPE_META[type] || TYPE_META.C;
  const rgb = hexToRgb(meta.color);
  document.documentElement.style.setProperty('--accent', meta.color);
  document.documentElement.style.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  document.documentElement.style.setProperty('--accent-deep', meta.deep);
}

function showToast(message, kind = 'info') {
  toast.textContent = message;
  toast.className = `toast is-${kind}`;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.hidden = true;
  }, 4200);
}

function setStatus(stepKey, title, status, note) {
  panelKicker.textContent = title;
  panelTitle.textContent = stepKey;
  panelStatus.textContent = status;
  railNote.textContent = note;
}

function getPhaseLabel() {
  switch (state.phase) {
    case 'identity':
      return {
        title: 'Step 1',
        panel: 'Identity capture',
        status: 'Ready to begin',
        note: 'Enter your details to create the assessment session.',
      };
    case 'questions':
      return {
        title: `Step 2 of ${state.pageCount || 4}`,
        panel: 'Question pages',
        status: `Page ${state.currentPage + 1} of ${state.pageCount || 4}`,
        note: 'Each page transition is saved for this assessment session.',
      };
    case 'result':
      return {
        title: 'Step 3',
        panel: 'Result report',
        status: 'Scores and guidance ready',
        note: 'The report is static, prewritten content selected from the DISC library.',
      };
    case 'feedback':
      return {
        title: 'Step 4',
        panel: 'Feedback',
        status: 'Final step',
        note: 'Tell us whether the result feels accurate and what should improve.',
      };
    case 'done':
      return {
        title: 'Complete',
        panel: 'Assessment complete',
        status: 'Local record saved',
        note: 'The assessment has been logged with feedback for later analysis.',
      };
    default:
      return {
        title: 'Step',
        panel: 'DISC prototype',
        status: 'Ready',
        note: '',
      };
  }
}

function getProgressPercent() {
  switch (state.phase) {
    case 'identity':
      return 12;
    case 'questions': {
      const pageCount = Math.max(state.pageCount, 1);
      return 20 + (((state.currentPage + 1) / pageCount) * 48);
    }
    case 'result':
      return 78;
    case 'feedback':
      return 92;
    case 'done':
      return 100;
    default:
      return 0;
  }
}

function updateSidebar() {
  const meta = getPhaseLabel();
  const progress = Math.max(0, Math.min(100, getProgressPercent()));

  panelKicker.textContent = meta.title;
  panelTitle.textContent = meta.panel;
  panelStatus.textContent = meta.status;
  railNote.textContent = meta.note;
  progressFill.style.width = `${progress}%`;
  progressLabel.textContent = `${Math.round(progress)}%`;
  recordId.textContent = state.assessmentId || 'Pending';

  const activeIndex = {
    identity: 0,
    questions: 1,
    result: 2,
    feedback: 3,
    done: 3,
  }[state.phase] || 0;

  stepItems.forEach((item, index) => {
    item.classList.toggle('is-active', index === activeIndex);
    item.classList.toggle('is-complete', index < activeIndex);
  });

  if (state.report && state.report.dominantType) {
    setThemeFromType(state.report.dominantType);
  } else {
    setThemeFromType('C');
  }
}

function getCurrentPageQuestions() {
  const start = state.currentPage * state.pageSize;
  return state.questions.slice(start, start + state.pageSize);
}

function collectAnswersFromForm(form, questions) {
  const formData = new FormData(form);
  const answers = {};
  const missing = [];

  questions.forEach((question) => {
    const value = formData.get(question.id);
    if (value === null || value === undefined || value === '') {
      missing.push(question.id);
      return;
    }
    answers[question.id] = Number.parseInt(value, 10);
  });

  return {
    answers,
    missing,
  };
}

function renderIdentityStep() {
  return `
    <form id="identity-form" class="flow">
      <section class="flow-card">
        <h3>Start with identity capture.</h3>
        <p>
          The prototype creates a record before the assessment begins so page transitions and
          partial progress can be logged as you move.
        </p>

        <div class="input-grid">
          <div class="field">
            <label for="name">Full name</label>
            <input id="name" name="name" type="text" placeholder="Your full name" autocomplete="name" required />
          </div>

          <div class="field">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" autocomplete="email" required />
          </div>
        </div>

        <div class="field" style="margin-top: 16px;">
          <label for="phone">Phone number <span class="field-help">(optional)</span></label>
          <input id="phone" name="phone" type="tel" placeholder="+1 555 123 4567" autocomplete="tel" />
        </div>

        <div class="privacy-box">
          <div class="privacy-row">
          <input id="consent" name="consent" type="checkbox" ${state.identity.consent ? 'checked' : ''} />
          <label for="consent">
              I consent to this prototype storing my assessment answers, scores, and feedback
              for this assessment session.
            </label>
          </div>
          <p class="field-help">
            No email is sent. The result appears on-screen only, and the assessment stays tied
            to this session.
          </p>
        </div>
      </section>

      <div class="form-actions">
        <div class="field-help">
          The assessment uses a balanced random draw so all four DISC types are represented.
        </div>
        <div class="button-row">
          <button class="button button-primary" type="submit">Create assessment session</button>
        </div>
      </div>
    </form>
  `;
}

function renderQuestionCard(question) {
  const currentValue = state.answers[question.id];
  const meta = TYPE_META[question.type];
  const options = Array.from({ length: 7 }, (_, index) => index + 1)
    .map((rating) => {
      const selected = Number(currentValue) === rating;
      return `
        <label class="likert-option ${selected ? 'is-selected' : ''}" aria-label="${rating}">
          <input type="radio" name="${question.id}" value="${rating}" ${selected ? 'checked' : ''} />
          <span>${rating}</span>
        </label>
      `;
    })
    .join('');

  return `
    <section class="question-card">
      <div class="question-top">
        <span>Q${question.order} of ${state.totalQuestions}</span>
        <strong>${escapeHtml(meta.short)} - ${escapeHtml(meta.label)}</strong>
      </div>
      <h3>${escapeHtml(question.text)}</h3>
      <div class="question-scale">1 = strongly disagree, 7 = strongly agree</div>
      <div class="likert-grid" role="radiogroup" aria-label="${escapeHtml(question.text)}">
        ${options}
      </div>
    </section>
  `;
}

function renderQuestionsStep() {
  const currentQuestions = getCurrentPageQuestions();
  const isFirstPage = state.currentPage === 0;
  const isLastPage = state.currentPage === state.pageCount - 1;
  const answered = Object.keys(state.answers).length;

  return `
    <form id="questions-form" class="flow">
      <section class="flow-card">
        <h3>Page ${state.currentPage + 1} of ${state.pageCount}</h3>
        <p>
          Answer the three statements on this page. Your progress is saved whenever you move
          forward or back.
        </p>

        <div class="question-meta">
          <span><strong>${answered}</strong> of ${state.totalQuestions} answered</span>
          <span>Likert scale: <strong>1 to 7</strong></span>
        </div>
      </section>

      <div class="question-stack">
        ${currentQuestions.map(renderQuestionCard).join('')}
      </div>

      <div class="nav-bar">
        <div class="field-help">
          ${isFirstPage ? 'No back step before the first page.' : 'You can step back to review previous answers.'}
        </div>
        <div class="button-row">
          ${isFirstPage ? '' : '<button class="button button-secondary" type="button" data-action="back">Back</button>'}
          <button class="button button-primary" type="submit">${isLastPage ? 'Get my report' : 'Next page'}</button>
        </div>
      </div>
    </form>
  `;
}

function renderScoreTiles() {
  if (!state.scores) {
    return '';
  }

  return TYPE_ORDER.map((type) => {
    const meta = TYPE_META[type];
    const score = state.scores[type] ? state.scores[type].score : 0;
    const width = Math.max(4, Math.min(100, score));
    return `
      <article class="score-tile" style="--tile-accent: ${meta.color}">
        <div class="label">
          <span>${escapeHtml(meta.short)} - ${escapeHtml(meta.label)}</span>
          <strong>${score}</strong>
        </div>
        <div class="score">${score}</div>
        <div class="score-bar"><span style="width: ${width}%;"></span></div>
      </article>
    `;
  }).join('');
}

function renderResultStep() {
  if (!state.report || !state.scores) {
    return `
      <section class="flow-card">
        <h3>Result not ready</h3>
        <p>The report will appear once the question page has been submitted.</p>
      </section>
    `;
  }

  const report = state.report;
  const dominantMeta = TYPE_META[report.dominantType];

  return `
    <div class="result-layout">
      <section class="result-hero">
        <div class="result-badges">
          <span class="badge badge-accent">${escapeHtml(report.dominantType)} - ${escapeHtml(dominantMeta.label)}</span>
          <span class="badge">${escapeHtml(report.band.toUpperCase())} signal</span>
          <span class="badge">Fresh grad fit</span>
        </div>
        <h3>${escapeHtml(report.headline)}</h3>
        <p>${escapeHtml(report.summary)}</p>
        ${report.blendNote ? `<div class="callout"><p>${escapeHtml(report.blendNote)}</p></div>` : ''}
      </section>

      <div class="result-grid">
        <section class="chart-card">
          <h4>Radar chart</h4>
          <div class="chart-wrap">
            <canvas id="radar-chart" class="chart-canvas" width="900" height="540" aria-label="DISC radar chart"></canvas>
          </div>
        </section>

        <section class="summary-card">
          <h4>Score summary</h4>
          <div class="score-grid">
            ${renderScoreTiles()}
          </div>
        </section>
      </div>

      <div class="result-grid">
        <section class="list-card">
          <h4>Career suggestions</h4>
          <ul>
            ${report.careerSuggestions.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </section>

        <section class="list-card">
          <h4>Self-improvement suggestions</h4>
          <ul>
            ${report.growthSuggestions.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </section>
      </div>

      <section class="insight-card">
        <h4>Job search tip</h4>
        <p>${escapeHtml(report.jobSearchTip)}</p>
      </section>

      <div class="nav-bar">
        <div class="field-help">
          The report is static and prewritten. It is not generated by an AI model at runtime.
        </div>
        <div class="button-row">
          <button class="button button-primary" type="button" data-action="to-feedback">Continue to feedback</button>
        </div>
      </div>
    </div>
  `;
}

function renderFeedbackStep() {
  const ratings = Array.from({ length: 7 }, (_, index) => index + 1)
    .map((rating) => {
      const selected = Number(state.feedback.accuracyRating) === rating;
      return `
        <label class="rating-option ${selected ? 'is-selected' : ''}" aria-label="${rating}">
          <input type="radio" name="accuracyRating" value="${rating}" ${selected ? 'checked' : ''} />
          <span>${rating}</span>
        </label>
      `;
    })
    .join('');

  return `
    <form id="feedback-form" class="flow">
      <section class="flow-card">
        <h3>How close does the report feel?</h3>
        <div class="feedback-statement">
          <p class="field-help">
            Accuracy rating uses a 1 to 7 scale, where 1 means "not like me at all" and 7 means
            "very accurate".
          </p>
          <div class="rating-grid">
            ${ratings}
          </div>
        </div>
      </section>

      <section class="flow-card">
        <h3>What should improve?</h3>
        <div class="field">
          <label for="additionalFeedback">Open-text suggestions</label>
          <textarea id="additionalFeedback" name="additionalFeedback" placeholder="Tell us what felt accurate, what felt off, or what you would like to see next.">${escapeHtml(state.feedback.additionalFeedback)}</textarea>
        </div>
      </section>

      <div class="nav-bar">
        <div class="field-help">
          Feedback is attached to the same assessment session.
        </div>
        <div class="button-row">
          <button class="button button-primary" type="submit">Submit feedback</button>
        </div>
      </div>
    </form>
  `;
}

function renderDoneStep() {
  return `
    <div class="done-panel">
      <section class="result-hero">
        <div class="result-badges">
          <span class="badge badge-accent">Completed</span>
          <span class="badge">Session updated</span>
        </div>
        <h3>Thanks, your feedback has been saved.</h3>
        <p>
          The assessment session now includes identity details, selected questions, all answers,
          scores, and feedback for later analysis.
        </p>
      </section>

      <section class="flow-card">
        <h3>What is stored</h3>
        <ul>
          <li>Name, email, and optional phone</li>
          <li>Exact questions shown in this session</li>
          <li>All answered ratings and calculated DISC scores</li>
          <li>Accuracy rating and open-text suggestions</li>
        </ul>
      </section>

        <div class="nav-bar">
        <div class="field-help">
          You can restart the flow to create a new assessment session.
        </div>
        <div class="button-row">
          <button class="button button-secondary" type="button" data-action="restart">Start a new assessment</button>
        </div>
      </div>
    </div>
  `;
}

function renderStep() {
  if (state.phase === 'identity') {
    app.innerHTML = renderIdentityStep();
  } else if (state.phase === 'questions') {
    app.innerHTML = renderQuestionsStep();
  } else if (state.phase === 'result') {
    app.innerHTML = renderResultStep();
  } else if (state.phase === 'feedback') {
    app.innerHTML = renderFeedbackStep();
  } else {
    app.innerHTML = renderDoneStep();
  }
  updateSidebar();
  syncFormDefaults();
  wireCurrentFormHandlers();
  if (state.phase === 'result') {
    requestAnimationFrame(drawRadarChart);
  }
}

function setSubmitting(value) {
  state.submitting = value;
}

async function createAssessmentFromIdentity(form) {
  if (state.submitting) {
    return;
  }

  const formData = new FormData(form);
  const identity = {
    name: String(formData.get('name') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    phone: String(formData.get('phone') || '').trim(),
    consent: formData.get('consent') === 'on',
  };

  if (!identity.name || !identity.email || !identity.consent) {
    showToast('Please enter your name, email, and consent before continuing.', 'error');
    return;
  }

  setSubmitting(true);
  try {
    const response = await fetch('/api/assessments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(identity),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Unable to create the assessment session.');
    }

    state.assessmentId = data.assessmentId;
    state.pageSize = data.pageSize || PAGE_SIZE;
    state.pageCount = data.pageCount || Math.ceil((data.questions || []).length / PAGE_SIZE);
    state.totalQuestions = data.totalQuestions || 10;
    state.questions = Array.isArray(data.questions) ? data.questions : [];
    state.identity = identity;
    state.answers = {};
    state.currentPage = 0;
    state.report = null;
    state.scores = null;
    state.feedback = {
      accuracyRating: null,
      additionalFeedback: '',
    };
    state.phase = 'questions';
    renderStep();
    showToast('Assessment record created. The first question page is ready.', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setSubmitting(false);
  }
}

async function saveQuestionTransition(transition, extra = {}) {
  if (!state.assessmentId) {
    return;
  }

  const response = await fetch(`/api/assessments/${state.assessmentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      currentPage: extra.currentPage !== undefined ? extra.currentPage : state.currentPage,
      answers: state.answers,
      transition,
      ...extra,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Unable to save progress.');
  }
}

async function submitQuestionPage(form) {
  if (state.submitting) {
    return;
  }

  const currentQuestions = getCurrentPageQuestions();
  const { answers, missing } = collectAnswersFromForm(form, currentQuestions);
  state.answers = {
    ...state.answers,
    ...answers,
  };

  if (missing.length > 0) {
    showToast('Please answer every question on this page before continuing.', 'error');
    return;
  }

  setSubmitting(true);
  try {
    if (state.currentPage < state.pageCount - 1) {
      const nextPage = state.currentPage + 1;
      await saveQuestionTransition(
        {
          from: 'questions',
          to: 'questions',
          direction: 'next',
          page: nextPage + 1,
        },
        {
          currentPage: nextPage,
          status: 'questioning',
        }
      );
      state.currentPage = nextPage;
      renderStep();
    } else {
      const response = await fetch(`/api/assessments/${state.assessmentId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: state.answers,
          questions: state.questions,
          from: 'questions',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to calculate the report.');
      }

      state.scores = data.scores;
      state.report = data.report;
      state.phase = 'result';
      renderStep();
      showToast('Your DISC report is ready.', 'success');
    }
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setSubmitting(false);
  }
}

async function handleBackQuestionPage(form) {
  if (state.submitting || state.currentPage === 0) {
    return;
  }

  const currentQuestions = getCurrentPageQuestions();
  const { answers } = collectAnswersFromForm(form, currentQuestions);
  state.answers = {
    ...state.answers,
    ...answers,
  };

  setSubmitting(true);
  try {
    const previousPage = state.currentPage - 1;
    await saveQuestionTransition(
      {
        from: 'questions',
        to: 'questions',
        direction: 'back',
        page: previousPage + 1,
      },
      {
        currentPage: previousPage,
        status: 'questioning',
      }
    );
    state.currentPage = previousPage;
    renderStep();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setSubmitting(false);
  }
}

async function moveToFeedback() {
  if (state.submitting) {
    return;
  }

  setSubmitting(true);
  try {
    await saveQuestionTransition(
      {
        from: 'result',
        to: 'feedback',
        direction: 'forward',
      },
      {
        currentPage: state.currentPage,
        scores: state.scores,
        report: state.report,
        status: 'result_viewed',
      }
    );
    state.phase = 'feedback';
    renderStep();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setSubmitting(false);
  }
}

async function submitFeedback(form) {
  if (state.submitting) {
    return;
  }

  const formData = new FormData(form);
  const accuracyRating = Number.parseInt(formData.get('accuracyRating'), 10);
  const additionalFeedback = String(formData.get('additionalFeedback') || '').trim();

  if (!(accuracyRating >= 1 && accuracyRating <= 7)) {
    showToast('Please choose an accuracy rating before submitting.', 'error');
    return;
  }

  setSubmitting(true);
  try {
    const response = await fetch(`/api/assessments/${state.assessmentId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accuracyRating,
        additionalFeedback,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Unable to save feedback.');
    }

    state.feedback = {
      accuracyRating,
      additionalFeedback,
    };
    state.phase = 'done';
    renderStep();
    showToast('Feedback saved. The prototype flow is complete.', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setSubmitting(false);
  }
}

function resetAssessment() {
  state.phase = 'identity';
  state.submitting = false;
  state.assessmentId = null;
  state.pageSize = PAGE_SIZE;
  state.pageCount = 0;
  state.totalQuestions = 10;
  state.questions = [];
  state.currentPage = 0;
  state.identity = {
    name: '',
    email: '',
    phone: '',
    consent: false,
  };
  state.answers = {};
  state.scores = null;
  state.report = null;
  state.feedback = {
    accuracyRating: null,
    additionalFeedback: '',
  };
  renderStep();
  showToast('Ready for a fresh assessment session.', 'info');
}

function drawRadarChart() {
  const canvas = document.getElementById('radar-chart');
  if (!canvas || !state.scores) {
    return;
  }

  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const width = rect.width;
  const height = rect.height;
  const centerX = width / 2;
  const centerY = height / 2 + 4;
  const radius = Math.min(width, height) * 0.32;
  const axes = ['D', 'I', 'S', 'C'];
  const angles = axes.map((_, index) => (-Math.PI / 2) + ((Math.PI / 2) * index));

  ctx.clearRect(0, 0, width, height);

  const rings = 5;
  ctx.lineWidth = 1;
  for (let ring = 1; ring <= rings; ring += 1) {
    const ringRadius = (radius / rings) * ring;
    ctx.beginPath();
    axes.forEach((axis, index) => {
      const angle = angles[index];
      const x = centerX + Math.cos(angle) * ringRadius;
      const y = centerY + Math.sin(angle) * ringRadius;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    ctx.strokeStyle = ring === rings ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)';
    ctx.stroke();
  }

  axes.forEach((axis, index) => {
    const angle = angles[index];
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.stroke();
  });

  const points = axes.map((axis, index) => {
    const score = state.scores[axis] ? state.scores[axis].score : 0;
    const pointRadius = (score / 100) * radius;
    const angle = angles[index];
    return {
      axis,
      score,
      x: centerX + Math.cos(angle) * pointRadius,
      y: centerY + Math.sin(angle) * pointRadius,
      angle,
    };
  });

  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.closePath();
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, 'rgba(79, 124, 255, 0.34)');
  gradient.addColorStop(1, 'rgba(37, 179, 138, 0.28)');
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2.4;
  ctx.stroke();

  points.forEach((point) => {
    const meta = TYPE_META[point.axis];
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = meta.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  });

  ctx.font = '700 14px Trebuchet MS, Segoe UI, sans-serif';
  ctx.fillStyle = 'rgba(238, 243, 255, 0.95)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  axes.forEach((axis, index) => {
    const angle = angles[index];
    const labelRadius = radius + 28;
    const x = centerX + Math.cos(angle) * labelRadius;
    const y = centerY + Math.sin(angle) * labelRadius;
    const meta = TYPE_META[axis];
    const score = state.scores[axis] ? state.scores[axis].score : 0;
    ctx.fillText(meta.short, x, y - 8);
    ctx.font = '500 12px Trebuchet MS, Segoe UI, sans-serif';
    ctx.fillStyle = 'rgba(174, 185, 210, 0.95)';
    ctx.fillText(`${score}`, x, y + 10);
    ctx.font = '700 14px Trebuchet MS, Segoe UI, sans-serif';
    ctx.fillStyle = 'rgba(238, 243, 255, 0.95)';
  });
}

function syncFormDefaults() {
  if (state.phase === 'identity') {
    const nameInput = app.querySelector('#name');
    const emailInput = app.querySelector('#email');
    const phoneInput = app.querySelector('#phone');
    const consentInput = app.querySelector('#consent');

    if (nameInput) {
      nameInput.value = state.identity.name || '';
    }
    if (emailInput) {
      emailInput.value = state.identity.email || '';
    }
    if (phoneInput) {
      phoneInput.value = state.identity.phone || '';
    }
    if (consentInput) {
      consentInput.checked = Boolean(state.identity.consent);
    }
  }

  if (state.phase === 'feedback') {
    const textarea = app.querySelector('#additionalFeedback');
    if (textarea) {
      textarea.value = state.feedback.additionalFeedback || '';
    }
  }
}

function wireCurrentFormHandlers() {
  const form = app.querySelector('form');
  if (!form) {
    return;
  }

  if (state.phase === 'identity') {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      createAssessmentFromIdentity(form);
    });
    return;
  }

  if (state.phase === 'questions') {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitQuestionPage(form);
    });
    const backButton = form.querySelector('[data-action="back"]');
    if (backButton) {
      backButton.addEventListener('click', () => {
        handleBackQuestionPage(form);
      });
    }
    return;
  }

  if (state.phase === 'feedback') {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitFeedback(form);
    });
    const ratingInputs = form.querySelectorAll('input[name="accuracyRating"]');
    ratingInputs.forEach((input) => {
      input.addEventListener('change', () => {
        state.feedback.accuracyRating = Number.parseInt(input.value, 10);
        form.querySelectorAll('.rating-option').forEach((option) => {
          const radio = option.querySelector('input');
          option.classList.toggle('is-selected', Boolean(radio && radio.checked));
        });
      });
    });
    const textarea = form.querySelector('#additionalFeedback');
    if (textarea) {
      textarea.addEventListener('input', () => {
        state.feedback.additionalFeedback = textarea.value;
      });
    }
    return;
  }
}

app.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) {
    return;
  }

  const action = button.getAttribute('data-action');
  if (action === 'to-feedback') {
    moveToFeedback();
  } else if (action === 'restart') {
    resetAssessment();
  }
});

window.addEventListener('resize', () => {
  if (state.phase === 'result') {
    drawRadarChart();
  }
});

function render() {
  renderStep();
}

render();
