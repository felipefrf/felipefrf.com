// All site copy lives here, so updating the site means editing this file.

export const person = {
  name: 'Felipe Ribeiro',
  role: 'AI engineer',
  location: 'São Paulo, Brazil',
  email: 'felipe.frf27@gmail.com',
  github: 'https://github.com/felipefrf',
  linkedin: 'https://www.linkedin.com/in/felipe-farias-ribeiro',
  now: 'Founding engineer at a stealth AI startup',
};

export type Project = {
  slug: string;
  name: string;
  kind: string;
  year: string;
  blurb: string;
  points?: string[];
  stack: string[];
  links: { label: string; href: string }[];
  image?: { src: string; alt: string };
  stats?: { value: string; label: string }[];
};

export const featured: Project[] = [
  {
    slug: 'medalvo',
    name: 'MedAlvo',
    kind: 'Founder',
    year: '2026 —',
    blurb:
      'An adaptive prep platform for Brazilian medical residency exams, run as a self-driving company: AI agents in cloud VMs scrape, OCR, deduplicate and QA the question bank and handle daily operations.',
    points: [
      'FSRS v6 + Thompson Sampling decide what you see next',
      '2PL IRT calibrates difficulty; Bayesian Knowledge Tracing models what you know',
      'FastAPI + Postgres/pgvector on Cloud Run, React on the front',
    ],
    stack: ['FastAPI', 'Postgres', 'pgvector', 'Cloud Run', 'React', 'AI agents'],
    links: [{ label: 'medalvo.com.br', href: 'https://medalvo.com.br' }],
    image: { src: '/img/medalvo.jpg', alt: 'MedAlvo landing page: “Cada questão mira a sua residência”, with an adaptive study dashboard' },
    stats: [
      { value: '163k+', label: 'official exam questions' },
      { value: '2,045', label: 'full past exams' },
    ],
  },
  {
    slug: 'penpad',
    name: 'penpad',
    kind: 'Open source',
    year: '2026',
    blurb:
      'Turns Markdown + LaTeX notes into realistic handwritten pages for iPad, Goodnotes, Notability and reMarkable. A writer model varies every glyph while a legibility clamp keeps it readable.',
    points: [
      'Fractions, integrals, roots and vectors laid out in handwriting',
      'Seed-reproducible output, offline, pure pip install, cross-OS CI',
    ],
    stack: ['Python', 'resvg', 'LaTeX'],
    links: [
      { label: 'Project page', href: '/penpad/' },
      { label: 'GitHub', href: 'https://github.com/felipefrf/penpad' },
    ],
    image: { src: '/penpad/img/hero.jpg', alt: 'A page of damped-oscillator physics notes rendered in handwriting by penpad' },
  },
];

export const more: Project[] = [
  {
    slug: 'editable-pets',
    name: 'Editable Pets',
    kind: 'macOS app',
    year: '2026',
    blurb: 'A desktop companion for Claude Code and Codex. Native hooks keep every concurrent agent session visible at a glance.',
    stack: ['Swift', 'Hooks'],
    links: [{ label: 'GitHub', href: 'https://github.com/felipefrf/editable-pets' }],
  },
  {
    slug: 'yt-to-md',
    name: 'yt-to-md',
    kind: 'CLI',
    year: '2026',
    blurb: 'Turn any YouTube video into clean, structured Markdown, built for AI agents. No API key, no cost.',
    stack: ['Python'],
    links: [{ label: 'GitHub', href: 'https://github.com/felipefrf/yt-to-md' }],
  },
  {
    slug: 'dual-subtitles',
    name: 'Dual Subtitles',
    kind: 'Chrome extension',
    year: '2026',
    blurb: 'Two synced subtitle languages on YouTube, one to understand and one to learn, in a Shadow-DOM overlay.',
    stack: ['TypeScript', 'WXT', 'React'],
    links: [{ label: 'GitHub', href: 'https://github.com/felipefrf/dual-subtitles-extension' }],
  },
  {
    slug: 'hair-visagism',
    name: 'Hair Visagism',
    kind: 'Experiment',
    year: '2026',
    blurb: 'Maps facial landmarks in the browser, classifies face shape and recommends haircuts, then renders a generative try-on.',
    stack: ['Next.js', 'MediaPipe', 'FLUX Kontext'],
    links: [
      { label: 'Live', href: 'https://hair-visagism.vercel.app' },
      { label: 'GitHub', href: 'https://github.com/felipefrf/hair-visagism' },
    ],
  },
  {
    slug: 'x-reset',
    name: 'x-reset',
    kind: 'Tool',
    year: '2026',
    blurb: 'Bulk-delete old tweets, retweets and replies from your official X archive. Browser-driven and resumable.',
    stack: ['TypeScript', 'Playwright'],
    links: [{ label: 'GitHub', href: 'https://github.com/felipefrf/x-reset' }],
  },
];

