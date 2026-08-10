(function () {
  const TOTAL_PAGES = 9;
  const RESULT_PAGE_INDEX = 8;
  const TOTAL_COMPLETION_SECTIONS = 13;

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
  const draftSaveStatus = document.querySelector("[data-draft-save-status]");
  const resumeDialog = document.querySelector("[data-resume-dialog]");
  const resumeSummary = document.querySelector("[data-resume-summary]");
  const SUPABASE_CONFIG = window.__SUPABASE_CONFIG__ || {};
  const SUPABASE_URL = SUPABASE_CONFIG.url || "";
  const SUPABASE_PUBLISHABLE_KEY =
    SUPABASE_CONFIG.publishableKey || SUPABASE_CONFIG.anonKey || "";
  const SUPABASE_APP_VERSION = SUPABASE_CONFIG.appVersion || "2026-07-30";
  const SUPABASE_SAVE_DRAFT_RPC =
    SUPABASE_CONFIG.saveDraftRpc || "save_115b_assessment_draft";
  const SUPABASE_LOAD_DRAFT_RPC =
    SUPABASE_CONFIG.loadDraftRpc || "load_115b_assessment_draft";
  const SUPABASE_DISCARD_DRAFT_RPC =
    SUPABASE_CONFIG.discardDraftRpc || "discard_115b_assessment_draft";
  const SUPABASE_SUBMIT_RPC =
    SUPABASE_CONFIG.submitRpc || "submit_115b_assessment";
  const LOCAL_DRAFT_KEY = "115b_ai_fluency_draft_v1";
  const LOCAL_DRAFT_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

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
      title: "Primary Goal",
      subtitle: "Choose the track and supporting goals that best match your intent.",
      copy:
        "The primary goal drives the learning track name, while the secondary and third goals add extra context for the result.",
      step: "Goal",
    },
    {
      title: "Training Topics",
      subtitle: "Choose a status for each topic area.",
      copy:
        "The default is no interest. Use the dropdown next to each topic to show how far you have gone.",
      step: "Training",
    },
    {
      title: "Which tools you used",
      subtitle: "Rate the tools you have touched with one option each.",
      copy:
        "Choose one usage level for every tool. The roadmap will use the strongest signals from your stack.",
      step: "Usage",
    },
    {
      title: "Knowledge / Skill",
      subtitle: "Map the AI knowledge and skills you currently use.",
      copy:
        "Choose the status that best matches each skill area. The default is no interest, so you can move quickly through the page.",
      step: "Skills",
    },
    {
      title: "Weighted Assessment",
      subtitle: "Rate the five factors that make up your AI fluency score.",
      copy:
        "Each factor uses a 1-5 scale and a different weight in the final score.",
      step: "Assessment",
    },
    {
      title: "Monthly Time & Cost",
      subtitle: "Capture the monthly hours and budget that shape your path.",
      copy:
        "The monthly totals shape the roadmap pace, and the budget inputs stay with the result for later review.",
      step: "Time",
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

  const objectiveDropdownOptions = [
    { value: "None", label: "None" },
  ].concat(
    wantsOptions.map(function (item) {
      return { value: item, label: item };
    })
  );

  const painDropdownOptions = [
    { value: "None", label: "None" },
  ].concat(
    painOptions.map(function (item) {
      return { value: item, label: item };
    })
  );

  const toolUsageOptions = [
    { value: "not-yet-try", label: "A) not yet try" },
    { value: "just-trying-only", label: "B) just trying only" },
    { value: "basic-free", label: "C) use basic/free version" },
    { value: "paid-version", label: "D) use paid version" },
    { value: "advance-features", label: "E) use advance features" },
  ];

  const toolUsageSections = [
    {
      key: "tool-usage-a",
      title: "A. Core assistants",
      note: "Rate each general-purpose assistant with one option.",
      items: [
        { name: "toolA1", label: "A1 - Chatgpt" },
        { name: "toolA2", label: "A2 -Gemini / google AI studio" },
        { name: "toolA3", label: "A3 - Claude" },
        { name: "toolA4", label: "A4 - Copilot" },
        { name: "toolA5", label: "A5 - Deepseek" },
        { name: "toolA6", label: "A6 - Kimi" },
      ],
    },
    {
      key: "tool-usage-b",
      title: "B. Coding assistants",
      note: "Rate each coding assistant with one option.",
      items: [
        { name: "toolB1", label: "B1 - Codex" },
        { name: "toolB2", label: "B2 - Claude code" },
      ],
    },
    {
      key: "tool-usage-c",
      title: "C. Automation tools",
      note: "Rate each automation or workflow tool with one option.",
      items: [
        { name: "toolC1", label: "C1 - N8n" },
        { name: "toolC2", label: "C2 - Make" },
        { name: "toolC3", label: "C3 - Zappier" },
      ],
    },
    {
      key: "tool-usage-d",
      title: "D. Work assistants",
      note: "Rate each work-focused assistant with one option.",
      items: [
        { name: "toolD1", label: "D1 - Open claw" },
        { name: "toolD2", label: "D2 - Hermes" },
        { name: "toolD3", label: "D3 - Claude Work" },
        { name: "toolD4", label: "D4 - Openai Work" },
      ],
    },
    {
      key: "tool-usage-e",
      title: "E. Creative tools",
      note: "Rate each creative media tool with one option.",
      items: [
        { name: "toolE1", label: "E1 - Banana" },
        { name: "toolE2", label: "E2 - Veo3" },
        { name: "toolE3", label: "E3 - madjury" },
        { name: "toolE4", label: "E4 - suno" },
        { name: "toolE5", label: "E5 - eleven lsb" },
        { name: "toolE6", label: "E6 - hygen" },
      ],
    },
    {
      key: "tool-usage-f",
      title: "F. Design and notes",
      note: "Rate each design or note-taking tool with one option.",
      items: [
        { name: "toolF1", label: "F1 - Canva" },
        { name: "toolF2", label: "F2 - plexigk" },
        { name: "toolF3", label: "F3 - minus" },
        { name: "toolF4", label: "F4 - gemini notebook" },
      ],
    },
  ];

  const toolUsageValueOrder = {
    "": 0,
    "0": 0,
    "not-yet-try": 0,
    "just-trying-only": 1,
    "basic-free": 2,
    "paid-version": 3,
    "advance-features": 4,
  };

  const knowledgeSkillStatusDefaultOption = {
    value: "no-interest",
    label: "no interest",
  };

  const knowledgeSkillStatusValueOrder = {
    "no-interest": 0,
    "interest-but-no-yet-learning": 1,
    basic: 2,
    immediate: 3,
    advanced: 4,
  };

  const knowledgeSkillStatusOptions = [
    {
      value: "interest-but-no-yet-learning",
      label: "interest but no yet learning",
    },
    { value: "basic", label: "Basic" },
    { value: "immediate", label: "Immediate" },
    { value: "advanced", label: "Advanced" },
  ];

  const knowledgeSkillSections = [
    {
      key: "knowledge-skill-a",
      title: "A. Prompting",
      note: "Choose the status that best matches your AI prompt skill.",
      items: [
        { name: "skillA1", label: "A1 - AI prompt" },
      ],
    },
    {
      key: "knowledge-skill-b",
      title: "B. Creative media",
      note: "Choose the status for each creative generation or editing skill.",
      items: [
        { name: "skillB1", label: "B1 - Image gen" },
        { name: "skillB2", label: "B2 - Video gen" },
        { name: "skillB3", label: "B3 - Music gen" },
        { name: "skillB4", label: "B4 - Avatar is" },
        { name: "skillB5", label: "B5 - Voice clone" },
        { name: "skillB6", label: "B6 - Image editing" },
        { name: "skillB7", label: "B7 - Video editing" },
        { name: "skillB8", label: "B8 - Info graphic" },
        { name: "skillB9", label: "B9 - AI Podcast" },
        { name: "skillB10", label: "B10 - Notebook knowledge base" },
      ],
    },
    {
      key: "knowledge-skill-d",
      title: "D. Infrastructure and automation",
      note: "Choose the status for each workflow, routing, and hosting skill.",
      items: [
        { name: "skillD1", label: "D1 - N8n workflow" },
        { name: "skillD2", label: "D2 - Local machine AI self hosting" },
        { name: "skillD3", label: "D3 - Open router" },
        { name: "skillD4", label: "D4 - Llm api" },
        { name: "skillD5", label: "D5 - Cloud AI self hosting" },
      ],
    },
    {
      key: "knowledge-skill-c",
      title: "C. Office productivity",
      note: "Choose the status for each office and communication skill.",
      items: [
        { name: "skillC1", label: "C1 - office Productivity" },
        { name: "skillC2", label: "C2 - Gmail automation" },
        { name: "skillC3", label: "C3 - Meeting summary" },
        { name: "skillC4", label: "C4 - AI calender" },
        { name: "skillC5", label: "C5 - Chatbot whatsapp/telegram" },
        { name: "skillC6", label: "C6 - Presentation slides" },
        { name: "skillC7", label: "C7 - Poster," },
      ],
    },
    {
      key: "knowledge-skill-e",
      title: "E. Building and agents",
      note: "Choose the status for each advanced building skill.",
      items: [
        { name: "skillE1", label: "E1 - Vibe coding" },
        { name: "skillE2", label: "E2 - Custom gpt" },
        { name: "skillE3", label: "E3 - AI Agent" },
      ],
    },
  ];

  const knowledgeSkillFields = [];
  knowledgeSkillSections.forEach(function (section) {
    section.items.forEach(function (item) {
      knowledgeSkillFields.push({
        name: item.name,
        label: item.label,
        sectionKey: section.key,
      });
    });
  });

  const monthlyHourDropdownOptions = [
    { value: "0", label: "0", numericValue: 0 },
    {
      value: "Less then 15 hours",
      label: "Less then 15 hours",
      numericValue: 8,
    },
    { value: "15 - 30 hours", label: "15 - 30 hours", numericValue: 22.5 },
    { value: "30 - 90 hours", label: "30 - 90 hours", numericValue: 60 },
    {
      value: "More then 90 hours",
      label: "More then 90 hours",
      numericValue: 90,
    },
  ];

  const monthlyCostDropdownOptions = [
    { value: "0", label: "0", numericValue: 0 },
    {
      value: "Less then MYR 100",
      label: "Less then MYR 100",
      numericValue: 50,
    },
    { value: "100 - 299", label: "100 - 299", numericValue: 200 },
    { value: "300 - 599", label: "300 - 599", numericValue: 450 },
    {
      value: "More then MYR 600",
      label: "More then MYR 600",
      numericValue: 600,
    },
  ];

  const weeklyTimeFields = [
    {
      name: "aiHoursTotalMonthly",
      label: "Total hours on AI (monthly)",
      placeholder: "e.g. 24",
      type: "hours",
    },
    {
      name: "aiCostTotalMonthly",
      label: "Total cost on AI (total-monthly)",
      placeholder: "e.g. 120",
      type: "cost",
    },
    {
      name: "aiWorkHoursMonthly",
      label: "Total hours work on AI (monthly)",
      placeholder: "e.g. 16",
      type: "hours",
    },
    {
      name: "aiLearnHoursMonthly",
      label: "Total hours learn on AI (monthly)",
      placeholder: "e.g. 8",
      type: "hours",
    },
    {
      name: "aiCostWorkMonthly",
      label: "Total cost work on AI (monthly)",
      placeholder: "e.g. 80",
      type: "cost",
    },
    {
      name: "aiCostLearnMonthly",
      label: "Total cost learn on AI (monthly)",
      placeholder: "e.g. 40",
      type: "cost",
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

  const goalDropdownOptions = [
    { value: "None", label: "None" },
  ].concat(goalOptions);

  const assessmentScaleOptions = [
    { value: "1", label: "Not Yet" },
    { value: "2", label: "Early" },
    { value: "3", label: "Functional" },
    { value: "4", label: "Strong" },
    { value: "5", label: "Highly mature" },
  ];

  const assessmentQuestions = [
    {
      key: "toolBreadth",
      title: "Tool breadth",
      weight: 30,
      prompt: "How broad is your current AI tool use across tasks and contexts?",
      note: "1 means one narrow tool setup. 5 means a broad stack used across many tasks.",
    },
    {
      key: "promptQuality",
      title: "Prompt quality and task framing",
      weight: 30,
      prompt: "How well do you structure prompts, context, and task framing before asking for output?",
      note: "1 means vague asks. 5 means consistently clear, specific, and reusable prompts.",
    },
    {
      key: "verificationJudgment",
      title: "Verification and judgment",
      weight: 15,
      prompt: "How consistently do you check outputs, judge quality, and catch errors?",
      note: "1 means you rarely verify. 5 means you regularly validate and critique the output.",
    },
    {
      key: "automationBuilding",
      title: "Automation / building ability",
      weight: 15,
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

  const trainingStatusDefaultOption = {
    value: "no-interest",
    label: "no interest",
  };

  const trainingStatusOptions = [
    {
      value: "interest-but-not-yet-attended",
      label: "interest but no yet attend any",
    },
    {
      value: "attend-free-session-only",
      label: "attend free session only",
    },
    {
      value: "attend-paid-session-only",
      label: "attend paid session only",
    },
    {
      value: "attend-both-free-and-paid-session",
      label: "attend both free and paid session",
    },
  ];

  const trainingTopicSections = [
    {
      key: "training-topic-a",
      title: "A. GenAI",
      note: "Pick a status for the foundation topic.",
      items: [
        {
          name: "trainingTopicA1",
          label: "A1 - GenAI / Prompt Engineering",
        },
      ],
    },
    {
      key: "training-topic-b",
      title: "B. Coding and Agents",
      note: "Pick a status for each coding and automation topic.",
      items: [
        { name: "trainingTopicB1", label: "B1 - Coding" },
        { name: "trainingTopicB2", label: "B2 - AI Agent" },
        { name: "trainingTopicB3", label: "B3 - AI Automation" },
      ],
    },
    {
      key: "training-topic-c",
      title: "C. Media Generation",
      note: "Pick a status for each media creation topic.",
      items: [
        { name: "trainingTopicC1", label: "C1 - Image Gen/Edit" },
        { name: "trainingTopicC2", label: "C2 - Video Gen/Edit" },
        { name: "trainingTopicC3", label: "C3 - Audio Gen/Edit" },
      ],
    },
    {
      key: "training-topic-d",
      title: "D. Clone and Knowledge",
      note: "Pick a status for the clone and knowledge topics.",
      items: [
        { name: "trainingTopicD1", label: "D1 - AI Clone" },
        { name: "trainingTopicD2", label: "D2 - Knowledge Agent" },
      ],
    },
    {
      key: "training-topic-e",
      title: "E. Business and Productivity",
      note: "Pick a status for each business workflow topic.",
      items: [
        { name: "trainingTopicE1", label: "E1 - AI on Marketing" },
        { name: "trainingTopicE2", label: "E2 - AI on Administration" },
        { name: "trainingTopicE3", label: "E3 - AI on Human Resource" },
        { name: "trainingTopicE4", label: "E4 - AI on data science" },
        { name: "trainingTopicE5", label: "E5 - AI on Business" },
        { name: "trainingTopicE6", label: "E6 - AI on Productivity" },
      ],
    },
  ];

  const trainingTopicFields = [];
  trainingTopicSections.forEach(function (section) {
    section.items.forEach(function (item) {
      trainingTopicFields.push(item);
    });
  });

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
      label: "Applied Practice",
      description: "Prompt patterns, process habits, and light automation.",
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
    resumeToken: "",
    submissionId: "",
    pendingResume: null,
    draftSaveState: {
      status: "idle",
      message: "",
      lastSavedAt: "",
    },
    saveState: {
      status: "idle",
      message: "",
    },
    answers: createInitialAnswers(),
  };

  function createInitialAnswers() {
    const answers = {
      name: "",
      email: "",
      roleBackground: "",
      wants: ["None", "None", "None"],
      wantsOther: "",
      pain: ["None", "None", "None"],
      painOther: "",
      tools: knowledgeSkillFields.map(function () {
        return knowledgeSkillStatusDefaultOption.value;
      }),
      toolsOther: "",
      aiHoursTotalMonthly: "0",
      aiCostTotalMonthly: "0",
      aiWorkHoursMonthly: "0",
      aiLearnHoursMonthly: "0",
      aiCostWorkMonthly: "0",
      aiCostLearnMonthly: "0",
      goal: "None",
      goalSecondary: "None",
      goalThird: "None",
      goalOtherSector: "",
      toolBreadth: "1",
      promptQuality: "1",
      verificationJudgment: "1",
      automationBuilding: "1",
      timeCostCommitment: "1",
      trainingTopics: trainingTopicFields.map(function () {
        return trainingStatusDefaultOption.value;
      }),
    };

    toolUsageSections.forEach(function (section) {
      section.items.forEach(function (item) {
        answers[item.name] = "not-yet-try";
      });
    });

    return answers;
  }

  function createUuid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, function (byte) {
      return byte.toString(16).padStart(2, "0");
    }).join("");

    return (
      hex.slice(0, 8) +
      "-" +
      hex.slice(8, 12) +
      "-" +
      hex.slice(12, 16) +
      "-" +
      hex.slice(16, 20) +
      "-" +
      hex.slice(20)
    );
  }

  function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      String(value || "")
    );
  }

  function ensureResumeToken() {
    if (!isUuid(state.resumeToken)) {
      state.resumeToken = createUuid();
    }
    return state.resumeToken;
  }

  function mergeSavedAnswers(savedAnswers) {
    const defaults = createInitialAnswers();
    if (!savedAnswers || typeof savedAnswers !== "object") {
      return defaults;
    }

    Object.keys(defaults).forEach(function (key) {
      if (!Object.prototype.hasOwnProperty.call(savedAnswers, key)) {
        return;
      }

      if (Array.isArray(defaults[key])) {
        if (!Array.isArray(savedAnswers[key])) {
          return;
        }
        defaults[key] = defaults[key].map(function (fallback, index) {
          return savedAnswers[key][index] == null
            ? fallback
            : savedAnswers[key][index];
        });
        return;
      }

      defaults[key] = savedAnswers[key];
    });

    return defaults;
  }

  function clearLocalDraft() {
    try {
      window.localStorage.removeItem(LOCAL_DRAFT_KEY);
    } catch (error) {
      return;
    }
  }

  function writeLocalDraft(record) {
    try {
      window.localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(record));
      return true;
    } catch (error) {
      return false;
    }
  }

  function readLocalDraft() {
    let raw = "";
    try {
      raw = window.localStorage.getItem(LOCAL_DRAFT_KEY) || "";
    } catch (error) {
      return null;
    }

    if (!raw) {
      return null;
    }

    try {
      const record = JSON.parse(raw);
      const savedTime = Date.parse(record.lastSavedAt || "");
      const isExpired =
        Number.isFinite(savedTime) && Date.now() - savedTime > LOCAL_DRAFT_MAX_AGE;

      if (
        !record ||
        record.version !== 1 ||
        !isUuid(record.resumeToken) ||
        !Number.isInteger(record.currentPage) ||
        record.currentPage < 1 ||
        record.currentPage > 7 ||
        !record.answers ||
        typeof record.answers !== "object" ||
        isExpired
      ) {
        clearLocalDraft();
        return null;
      }

      return record;
    } catch (error) {
      clearLocalDraft();
      return null;
    }
  }

  function persistDraftLocally() {
    if (state.locked || state.currentPage < 1 || state.currentPage > 7) {
      return null;
    }

    const record = {
      version: 1,
      resumeToken: ensureResumeToken(),
      currentPage: state.currentPage,
      answers: JSON.parse(JSON.stringify(state.answers)),
      submissionId: isUuid(state.submissionId) ? state.submissionId : "",
      appVersion: SUPABASE_APP_VERSION,
      lastSavedAt: new Date().toISOString(),
    };

    writeLocalDraft(record);
    return record;
  }

  function setDraftSaveState(status, message, savedAt) {
    state.draftSaveState = {
      status: status,
      message: message || "",
      lastSavedAt: savedAt || state.draftSaveState.lastSavedAt || "",
    };

    if (draftSaveStatus) {
      draftSaveStatus.dataset.state = status;
      draftSaveStatus.textContent = message || "";
    }

    if (!state.locked && state.currentPage > 0) {
      nextBtn.disabled = status === "saving";
    }
  }

  function getSupabaseRpcUrl(functionName) {
    return (
      SUPABASE_URL.replace(/\/+$/, "") +
      "/rest/v1/rpc/" +
      encodeURIComponent(functionName)
    );
  }

  async function callSupabaseRpc(functionName, payload) {
    if (typeof window === "undefined" || window.location.protocol === "file:") {
      throw new Error("Open the app through http:// or https:// to save progress.");
    }

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      throw new Error("Supabase configuration is missing.");
    }

    const response = await fetch(getSupabaseRpcUrl(functionName), {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: "Bearer " + SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = "Supabase request failed with status " + response.status + ".";
      try {
        const errorPayload = responseText ? JSON.parse(responseText) : null;
        errorMessage = cleanText(
          errorPayload && (errorPayload.message || errorPayload.hint)
            ? errorPayload.message || errorPayload.hint
            : errorMessage,
          160
        );
      } catch (error) {
        errorMessage = cleanText(responseText, 160) || errorMessage;
      }
      throw new Error(errorMessage);
    }

    if (!responseText) {
      return null;
    }

    try {
      return JSON.parse(responseText);
    } catch (error) {
      return responseText;
    }
  }

  async function saveDraftCheckpoint() {
    const localRecord = persistDraftLocally();
    if (!localRecord) {
      return false;
    }

    setDraftSaveState("saving", "Saving progress...", localRecord.lastSavedAt);

    try {
      const result = await callSupabaseRpc(SUPABASE_SAVE_DRAFT_RPC, {
        p_resume_token: localRecord.resumeToken,
        p_current_page: localRecord.currentPage,
        p_answers: localRecord.answers,
        p_app_version: SUPABASE_APP_VERSION,
      });
      const savedAt =
        result && result.last_saved_at
          ? result.last_saved_at
          : new Date().toISOString();

      localRecord.lastSavedAt = savedAt;
      writeLocalDraft(localRecord);
      setDraftSaveState("saved", "Progress saved", savedAt);
      return true;
    } catch (error) {
      setDraftSaveState(
        "local",
        "Saved on this device; cloud save unavailable",
        localRecord.lastSavedAt
      );
      return false;
    }
  }

  function getDraftTimestamp(record) {
    const savedAt = record
      ? record.lastSavedAt || record.last_saved_at || ""
      : "";
    const parsed = Date.parse(savedAt);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatDraftSavedAt(value) {
    const parsed = Date.parse(value || "");
    if (!Number.isFinite(parsed)) {
      return "recently";
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(parsed));
  }

  function showResumeDialog(record) {
    state.pendingResume = record;
    if (resumeSummary) {
      resumeSummary.textContent =
        "Page " +
        (record.currentPage + 1) +
        " of " +
        TOTAL_PAGES +
        " was saved " +
        formatDraftSavedAt(record.lastSavedAt) +
        ".";
    }

    if (resumeDialog && typeof resumeDialog.showModal === "function") {
      resumeDialog.showModal();
    } else if (resumeDialog) {
      resumeDialog.setAttribute("open", "");
    }
  }

  function hideResumeDialog() {
    if (!resumeDialog) {
      return;
    }
    if (typeof resumeDialog.close === "function" && resumeDialog.open) {
      resumeDialog.close();
    } else {
      resumeDialog.removeAttribute("open");
    }
  }

  async function checkForSavedDraft() {
    const localRecord = readLocalDraft();
    if (!localRecord) {
      return;
    }

    let resumeRecord = localRecord;
    try {
      const cloudRecord = await callSupabaseRpc(SUPABASE_LOAD_DRAFT_RPC, {
        p_resume_token: localRecord.resumeToken,
      });

      if (cloudRecord && getDraftTimestamp(cloudRecord) > getDraftTimestamp(localRecord)) {
        resumeRecord = {
          version: 1,
          resumeToken: localRecord.resumeToken,
          currentPage: Number(cloudRecord.current_page),
          answers: cloudRecord.answers,
          appVersion: SUPABASE_APP_VERSION,
          lastSavedAt: cloudRecord.last_saved_at,
        };
        writeLocalDraft(resumeRecord);
      }
    } catch (error) {
      resumeRecord = localRecord;
    }

    if (state.currentPage === 0 && !state.locked) {
      showResumeDialog(resumeRecord);
    }
  }

  function resumeSavedDraft() {
    const record = state.pendingResume;
    if (!record) {
      hideResumeDialog();
      return;
    }

    state.currentPage = clamp(Number(record.currentPage) || 1, 1, 7);
    state.answers = mergeSavedAnswers(record.answers);
    state.resumeToken = record.resumeToken;
    state.submissionId = isUuid(record.submissionId) ? record.submissionId : "";
    state.locked = false;
    state.finalResult = null;
    state.pendingResume = null;
    state.saveState = { status: "idle", message: "" };
    state.draftSaveState = {
      status: "saved",
      message: "Progress restored",
      lastSavedAt: record.lastSavedAt || "",
    };
    hideResumeDialog();
    renderPage();
    setDraftSaveState("saved", "Progress restored", record.lastSavedAt || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function discardSavedDraft() {
    const record = state.pendingResume;
    clearLocalDraft();
    state.pendingResume = null;
    state.resumeToken = "";
    state.submissionId = "";
    hideResumeDialog();

    state.currentPage = 0;
    state.locked = false;
    state.finalResult = null;
    state.answers = createInitialAnswers();
    state.saveState = { status: "idle", message: "" };
    state.draftSaveState = { status: "idle", message: "", lastSavedAt: "" };
    renderPage();

    if (record && isUuid(record.resumeToken)) {
      void callSupabaseRpc(SUPABASE_DISCARD_DRAFT_RPC, {
        p_resume_token: record.resumeToken,
      }).catch(function () {
        return null;
      });
    }
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

  function findCommitmentOption(options, value) {
    const text = cleanText(value, 80);
    return (
      options.find(function (option) {
        return option.value === text || option.label === text;
      }) || null
    );
  }

  function getMonthlyHourOptionForNumber(value) {
    if (value <= 0) return monthlyHourDropdownOptions[0];
    if (value < 15) return monthlyHourDropdownOptions[1];
    if (value <= 30) return monthlyHourDropdownOptions[2];
    if (value <= 90) return monthlyHourDropdownOptions[3];
    return monthlyHourDropdownOptions[4];
  }

  function getMonthlyCostOptionForNumber(value) {
    if (value <= 0) return monthlyCostDropdownOptions[0];
    if (value < 100) return monthlyCostDropdownOptions[1];
    if (value <= 299) return monthlyCostDropdownOptions[2];
    if (value <= 599) return monthlyCostDropdownOptions[3];
    return monthlyCostDropdownOptions[4];
  }

  function getCommitmentSelectValue(field, value) {
    const options =
      field.type === "cost"
        ? monthlyCostDropdownOptions
        : monthlyHourDropdownOptions;
    const directOption = findCommitmentOption(options, value);

    if (directOption) {
      return directOption.value;
    }

    const numericValue = parseNumberValue(value);
    if (numericValue == null) {
      return "0";
    }

    return field.type === "cost"
      ? getMonthlyCostOptionForNumber(numericValue).value
      : getMonthlyHourOptionForNumber(numericValue).value;
  }

  function getMonthlyHourNumber(value) {
    const option = findCommitmentOption(monthlyHourDropdownOptions, value);
    if (option) {
      return option.numericValue;
    }

    return parseNumberValue(value);
  }

  function getMonthlyCostNumber(value) {
    const option = findCommitmentOption(monthlyCostDropdownOptions, value);
    if (option) {
      return option.numericValue;
    }

    return parseNumberValue(value);
  }

  function getMonthlyHourDisplay(value) {
    const option = findCommitmentOption(monthlyHourDropdownOptions, value);
    if (option) {
      return option.value === "0" ? "0 hrs/month" : option.label;
    }

    const numericValue = parseNumberValue(value);
    if (numericValue == null) {
      return "";
    }

    return formatMonthlyHours(numericValue);
  }

  function getMonthlyCostDisplay(value) {
    const option = findCommitmentOption(monthlyCostDropdownOptions, value);
    if (option) {
      return option.value === "0" ? "MYR 0/mo" : option.label;
    }

    const numericValue = parseNumberValue(value);
    if (numericValue == null) {
      return "";
    }

    return "MYR " + formatSimpleNumber(numericValue) + "/mo";
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

  function isMeaningfulSelection(value) {
    const text = cleanText(value, 120);
    return Boolean(text) && text !== "None";
  }

  function hasMeaningfulSelection(values) {
    return Array.isArray(values) && values.some(function (value) {
      return isMeaningfulSelection(value);
    });
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
    if (draftSaveStatus) {
      draftSaveStatus.dataset.state = state.draftSaveState.status;
      draftSaveStatus.textContent = state.draftSaveState.message || "";
    }

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
    nextBtn.disabled = state.draftSaveState.status === "saving";

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
    const totalHours = getMonthlyHourNumber(answers.aiHoursTotalMonthly);
    const workHours = getMonthlyHourNumber(answers.aiWorkHoursMonthly);
    const learnHours = getMonthlyHourNumber(answers.aiLearnHoursMonthly);

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
    const totalHours = getMonthlyHourNumber(answers.aiHoursTotalMonthly);
    const workHours = getMonthlyHourNumber(answers.aiWorkHoursMonthly);
    const learnHours = getMonthlyHourNumber(answers.aiLearnHoursMonthly);
    const totalHoursDisplay = getMonthlyHourDisplay(answers.aiHoursTotalMonthly);
    const workHoursDisplay = getMonthlyHourDisplay(answers.aiWorkHoursMonthly);
    const learnHoursDisplay = getMonthlyHourDisplay(answers.aiLearnHoursMonthly);
    const weeklyHours = getWeeklyHours(answers);
    const parts = [];

    if (totalHours != null) {
      parts.push("total " + (totalHoursDisplay || formatMonthlyHours(totalHours)));
    }

    if (workHours != null) {
      parts.push("work " + (workHoursDisplay || formatMonthlyHours(workHours)));
    }

    if (learnHours != null) {
      parts.push("learn " + (learnHoursDisplay || formatMonthlyHours(learnHours)));
    }

    if (weeklyHours != null) {
      parts.push("~" + formatWeeklyHours(weeklyHours));
    }

    return parts.join(", ");
  }

  function summarizeMonthlyCost(answers) {
    const totalCost = getMonthlyCostNumber(answers.aiCostTotalMonthly);
    const workCost = getMonthlyCostNumber(answers.aiCostWorkMonthly);
    const learnCost = getMonthlyCostNumber(answers.aiCostLearnMonthly);
    const totalCostDisplay = getMonthlyCostDisplay(answers.aiCostTotalMonthly);
    const workCostDisplay = getMonthlyCostDisplay(answers.aiCostWorkMonthly);
    const learnCostDisplay = getMonthlyCostDisplay(answers.aiCostLearnMonthly);
    const parts = [];

    if (totalCost != null) {
      parts.push("total " + (totalCostDisplay || formatSimpleNumber(totalCost) + "/mo"));
    }

    if (workCost != null) {
      parts.push("work " + (workCostDisplay || formatSimpleNumber(workCost) + "/mo"));
    }

    if (learnCost != null) {
      parts.push("learn " + (learnCostDisplay || formatSimpleNumber(learnCost) + "/mo"));
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
    if (Array.isArray(values) && values.length === knowledgeSkillFields.length) {
      return values
        .map(function (value, index) {
          return {
            label: knowledgeSkillFields[index].label,
            value: isKnowledgeSkillStatusValue(value)
              ? value
              : knowledgeSkillStatusDefaultOption.value,
          };
        })
        .filter(function (entry) {
          return knowledgeSkillStatusValueOrder[entry.value] > 0;
        })
        .map(function (entry) {
          return entry.label;
        });
    }

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

  function isKnowledgeSkillStatusValue(value) {
    return Object.prototype.hasOwnProperty.call(
      knowledgeSkillStatusValueOrder,
      value
    );
  }

  function getKnowledgeSkillEntries(answers) {
    return knowledgeSkillFields.map(function (field, index) {
      const value =
        Array.isArray(answers.tools) && isKnowledgeSkillStatusValue(answers.tools[index])
          ? answers.tools[index]
          : knowledgeSkillStatusDefaultOption.value;

      return {
        key: field.name,
        label: field.label,
        value: value,
        sectionKey: field.sectionKey,
      };
    });
  }

  function getActiveKnowledgeSkillEntries(answers) {
    return getKnowledgeSkillEntries(answers).filter(function (entry) {
      return knowledgeSkillStatusValueOrder[entry.value] > 0;
    });
  }

  function getPrimaryKnowledgeSkillEntry(answers) {
    const entries = getActiveKnowledgeSkillEntries(answers);

    if (!entries.length) {
      return null;
    }

    return entries.reduce(function (best, entry) {
      if (!best) {
        return entry;
      }

      if (
        knowledgeSkillStatusValueOrder[entry.value] >
        knowledgeSkillStatusValueOrder[best.value]
      ) {
        return entry;
      }

      return best;
    }, null);
  }

  function getKnowledgeSkillStatusLabel(value) {
    if (value === knowledgeSkillStatusDefaultOption.value) {
      return knowledgeSkillStatusDefaultOption.label;
    }

    const option = knowledgeSkillStatusOptions.find(function (item) {
      return item.value === value;
    });

    return option ? option.label : "";
  }

  function summarizeKnowledgeSkills(answers, limit) {
    const maxItems = typeof limit === "number" ? limit : 4;
    const entries = getActiveKnowledgeSkillEntries(answers);

    if (!entries.length) {
      return "No interest across all knowledge/skills";
    }

    const summary = entries
      .slice(0, maxItems)
      .map(function (entry) {
        return entry.label + " - " + getKnowledgeSkillStatusLabel(entry.value);
      })
      .join(", ");

    if (entries.length > maxItems) {
      return summary + ", and more";
    }

    return summary;
  }

  function summarizeSelections(selected, otherText, fallback) {
    const values = Array.isArray(selected) ? selected.slice() : [];
    const other = cleanText(otherText, 120);
    if (other) values.push(other);
    const joined = values.filter(function (value) {
      return isMeaningfulSelection(value);
    }).join(", ");
    return joined || fallback;
  }

  function getTrainingStatusLabel(value) {
    if (value === trainingStatusDefaultOption.value) {
      return trainingStatusDefaultOption.label;
    }

    const option = trainingStatusOptions.find(function (item) {
      return item.value === value;
    });

    return option ? option.label : "";
  }

  function summarizeTrainingTopics(answers, limit) {
    const maxItems = typeof limit === "number" ? limit : 4;
    const selections = trainingTopicFields
      .map(function (field, index) {
        const value =
          Array.isArray(answers.trainingTopics) && answers.trainingTopics[index]
            ? answers.trainingTopics[index]
            : trainingStatusDefaultOption.value;

        return {
          label: field.label,
          value: value,
        };
      })
      .filter(function (entry) {
        return entry.value !== trainingStatusDefaultOption.value;
      });

    if (!selections.length) {
      return "No interest across all topics";
    }

    const summary = selections
      .slice(0, maxItems)
      .map(function (entry) {
        return entry.label + " - " + getTrainingStatusLabel(entry.value);
      })
      .join(", ");

    if (selections.length > maxItems) {
      return summary + ", and more";
    }

    return summary;
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
    const skills = normalizeTools(answers.tools, answers.toolsOther);
    const toolBreadth = getAssessmentRating(answers, "toolBreadth");
    const promptQuality = getAssessmentRating(answers, "promptQuality");
    const verificationJudgment = getAssessmentRating(answers, "verificationJudgment");
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
    const totalWeight = factorScores.reduce(function (sum, factor) {
      return sum + factor.weight;
    }, 0);
    const weightedScore = factorScores.reduce(function (sum, factor) {
      return sum + factor.score;
    }, 0);
    const normalizedScore =
      totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;

    const fluencyScore = clamp(
      normalizedScore,
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
      automationBuilding: automationBuilding,
      timeCostCommitment: timeCostCommitment,
      factorScores: factorScores,
      tools: skills,
      toolCount: skills.length,
    };
  }

  function getCompletionSections(answers) {
    const profileComplete =
      isFilled(answers.name) &&
      isValidEmail(answers.email) &&
      isFilled(answers.roleBackground);
    const wantsComplete =
      isMeaningfulSelection(answers.wants[0]) || isFilled(answers.wantsOther);
    const painComplete =
      isMeaningfulSelection(answers.pain[0]) || isFilled(answers.painOther);
    const toolUsageComplete = toolUsageSections.every(function (section) {
      return section.items.every(function (item) {
        return isFilled(answers[item.name]);
      });
    });
    const toolsComplete =
      Array.isArray(answers.tools) &&
      answers.tools.length === knowledgeSkillFields.length &&
      answers.tools.every(function (value) {
        return isKnowledgeSkillStatusValue(value);
      });
    const goalComplete =
      isMeaningfulSelection(answers.goal) || isFilled(answers.goalOtherSector);
    const assessmentComplete = assessmentQuestions.map(function (factor) {
      return isFilled(answers[factor.key]);
    });
    const hoursComplete = weeklyTimeFields.every(function (field) {
      return isFilled(answers[field.name]);
    });
    const trainingComplete =
      Array.isArray(answers.trainingTopics) &&
      answers.trainingTopics.length === trainingTopicFields.length &&
      answers.trainingTopics.every(function (value) {
        return isFilled(value);
      });

    return [
      profileComplete,
      wantsComplete,
      painComplete,
      goalComplete,
      trainingComplete,
      toolUsageComplete,
      toolsComplete,
    ].concat(assessmentComplete, [hoursComplete]);
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
      if (
        !isMeaningfulSelection(answers.wants[0]) &&
        !isFilled(answers.wantsOther)
      ) {
        missing.push("objective");
        focusSelectors.push('[name="wantsPrimary"]');
      }
      if (
        !isMeaningfulSelection(answers.pain[0]) &&
        !isFilled(answers.painOther)
      ) {
        missing.push("pain");
        focusSelectors.push('[name="painPrimary"]');
      }
    }

    if (pageIndex === 2) {
      if (!isMeaningfulSelection(answers.goal) && !isFilled(answers.goalOtherSector)) {
        missing.push("goal");
        focusSelectors.push('[name="goal"]');
      }
    }

    if (pageIndex === 3) {
      const firstMissingTraining = trainingTopicFields.find(function (field, index) {
        return !isFilled(
          Array.isArray(answers.trainingTopics) ? answers.trainingTopics[index] : ""
        );
      });

      if (firstMissingTraining) {
        missing.push("training");
        focusSelectors.push('[name="' + firstMissingTraining.name + '"]');
      }
    }

    if (pageIndex === 4) {
      toolUsageSections.forEach(function (section) {
        const sectionMissing = section.items.some(function (item) {
          return !isFilled(answers[item.name]);
        });

        if (sectionMissing) {
          missing.push(section.key);
          const firstMissingItem = section.items.find(function (item) {
            return !isFilled(answers[item.name]);
          });
          if (firstMissingItem) {
            focusSelectors.push('[name="' + firstMissingItem.name + '"]');
          }
        }
      });
    }

    if (pageIndex === 5) {
      const firstMissingSkill = knowledgeSkillFields.find(function (field, index) {
        return !isKnowledgeSkillStatusValue(
          Array.isArray(answers.tools) ? answers.tools[index] : ""
        );
      });

      if (firstMissingSkill) {
        missing.push("tools");
        focusSelectors.push('[name="' + firstMissingSkill.name + '"]');
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
      weeklyTimeFields.forEach(function (field) {
        if (!isFilled(answers[field.name])) {
          missing.push("hours");
          focusSelectors.push('[name="' + field.name + '"]');
        }
      });
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
    const selectedSkills = normalizeTools(answers.tools, answers.toolsOther);
    const plan = [];
    const primarySkill = getPrimaryKnowledgeSkillEntry(answers);
    const activeToolUsage = getToolUsageEntries(answers).filter(function (entry) {
      return toolUsageValueOrder[entry.value] > 0;
    });
    const roleContext = cleanText(answers.roleBackground, 80);

    if (primarySkill) {
      plan.push({
        label: "Primary skill anchor",
        value:
          primarySkill.label +
          " is your strongest anchor at " +
          getKnowledgeSkillStatusLabel(primarySkill.value) +
          ". Keep one repeatable workflow there first.",
      });
    } else {
      plan.push({
        label: "Primary skill anchor",
        value:
          "Start with one general skill area and keep the workflow intentionally simple.",
      });
    }

    if (!selectedSkills.length) {
      plan.push({
        label: "Current skill stack",
        value:
          "You are effectively starting from a blank slate. Keep the first workflow narrow.",
      });
    } else if (selectedSkills.length === 1) {
      plan.push({
        label: "Current skill stack",
        value:
          "You already have one active skill: " +
          selectedSkills[0] +
          " at " +
          getKnowledgeSkillStatusLabel(primarySkill ? primarySkill.value : knowledgeSkillStatusDefaultOption.value) +
          ". Build one repeatable use case around it first.",
      });
    } else {
      plan.push({
        label: "Current skill stack",
        value:
          "You already use " +
          summarizeKnowledgeSkills(answers, 4) +
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
    const selectedSkills = normalizeTools(answers.tools, answers.toolsOther);
    const primarySkill = getPrimaryKnowledgeSkillEntry(answers);
    const cards = [];

    for (let index = 0; index < weeks; index += 1) {
      const phase = template[index] || template[template.length - 1];
      const week = index + 1;
      const focusParts = [phase.focus];

      if (lens) {
        focusParts.push(lens);
      }

      if (selectedSkills.length) {
        focusParts.push(
          "Compare outcomes across " +
            selectedSkills.slice(0, 2).join(" and ") +
            " when relevant."
        );
      }

      if (primarySkill) {
        focusParts.push(
          "Anchor the workflow in " +
            primarySkill.label +
            " at " +
            getKnowledgeSkillStatusLabel(primarySkill.value) +
            "."
        );
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
    const monthlyHoursDisplay = getMonthlyHourDisplay(answers.aiHoursTotalMonthly);
    const weeklyHours = getWeeklyHours(answers);
    const durationWeeks =
      weeklyHours != null && bandKey ? getDurationWeeks(bandKey, weeklyHours) : null;
    const durationText = durationWeeks
      ? durationWeeks +
        " weeks at " +
        formatWeeklyHours(weeklyHours) +
        (monthlyHours != null
          ? " (" + (monthlyHoursDisplay || formatMonthlyHours(monthlyHours)) + ")"
          : "")
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
    const submittedAt =
      typeof Date !== "undefined" ? new Date().toISOString() : "";
    const submissionSnapshot = {
      answers: answers,
      roadmap: roadmap,
      submitted_at: submittedAt,
      app_version: SUPABASE_APP_VERSION,
    };

    return {
      name: cleanText(answers.name, 80),
      email: cleanText(answers.email, 120),
      phone: null,
      consent_given: true,
      answers: submissionSnapshot,
      fluency_score: roadmap.levelSignal.fluencyScore,
      fluency_level: roadmap.levelSignal.level,
      band_key: roadmap.bandKey || "beginner",
      track_key: roadmap.track ? roadmap.track.key : "",
      paid: hasPremiumToolUsage(answers),
      page_timestamps: {
        submitted_at: submittedAt,
        completed_pages: RESULT_PAGE_INDEX + 1,
      },
      app_version: SUPABASE_APP_VERSION,
      submitted_at: submittedAt,
    };
  }

  function buildAssessmentExportPayload() {
    if (!state.locked) {
      syncAnswersFromCurrentPage();
    }

    const answersSnapshot = JSON.parse(JSON.stringify(state.answers));
    answersSnapshot.toolUsage = toolUsageSections.map(function (section, sectionIndex) {
      return {
        section: String(sectionIndex + 1).padStart(2, "0"),
        key: section.key,
        title: section.title,
        note: section.note,
        items: section.items.map(function (item, itemIndex) {
          const answerValue = answersSnapshot[item.name] || "not-yet-try";
          return {
            index: String(itemIndex + 1).padStart(2, "0"),
            name: item.name,
            question: item.label,
            answer: answerValue,
            suggested_answer:
              getToolUsageValueLabel(answerValue) || answerValue,
            dropdownlist: toolUsageOptions.map(function (option) {
              return {
                value: option.value,
                label: option.label,
              };
            }),
          };
        }),
      };
    });
    answersSnapshot.trainingTopics = trainingTopicSections.map(function (section, sectionIndex) {
      return {
        section: String(sectionIndex + 1).padStart(2, "0"),
        key: section.key,
        title: section.title,
        note: section.note,
        items: section.items.map(function (item, itemIndex) {
          const fieldIndex = trainingTopicFields.findIndex(function (field) {
            return field.name === item.name;
          });
          const answerValue =
            fieldIndex >= 0 &&
            Array.isArray(state.answers.trainingTopics) &&
            isFilled(state.answers.trainingTopics[fieldIndex])
              ? state.answers.trainingTopics[fieldIndex]
              : trainingStatusDefaultOption.value;
          return {
            index: String(itemIndex + 1).padStart(2, "0"),
            name: item.name,
            question: item.label,
            answer: answerValue,
            suggested_answer: getTrainingStatusLabel(answerValue) || answerValue,
            dropdownlist: [
              trainingStatusDefaultOption,
            ].concat(trainingStatusOptions).map(function (option) {
              return {
                value: option.value,
                label: option.label,
              };
            }),
          };
        }),
      };
    });
    const roadmapSnapshot = JSON.parse(
      JSON.stringify(state.finalResult || computeRoadmap(answersSnapshot))
    );
    const questionSnapshot = pageMeta.map(function (meta, index) {
      const entry = {
        page: String(index + 1).padStart(2, "0"),
        title: meta.title,
        subtitle: meta.subtitle,
        copy: meta.copy,
      };

      if (index === 7) {
        entry.fields = weeklyTimeFields.map(function (field) {
          const options =
            field.type === "cost"
              ? monthlyCostDropdownOptions
              : monthlyHourDropdownOptions;
          const currentValue = getFieldValue(field.name);
          const suggestedOption = findCommitmentOption(options, currentValue);
          return {
            name: field.name,
            label: field.label,
            question: field.label,
            suggested_answer: suggestedOption
              ? suggestedOption.label
              : getCommitmentSelectValue(field, currentValue),
            type: field.type,
          };
        });
      }

      return entry;
    });

    return {
      submission_id: isUuid(state.submissionId) ? state.submissionId : "",
      resume_token: isUuid(state.resumeToken) ? state.resumeToken : "",
      export_type: state.locked ? "final" : "draft",
      exported_at: new Date().toISOString(),
      app_version: SUPABASE_APP_VERSION,
      sync_status: state.saveState.status,
      questions: questionSnapshot,
      answers: answersSnapshot,
      roadmap: roadmapSnapshot,
    };
  }

  function getAssessmentExportFilename(payload) {
    const exportedDate = cleanText(payload.exported_at, 24).slice(0, 10);
    const personSlug = slugify(state.answers.name || "assessment");
    const idSlug = payload.submission_id
      ? payload.submission_id.slice(0, 8)
      : payload.export_type;

    return (
      "ai-fluency-assessment-" +
      personSlug +
      "-" +
      (exportedDate || "export") +
      "-" +
      idSlug +
      ".json"
    );
  }

  function downloadAssessmentJson() {
    const payload = buildAssessmentExportPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = objectUrl;
    link.download = getAssessmentExportFilename(payload);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(objectUrl);
    }, 0);
  }

  async function submitAssessmentToSupabase(answers, roadmap) {
    const submissionId = isUuid(state.submissionId)
      ? state.submissionId
      : createUuid();
    const resumeToken = ensureResumeToken();
    state.submissionId = submissionId;
    const payload = buildSupabasePayload(answers, roadmap);

    await callSupabaseRpc(SUPABASE_SUBMIT_RPC, {
      p_submission_id: submissionId,
      p_resume_token: resumeToken,
      p_payload: payload,
    });

    return submissionId;
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
      clearLocalDraft();
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

  function getToolUsageEntries(answers) {
    const entries = [];

    toolUsageSections.forEach(function (section) {
      section.items.forEach(function (item) {
        const value = answers[item.name];
        entries.push({
          key: item.name,
          label: item.label,
          value: value || "",
          sectionKey: section.key,
        });
      });
    });

    return entries;
  }

  function getToolUsageValueLabel(value) {
    if (value === "0") {
      return "not yet try";
    }

    const option = toolUsageOptions.find(function (item) {
      return item.value === value;
    });

    if (!option) {
      return "";
    }

    return option.label.replace(/^[A-E]\)\s*/, "");
  }

  function getToolUsageSummary(answers, limit) {
    const maxItems = typeof limit === "number" ? limit : 4;
    const entries = getToolUsageEntries(answers).filter(function (entry) {
      return entry.value && entry.value !== "0" && entry.value !== "not-yet-try";
    });

    if (!entries.length) {
      return "";
    }

    const summary = entries
      .slice(0, maxItems)
      .map(function (entry) {
        return entry.label + " - " + getToolUsageValueLabel(entry.value);
      })
      .join(", ");

    if (entries.length > maxItems) {
      return summary + ", and more";
    }

    return summary;
  }

  function getToolUsageCounts(answers) {
    const counts = {
      "not-yet-try": 0,
      "just-trying-only": 0,
      "basic-free": 0,
      "paid-version": 0,
      "advance-features": 0,
    };

    getToolUsageEntries(answers).forEach(function (entry) {
      if (Object.prototype.hasOwnProperty.call(counts, entry.value)) {
        counts[entry.value] += 1;
      } else {
        counts["not-yet-try"] += 1;
      }
    });

    return counts;
  }

  function getToolUsageCountSummary(answers) {
    const counts = getToolUsageCounts(answers);
    const parts = [
      counts["not-yet-try"] + " not yet try",
      counts["just-trying-only"] + " just trying only",
      counts["basic-free"] + " basic/free",
      counts["paid-version"] + " paid",
      counts["advance-features"] + " advanced",
    ];

    return parts.join(", ");
  }

  function hasPremiumToolUsage(answers) {
    return getToolUsageEntries(answers).some(function (entry) {
      return (
        entry.value === "paid-version" || entry.value === "advance-features"
      );
    });
  }

  function getPrimaryToolUsageEntry(answers) {
    const entries = getToolUsageEntries(answers).filter(function (entry) {
      return toolUsageValueOrder[entry.value] > 0;
    });

    if (!entries.length) {
      return null;
    }

    return entries.reduce(function (best, entry) {
      if (!best) {
        return entry;
      }

      if (
        toolUsageValueOrder[entry.value] > toolUsageValueOrder[best.value]
      ) {
        return entry;
      }

      return best;
    }, null);
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

  function renderSelectField(name, label, value, options, placeholder, defaultOption) {
    const optionMarkup = [];

    if (defaultOption) {
      optionMarkup.push(
        '<option value="' +
          escapeAttr(defaultOption.value) +
          '"' +
          (value === defaultOption.value ? " selected" : "") +
          ">" +
          escapeHtml(defaultOption.label) +
          "</option>"
      );
    } else if (placeholder) {
      optionMarkup.push(
        '<option value="">' + escapeHtml(placeholder) + "</option>"
      );
    }

    optionMarkup.push(
      options
        .map(function (option) {
          const selected = value === option.value ? " selected" : "";
          return (
            '<option value="' +
            escapeAttr(option.value) +
            '"' +
            selected +
            ">" +
            escapeHtml(option.label) +
            "</option>"
          );
        })
        .join("")
    );

    return (
      '<label class="select-field">' +
      "<span>" +
      escapeHtml(label) +
      "</span>" +
      '<select name="' +
      escapeAttr(name) +
      '">' +
      optionMarkup +
      "</select>" +
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
      "<p>We capture your contact details, objective, pain points, knowledge/skills, monthly time and cost, goal, weighted assessment, and training history.</p>" +
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
      '<p class="section-note">Pick a primary objective first, then optional secondary and third objectives. Leave any unused slot on None.</p>' +
      '<div class="field-grid">' +
      renderSelectField(
        "wantsPrimary",
        "Primary Objective",
        answers.wants[0],
        objectiveDropdownOptions
      ) +
      renderSelectField(
        "wantsSecondary",
        "Secondary Objective",
        answers.wants[1],
        objectiveDropdownOptions
      ) +
      renderSelectField(
        "wantsThird",
        "Third Objective",
        answers.wants[2],
        objectiveDropdownOptions
      ) +
      "</div>" +
      renderTextareaField(
        "wantsOther",
        "Other objective",
        answers.wantsOther,
        "Describe any additional outcome you want to achieve."
      );

    const painCard =
      '<p class="section-note">Pick a primary pain point first, then optional secondary and third pain points. Leave any unused slot on None.</p>' +
      '<div class="field-grid">' +
      renderSelectField(
        "painPrimary",
        "Primary Pain Point",
        answers.pain[0],
        painDropdownOptions
      ) +
      renderSelectField(
        "painSecondary",
        "Secondary Pain Point",
        answers.pain[1],
        painDropdownOptions
      ) +
      renderSelectField(
        "painThird",
        "Third Pain Point",
        answers.pain[2],
        painDropdownOptions
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
        "Select your primary, secondary, and third objective, then add any additional objective below.",
        objectiveCard
      ) +
      renderQuestionCard(
        "pain",
        "02C",
        "What is currently slowing your AI learning?",
        "Select your primary, secondary, and third pain points and add any notes in the free-text field.",
        painCard
      ) +
      "</div>"
    );
  }

  function renderToolUsagePage(answers) {
    const legend =
      '<div class="feature-grid">' +
      toolUsageOptions
        .map(function (option) {
          return (
            '<article class="feature-card">' +
            '<p class="kicker">' +
            escapeHtml(option.label.slice(0, 1)) +
            "</p>" +
            "<h4>" +
            escapeHtml(option.label.slice(3)) +
            "</h4>" +
            "</article>"
          );
        })
        .join("") +
      "</div>";

    const sections = toolUsageSections
      .map(function (section, index) {
        const fields = section.items
          .map(function (item) {
            return renderSelectField(
              item.name,
              item.label,
              answers[item.name] || "not-yet-try",
              toolUsageOptions
            );
          })
          .join("");

        return renderQuestionCard(
          section.key,
          "03" + String.fromCharCode(65 + index),
          section.title,
          section.note,
          '<div class="field-grid">' + fields + "</div>"
        );
      })
      .join("");

    return (
      '<div class="page-stack">' +
      renderQuestionCard(
        "tool-usage-intro",
        "03",
        "Which tools you used",
        "Each tool select one option.",
        '<p class="section-note">Use the same scale for every tool so the roadmap can read your current tool depth consistently.</p>' +
          legend
      ) +
      sections +
      "</div>"
    );
  }

  function renderToolsPage(answers) {
    const legend =
      '<div class="feature-grid">' +
      [knowledgeSkillStatusDefaultOption].concat(knowledgeSkillStatusOptions)
        .map(function (option) {
          return (
            '<article class="feature-card">' +
            '<p class="kicker">' +
            escapeHtml(option.label.slice(0, 1).toUpperCase()) +
            "</p>" +
            "<h4>" +
            escapeHtml(option.label) +
            "</h4>" +
            "</article>"
          );
        })
        .join("") +
      "</div>";

    let skillIndex = 0;
    const sections = knowledgeSkillSections
      .map(function (section, index) {
        const fields = section.items
          .map(function (item) {
            const value =
              Array.isArray(answers.tools) &&
              isKnowledgeSkillStatusValue(answers.tools[skillIndex])
                ? answers.tools[skillIndex]
                : knowledgeSkillStatusDefaultOption.value;
            skillIndex += 1;
            return renderSelectField(
              item.name,
              item.label,
              value,
              knowledgeSkillStatusOptions,
              null,
              knowledgeSkillStatusDefaultOption
            );
          })
          .join("");

        return renderQuestionCard(
          section.key,
          "04" + String.fromCharCode(65 + index),
          section.title,
          section.note,
          '<div class="field-grid">' + fields + "</div>"
        );
      })
      .join("");

    return (
      '<div class="page-stack">' +
      renderQuestionCard(
        "skills-intro",
        "04",
        "Which AI knowledge/skill do you currently use?",
        "Select the current level for each skill area.",
        '<p class="section-note">Default is no interest. Use the dropdown for each skill to show your current level.</p>' +
          legend
      ) +
      sections +
      "</div>"
    );
  }

  function renderHoursPage(answers) {
    const summaryFields = weeklyTimeFields
      .slice(0, 2)
      .map(function (field) {
        return renderSelectField(
          field.name,
          field.label,
          getCommitmentSelectValue(field, answers[field.name]),
          field.type === "cost"
            ? monthlyCostDropdownOptions
            : monthlyHourDropdownOptions
        );
      })
      .join("");

    const breakdownFields = weeklyTimeFields
      .slice(2)
      .map(function (field) {
        return renderSelectField(
          field.name,
          field.label,
          getCommitmentSelectValue(field, answers[field.name]),
          field.type === "cost"
            ? monthlyCostDropdownOptions
            : monthlyHourDropdownOptions
        );
      })
      .join("");

    return renderQuestionCard(
      "hours",
      "08",
      "How much monthly time and budget can you commit?",
      "These numbers set the pace and capture the cost side of your AI learning.",
      '<p class="section-note">Choose monthly ranges. Total hours and total cost go first, then the work and learning split.</p>' +
        '<div class="field-grid">' +
        summaryFields +
        "</div>" +
        '<p class="section-note">Now break the monthly numbers into work and learning.</p>' +
        '<div class="field-grid">' +
        breakdownFields +
        "</div>" +
        '<div class="actions">' +
        '<button type="button" class="secondary-btn" data-action="download-json">Download assessment JSON</button>' +
        "</div>"
    );
  }

  function renderGoalPage(answers) {
    const goalCard =
      '<p class="section-note">Pick a primary goal first, then optional secondary and third goals. Leave any unused slot on None.</p>' +
      '<div class="field-grid">' +
      renderSelectField(
        "goal",
        "Primary Goal",
        answers.goal,
        goalDropdownOptions
      ) +
      renderSelectField(
        "goalSecondary",
        "Secondary Goal",
        answers.goalSecondary,
        goalDropdownOptions
      ) +
      renderSelectField(
        "goalThird",
        "Third Goal",
        answers.goalThird,
        goalDropdownOptions
      ) +
      "</div>" +
      renderTextField(
        "goalOtherSector",
        "Other Sector",
        answers.goalOtherSector,
        "Describe another sector or context"
      );

    return renderQuestionCard(
      "goal",
      "06",
      "What is your main goal for learning AI?",
      "Choose a primary goal first, then optional secondary and third goals. The primary goal drives the track name and examples in the roadmap.",
      goalCard
    );
  }

  function renderAssessmentPage(answers) {
    return (
      '<div class="page-stack">' +
      '<p class="section-note">Rate each factor on the same 1-5 scale: Not Yet, Early, Functional, Strong, and Highly mature.</p>' +
      assessmentQuestions
        .map(function (factor, index) {
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
              '<div class="field-grid">' +
              renderSelectField(
                factor.key,
                "Rating",
                answers[factor.key] || "1",
                assessmentScaleOptions
              ) +
              "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderTrainingPage(answers) {
    const legend =
      '<div class="feature-grid">' +
      [trainingStatusDefaultOption].concat(trainingStatusOptions)
        .map(function (option) {
          return (
            '<article class="feature-card">' +
            '<p class="kicker">' +
            escapeHtml(option.label.slice(0, 1).toUpperCase()) +
            "</p>" +
            "<h4>" +
            escapeHtml(option.label) +
            "</h4>" +
            "</article>"
          );
        })
        .join("") +
      "</div>";

    let topicIndex = 0;
    const sections = trainingTopicSections
      .map(function (section, index) {
        const fields = section.items
          .map(function (item) {
            const value =
              Array.isArray(answers.trainingTopics) &&
              isFilled(answers.trainingTopics[topicIndex])
                ? answers.trainingTopics[topicIndex]
                : trainingStatusDefaultOption.value;
            topicIndex += 1;
            return renderSelectField(
              item.name,
              item.label,
              value,
              trainingStatusOptions,
              null,
              trainingStatusDefaultOption
            );
          })
          .join("");

        return renderQuestionCard(
          section.key,
          "08" + String.fromCharCode(65 + index),
          section.title,
          section.note,
          '<div class="field-grid">' + fields + "</div>"
        );
      })
      .join("");

    return (
      '<div class="page-stack">' +
      renderQuestionCard(
        "training-intro",
        "08",
        "Training Topics",
        "Choose a status for each topic area.",
        '<p class="section-note">Default is no interest. Use the dropdown next to each topic.</p>' +
          legend
      ) +
      sections +
      "</div>"
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
    const goalSummary = summarizeSelections(
      [answers.goal, answers.goalSecondary, answers.goalThird],
      answers.goalOtherSector,
      "Not provided"
    );
    const selectedSkills = roadmap.tools;
    const toolUsageSummary = getToolUsageSummary(answers, 4) || "not yet try";
    const monthlyTimeSummary = summarizeMonthlyTime(answers);
    const monthlyCostSummary = summarizeMonthlyCost(answers);
    const trainingTopicsSummary = summarizeTrainingTopics(answers, 4);
    const syncMessage = getSupabaseSyncMessage();
    const syncButtonLabel = getSupabaseSyncButtonLabel();
    const syncBadgeText =
      state.saveState.status === "saved"
        ? "Saved to Supabase"
        : state.saveState.status === "saving"
        ? "Syncing to Supabase"
        : "Supabase sync ready";
    const resultSummary =
      "Prepared for " +
      displayName +
      ". Your assessment points to " +
      (roadmap.track ? roadmap.track.label : "a tailored track") +
      " at " +
      getPacingArticle(roadmap.pacing) +
      " " +
      roadmap.pacing +
      ", grounded in your available time, budget, and current skills.";

    const factorRows = roadmap.levelSignal.factorScores
      .map(function (factor) {
        const ratingOption = assessmentScaleOptions.find(function (option) {
          return Number(option.value) === factor.rating;
        });
        const ratingLabel = ratingOption ? ratingOption.label : factor.rating + "/5";
        const ratingPercent = factor.rating * 20;

        return (
          '<article class="result-factor">' +
          '<div class="result-factor__head">' +
          "<h4>" +
          escapeHtml(factor.label) +
          "</h4>" +
          '<span class="result-factor__weight">' +
          factor.weight +
          "% weight</span>" +
          "</div>" +
          '<div class="result-factor__bar" role="progressbar" aria-label="' +
          escapeHtml(factor.label) +
          '" aria-valuemin="1" aria-valuemax="5" aria-valuenow="' +
          factor.rating +
          '"><span style="--factor-progress: ' +
          ratingPercent +
          '%"></span></div>' +
          '<div class="result-factor__rating"><strong>' +
          escapeHtml(ratingLabel) +
          "</strong><span>" +
          factor.rating +
          " / 5</span></div>" +
          "</article>"
        );
      })
      .join("");

    const contextItems = [
      { label: "Role / background", value: roleSummary },
      { label: "Goal focus", value: goalSummary },
      {
        label: "Knowledge / skills",
        value: selectedSkills.length
          ? summarizeKnowledgeSkills(answers, 4)
          : "No active skills selected yet",
      },
      { label: "Tool usage", value: toolUsageSummary },
      { label: "Monthly time", value: monthlyTimeSummary || "Not provided" },
      { label: "Monthly budget", value: monthlyCostSummary || "Not provided" },
      { label: "Training signal", value: trainingTopicsSummary },
      {
        label: "Learning outcome",
        value: wantsSummary + ". Friction: " + painSummary + ".",
      },
    ];
    const contextGrid = contextItems
      .map(function (item) {
        return (
          "<div><dt>" +
          escapeHtml(item.label) +
          "</dt><dd>" +
          escapeHtml(item.value) +
          "</dd></div>"
        );
      })
      .join("");

    const signalSection =
      '<section class="result-report-section result-signals">' +
      '<header class="result-section-head">' +
      '<span class="result-section-index">01</span>' +
      "<div><p>Assessment signals</p><h3>What is shaping your score</h3>" +
      "<span>Your five weighted factors, followed by the context used to tailor the roadmap.</span></div>" +
      "</header>" +
      '<div class="result-factor-grid">' +
      factorRows +
      "</div>" +
      '<dl class="result-context-grid">' +
      contextGrid +
      "</dl>" +
      "</section>";

    const recommendationCards = roadmap.toolPlan
      .map(function (item, index) {
        return (
          '<article class="result-recommendation">' +
          '<span class="result-recommendation__number">' +
          String(index + 1).padStart(2, "0") +
          "</span><div><h4>" +
          escapeHtml(item.label) +
          "</h4><p>" +
          escapeHtml(item.value) +
          "</p></div></article>"
        );
      })
      .join("");
    const toolSection =
      '<section class="result-report-section result-tools">' +
      '<header class="result-section-head">' +
      '<span class="result-section-index">02</span>' +
      "<div><p>Tool recommendations</p><h3>Build a smaller, sharper stack</h3>" +
      "<span>Use these recommendations in sequence instead of adding tools all at once.</span></div>" +
      "</header>" +
      '<div class="result-recommendation-grid">' +
      recommendationCards +
      "</div>" +
      "</section>";

    const roadmapWeeks = roadmap.modules.length
      ? '<ol class="roadmap-weeks">' +
        roadmap.modules
          .map(function (card) {
            return (
              '<li class="roadmap-week">' +
              '<div class="roadmap-week__marker"><span>Week</span><strong>' +
              card.week +
              "</strong></div>" +
              '<article class="roadmap-week__card">' +
              '<div class="roadmap-week__head"><h4>' +
              escapeHtml(card.title) +
              '</h4><span class="roadmap-week__hours">' +
              escapeHtml(card.hours) +
              "</span></div>" +
              "<p>" +
              escapeHtml(card.focus) +
              "</p>" +
              '<div class="roadmap-week__meta"><span>' +
              escapeHtml(
                trackLens[roadmap.track ? roadmap.track.key : "career"] ||
                  "Professional context"
              ) +
              "</span><span>" +
              escapeHtml(card.stack) +
              "</span></div>" +
              "</article></li>"
            );
          })
          .join("") +
        "</ol>"
      : '<div class="roadmap-empty">Choose a primary goal and monthly commitment to generate the weekly sequence.</div>';
    const roadmapSection =
      '<section class="result-report-section result-roadmap">' +
      '<header class="result-section-head result-section-head--roadmap">' +
      '<span class="result-section-index">03</span>' +
      "<div><p>Week-by-week roadmap</p><h3>Turn fluency into a working habit</h3>" +
      "<span>" +
      escapeHtml(roadmap.band.description) +
      "</span></div>" +
      '<div class="result-roadmap__pace"><span>Timeline</span><strong>' +
      escapeHtml(roadmap.durationText) +
      "</strong><small>" +
      escapeHtml(capitalizeSentence(roadmap.pacing)) +
      "</small></div>" +
      "</header>" +
      roadmapWeeks +
      "</section>";

    const scoreHero =
      '<section class="result-hero" data-card="result">' +
      '<div class="result-hero__score">' +
      '<p class="eyebrow">Final roadmap</p>' +
      '<div class="result-score-lockup">' +
      '<div class="result-score-dial" style="--score-angle: ' +
      roadmap.levelSignal.fluencyScore * 3.6 +
      'deg" role="img" aria-label="AI fluency score ' +
      roadmap.levelSignal.fluencyScore +
      ' out of 100"><div><strong>' +
      roadmap.levelSignal.fluencyScore +
      "</strong><span>/100</span></div></div>" +
      '<div class="result-score-copy"><span class="result-score-title">AI fluency score</span>' +
      "<h2>" +
      escapeHtml(roadmap.band.label) +
      " fluency</h2><p>" +
      escapeHtml(resultSummary) +
      "</p></div></div>" +
      '<div class="result-meta"><span>Locked result</span><span>' +
      escapeHtml(syncBadgeText) +
      "</span><span>Prepared for " +
      escapeHtml(displayName) +
      "</span></div></div>" +
      '<article class="result-track-card">' +
      '<p class="result-card-label">Track</p>' +
      "<h3>" +
      escapeHtml(roadmap.track ? roadmap.track.label : "Track pending") +
      "</h3><p>" +
      escapeHtml(
        roadmap.track
          ? roadmap.track.description
          : "Choose a primary goal to reveal the recommended track."
      ) +
      "</p>" +
      '<dl class="result-track-stats"><div><dt>Primary goal</dt><dd>' +
      escapeHtml(
        answers.goal && answers.goal !== "None" ? answers.goal : "Not selected"
      ) +
      "</dd></div><div><dt>Commitment</dt><dd>" +
      escapeHtml(roadmap.durationText) +
      "</dd></div><div><dt>Working pace</dt><dd>" +
      escapeHtml(capitalizeSentence(roadmap.pacing)) +
      "</dd></div></dl></article></section>";

    const resultFooter =
      '<section class="result-footer">' +
      '<div><p class="result-card-label">Save your roadmap</p>' +
      "<h3>Keep this assessment ready for reporting</h3>" +
      '<p class="send-status" data-send-status>' +
      escapeHtml(syncMessage) +
      "</p></div>" +
      '<div class="result-footer__actions">' +
      '<button type="button" class="primary-btn" data-action="sync-now">' +
      escapeHtml(syncButtonLabel) +
      "</button>" +
      '<button type="button" class="secondary-btn" data-action="download-json">Download assessment JSON</button>' +
      '<button type="button" class="secondary-btn" data-action="reset">Retake assessment</button>' +
      "</div></section>";

    return (
      '<section class="result-stage">' +
      scoreHero +
      signalSection +
      toolSection +
      roadmapSection +
      resultFooter +
      "</section>"
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
    const currentSkills = roadmap.tools.length
      ? roadmap.tools.join(", ")
      : "No active skills selected yet";
    const toolUsageLine = getToolUsageSummary(state.answers, 3) || "not yet try";
    const liveLine = state.locked ? scoreLine : "Assessment in progress";

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
      "<li>Tool usage: " + escapeHtml(toolUsageLine) + ".</li>" +
      "<li>Assessment score: " +
      escapeHtml(String(roadmap.levelSignal.fluencyScore || "Pending")) +
      "/100.</li>" +
      "<li>Role / background: " +
      escapeHtml(cleanText(state.answers.roleBackground, 80) || "Pending") +
      ".</li>" +
      "<li>Skills in use: " + escapeHtml(currentSkills) + ".</li>" +
      "<li>Goal: " +
      escapeHtml(
        isMeaningfulSelection(state.answers.goal)
          ? state.answers.goal
          : "Pending"
      ) +
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
      pageContent.innerHTML = renderGoalPage(answers);
    } else if (pageIndex === 3) {
      pageContent.innerHTML = renderTrainingPage(answers);
    } else if (pageIndex === 4) {
      pageContent.innerHTML = renderToolUsagePage(answers);
    } else if (pageIndex === 5) {
      pageContent.innerHTML = renderToolsPage(answers);
    } else if (pageIndex === 6) {
      pageContent.innerHTML = renderAssessmentPage(answers);
    } else if (pageIndex === 7) {
      pageContent.innerHTML = renderHoursPage(answers);
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
      return "Progress is building.";
    }
    return "Strong live reading.";
  }

  function setConditionalVisibility() {
    return;
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
      state.answers.wants = [
        getFieldValue("wantsPrimary") || "None",
        getFieldValue("wantsSecondary") || "None",
        getFieldValue("wantsThird") || "None",
      ];
      state.answers.wantsOther = cleanText(getFieldValue("wantsOther"), 160);
      state.answers.pain = [
        getFieldValue("painPrimary") || "None",
        getFieldValue("painSecondary") || "None",
        getFieldValue("painThird") || "None",
      ];
      state.answers.painOther = cleanText(getFieldValue("painOther"), 160);
    } else if (state.currentPage === 2) {
      state.answers.goal = getFieldValue("goal") || "None";
      state.answers.goalSecondary = getFieldValue("goalSecondary") || "None";
      state.answers.goalThird = getFieldValue("goalThird") || "None";
      state.answers.goalOtherSector = cleanText(getFieldValue("goalOtherSector"), 120);
    } else if (state.currentPage === 3) {
      state.answers.trainingTopics = trainingTopicFields.map(function (field) {
        return getFieldValue(field.name) || trainingStatusDefaultOption.value;
      });
    } else if (state.currentPage === 4) {
      toolUsageSections.forEach(function (section) {
        section.items.forEach(function (item) {
          state.answers[item.name] = cleanText(getFieldValue(item.name), 40);
        });
      });
    } else if (state.currentPage === 5) {
      state.answers.tools = knowledgeSkillFields.map(function (field) {
        return isKnowledgeSkillStatusValue(getFieldValue(field.name))
          ? getFieldValue(field.name)
          : knowledgeSkillStatusDefaultOption.value;
      });
    } else if (state.currentPage === 6) {
      state.answers.toolBreadth = getFieldValue("toolBreadth") || "1";
      state.answers.promptQuality = getFieldValue("promptQuality") || "1";
      state.answers.verificationJudgment = getFieldValue("verificationJudgment") || "1";
      state.answers.automationBuilding = getFieldValue("automationBuilding") || "1";
      state.answers.timeCostCommitment = getFieldValue("timeCostCommitment") || "1";
    } else if (state.currentPage === 7) {
      weeklyTimeFields.forEach(function (field) {
        state.answers[field.name] = getCommitmentSelectValue(
          field,
          getFieldValue(field.name)
        );
      });
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

  async function handleNext() {
    if (state.locked || state.draftSaveState.status === "saving") {
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
          ? "Select the primary goal for this assessment."
          : state.currentPage === 3
          ? "Confirm whether you have completed formal paid training and share the course name if you have."
          : state.currentPage === 4
          ? "Select one option for each tool on this page."
          : state.currentPage === 5
          ? "Choose a status for each skill area on this page."
          : state.currentPage === 6
          ? "Rate the five factors that shape your AI fluency score."
          : state.currentPage === 7
          ? "Enter the monthly hours and cost numbers before continuing."
          : "Complete the highlighted fields before continuing.";
      focusFirstSelector(validation.focusSelectors);
      refreshLiveState();
      return;
    }

    clearErrorState();

    if (state.currentPage === 7) {
      await saveDraftCheckpoint();
      state.finalResult = computeRoadmap(state.answers);
      state.submissionId = isUuid(state.submissionId)
        ? state.submissionId
        : createUuid();
      persistDraftLocally();
      state.locked = true;
      state.currentPage = RESULT_PAGE_INDEX;
      state.saveState = {
        status: "idle",
        message: "",
      };
      renderPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
      await syncCurrentResult();
      return;
    }

    state.currentPage += 1;
    renderPage();
    window.scrollTo({ top: 0, behavior: "smooth" });
    await saveDraftCheckpoint();
  }

  async function handleBack() {
    if (state.locked) {
      return;
    }
    syncAnswersFromCurrentPage();
    clearErrorState();
    if (state.currentPage > 0) {
      state.currentPage -= 1;
      renderPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (state.currentPage > 0) {
        await saveDraftCheckpoint();
      }
    }
  }

  function handleReset() {
    clearLocalDraft();
    state.currentPage = 0;
    state.locked = false;
    state.finalResult = null;
    state.resumeToken = "";
    state.submissionId = "";
    state.pendingResume = null;
    state.draftSaveState = {
      status: "idle",
      message: "",
      lastSavedAt: "",
    };
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

  function handleDownloadJson() {
    downloadAssessmentJson();
  }

  function wireEvents() {
    const startButtons = document.querySelectorAll(
      '[data-action="start-assessment"]'
    );
    startButtons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        void handleNext();
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
      void handleNext();
    });

    form.addEventListener("click", function (event) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      if (target.closest('[data-action="back"]')) {
        event.preventDefault();
        void handleBack();
      }
      if (target.closest('[data-action="reset"]')) {
        event.preventDefault();
        handleReset();
      }
      if (target.closest('[data-action="sync-now"]')) {
        event.preventDefault();
        handleSyncNow();
      }
      if (target.closest('[data-action="download-json"]')) {
        event.preventDefault();
        handleDownloadJson();
      }
    });

    if (resumeDialog) {
      resumeDialog.addEventListener("cancel", function (event) {
        event.preventDefault();
      });
      resumeDialog.addEventListener("click", function (event) {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
          return;
        }
        if (target.closest('[data-action="resume-draft"]')) {
          event.preventDefault();
          resumeSavedDraft();
        }
        if (target.closest('[data-action="discard-draft"]')) {
          event.preventDefault();
          discardSavedDraft();
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (!state.locked && state.currentPage > 0 && state.currentPage < 8) {
        syncAnswersFromCurrentPage();
        persistDraftLocally();
      }
    });
  }

  wireEvents();
  renderPage();
  void checkForSavedDraft();
})();
