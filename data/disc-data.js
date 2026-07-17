const typeOrder = ['D', 'I', 'S', 'C'];

const typeMeta = {
  D: {
    label: 'Dominance',
    short: 'D',
    color: '#ff6a3d',
    deep: '#ff4d1f',
  },
  I: {
    label: 'Influence',
    short: 'I',
    color: '#f6b73c',
    deep: '#d99a00',
  },
  S: {
    label: 'Steadiness',
    short: 'S',
    color: '#25b38a',
    deep: '#13805f',
  },
  C: {
    label: 'Conscientiousness',
    short: 'C',
    color: '#4f7cff',
    deep: '#2e62ff',
  },
};

const questionTextMap = {
  D: [
    'I like being the person who moves a project forward when deadlines are tight.',
    'I prefer making a decision and adjusting later over waiting too long.',
    'I feel energized when I can challenge a weak process.',
    'I speak up when a team needs a clear direction.',
    'I focus on outcomes more than on making everyone comfortable.',
    'I am comfortable taking responsibility for a result.',
    'I enjoy competition and measurable wins.',
    'I am quick to cut through ambiguity and pick a course of action.',
    'I prefer direct feedback over vague encouragement.',
    'I like being trusted to own an important task end to end.',
    'I push for faster progress when discussions drag on.',
    'I often volunteer to coordinate when nobody is leading.',
  ],
  I: [
    'I naturally warm up a room and get people talking.',
    'I enjoy networking with new people.',
    'I like presenting ideas and winning support.',
    'I bring energy to group discussions.',
    'I am comfortable persuading others to try a new idea.',
    'I usually add enthusiasm to a team project.',
    'I enjoy brainstorming many possibilities with others.',
    'I find it easy to introduce myself and start conversations.',
    'I like roles where communication is a big part of success.',
    'I often inspire others when motivation dips.',
    'I enjoy sharing progress and celebrating wins.',
    'I tend to make work feel more lively and collaborative.',
  ],
  S: [
    'I stay calm and steady when others are stressed.',
    'I am patient with teammates who need extra time.',
    'I prefer consistent routines and clear expectations.',
    'I am good at listening without interrupting.',
    'I help keep a team cooperative and balanced.',
    'I tend to support people quietly and reliably.',
    'I value harmony and long-term trust.',
    'I am comfortable working behind the scenes to keep things running.',
    'I often notice when someone needs encouragement.',
    'I prefer gradual change over sudden disruption.',
    'I like finishing what I start before jumping to the next thing.',
    'I am dependable even when the work gets repetitive.',
  ],
  C: [
    'I check details carefully before I submit work.',
    'I like clear standards and well-defined expectations.',
    'I feel satisfied when my work is accurate and polished.',
    'I naturally look for mistakes or inconsistencies.',
    'I prefer facts and evidence over guesswork.',
    'I organize information before making a decision.',
    'I like working with data, structure, or systems.',
    'I usually prepare thoroughly before a meeting or presentation.',
    'I want to understand the why behind a process.',
    'I am comfortable following rules that improve quality.',
    'I often notice ways to make a workflow more precise.',
    'I prefer quality control over rushing to finish.',
  ],
};

const questionBank = typeOrder.reduce((bank, type) => {
  const texts = questionTextMap[type];
  const typedQuestions = texts.map((text, index) => ({
    id: `${type}${String(index + 1).padStart(2, '0')}`,
    type,
    text,
  }));
  return bank.concat(typedQuestions);
}, []);

// Seed set used to populate Supabase on the first run.
// This keeps the runtime bank at 30 questions while preserving a balanced mix.
const seedLayout = {
  D: 8,
  I: 8,
  S: 7,
  C: 7,
};

const questionSeed = typeOrder.reduce((bank, type) => {
  const texts = questionTextMap[type].slice(0, seedLayout[type]);
  const seedQuestions = texts.map((text, index) => ({
    id: `${type}${String(index + 1).padStart(2, '0')}`,
    type,
    text,
  }));
  return bank.concat(seedQuestions);
}, []);

function profile(headline, summary, careerSuggestions, growthSuggestions, jobSearchTip) {
  return {
    headline,
    summary,
    careerSuggestions,
    growthSuggestions,
    jobSearchTip,
  };
}