export type Job = {
  company: string;
  role: string;
  place: string;
  dates: string;
  summary: string;
  bullets: string[];
};

export const jobs: Job[] = [
  {
    company: 'Stealth AI startup',
    role: 'Founding Engineer',
    place: 'San Francisco · remote',
    dates: 'Sep 2026 — now',
    summary: 'Building Milo, a peer-to-peer personal AI for teams. Each employee’s agent runs in its own Linux microVM.',
    bullets: [
      'Shipped Microsoft Teams and Google Chat integrations at parity with Slack and WhatsApp: act-as-user OAuth, streaming, files and voice transcription.',
      'Built the credential layer for the hosted browser agent: an encrypted vault where OTPs and secrets are injected by alias, so they never enter model context.',
      'Eval-first shipping: bilingual ship-gate suites replaying production cases, nightly LLM-judged reviews, and an “autopsy” tool that reconstructs any conversation end to end.',
    ],
  },
  {
    company: 'NG.CASH',
    role: 'Product Engineer',
    place: 'São Paulo · remote',
    dates: 'Jan 2026 — Sep 2026',
    summary: 'Production LLM agents and full-stack systems for a Brazilian fintech, where a wrong answer costs real money.',
    bullets: [
      'WhatsApp debt-negotiation agent with multi-model orchestration and pricing kept deterministic in code: 19% lower latency, 0 leaks across a 34-attack prompt-injection battery.',
      'Re-platformed legacy payroll into Fastify + React on Cloud Run with Terraform, plus a Gemini pipeline that validates contractor invoices.',
      'Automated Legal’s judicial-notification triage with multimodal OCR and entity extraction, removing ~95% of manual review.',
    ],
  },
  {
    company: 'Credix',
    role: 'ML Engineer, Credit & Risk',
    place: 'Belgium · remote',
    dates: 'Jul 2025 — Jan 2026',
    summary: 'Credit models for emerging-market B2B buyers that drove automated decisions and seller pricing.',
    bullets: [
      'XGBoost and logistic-regression classifiers that bucket buyers by predicted DPD and loss, deployed to production.',
      'SQL + Python pipelines for near-real-time decisioning, with anomaly detection flagging fraud.',
    ],
  },
  {
    company: 'LinkedIn',
    role: 'Sales Strategy Intern, Data & AI',
    place: 'New York · remote',
    dates: 'Feb 2025 — Jul 2025',
    summary: 'An LLM chatbot over Salesforce CRM data that replaced analyst-mediated forecasts for US & Canada sales.',
    bullets: [],
  },
];

export const honors = [
  { value: '1st', label: 'Overall, top gold', event: 'Iberoamerican Physics Olympiad', scope: 'International' },
  { value: 'Silver', label: 'Medal', event: 'Nordic-Baltic Physics Olympiad', scope: 'International' },
  { value: '3×', label: 'Gold', event: 'Brazilian Physics Olympiad (OBF)', scope: 'National' },
  { value: '2×', label: 'Gold', event: 'Brazilian Robotics Olympiad (OBR)', scope: 'National' },
  { value: '1×', label: 'Gold', event: 'Brazilian Math Olympiad (OBMEP)', scope: 'National' },
];

export const education = {
  school: 'Instituto Tecnológico de Aeronáutica (ITA)',
  degree: 'Aerospace Engineering, Data Science minor',
  dates: 'Expected Dec 2027',
};

export const toolbox = [
  { area: 'AI & agents', items: ['LLM agents', 'Multi-agent orchestration', 'Tool use & MCP', 'RAG', 'Evals & guardrails', 'PyTorch'] },
  { area: 'Product', items: ['TypeScript', 'Node', 'Next.js', 'React', 'Fastify', 'FastAPI', 'Python'] },
  { area: 'Data', items: ['Postgres', 'pgvector', 'Snowflake', 'DynamoDB', 'XGBoost', 'SQL'] },
  { area: 'Infra', items: ['GCP Cloud Run', 'AWS', 'Terraform', 'Docker', 'GitHub Actions', 'Linux'] },
];

// Waypoints on the hero's trajectory plot, left to right.
export const flightPath = [
  { year: '2017–20', label: 'Physics & robotics olympiads' },
  { year: 'ITA', label: 'Aerospace engineering' },
  { year: '2025', label: 'LinkedIn' },
  { year: '2025', label: 'Credix' },
  { year: '2026', label: 'NG.CASH · MedAlvo' },
  { year: 'now', label: 'Founding engineer' },
];
