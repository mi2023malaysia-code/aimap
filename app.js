(function () {
  const TOTAL_PAGES = 9;
  const RESULT_PAGE_INDEX = 8;
  const TOTAL_COMPLETION_SECTIONS = 14;

  const form = document.getElementById("wizard-form");
  const pageContent = document.getElementById("page-content");
  const pageTitle = document.querySelector("[data-page-title]");
  const pageSubtitle = document.querySelector("[data-page-subtitle]");
  const pageCopy = document.querySelector("[data-page-copy]");
  const stepStrip = document.querySelector("[data-step-strip]");
  const wizardError = document.querySelector("[data-form-error]");
  const backBtn = document.querySelector('[data-action="back"]');
  const nextBtn = document.querySelector('[data-action="next"]');
  const sideTitle = document.querySelector("[data-side-title]");
  const sideSubtitle = document.querySelector("[data-side-subtitle]");
  const sideBody = document.querySelector("[data-side-body]");
  const gauge = document.querySelector("[data-gauge]");
  const dialLabel = document.querySelector("[data-dial-label]");
  const dialValue = document.querySelector("[data-dial-value]");
  const dialTrack = document.querySelector("[data-dial-track]");
  const dialStatus = document.querySelector("[data-dial-status]");
  const statusPage = document.querySelector("[data-status-page]");
  const statusProgress = document.querySelector("[data-status-progress]");
  const statusLevel = document.querySelector("[data-status-level]");
  const statusTrack = document.querySelector("[data-status-track]");
  const SUPABASE_CONFIG = window.__SUPABASE_CONFIG__ || {};
  const SUPABASE_URL = SUPABASE_CONFIG.url || "";
  const SUPABASE_PUBLISHABLE_KEY =
    SUPABASE_CONFIG.publishableKey || SUPABASE_CONFIG.anonKey || "";
  const SUPABASE_TABLE = SUPABASE_CONFIG.table || "115_assessments";
  const SUPABASE_APP_VERSION = SUPABASE_CONFIG.appVersion || "2026-07-30";

  const pageMeta = [
    {
      title: "Objective",
      subtitle: "Confirm what this assessment should deliver.",
      copy:
        "This signal check takes about three minutes. The dial fills as you answer and locks onto your final weighted AI fluency score after submission.",
      step: "Objective",
    },
    {
      title: "Profile",
      subtitle: "Capture the basics, background, and the outcome you want.",
      copy:
        "We use this page to personalize the roadmap, the language, and the Supabase record prepared for later.",
      step: "Profile",
    },
    {
      title: "Paid AI Tool",
      subtitle: "Understand whether a paid platform already anchors your workflow.",
      copy:
        "Move through one page at a time. You can go back and adjust answers until the final submit is complete.",
      step: "Paid",
    },
    {
      title: "Current Tools",
      subtitle: "Map the tools that are already active in your workflow.",
      copy:
        "The more accurate this picture is, the cleaner the roadmap and tool guidance will be.",
      step: "Tools",
    },
    {
      title: "Monthly Time & Cost",
      subtitle: "Capture the monthly hours and budget that shape your path.",
      copy:
        "The monthly totals shape the roadmap pace, and the budget inputs stay with the result for later review.",
      step: "Time",
    },
    {
      title: "Primary Goal",
      subtitle: "Choose the track that best matches your intent.",
      copy:
        "The selected goal drives the learning track name and the examples used in the result.",
      step: "Goal",
    },
    {
      title: "Weighted Assessment",
      subtitle: "Rate the six factors that make up your AI fluency score.",
      copy:
        "Each factor uses a 1-5 scale and a different weight in the final score.",
      step: "Assessment",
    },
    {
      title: "Training History",
      subtitle: "Avoid repeating content you already know.",
      copy:
        "If you have completed formal paid training before, we will avoid duplicating it in the roadmap.",
      step: "Training",
    },
    {
      title: "Result",
      subtitle: "Your final recommendation is now locked.",
      copy:
        "The result screen is read-only. The completed assessment can sync to Supabase for storage and reporting.",
      step: "Result",
    },
  ];

  const wantsOptions = [
    "Assess my current AI fluency",
    "Get a practical learning roadmap",
    "Identify the right tools for my workflow",
    "Improve productivity in my current role",
    "Support a product or side project",
    "Align AI learning with business outcomes",
  ];

  const painOptions = [
    "Too many tools to evaluate",
    "No clear starting point",
    "I can use AI, but not consistently",
    "Limited time to learn",
    "I need better prompts and workflows",
    "I need more confidence in output quality",
  ];

  const paidToolOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  const toolOptions = [
    { value: "ChatGPT", label: "ChatGPT" },
    { value: "Claude", label: "Claude" },
    { value: "Gemini", label: "Gemini" },
    { value: "Copilot", label: "Copilot" },
    { value: "Midjourney", label: "Midjourney" },
    { value: "None", label: "None" },
    { value: "Other", label: "Other" },
  ];

  const weeklyTimeFields = [
    {
      name: "aiHoursTotalMonthly",
      label: "Total hours on AI (monthly)",
      placeholder: "e.g. 24",
    },
    {
      name: "aiCostTotalMonthly",
      label: "Total cost on AI (total-monthly)",
      placeholder: "e.g. 120",
    },
    {
      name: "aiWorkHoursMonthly",
      label: "Total hours work on AI (monthly)",
      placeholder: "e.g. 16",
    },
    {
      name: "aiLearnHoursMonthly",
      label: "Total hours learn on AI (monthly)",
      placeholder: "e.g. 8",
    },
    {
      name: "aiCostWorkMonthly",
      label: "Total cost work on AI (monthly)",
      placeholder: "e.g. 80",
    },
    {
      name: "aiCostLearnMonthly",
      label: "Total cost learn on AI (monthly)",
      placeholder: "e.g. 40",
    },
  ];

  const goalOptions = [
    { value: "Career switch", label: "Career switch" },
    { value: "Upskill in current job", label: "Upskill in current job" },
    {
      value: "Build a product/side project",
      label: "Build a product or side project",
    },
    { value: "Academic/research", label: "Academic or research" },
    { value: "General curiosity", label: "General curiosity" },
  ];

  const assessmentScaleOptions = [
    { value: "1", label: "1 - Not yet" },
    { value: "2", label: "2 - Early" },
    { value: "3", label: "3 - Functional" },
    { value: "4", label: "4 - Strong" },
    { value: "5", label: "5 - Highly mature" },
  ];

  const assessmentQuestions = [
    {
      key: "toolBreadth",
      title: "Tool breadth",
      weight: 25,
      prompt: "How broad is your current AI tool use across tasks and contexts?",
      note: "1 means one narrow tool setup. 5 means a broad stack used across many tasks.",
    },
    {
      key: "promptQuality",
      title: "Prompt quality and task framing",
      weight: 25,
      prompt: "How well do you structure prompts, context, and task framing before asking for output?",
      note: "1 means vague asks. 5 means consistently clear, specific, and reusable prompts.",
    },
    {
      key: "verificationJudgment",
      title: "Verification and judgment",
      weight: 10,
      prompt: "How consistently do you check outputs, judge quality, and catch errors?",
      note: "1 means you rarely verify. 5 means you regularly validate and critique the output.",
    },
    {
      key: "workflowIntegration",
      title: "Workflow integration",
      weight: 20,
      prompt: "How well does AI fit into your day-to-day workflow instead of sitting on the side?",
      note: "1 means occasional use only. 5 means AI is embedded in your normal process.",
    },
    {
      key: "automationBuilding",
      title: "Automation / building ability",
      weight: 10,
      prompt: "How much do you automate, connect tools, or build repeatable AI workflows?",
      note: "1 means no automation yet. 5 means you regularly build or automate with AI.",
    },
    {
      key: "timeCostCommitment",
      title: "Time & cost commitment",
      weight: 10,
      prompt: "How much monthly time and budget can you realistically commit to learning and using AI?",
      note: "1 means very limited monthly time or budget. 5 means you can consistently invest both.",
    },
  ];

  const trainingOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  const goalTracks = {
    "Career switch": {
      key: "career",
      label: "Career Catalyst",
      description: "Build credible AI habits for a move into new work.",
    },
    "Upskill in current job": {
      key: "upskill",
      label: "Workflow Builder",
      description: "Improve how you work inside your current role.",
    },
    "Build a product/side project": {
      key: "builder",
      label: "Builder Track",
      description: "Turn AI into a small, shippable product loop.",
    },
    "Academic/research": {
      key: "research",
      label: "Research Lens",
      description: "Use AI for synthesis, comparison, and rigor.",
    },
    "General curiosity": {
      key: "curiosity",
      label: "Curiosity Path",
      description: "Explore AI with a broad, low-friction rhythm.",
    },
  };

  const bandConfig = {
    beginner: {
      label: "Foundations",
      description: "Prompting, tool basics, and one repeatable use case.",
    },
    intermediate: {
      label: "Workflow Integration",
      description: "Prompt patterns, workflow integration, and light automation.",
    },
    advanced: {
      label: "Advanced Systems",
      description: "APIs, agentic workflows, and quality control patterns.",
    },
  };

  const durationMap = {
    beginner: {
      "<1hr": 6,
      "1-3hrs": 5,
      "3-6hrs": 4,
      "6+ hrs": 4,
    },
    intermediate: {
      "<1hr": 8,
      "1-3hrs": 8,
      "3-6hrs": 7,
      "6+ hrs": 6,
    },
    advanced: {
      "<1hr": 12,
      "1-3hrs": 11,
      "3-6hrs": 10,
      "6+ hrs": 8,
    },
  };

  const paceMap = {
    "<1hr": "light pace, one focused session per week",
    "1-3hrs": "steady pace, one to two sessions per week",
    "3-6hrs": "accelerated pace, two to three sessions per week",
    "6+ hrs": "intensive pace, three or more sessions per week",
  };

  const WEEKS_PER_MONTH = 4.345;

  const beginnerModules = [
    {
      title: "Signal setup",
      focus: "Define one outcome you want from AI and the task it should support.",
    },
    {
      title: "Prompt fundamentals",
      focus: "Practice clear asks with context, constraints, and examples.",
    },
    {
      title: "Tool rhythm",
      focus: "Choose one assistant and one capture system for repeat use.",
    },
    {
      title: "Real use case",
      focus: "Apply the workflow to a real task from your track.",
    },
    {
      title: "Confidence check",
      focus: "Review what worked, what failed, and where the output drifted.",
    },
    {
      title: "Habit lock",
      focus: "Turn the workflow into a weekly routine with a clear next step.",
    },
  ];

  const intermediateModules = [
    {
      title: "Workflow audit",
      focus: "Map one recurring task and identify the best places for AI support.",
    },
    {
      title: "Prompt patterns",
      focus: "Create reusable prompts with examples, rules, and a quality bar.",
    },
    {
      title: "Multi-tool flow",
      focus: "Move between assistant, notes, and source material without losing context.",
    },
    {
      title: "Automation basics",
      focus: "Use templates, saved instructions, snippets, or simple automation.",
    },
    {
      title: "Quality control",
      focus: "Check tone, correctness, citations, and failure modes before reuse.",
    },
    {
      title: "Applied project",
      focus: "Ship one repeatable workflow in a real setting from your track.",
    },
    {
      title: "Refinement sprint",
      focus: "Tighten the workflow and remove friction from the messy bits.",
    },
    {
      title: "Review and scale",
      focus: "Pick the next process to improve and document what you learned.",
    },
  ];

  const advancedModules = [
    {
      title: "System map",
      focus: "Define the task, data, constraints, and success criteria before building.",
    },
    {
      title: "API and model choices",
      focus: "Choose models, prompts, and tool settings with intention.",
    },
    {
      title: "Agent design",
      focus: "Break work into steps, tools, and guardrails that the system can follow.",
    },
    {
      title: "Retrieval and sources",
      focus: "Ground outputs in files, docs, notes, or external references.",
    },
    {
      title: "Evaluation design",
      focus: "Measure quality, compare variants, and capture where the system drifts.",
    },
    {
      title: "Tool orchestration",
      focus: "Build a repeatable sequence that moves work across tools cleanly.",
    },
    {
      title: "Observability",
      focus: "Trace failures, latency, prompt drift, and edge-case behavior.",
    },
    {
      title: "Deployment patterns",
      focus: "Package the workflow so it can be used repeatedly and shared safely.",
    },
    {
      title: "Reliability tuning",
      focus: "Improve guardrails, fallbacks, and the quality of the handoff.",
    },
    {
      title: "Capstone build",
      focus: "Ship the system and document the reusable operating playbook.",
    },
    {
      title: "Hardening",
      focus: "Test the workflow against edge cases and reduce avoidable errors.",
    },
    {
      title: "Scale plan",
      focus: "Choose the next capability to extend and how to monitor it.",
    },
  ];

  const trackLens = {
    career:
      "Use meetings, documents, and communication drafts from your actual role.",
    upskill:
      "Use the tasks you repeat every week and the outputs your team relies on.",
    builder:
      "Use prototypes, product decisions, and fast iteration loops.",
    research:
      "Use source-heavy reading, synthesis, and note discipline.",
    curiosity:
      "Use personal experiments, creative tasks, and broad exploration.",
  };

  const toolStackGuides = {
    beginner: {
      career: "One assistant, docs, and meeting notes.",
      upskill: "One assistant, task lists, and a simple knowledge base.",
      builder: "One assistant, notes, and a quick prototype tool.",
      research: "One assistant, source notes, and a comparison table.",
      curiosity: "One assistant, bookmarks, and a capture space.",
    },
    intermediate: {
      career: "Assistant plus prompt templates, docs, and a reusable checklist.",
      upskill: "Assistant plus templates, spreadsheets, and shared docs.",
      builder: "Assistant plus prototype tooling, docs, and issue tracking.",
      research: "Assistant plus source management, notes, and comparisons.",
      curiosity: "Assistant plus notes, bookmarks, and a quick capture system.",
    },
    advanced: {
      career: "Assistant plus APIs, eval sheets, and workflow logs.",
      upskill: "Assistant plus automation, logs, and repeatable quality checks.",
      builder: "Assistant plus APIs, product telemetry, and a test harness.",
      research: "Assistant plus retrieval, evals, and source tracing.",
      curiosity: "Assistant plus custom scripts, logs, and experiment tracking.",
    },
  };

  const state = {
    currentPage: 0,
    locked: false,
    finalResult: null,
    saveState: {
      status: "idle",
      message: "",
    },
    answers: createInitialAnswers(),
  };

  function createInitialAnswers() {
    return {
      name: "",
      email: "",
      roleBackground: "",
      wants: [],
      wantsOther: "",
      pain: [],
      painOther: "",
      paid: "",
      paidToolName: "",
      tools: [],
      toolsOther: "",
      aiHoursTotalMonthly: "",
      aiCostTotalMonthly: "",
      aiWorkHoursMonthly: "",
      aiLearnHoursMonthly: "",
      aiCostWorkMonthly: "",
      aiCostLearnMonthly: "",
      goal: "",
      toolBreadth: "",
      promptQuality: "",
      verificationJudgment: "",
      workflowIntegration: "",
      automationBuilding: "",
      timeCostCommitment: "",
      training: "",
      trainingCourse: "",
    };
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function slugify(value) {
    return String(value == null ? "" : value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function cleanText(value, maxLength) {
    const limit = typeof maxLength === "number" ? maxLength : 160;
    return value
      ? String(value).trim().replace(/\s+/g, " ").slice(0, limit)
      : "";
  }

  function parseNumberValue(value) {
    const cleaned = cleanText(value, 40).replaceAll(",", "");
    if (!cleaned) {
      return null;
    }

    const parsed = Number(cleaned);
    if (!Number.isFinite(parsed)) {
      return null;
    }

    return Math.max(0, parsed);
  }

  function formatSimpleNumber(value) {
    if (!Number.isFinite(value)) {
      return "";
    }

    const rounded = Math.round(value * 100) / 100;
    return String(Number(rounded.toFixed(2)));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function isFilled(value) {
    return cleanText(value).length > 0;
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanText(value));
  }

  function getRadioValue(name) {
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : "";
  }

  function getCheckboxValues(name) {
    return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map(
      function (input) {
        return input.value;
      }
    );
  }

  function getFieldValue(name) {
    const field = form.querySelector(`[name="${name}"]`);
    return field ? field.value : "";
  }

  function setFieldVisibility(name, visible) {
    const element = form.querySelector(`[data-conditional="${name}"]`);
    if (element) {
      element.hidden = !visible;
    }
  }

  function setNextButtonState() {
    if (state.locked) {
      nextBtn.hidden = true;
      backBtn.hidden = true;
      return;
    }

    if (state.currentPage === 0) {
      backBtn.hidden = true;
      nextBtn.hidden = true;
      return;
    }

    backBtn.hidden = state.currentPage === 0;
    nextBtn.hidden = false;

    if (state.currentPage === 7) {
      nextBtn.textContent = "Generate result";
    } else {
      nextBtn.textContent = "Continue";
    }
  }

  function getBand(level) {
    if (level <= 2) return "beginner";
    if (level <= 5) return "intermediate";
    return "advanced";
  }

  function getTrack(goal) {
    return goalTracks[goal] || null;
  }

  function getMonthlyHours(answers) {
    const totalHours = parseNumberValue(answers.aiHoursTotalMonthly);
    const workHours = parseNumberValue(answers.aiWorkHoursMonthly);
    const learnHours = parseNumberValue(answers.aiLearnHoursMonthly);

    if (totalHours != null) {
      return totalHours;
    }

    if (workHours == null && learnHours == null) {
      return null;
    }

    return (workHours || 0) + (learnHours || 0);
  }

  function getWeeklyHours(answers) {
    const monthlyHours = getMonthlyHours(answers);
    if (monthlyHours == null) {
      return null;
    }

    return monthlyHours / WEEKS_PER_MONTH;
  }

  function getWeeklyTimeBand(hours) {
    if (hours == null || !Number.isFinite(hours)) {
      return "";
    }

    if (hours < 1) return "<1hr";
    if (hours < 3) return "1-3hrs";
    if (hours < 6) return "3-6hrs";
    return "6+ hrs";
  }

  function getDurationWeeks(band, hours) {
    if (!band || hours == null) return null;
    const bucket = getWeeklyTimeBand(hours);
    return durationMap[band][bucket] || durationMap[band]["1-3hrs"];
  }

  function formatWeeklyHours(value) {
    if (value == null || !Number.isFinite(value)) return "";
    if (value === 0) return "0 hrs/week";
    if (value < 1) return Math.round(value * 60) + " min/week";

    const rounded = Math.round(value * 10) / 10;
    if (rounded === 1) return "1 hr/week";
    return String(Number(rounded.toFixed(1))) + " hrs/week";
  }

  function formatMonthlyHours(value) {
    if (value == null || !Number.isFinite(value)) return "";
    if (value === 0) return "0 hrs/month";
    if (value < 1) return Math.round(value * 60) + " min/month";

    const rounded = Math.round(value * 10) / 10;
    if (rounded === 1) return "1 hr/month";
    return String(Number(rounded.toFixed(1))) + " hrs/month";
  }

  function getPacingLabel(hours) {
    const bucket = getWeeklyTimeBand(hours);
    return paceMap[bucket] || "steady pace";
  }

  function summarizeMonthlyTime(answers) {
    const totalHours = parseNumberValue(answers.aiHoursTotalMonthly);
    const workHours = parseNumberValue(answers.aiWorkHoursMonthly);
    const learnHours = parseNumberValue(answers.aiLearnHoursMonthly);
    const weeklyHours = getWeeklyHours(answers);
    const parts = [];

    if (totalHours != null) {
      parts.push("total " + formatMonthlyHours(totalHours));
    }

    if (workHours != null) {
      parts.push("work " + formatMonthlyHours(workHours));
    }

    if (learnHours != null) {
      parts.push("learn " + formatMonthlyHours(learnHours));
    }

    if (weeklyHours != null) {
      parts.push("~" + formatWeeklyHours(weeklyHours));
    }

    return parts.join(", ");
  }

  function summarizeMonthlyCost(answers) {
    const totalCost = parseNumberValue(answers.aiCostTotalMonthly);
    const workCost = parseNumberValue(answers.aiCostWorkMonthly);
    const learnCost = parseNumberValue(answers.aiCostLearnMonthly);
    const parts = [];

    if (totalCost != null) {
      parts.push("total " + formatSimpleNumber(totalCost) + "/mo");
    }

    if (workCost != null) {
      parts.push("work " + formatSimpleNumber(workCost) + "/mo");
    }

    if (learnCost != null) {
      parts.push("learn " + formatSimpleNumber(learnCost) + "/mo");
    }

    return parts.join(", ");
  }

  function capitalizeSentence(value) {
    const text = cleanText(value, 120);
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function getPacingArticle(value) {
    const text = cleanText(value, 120);
    return /^(accelerated|intensive)/i.test(text) ? "an" : "a";
  }

  function normalizeTools(values, otherText) {
    const cleaned = [];
    values.forEach(function (tool) {
      if (tool === "None" || tool === "Other") return;
      cleaned.push(tool);
    });

    if (values.includes("Other")) {
      const other = cleanText(otherText, 80);
      cleaned.push(other || "Other AI tool");
    }

    return Array.from(new Set(cleaned.filter(Boolean)));
  }

  function summarizeSelections(selected, otherText, fallback) {
    const values = selected.slice();
    const other = cleanText(otherText, 120);
    if (other) values.push(other);
    const joined = values.filter(Boolean).join(", ");
    return joined || fallback;
  }

  function getAssessmentRating(answers, key) {
    return clamp(Number(answers[key]) || 1, 1, 5);
  }

  function scoreAssessmentRating(rating, weight) {
    return ((rating - 1) / 4) * weight;
  }

  function scoreToLevel(score) {
    return clamp(Math.round(((score - 1) * 6) / 99) + 1, 1, 7);
  }

  function calculateLevel(answers) {
    const tools = normalizeTools(answers.tools, answers.toolsOther);
    const toolBreadth = getAssessmentRating(answers, "toolBreadth");
    const promptQuality = getAssessmentRating(answers, "promptQuality");
    const verificationJudgment = getAssessmentRating(answers, "verificationJudgment");
    const workflowIntegration = getAssessmentRating(answers, "workflowIntegration");
    const automationBuilding = getAssessmentRating(answers, "automationBuilding");
    const timeCostCommitment = getAssessmentRating(answers, "timeCostCommitment");

    const factorScores = assessmentQuestions.map(function (factor) {
      const rating = getAssessmentRating(answers, factor.key);
      return {
        key: factor.key,
        label: factor.title,
        weight: factor.weight,
        rating: rating,
        score: scoreAssessmentRating(rating, factor.weight),
      };
    });

    const fluencyScore = clamp(
      Math.round(
        factorScores.reduce(function (sum, factor) {
          return sum + factor.score;
        }, 0)
      ),
      1,
      100
    );
    const level = scoreToLevel(fluencyScore);

    return {
      level: level,
      fluencyScore: fluencyScore,
      toolBreadth: toolBreadth,
      promptQuality: promptQuality,
      verificationJudgment: verificationJudgment,
      workflowIntegration: workflowIntegration,
      automationBuilding: automationBuilding,
      timeCostCommitment: timeCostCommitment,
      factorScores: factorScores,
      tools: tools,
      toolCount: tools.length,
    };
  }

  function getCompletionSections(answers) {
    const profileComplete =
      isFilled(answers.name) &&
      isValidEmail(answers.email) &&
      isFilled(answers.roleBackground);
    const wantsComplete =
      answers.wants.length > 0 || isFilled(answers.wantsOther);
    const painComplete = answers.pain.length > 0 || isFilled(answers.painOther);
    const paidComplete =
      isFilled(answers.paid) &&
      (answers.paid !== "yes" || isFilled(answers.paidToolName));
    const toolsComplete =
      answers.tools.length > 0 &&
      (!answers.tools.includes("Other") || isFilled(answers.toolsOther));
    const hoursComplete = weeklyTimeFields.every(function (field) {
      return isFilled(answers[field.name]);
    });
    const goalComplete = isFilled(answers.goal);
    const assessmentComplete = assessmentQuestions.map(function (factor) {
      return isFilled(answers[factor.key]);
    });
    const trainingComplete =
      isFilled(answers.training) &&
      (answers.training !== "yes" || isFilled(answers.trainingCourse));

    return [
      profileComplete,
      wantsComplete,
      painComplete,
      paidComplete,
      toolsComplete,
      hoursComplete,
      goalComplete,
      assessmentComplete[0],
      assessmentComplete[1],
      assessmentComplete[2],
      assessmentComplete[3],
      assessmentComplete[4],
      assessmentComplete[5],
      trainingComplete,
    ];
  }

  function getCompletion(answers) {
    const sections = getCompletionSections(answers);
    const completed = sections.filter(Boolean).length;
    const completion = completed / TOTAL_COMPLETION_SECTIONS;

    return {
      completed: completed,
      total: TOTAL_COMPLETION_SECTIONS,
      completion: completion,
      sections: sections,
    };
  }

  function getPageValidation(pageIndex, answers) {
    const missing = [];
    const focusSelectors = [];

    if (pageIndex === 1) {
      if (!isFilled(answers.name)) {
        missing.push("profile");
        focusSelectors.push('[name="name"]');
      }
      if (!isValidEmail(answers.email)) {
        missing.push("profile");
        focusSelectors.push('[name="email"]');
      }
      if (!isFilled(answers.roleBackground)) {
        missing.push("profile");
        focusSelectors.push('[name="roleBackground"]');
      }
      if (!answers.wants.length && !isFilled(answers.wantsOther)) {
        missing.push("objective");
        focusSelectors.push('[name="wantsOther"]');
      }
      if (!answers.pain.length && !isFilled(answers.painOther)) {
        missing.push("pain");
        focusSelectors.push('[name="painOther"]');
      }
    }

    if (pageIndex === 2) {
      if (!isFilled(answers.paid)) {
        missing.push("paid");
        focusSelectors.push('[name="paid"]');
      } else if (answers.paid === "yes" && !isFilled(answers.paidToolName)) {
        missing.push("paid");
        focusSelectors.push('[name="paidToolName"]');
      }
    }

    if (pageIndex === 3) {
      if (!answers.tools.length) {
        missing.push("tools");
        focusSelectors.push('[name="tools"]');
      } else if (answers.tools.includes("Other") && !isFilled(answers.toolsOther)) {
        missing.push("tools");
        focusSelectors.push('[name="toolsOther"]');
      }
    }

    if (pageIndex === 4) {
      weeklyTimeFields.forEach(function (field) {
        if (!isFilled(answers[field.name])) {
          missing.push("hours");
          focusSelectors.push('[name="' + field.name + '"]');
        }
      });
    }

    if (pageIndex === 5) {
      if (!isFilled(answers.goal)) {
        missing.push("goal");
        focusSelectors.push('[name="goal"]');
      }
    }

    if (pageIndex === 6) {
      assessmentQuestions.forEach(function (factor) {
        if (!isFilled(answers[factor.key])) {
          missing.push("assessment-" + factor.key);
          focusSelectors.push('[name="' + factor.key + '"]');
        }
      });
    }

    if (pageIndex === 7) {
      if (!isFilled(answers.training)) {
        missing.push("training");
        focusSelectors.push('[name="training"]');
      } else if (answers.training === "yes" && !isFilled(answers.trainingCourse)) {
        missing.push("training");
        focusSelectors.push('[name="trainingCourse"]');
      }
    }

    return {
      valid: missing.length === 0,
      missingCards: Array.from(new Set(missing)),
      focusSelectors: focusSelectors,
    };
  }

  function getBandLabel(level) {
    return bandConfig[getBand(level)].label;
  }

  function buildToolPlan(answers, band, trackKey, level) {
    const selectedTools = normalizeTools(answers.tools, answers.toolsOther);
    const plan = [];
    const paidTool = cleanText(answers.paidToolName, 80);
    const roleContext = cleanText(answers.roleBackground, 80);

    if (answers.paid === "yes" && paidTool) {
      plan.push({
        label: "Primary workspace",
        value: paidTool + " should stay at the center of your workflow.",
      });
    } else if (answers.paid === "yes") {
      plan.push({
        label: "Primary workspace",
        value: "Use the paid tool you already have as the default workspace.",
      });
    } else {
      plan.push({
        label: "Primary workspace",
        value:
          "Start with one general assistant and keep the workflow intentionally simple.",
      });
    }

    if (!selectedTools.length) {
      plan.push({
        label: "Current stack",
        value:
          "You are effectively starting from a blank slate. Keep the first workflow narrow.",
      });
    } else if (selectedTools.length === 1) {
      plan.push({
        label: "Current stack",
        value:
          "You already have one active tool: " +
          selectedTools[0] +
          ". Build one repeatable use case around it first.",
      });
    } else {
      plan.push({
        label: "Current stack",
        value:
          "You already use " +
          selectedTools.join(", ") +
          ". Compare them with the same prompt and keep the better fit for each job.",
      });
    }

    if (band === "advanced" || level >= 6) {
      plan.push({
        label: "Upgrade trigger",
        value:
          "Add APIs, logging, or evals only after one workflow is already stable.",
      });
    } else {
      plan.push({
        label: "Upgrade trigger",
        value:
          "Add a second tool only when it solves a distinct problem you cannot solve today.",
      });
    }

    if (trackKey) {
      plan.push({
        label: "Track bias",
        value:
          "For " +
          goalTracks[answers.goal].label +
          (roleContext
            ? ", keep examples grounded in your " + roleContext + " context."
            : ", keep examples close to your real context.") +
          " That keeps the learning useful and specific.",
      });
    } else {
      plan.push({
        label: "Track bias",
        value: "Choose a goal to narrow the learning path.",
      });
    }

    return plan;
  }

  function buildModules(answers, band, trackKey, weeks, weeklyHours) {
    const template =
      band === "beginner"
        ? beginnerModules
        : band === "advanced"
        ? advancedModules
        : intermediateModules;
    const lens = trackLens[trackKey] || "";
    const selectedTools = normalizeTools(answers.tools, answers.toolsOther);
    const paidTool = cleanText(answers.paidToolName, 80);
    const cards = [];

    for (let index = 0; index < weeks; index += 1) {
      const phase = template[index] || template[template.length - 1];
      const week = index + 1;
      const focusParts = [phase.focus];

      if (lens) {
        focusParts.push(lens);
      }

      if (selectedTools.length) {
        focusParts.push(
          "Compare outcomes across " +
            selectedTools.slice(0, 2).join(" and ") +
            " when relevant."
        );
      }

      if (paidTool) {
        focusParts.push("Anchor the workflow in " + paidTool + ".");
      }

      cards.push({
        week: week,
        title: phase.title,
        focus: focusParts.join(" "),
        hours: formatWeeklyHours(weeklyHours),
        stack:
          toolStackGuides[band] &&
          toolStackGuides[band][trackKey]
            ? toolStackGuides[band][trackKey]
            : "One assistant, docs, and a capture space.",
      });
    }

    return cards;
  }

  function computeRoadmap(answers) {
    const levelSignal = calculateLevel(answers);
    const bandKey = getBand(levelSignal.level);
    const band = bandConfig[bandKey];
    const track = getTrack(answers.goal);
    const monthlyHours = getMonthlyHours(answers);
    const weeklyHours = getWeeklyHours(answers);
    const durationWeeks =
      weeklyHours != null && bandKey ? getDurationWeeks(bandKey, weeklyHours) : null;
    const durationText = durationWeeks
      ? durationWeeks +
        " weeks at " +
        formatWeeklyHours(weeklyHours) +
        (monthlyHours != null ? " (" + formatMonthlyHours(monthlyHours) + ")" : "")
      : "Pending monthly commitment";
    const pacing = weeklyHours != null
      ? getPacingLabel(weeklyHours)
      : "Choose monthly time to set the pace";
    const tools = normalizeTools(answers.tools, answers.toolsOther);
    const modules =
      track && durationWeeks
        ? buildModules(answers, bandKey, track.key, durationWeeks, weeklyHours)
        : [];
    const toolPlan = buildToolPlan(
      answers,
      bandKey,
      track ? track.key : "",
      levelSignal.level
    );

    return {
      levelSignal: levelSignal,
      bandKey: bandKey,
      band: band,
      track: track,
      weeklyHours: weeklyHours,
      durationWeeks: durationWeeks,
      durationText: durationText,
      pacing: pacing,
      tools: tools,
      monthlyHours: monthlyHours,
      modules: modules,
      toolPlan: toolPlan,
    };
  }

  function getSupabaseSyncMessage() {
    if (state.saveState.status === "saving") {
      return "Saving this result to Supabase now.";
    }

    if (state.saveState.status === "saved") {
      return "Saved to Supabase and ready for reporting.";
    }

    if (state.saveState.status === "error") {
      return (
        state.saveState.message ||
        "Supabase sync failed. You can retry from the result screen."
      );
    }

    return "This result will sync to Supabase when you finish the assessment.";
  }

  function getSupabaseSyncButtonLabel() {
    if (state.saveState.status === "saving") {
      return "Saving...";
    }

    if (state.saveState.status === "saved") {
      return "Sync again";
    }

    if (state.saveState.status === "error") {
      return "Retry sync";
    }

    return "Sync to Supabase";
  }

  function buildSupabasePayload(answers, roadmap) {
    const submissionSnapshot = {
      answers: answers,
      roadmap: roadmap,
      submitted_at:
        typeof Date !== "undefined" ? new Date().toISOString() : "",
      app_version: SUPABASE_APP_VERSION,
    };

    return {
      name: cleanText(answers.name, 80),
      email: cleanText(answers.email, 120),
      phone: null,
      consent_given: true,
      stage: "submitted",
      current_page: RESULT_PAGE_INDEX,
      question_ids: null,
      answers: submissionSnapshot,
      score_d: null,
      score_i: null,
      score_s: null,
      score_c: null,
      dominant_type: roadmap.bandKey || "",
      paid: answers.paid === "yes",
      page_timestamps: {
        submitted_at: submissionSnapshot.submitted_at,
        completed_pages: RESULT_PAGE_INDEX + 1,
      },
    };
  }

  async function submitAssessmentToSupabase(answers, roadmap) {
    if (typeof window === "undefined" || window.location.protocol === "file:") {
      throw new Error(
        "Open the app through http:// or https:// so Supabase can receive the submission."
      );
    }

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      throw new Error("Supabase config is missing from supabase.config.js.");
    }

    const payload = buildSupabasePayload(answers, roadmap);
    const response = await fetch(
      SUPABASE_URL.replace(/\/+$/, "") +
        "/rest/v1/" +
        encodeURIComponent(SUPABASE_TABLE),
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: "Bearer " + SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch (error) {
        errorBody = "";
      }

      throw new Error(
        errorBody ||
          "Supabase insert failed with status " + String(response.status) + "."
      );
    }
  }

  async function syncCurrentResult() {
    if (!state.locked || !state.finalResult) {
      return;
    }

    if (state.saveState.status === "saving") {
      return;
    }

    const answersSnapshot = JSON.parse(JSON.stringify(state.answers));
    const roadmapSnapshot = JSON.parse(JSON.stringify(state.finalResult));

    state.saveState = {
      status: "saving",
      message: "",
    };
    renderPage();

    try {
      await submitAssessmentToSupabase(answersSnapshot, roadmapSnapshot);
      state.saveState = {
        status: "saved",
        message: "Saved to Supabase.",
      };
    } catch (error) {
      state.saveState = {
        status: "error",
        message:
          error instanceof Error
            ? cleanText(error.message, 140)
            : "Supabase sync failed.",
      };
    }

    renderPage();
  }

  function renderOptionGroup(name, options, selectedValues, type) {
    return options
      .map(function (option) {
        const id = name + "-" + slugify(option.value);
        const checked = selectedValues.includes(option.value) ? "checked" : "";
        return (
          '<label class="choice-pill" for="' +
          escapeAttr(id) +
          '">' +
          '<input id="' +
          escapeAttr(id) +
          '" type="' +
          type +
          '" name="' +
          escapeAttr(name) +
          '" value="' +
          escapeAttr(option.value) +
          '" ' +
          checked +
          ">" +
          "<span>" +
          escapeHtml(option.label) +
          "</span>" +
          "</label>"
        );
      })
      .join("");
  }

  function renderTextField(name, label, value, placeholder, autocomplete) {
    return (
      '<label class="text-field">' +
      "<span>" +
      escapeHtml(label) +
      "</span>" +
      '<input type="text" name="' +
      escapeAttr(name) +
      '" value="' +
      escapeAttr(value || "") +
      '" placeholder="' +
      escapeAttr(placeholder || "") +
      '"' +
      (autocomplete ? ' autocomplete="' + escapeAttr(autocomplete) + '"' : "") +
      ">" +
      "</label>"
    );
  }

  function renderNumberField(name, label, value, placeholder) {
    return (
      '<label class="text-field">' +
      "<span>" +
      escapeHtml(label) +
      "</span>" +
      '<input type="number" inputmode="decimal" min="0" step="any" name="' +
      escapeAttr(name) +
      '" value="' +
      escapeAttr(value || "") +
      '" placeholder="' +
      escapeAttr(placeholder || "") +
      '">' +
      "</label>"
    );
  }

  function renderTextareaField(name, label, value, placeholder) {
    return (
      '<label class="textarea-field">' +
      "<span>" +
      escapeHtml(label) +
      "</span>" +
      '<textarea name="' +
      escapeAttr(name) +
      '" rows="4" placeholder="' +
      escapeAttr(placeholder || "") +
      '">' +
      escapeHtml(value || "") +
      "</textarea>" +
      "</label>"
    );
  }

  function renderQuestionCard(cardKey, indexLabel, title, description, bodyHtml) {
    return (
      '<section class="question-card" data-card="' +
      escapeAttr(cardKey) +
      '">' +
      '<div class="question-head">' +
      '<span class="question-index">' +
      escapeHtml(indexLabel) +
      "</span>" +
      "<div>" +
      "<h3>" +
      escapeHtml(title) +
      "</h3>" +
      "<p>" +
      escapeHtml(description) +
      "</p>" +
      "</div>" +
      "</div>" +
      bodyHtml +
      "</section>"
    );
  }

  function renderIntroPage() {
    return (
      '<section class="question-card page-intro" data-card="intro">' +
      '<div class="question-head">' +
      '<span class="question-index">01</span>' +
      "<div>" +
      "<h3>Why this assessment exists</h3>" +
      "<p>We are looking for a signal check, not a generic quiz.</p>" +
      "</div>" +
      "</div>" +
      '<p class="section-note">The dial fills as you answer, the result locks at final submit, and the roadmap appears instantly with a professional tone.</p>' +
      '<div class="feature-grid">' +
      '<article class="feature-card">' +
      '<p class="kicker">Live dial</p>' +
      "<h4>Measure current fluency</h4>" +
      "<p>The gauge updates as you move through the wizard and settles on the final weighted AI fluency score after submit.</p>" +
      "</article>" +
      '<article class="feature-card">' +
      '<p class="kicker">Context capture</p>' +
      "<h4>Record what you need</h4>" +
      "<p>We capture your contact details, objective, pain points, tools, monthly time and cost, goal, weighted assessment, and training history.</p>" +
      "</article>" +
      '<article class="feature-card">' +
      '<p class="kicker">Instant roadmap</p>' +
      "<h4>Receive a practical path</h4>" +
      "<p>The final screen shows your weighted score, track, duration, tool recommendations, and week-by-week modules.</p>" +
      "</article>" +
      "</div>" +
      '<p class="form-note">Under 3 minutes. No async wait. Mobile responsive.</p>' +
      "</section>"
    );
  }

  function renderProfilePage(answers) {
    const profileCard =
      '<div class="field-grid">' +
      renderTextField("name", "Full name", answers.name, "Enter your name", "name") +
      renderTextField(
        "email",
        "Email address",
        answers.email,
        "Enter the email for your result copy",
        "email"
      ) +
      "</div>" +
      renderTextField(
        "roleBackground",
        "Role / background",
        answers.roleBackground,
        "e.g. product manager, student, analyst"
      ) +
      '<p class="form-note">This contact and background information is used to personalize the result and prepare the email copy action.</p>';

    const objectiveCard =
      '<p class="section-note">Choose any outcomes that matter. You can add a free-text note below if the options do not fully capture your objective.</p>' +
      '<div class="chip-grid">' +
      renderOptionGroup(
        "wants",
        wantsOptions.map(function (item) {
          return { value: item, label: item };
        }),
        answers.wants,
        "checkbox"
      ) +
      "</div>" +
      renderTextareaField(
        "wantsOther",
        "Other objective",
        answers.wantsOther,
        "Describe any additional outcome you want to achieve."
      );

    const painCard =
      '<p class="section-note">Select the friction points that most accurately reflect your learning experience, then add any other notes below.</p>' +
      '<div class="chip-grid">' +
      renderOptionGroup(
        "pain",
        painOptions.map(function (item) {
          return { value: item, label: item };
        }),
        answers.pain,
        "checkbox"
      ) +
      "</div>" +
      renderTextareaField(
        "painOther",
        "Other pain point",
        answers.painOther,
        "Add any other blockers, constraints, or concerns."
      );

    return (
      '<div class="page-stack">' +
      renderQuestionCard(
        "profile",
        "02A",
        "Contact details",
        "Provide the details we should use for the final result and the future email copy flow.",
        profileCard
      ) +
      renderQuestionCard(
        "objective",
        "02B",
        "What do you want this assessment to deliver?",
        "Select all that apply, then add any additional objective below.",
        objectiveCard
      ) +
      renderQuestionCard(
        "pain",
        "02C",
        "What is currently slowing your AI learning?",
        "Select the pain points that apply and add any notes in the free-text field.",
        painCard
      ) +
      "</div>"
    );
  }

  function renderPaidPage(answers) {
    const yesNo = renderOptionGroup(
      "paid",
      paidToolOptions,
      answers.paid ? [answers.paid] : [],
      "radio"
    );

    const conditional =
      '<div class="conditional" data-conditional="paid"' +
      (answers.paid === "yes" ? "" : " hidden") +
      ">" +
      renderTextField(
        "paidToolName",
        "Which tool do you pay for?",
        answers.paidToolName,
        "Enter the paid AI tool name"
      ) +
      "</div>";

    return renderQuestionCard(
      "paid",
      "03",
      "Do you currently pay for any AI tool?",
      "If yes, name the tool so the roadmap can anchor on your existing stack.",
      '<p class="section-note">A paid subscription often changes the learning path and the tool recommendations.</p>' +
        '<div class="choice-row">' +
        yesNo +
        "</div>" +
        conditional
    );
  }

  function renderToolsPage(answers) {
    const checkboxRow = renderOptionGroup(
      "tools",
      toolOptions,
      answers.tools,
      "checkbox"
    );
    const otherVisible = answers.tools.includes("Other");
    const otherField =
      '<div class="conditional" data-conditional="tools-other"' +
      (otherVisible ? "" : " hidden") +
      ">" +
      renderTextField(
        "toolsOther",
        "Other AI tool",
        answers.toolsOther,
        "Name the additional tool you use"
      ) +
      "</div>";

    return renderQuestionCard(
      "tools",
      "04",
      "Which AI tools do you currently use?",
      "Select every tool that is active today. Use None if you are not working with one yet.",
      '<p class="section-note">Select all that apply. If you choose Other, add the tool name below.</p>' +
        '<div class="chip-grid">' +
        checkboxRow +
        "</div>" +
        otherField
    );
  }

  function renderHoursPage(answers) {
    const summaryFields = weeklyTimeFields
      .slice(0, 2)
      .map(function (field) {
        return renderNumberField(
          field.name,
          field.label,
          answers[field.name],
          field.placeholder
        );
      })
      .join("");

    const breakdownFields = weeklyTimeFields
      .slice(2)
      .map(function (field) {
        return renderNumberField(
          field.name,
          field.label,
          answers[field.name],
          field.placeholder
        );
      })
      .join("");

    return renderQuestionCard(
      "hours",
      "05",
      "How much monthly time and budget can you commit?",
      "These numbers set the pace and capture the cost side of your AI learning.",
      '<p class="section-note">Enter numeric monthly values. Total hours and total cost go first, then the work and learning split.</p>' +
        '<div class="field-grid">' +
        summaryFields +
        "</div>" +
        '<p class="section-note">Now break the monthly numbers into work and learning.</p>' +
        '<div class="field-grid">' +
        breakdownFields +
        "</div>"
    );
  }

  function renderGoalPage(answers) {
    return renderQuestionCard(
      "goal",
      "06",
      "What is your main goal for learning AI?",
      "This determines the track name and the examples used in the roadmap.",
      '<p class="section-note">Choose the objective that most closely matches why you are here today.</p>' +
        '<div class="choice-row">' +
        renderOptionGroup(
          "goal",
          goalOptions,
          answers.goal ? [answers.goal] : [],
          "radio"
        ) +
        "</div>"
    );
  }

  function renderAssessmentPage(answers) {
    return (
      '<div class="page-stack">' +
      '<p class="section-note">Rate each factor on the same 1-5 scale: Not yet, Early, Functional, Strong, and Highly mature.</p>' +
      assessmentQuestions
        .map(function (factor, index) {
          const selectedValue = answers[factor.key] ? [answers[factor.key]] : [];
          return renderQuestionCard(
            "assessment-" + factor.key,
            "07" + String.fromCharCode(65 + index),
            factor.title,
            factor.weight + "% of the final AI fluency score.",
            '<p class="section-note">' +
              escapeHtml(factor.prompt) +
              " " +
              escapeHtml(factor.note) +
              "</p>" +
              '<div class="choice-row">' +
              renderOptionGroup(
                factor.key,
                assessmentScaleOptions,
                selectedValue,
                "radio"
              ) +
              "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderTrainingPage(answers) {
    const conditional =
      '<div class="conditional" data-conditional="training"' +
      (answers.training === "yes" ? "" : " hidden") +
      ">" +
      renderTextField(
        "trainingCourse",
        "Course or program name",
        answers.trainingCourse,
        "Enter the course or program name"
      ) +
      "</div>";

    return renderQuestionCard(
      "training",
      "08",
      "Have you completed any formal paid AI training or courses before?",
      "If yes, share the program or course name so we avoid repeating it.",
      '<p class="section-note">This helps prevent duplicate content in the final roadmap.</p>' +
        '<div class="choice-row">' +
        renderOptionGroup(
          "training",
          trainingOptions,
          answers.training ? [answers.training] : [],
          "radio"
        ) +
        "</div>" +
        conditional
    );
  }

  function renderResultPage(answers, roadmap) {
    const displayName = answers.name ? answers.name : "you";
    const roleSummary = cleanText(answers.roleBackground, 120) || "Not provided";
    const wantsSummary = summarizeSelections(
      answers.wants,
      answers.wantsOther,
      "Not provided"
    );
    const painSummary = summarizeSelections(
      answers.pain,
      answers.painOther,
      "Not provided"
    );
    const selectedTools = roadmap.tools;
    const paidTool = cleanText(answers.paidToolName, 80);
    const monthlyTimeSummary = summarizeMonthlyTime(answers);
    const monthlyCostSummary = summarizeMonthlyCost(answers);
    const trainingSummary =
      answers.training === "yes"
        ? cleanText(answers.trainingCourse, 80) || "Yes"
        : "No";
    const factorSummary = roadmap.levelSignal.factorScores
      .map(function (factor) {
        return (
          factor.label +
          ": " +
          factor.rating +
          "/5 (" +
          factor.weight +
          "%)"
        );
      })
      .join(", ");

    const signalItems = [
      "Background / role: " + roleSummary + ".",
      "Current tools: " +
        (selectedTools.length ? selectedTools.join(", ") : "No active tools selected yet") +
        ".",
      "Weighted assessment: " + roadmap.levelSignal.fluencyScore + "/100.",
      "Assessment factors: " + factorSummary + ".",
      "Monthly time: " + (monthlyTimeSummary || "Not provided") + ".",
      "Monthly budget: " + (monthlyCostSummary || "Not provided") + ".",
      "AI fluency score: " + roadmap.levelSignal.fluencyScore + "/100.",
      "Formal training: " +
        trainingSummary +
        ".",
      "Weekly pace: " + roadmap.pacing + ".",
      "What you want: " + wantsSummary + ".",
      "Pain points: " + painSummary + ".",
    ];

    const toolPlanItems = roadmap.toolPlan;
    const moduleCards = roadmap.modules;
    const syncMessage = getSupabaseSyncMessage();
    const syncButtonLabel = getSupabaseSyncButtonLabel();
    const syncBadgeText =
      state.saveState.status === "saved"
        ? "Saved to Supabase"
        : state.saveState.status === "saving"
        ? "Syncing to Supabase"
        : "Supabase sync ready";

    const summaryMeta =
      '<div class="result-meta">' +
      "<span>Locked result</span>" +
      "<span>" + escapeHtml(syncBadgeText) + "</span>" +
      "<span>No further edits</span>" +
      "</div>";

    const resultActions =
      '<div class="result-actions">' +
      '<button type="button" class="secondary-btn" data-action="reset">Retake assessment</button>' +
      "</div>";

    const metrics =
      '<div class="result-summary">' +
      metricCard(
        "AI fluency score",
        roadmap.levelSignal.fluencyScore + "/100",
        factorSummary
      ) +
      metricCard(
        "Track",
        roadmap.track ? roadmap.track.label : "Pending",
        roadmap.track ? roadmap.track.description : "Choose a goal to reveal the track."
      ) +
      metricCard(
        "Duration",
        roadmap.durationText,
        roadmap.weeklyHours
          ? formatWeeklyHours(roadmap.weeklyHours) +
            ". " +
            capitalizeSentence(roadmap.pacing) +
            "."
          : "Based on your monthly commitment."
      ) +
      "</div>";

    const resultSummary =
      "Prepared for " +
      displayName +
      ". Weighted assessment: " +
      roadmap.levelSignal.fluencyScore +
      "/100. Role/background: " +
      roleSummary +
      ". This route points to " +
      (roadmap.track ? roadmap.track.label : "a tailored track") +
      " with " +
      getPacingArticle(roadmap.pacing) +
      " " +
      roadmap.pacing +
      ".";

    const signalCard =
      '<section class="result-block">' +
      "<h3>Assessment signals</h3>" +
      '<ul class="insight-list">' +
      signalItems
        .map(function (item) {
          return "<li>" + escapeHtml(item) + "</li>";
        })
        .join("") +
      "</ul>" +
      "</section>";

    const toolCard =
      '<section class="result-block">' +
      "<h3>Tool recommendations</h3>" +
      '<ul class="insight-list">' +
      toolPlanItems
        .map(function (item) {
          return (
            "<li><strong>" +
            escapeHtml(item.label) +
            ":</strong> " +
            escapeHtml(item.value) +
            "</li>"
          );
        })
        .join("") +
      "</ul>" +
      "</section>";

    const syncCard =
      '<section class="result-block send-card">' +
      "<h3>Supabase sync</h3>" +
      "<p>The contact email you entered is stored with the assessment result.</p>" +
      '<p class="send-status" data-send-status>' +
      escapeHtml(syncMessage) +
      "</p>" +
      '<button type="button" class="primary-btn" data-action="sync-now">' +
      escapeHtml(syncButtonLabel) +
      "</button>" +
      "</section>";

    const moduleList =
      '<section class="result-block module-list">' +
      '<div class="module-list__head">' +
      "<h3>Week-by-week roadmap</h3>" +
      "<p>" +
      escapeHtml(roadmap.band.description) +
      "</p>" +
      "</div>" +
      '<div class="module-list__items">' +
      moduleCards
        .map(function (card) {
          return (
            '<article class="module-card">' +
            '<div class="module-card__head">' +
            '<span class="module-card__week">Week ' +
            card.week +
            "</span>" +
            '<span class="module-card__hours">' +
            escapeHtml(card.hours) +
            "</span>" +
            "</div>" +
            '<h4 class="module-card__title">' +
            escapeHtml(card.title) +
            "</h4>" +
            "<p>" +
            escapeHtml(card.focus) +
            "</p>" +
            '<div class="module-card__meta">' +
            "<span>" +
            escapeHtml(trackLens[roadmap.track ? roadmap.track.key : "career"] || "Professional context") +
            "</span>" +
            "<span>" +
            escapeHtml(card.stack) +
            "</span>" +
            "</div>" +
            "</article>"
          );
        })
        .join("") +
      "</div>" +
      "</section>";

    return (
      '<section class="result-stage">' +
      '<section class="question-card result-hero" data-card="result">' +
      '<p class="eyebrow">Final result</p>' +
      "<h2>AI fluency score " +
      roadmap.levelSignal.fluencyScore +
      "/100" +
      (roadmap.track ? " - " + escapeHtml(roadmap.track.label) : "") +
      "</h2>" +
      "<p>" +
      escapeHtml(resultSummary) +
      "</p>" +
      summaryMeta +
      resultActions +
      "</section>" +
      metrics +
      '<div class="result-grid">' +
      signalCard +
      toolCard +
      "</div>" +
      syncCard +
      moduleList +
      "</section>"
    );
  }

  function metricCard(label, value, note) {
    return (
      '<article class="metric">' +
      '<span class="metric__label">' +
      escapeHtml(label) +
      "</span>" +
      '<strong class="metric__value">' +
      escapeHtml(value) +
      "</strong>" +
      '<p class="metric__note">' +
      escapeHtml(note) +
      "</p>" +
      "</article>"
    );
  }

  function renderStepStrip(currentPage, locked) {
    return pageMeta
      .map(function (meta, index) {
        let state = "todo";
        if (index < currentPage) {
          state = "done";
        } else if (index === currentPage) {
          state = locked ? "done" : "active";
        }
        return (
          '<span class="step-pill" data-state="' +
          state +
          '">' +
          "<em>" +
          String(index + 1).padStart(2, "0") +
          "</em>" +
          "<strong>" +
          escapeHtml(meta.step) +
          "</strong>" +
          "</span>"
        );
      })
      .join("");
  }

  function renderSideBody(roadmap, completion) {
    const track = roadmap.track;
    const scoreLine = "AI fluency score " + roadmap.levelSignal.fluencyScore + "/100";
    const trackLine = track ? track.label : "Pending";
    const durationLine = roadmap.durationText;
    const paceLine = roadmap.pacing;
    const monthlyTimeLine = summarizeMonthlyTime(state.answers) || "Pending";
    const monthlyCostLine = summarizeMonthlyCost(state.answers) || "Pending";
    const currentTools = roadmap.tools.length
      ? roadmap.tools.join(", ")
      : "No active tools selected yet";
    const liveLine = state.locked ? scoreLine : "Assessment in progress";
    const paidTool =
      state.answers.paid === "yes" && isFilled(state.answers.paidToolName)
        ? cleanText(state.answers.paidToolName, 80)
        : state.answers.paid === "yes"
        ? "Paid tool selected"
        : "No paid tool selected";

    const previewCard =
      '<section class="side-card">' +
      '<p class="kicker">' + (state.locked ? "Final signal" : "Live signal") + "</p>" +
      "<h4>" + escapeHtml(liveLine + " - " + trackLine) + "</h4>" +
      '<ul class="insight-list">' +
      "<li>Completion: " +
      completion.completed +
      "/" +
      completion.total +
      " sections.</li>" +
      "<li>Weighted score: " +
      roadmap.levelSignal.fluencyScore +
      "/100.</li>" +
      "<li>Track preview: " +
      escapeHtml(trackLine) +
      ".</li>" +
      "<li>Duration: " +
      escapeHtml(durationLine) +
      ".</li>" +
      "<li>Monthly AI time: " +
      escapeHtml(monthlyTimeLine) +
      ".</li>" +
      "<li>Monthly AI budget: " +
      escapeHtml(monthlyCostLine) +
      ".</li>" +
      "<li>Pacing: " +
      escapeHtml(paceLine) +
      ".</li>" +
      "</ul>" +
      "</section>";

    const toolCard =
      '<section class="side-card">' +
      '<p class="kicker">' + (state.locked ? "Locked context" : "Context snapshot") + "</p>" +
      "<h4>Current working set</h4>" +
      '<ul class="insight-list">' +
      "<li>Paid tool: " + escapeHtml(paidTool) + ".</li>" +
      "<li>Assessment score: " +
      escapeHtml(String(roadmap.levelSignal.fluencyScore || "Pending")) +
      "/100.</li>" +
      "<li>Role / background: " +
      escapeHtml(cleanText(state.answers.roleBackground, 80) || "Pending") +
      ".</li>" +
      "<li>Tools in use: " + escapeHtml(currentTools) + ".</li>" +
      "<li>Goal: " +
      escapeHtml(state.answers.goal || "Pending") +
      ".</li>" +
      "</ul>" +
      "</section>";

    return previewCard + toolCard;
  }

  function renderPage() {
    const pageIndex = state.locked ? RESULT_PAGE_INDEX : state.currentPage;
    const answers = state.answers;
    const roadmap = computeRoadmap(answers);
    const completion = getCompletion(answers);
    const meta = pageMeta[pageIndex];
    const pageState = state.locked ? "result" : pageIndex === 0 ? "intro" : "wizard";

    document.body.dataset.pageState = pageState;
    pageTitle.textContent = meta.title;
    pageSubtitle.textContent = meta.subtitle;
    pageCopy.textContent = meta.copy;
    stepStrip.innerHTML = renderStepStrip(pageIndex, state.locked);
    sideTitle.textContent = state.locked ? "Final roadmap" : "Live preview";
    sideSubtitle.textContent = state.locked
      ? "The result is locked and the Supabase sync status updates below."
      : "The right-hand signal updates as you answer each section.";

    if (state.locked) {
      pageContent.innerHTML = renderResultPage(answers, state.finalResult || roadmap);
    } else if (pageIndex === 0) {
      pageContent.innerHTML = renderIntroPage();
    } else if (pageIndex === 1) {
      pageContent.innerHTML = renderProfilePage(answers);
    } else if (pageIndex === 2) {
      pageContent.innerHTML = renderPaidPage(answers);
    } else if (pageIndex === 3) {
      pageContent.innerHTML = renderToolsPage(answers);
    } else if (pageIndex === 4) {
      pageContent.innerHTML = renderHoursPage(answers);
    } else if (pageIndex === 5) {
      pageContent.innerHTML = renderGoalPage(answers);
    } else if (pageIndex === 6) {
      pageContent.innerHTML = renderAssessmentPage(answers);
    } else if (pageIndex === 7) {
      pageContent.innerHTML = renderTrainingPage(answers);
    } else {
      pageContent.innerHTML = renderResultPage(answers, state.finalResult || roadmap);
    }

    setConditionalVisibility();
    setNextButtonState();
    clearErrorState();
    updateChrome(roadmap, completion, pageIndex);
  }

  function updateChrome(roadmap, completion, pageIndex) {
    const previewCompletion = state.locked
      ? 1
      : Math.max(0.06, completion.completion);
    const finalBand = roadmap.bandKey || "beginner";
    const gaugeFill = state.locked
      ? Math.max(18, (roadmap.levelSignal.fluencyScore / 100) * 360)
      : previewCompletion * 360;

    gauge.dataset.band = finalBand;
    gauge.style.setProperty("--fill", gaugeFill + "deg");

    if (state.locked) {
      dialLabel.textContent = "AI fluency score";
      dialValue.textContent = roadmap.levelSignal.fluencyScore + "/100";
      dialTrack.textContent = roadmap.track ? roadmap.track.label : "Result locked";
      dialStatus.textContent =
        "Locked after final submit. No further edits are permitted.";
    } else {
      dialLabel.textContent = "Page";
      dialValue.textContent = String(pageIndex + 1) + "/" + TOTAL_PAGES;
      dialTrack.textContent = getBandLabel(roadmap.levelSignal.level);
      dialStatus.textContent = getDialStatus(completion.completed, state.currentPage);
    }

    statusPage.textContent = state.locked
      ? TOTAL_PAGES + " of " + TOTAL_PAGES
      : String(pageIndex + 1) + " of " + TOTAL_PAGES;
    statusProgress.textContent = state.locked
      ? "100%"
      : Math.round(completion.completion * 100) + "%";
    statusLevel.textContent = roadmap.levelSignal.fluencyScore + "/100";
    statusTrack.textContent = state.locked
      ? roadmap.track
        ? roadmap.track.label
        : "Locked result"
      : roadmap.track
      ? roadmap.track.label
      : "Pending";

    sideBody.innerHTML = renderSideBody(roadmap, completion);
  }

  function getDialStatus(completedSections, pageIndex) {
    if (pageIndex === 0) {
      return "Start with the overview.";
    }
    if (completedSections === 0) {
      return "Signal is gathering.";
    }
    if (completedSections < 3) {
      return "Early pattern forming.";
    }
    if (completedSections < TOTAL_COMPLETION_SECTIONS) {
      return "Score is taking shape.";
    }
    return "Strong live reading.";
  }

  function setConditionalVisibility() {
    setFieldVisibility("paid", getRadioValue("paid") === "yes");
    setFieldVisibility("tools-other", getCheckboxValues("tools").includes("Other"));
    setFieldVisibility("training", getRadioValue("training") === "yes");
  }

  function clearErrorState() {
    wizardError.hidden = true;
    wizardError.textContent = "";
    Array.from(form.querySelectorAll("[data-card]")).forEach(function (card) {
      card.classList.remove("is-error");
    });
  }

  function markErrors(cardKeys) {
    Array.from(form.querySelectorAll("[data-card]")).forEach(function (card) {
      card.classList.remove("is-error");
    });
    cardKeys.forEach(function (cardKey) {
      const card = form.querySelector('[data-card="' + cardKey + '"]');
      if (card) {
        card.classList.add("is-error");
      }
    });
  }

  function focusFirstSelector(selectors) {
    for (let index = 0; index < selectors.length; index += 1) {
      const node = form.querySelector(selectors[index]);
      if (node && typeof node.focus === "function") {
        node.focus();
        return;
      }
    }
  }

  function syncAnswersFromCurrentPage() {
    if (state.locked) {
      return;
    }

    if (state.currentPage === 1) {
      state.answers.name = cleanText(getFieldValue("name"), 80);
      state.answers.email = cleanText(getFieldValue("email"), 120);
      state.answers.roleBackground = cleanText(getFieldValue("roleBackground"), 120);
      state.answers.wants = getCheckboxValues("wants");
      state.answers.wantsOther = cleanText(getFieldValue("wantsOther"), 160);
      state.answers.pain = getCheckboxValues("pain");
      state.answers.painOther = cleanText(getFieldValue("painOther"), 160);
    } else if (state.currentPage === 2) {
      state.answers.paid = getRadioValue("paid");
      state.answers.paidToolName = cleanText(getFieldValue("paidToolName"), 80);
    } else if (state.currentPage === 3) {
      state.answers.tools = getCheckboxValues("tools");
      state.answers.toolsOther = cleanText(getFieldValue("toolsOther"), 80);
    } else if (state.currentPage === 4) {
      state.answers.aiHoursTotalMonthly = cleanText(
        getFieldValue("aiHoursTotalMonthly"),
        40
      );
      state.answers.aiCostTotalMonthly = cleanText(
        getFieldValue("aiCostTotalMonthly"),
        40
      );
      state.answers.aiWorkHoursMonthly = cleanText(
        getFieldValue("aiWorkHoursMonthly"),
        40
      );
      state.answers.aiLearnHoursMonthly = cleanText(
        getFieldValue("aiLearnHoursMonthly"),
        40
      );
      state.answers.aiCostWorkMonthly = cleanText(
        getFieldValue("aiCostWorkMonthly"),
        40
      );
      state.answers.aiCostLearnMonthly = cleanText(
        getFieldValue("aiCostLearnMonthly"),
        40
      );
    } else if (state.currentPage === 5) {
      state.answers.goal = getRadioValue("goal");
    } else if (state.currentPage === 6) {
      state.answers.toolBreadth = getRadioValue("toolBreadth");
      state.answers.promptQuality = getRadioValue("promptQuality");
      state.answers.verificationJudgment = getRadioValue("verificationJudgment");
      state.answers.workflowIntegration = getRadioValue("workflowIntegration");
      state.answers.automationBuilding = getRadioValue("automationBuilding");
      state.answers.timeCostCommitment = getRadioValue("timeCostCommitment");
    } else if (state.currentPage === 7) {
      state.answers.training = getRadioValue("training");
      state.answers.trainingCourse = cleanText(getFieldValue("trainingCourse"), 80);
    }
  }

  function enforceExclusiveTools(target) {
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    if (target.name !== "tools" || !target.checked) {
      return;
    }

    const allTools = Array.from(form.querySelectorAll('input[name="tools"]'));
    const noneBox = allTools.find(function (input) {
      return input.value === "None";
    });
    const otherBox = allTools.find(function (input) {
      return input.value === "Other";
    });

    if (target.value === "None") {
      allTools.forEach(function (input) {
        if (input.value !== "None") {
          input.checked = false;
        }
      });
      const otherField = form.querySelector('[name="toolsOther"]');
      if (otherField) {
        otherField.value = "";
      }
      return;
    }

    if (noneBox) {
      noneBox.checked = false;
    }
    if (target.value === "Other" && otherBox) {
      const otherField = form.querySelector('[name="toolsOther"]');
      if (otherField) {
        otherField.focus();
      }
    }
  }

  function refreshLiveState() {
    syncAnswersFromCurrentPage();
    setConditionalVisibility();

    const validation = getPageValidation(state.currentPage, state.answers);
    if (validation.valid) {
      wizardError.hidden = true;
      wizardError.textContent = "";
      markErrors([]);
    }

    const roadmap = computeRoadmap(state.answers);
    const completion = getCompletion(state.answers);
    updateChrome(roadmap, completion, state.currentPage);
  }

  function handleNext() {
    if (state.locked) {
      return;
    }

    syncAnswersFromCurrentPage();
    const validation = getPageValidation(state.currentPage, state.answers);

    if (!validation.valid) {
      markErrors(validation.missingCards);
      wizardError.hidden = false;
      wizardError.textContent =
        state.currentPage === 1
          ? "Complete the highlighted profile and context sections before continuing."
          : state.currentPage === 2
          ? "Confirm whether you pay for an AI tool and name it if you do."
          : state.currentPage === 3
          ? "Select at least one tool, or choose None if you are just starting out."
          : state.currentPage === 4
          ? "Enter the monthly hours and cost numbers before continuing."
          : state.currentPage === 5
          ? "Select the primary goal for this assessment."
          : state.currentPage === 6
          ? "Rate the six factors that shape your AI fluency score."
          : state.currentPage === 7
          ? "Confirm whether you have completed formal paid training and share the course name if you have."
          : "Complete the highlighted fields before continuing.";
      focusFirstSelector(validation.focusSelectors);
      refreshLiveState();
      return;
    }

    clearErrorState();

    if (state.currentPage === 7) {
      state.finalResult = computeRoadmap(state.answers);
      state.locked = true;
      state.currentPage = RESULT_PAGE_INDEX;
      state.saveState = {
        status: "idle",
        message: "",
      };
      renderPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
      void syncCurrentResult();
      return;
    }

    state.currentPage += 1;
    renderPage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    if (state.locked) {
      return;
    }
    syncAnswersFromCurrentPage();
    clearErrorState();
    if (state.currentPage > 0) {
      state.currentPage -= 1;
      renderPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleReset() {
    state.currentPage = 0;
    state.locked = false;
    state.finalResult = null;
    state.saveState = {
      status: "idle",
      message: "",
    };
    state.answers = createInitialAnswers();
    renderPage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSyncNow() {
    void syncCurrentResult();
  }

  function wireEvents() {
    const startButtons = document.querySelectorAll(
      '[data-action="start-assessment"]'
    );
    startButtons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        handleNext();
      });
    });

    form.addEventListener("input", function (event) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      if (target.matches('input[name="tools"]')) {
        enforceExclusiveTools(target);
      }
      refreshLiveState();
    });

    form.addEventListener("change", function (event) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      if (target.matches('input[name="tools"]')) {
        enforceExclusiveTools(target);
      }
      refreshLiveState();
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      handleNext();
    });

    form.addEventListener("click", function (event) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      if (target.closest('[data-action="back"]')) {
        event.preventDefault();
        handleBack();
      }
      if (target.closest('[data-action="reset"]')) {
        event.preventDefault();
        handleReset();
      }
      if (target.closest('[data-action="sync-now"]')) {
        event.preventDefault();
        handleSyncNow();
      }
    });
  }

  wireEvents();
  renderPage();
})();