const profileLibrary = {
  D: {
    high: profile(
      'Commanding starter',
      'You are likely to thrive in environments that reward speed, ownership, and visible outcomes. As a fresh grad, you will probably feel most alive when a role gives you a problem and room to move.',
      ['Project coordinator', 'Sales development associate', 'Operations analyst', 'Startup generalist'],
      ['Pause for one input before deciding.', 'Translate directness into clarity, not pressure.', 'Check how your speed affects the team around you.'],
      'Look for entry-level roles with clear ownership, fast feedback cycles, and measurable goals.'
    ),
    medium: profile(
      'Pragmatic driver',
      'You like momentum and responsibility, but you can still adjust when the team needs consensus. That mix can be a strong fit for early-career roles that blend action with collaboration.',
      ['Product operations assistant', 'Account coordinator', 'Junior consultant', 'Field operations associate'],
      ['Invite a second perspective before you lock in a choice.', 'Use short status updates to keep people aligned.', 'Give patience a chance to save time later.'],
      'Target teams that value initiative and do not mind a little assertiveness.'
    ),
    balanced: profile(
      'Quietly assertive',
      'You may lead best when the situation is real and the purpose is clear. In a first job, you could excel in roles where structure exists but initiative still matters.',
      ['Operations support associate', 'Process improvement assistant', 'Customer escalation coordinator', 'Team lead trainee'],
      ['Step into uncertainty a little sooner.', 'Say the next action out loud so others can follow your pace.', 'Use directness with a softer opening.'],
      'Choose a role where you can take ownership without needing to be the loudest voice in the room.'
    ),
  },
  I: {
    high: profile(
      'Visible connector',
      'You likely bring energy, momentum, and social ease into a room. Fresh grad roles that rely on networking, persuasion, and communication will probably let you shine quickly.',
      ['Recruiting coordinator', 'Community associate', 'Marketing assistant', 'Client success specialist'],
      ['Write down commitments so enthusiasm turns into follow-through.', 'Balance speaking with listening in group settings.', 'Use structure to keep your best ideas from drifting away.'],
      'Look for roles with lots of stakeholder contact, presentations, or collaboration across teams.'
    ),
    medium: profile(
      'Engaging teammate',
      'You can energize a group, but you still have enough steadiness to support the work behind the scenes. That makes you well suited to people-facing roles with some structure.',
      ['Events coordinator', 'Employer branding assistant', 'Sales support associate', 'Training coordinator'],
      ['Slow down long enough to close the loop on your ideas.', 'Protect time for focused work when the calendar gets loud.', 'Make space for quieter teammates to contribute.'],
      'Seek early-career roles where communication matters, but progress is measured by outcomes too.'
    ),
    balanced: profile(
      'Supportive promoter',
      'You probably come across as approachable and positive without needing constant attention. In a fresh-grad role, you may do best where people skills and dependable execution work together.',
      ['Partnerships assistant', 'Customer engagement associate', 'Campus recruitment support', 'Learning and development coordinator'],
      ['Document decisions so good conversations become real action.', 'Watch for overpromising in the excitement of the moment.', 'Use your warmth to keep the team aligned, not just entertained.'],
      'Choose a role that lets you connect with people while still giving you a process to anchor the work.'
    ),
  },
  S: {
    high: profile(
      'Reliable anchor',
      'You probably bring calm, patience, and consistency into a team. Fresh grad roles that value trust, service, and long-term relationships should feel natural to you.',
      ['Customer success associate', 'HR operations assistant', 'Service coordinator', 'Operations support specialist'],
      ['Practice voicing your view earlier instead of waiting too long.', 'Try one small change at a time so change feels manageable.', 'Be willing to claim your own priorities, not only everyone else\'s.'],
      'Aim for teams where dependable follow-through matters as much as speed.'
    ),
    medium: profile(
      'Steady collaborator',
      'You seem comfortable building trust and keeping things stable, while still adapting when needed. That makes you a good fit for roles that support both people and process.',
      ['People operations associate', 'Client support specialist', 'Program coordinator', 'Office operations assistant'],
      ['Speak up when a process is broken instead of absorbing the friction.', 'Set boundaries around how much you can carry for others.', 'Use your steadiness to guide change, not avoid it.'],
      'Look for entry roles where calm coordination and consistency are visible strengths.'
    ),
    balanced: profile(
      'Trust builder',
      'You may be the person who keeps a team running smoothly without needing the spotlight. In a first job, you are likely to do well where patience and service are valued.',
      ['Administrative support associate', 'Customer care coordinator', 'Scheduler or dispatch support', 'Team operations assistant'],
      ['Practice saying no when a request would overload you.', 'Take a more active role when a decision has been delayed too long.', 'Keep your natural calm, but do not disappear inside it.'],
      'Target roles with clear routines, cooperative teammates, and room to build trust over time.'
    ),
  },
  C: {
    high: profile(
      'Precision-minded starter',
      'You likely notice details that other people miss, and you feel better when the work is accurate. Fresh grad roles with structure, analysis, or quality control can be a strong match.',
      ['Data analyst associate', 'Quality assurance coordinator', 'Finance assistant', 'Compliance support analyst'],
      ['Ship a draft before polishing forever.', 'Share your reasoning in plain language, not just in numbers.', 'Let good enough be good enough when the stakes are low.'],
      'Look for roles with clear standards, measurable output, and room to learn from data or process.'
    ),
    medium: profile(
      'Structured analyst',
      'You seem careful and thoughtful, but not frozen by the need for perfection. That balance can be powerful in early-career roles where accuracy and communication both matter.',
      ['Business analyst trainee', 'Operations analyst', 'Reporting coordinator', 'Process analyst assistant'],
      ['Avoid overchecking work that already meets the brief.', 'Keep your updates concise so your rigor stays easy to use.', 'Practice making a decision with 80 percent of the information.'],
      'Aim for teams that respect evidence, documentation, and good process.'
    ),
    balanced: profile(
      'Methodical problem solver',
      'You probably bring order to messy situations and like knowing how things work. In a fresh grad role, you may enjoy responsibilities that reward careful thinking and consistency.',
      ['Quality control assistant', 'Documentation specialist', 'Operations reporting associate', 'Junior process analyst'],
      ['Do not let preparation become procrastination.', 'Use your eye for detail to improve communication, not just to catch flaws.', 'Practice explaining complex ideas in a simple way.'],
      'Choose a role where careful thinking is appreciated, but deadlines still matter.'
    ),
  },
};

module.exports = {
  questionBank,
  questionSeed,
  profileLibrary,
  typeMeta,
  typeOrder,
};
