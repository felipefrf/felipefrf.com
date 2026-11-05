// All site copy lives here, so updating the site means editing this file.

export const person = {
  name: 'Felipe Ribeiro',
  role: 'AI engineer',
  location: 'São Paulo, Brazil',
  email: 'felipe.frf27@gmail.com',
  github: 'https://github.com/felipefrf',
  linkedin: 'https://www.linkedin.com/in/felipe-farias-ribeiro',
  now: 'Building at a stealth AI startup',
  nowPlace: 'San Francisco · remote',
};

// Big numbers under the hero. `count` animates from 0 when it scrolls into view.
export const impact = [
  { value: '28th', label: 'of 4,033 in ITA’s entrance exam', detail: '144 seats · Brazil’s most respected engineering school', logo: '/img/ita.png' },
  { value: '1st', label: 'overall, top gold', detail: 'Iberoamerican Physics Olympiad 2020', accent: true },
  { value: '50+', count: 50, suffix: '+', label: 'olympiad medals', detail: 'Two international, 2017–2020' },
  { value: '0/34', label: 'prompt-injection leaks', detail: 'On the debt-negotiation agent at NG.CASH' },
  { value: '~95%', label: 'of manual review removed', detail: 'Legal’s judicial-notification triage' },
];

export type Link = { label: string; href: string };

export type Project = {
  slug: string;
  name: string;
  kind: string;
  year: string;
  blurb: string;
  points?: string[];
  stack: string[];
  links: Link[];
  status?: string;
  stats?: { value: string; label: string }[];
};

export const featured: Project[] = [
  {
    slug: 'medalvo',
    name: 'MedAlvo',
    kind: 'Founder',
    year: '2026 —',
    blurb:
      'An adaptive prep platform for Brazilian medical residency exams, run as a self-driving company: AI agents in cloud VMs scrape, OCR, deduplicate and QA the question bank and handle daily operations. It makes money.',
    points: [
      'FSRS v6 + Thompson Sampling decide what each student sees next',
      '2PL IRT calibrates difficulty; Bayesian Knowledge Tracing models what you know',
      'FastAPI + Postgres/pgvector on Cloud Run, React on the front',
    ],
    stack: ['FastAPI', 'Postgres', 'pgvector', 'Cloud Run', 'React', 'AI agents'],
    links: [{ label: 'medalvo.com.br', href: 'https://medalvo.com.br' }],
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
      'Turns Markdown + LaTeX notes into realistic handwritten pages for iPad, Goodnotes and reMarkable. A writer model varies every glyph while a legibility clamp keeps it readable. Watch it write.',
    points: [
      'Fractions, integrals, roots and vectors laid out in handwriting',
      'Seed-reproducible output, offline, pure pip install, cross-OS CI',
    ],
    stack: ['Python', 'resvg', 'LaTeX'],
    links: [
      { label: 'Project page', href: '/penpad/' },
      { label: 'GitHub', href: 'https://github.com/felipefrf/penpad' },
    ],
  },
  {
    slug: 'curo',
    name: 'Curo',
    kind: 'Side project',
    year: '2026',
    blurb:
      'A WhatsApp-first patient-care layer for Brazilian specialists and clinics: one conversation for the patient, while Curo talks to the doctor, the hospital and the insurer. Built with my brother Rafael (MIT). We took it seriously for a while, far enough to interview with Y Combinator.',
    points: [
      'Agent with 14 tools for intake, scheduling, FAQ, documents and team handoff',
      'Deterministic scheduling with idempotent bookings; per-clinic isolation from tenant one',
      'Google ADK + Gemini on GCP, Postgres, clinic portal in React',
    ],
    stack: ['Google ADK', 'Gemini', 'Postgres', 'React', 'WhatsApp'],
    links: [{ label: 'felipefrf.com/curo', href: '/curo/' }],
  },
  {
    slug: 'flights',
    name: 'Flight Price Finder',
    kind: 'Side project',
    year: '2026',
    status: 'Live Google Flights data through treg',
    blurb:
      'Finds the cheapest way between two cities, including hidden-city fares: a ticket to somewhere further that connects where you actually want to land. Every search proves it searched, because most of them find nothing, and that’s fine.',
    points: [
      'Real find: SSA→CGH direct was R$381; SSA→CGH→FLN was R$248',
      'Groups nearby airports (GRU/CGH/VCP) and multi-leg through-fares',
      'Fares come from Google Flights through treg; runs on my machine behind a Cloudflare Tunnel + Access',
    ],
    stack: ['Python', 'treg', 'Google Flights', 'Cloudflare Tunnel'],
    links: [],
  },
];

export const apice = {
  name: 'Ápice',
  kind: 'Side business',
  year: '2026',
  blurb:
    'A software house my brother and I run on the side. Two engineers, ITA and MIT: we design the system and write the code ourselves, for companies that need software that holds up.',
  href: 'https://software-house-six.vercel.app',
  work: [
    {
      client: 'Império Eventos',
      name: 'Império Logística',
      what: 'A logistics control tower (Next.js) and a field app for iOS and Android (Expo) on Supabase, reading stock from EstoqueNOW so the warehouse and the event crews see the same truth.',
    },
    {
      client: 'Clinics & specialists',
      name: 'Patient-care agents',
      what: 'WhatsApp agents for medical clinics that handle intake, scheduling and follow-ups.',
    },
  ],
};

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
    summary: 'Building Milo, a peer-to-peer personal AI for teams. Each employee’s agent runs in its own Linux microVM with their tools.',
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
    summary: 'Credit models for emerging-market B2B buyers that became the automated decision engine and drove seller pricing.',
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
    summary: 'Worked with the US & Canada sales team from Brazil.',
    bullets: ['Shipped an LLM chatbot over Salesforce CRM data that replaced analyst-mediated revenue forecasts.'],
  },
];

// Shorter stints: shown compactly under the main roles.
export const earlier = [
  { company: 'Safra', role: 'US Equities Summer Intern', dates: 'Jan — Feb 2025', note: 'NLP pipeline over SEC EDGAR 10-Ks' },
  { company: 'BTG Pactual', role: 'Automation Engineer Intern', dates: 'Apr — Aug 2024', note: 'Automations for Legal and the reforestation business; a stint as PM' },
  { company: 'XP Inc.', role: 'Product Control Summer Intern', dates: 'Dec 2023 — Feb 2024', note: 'Spreadsheet automation for product control' },
  { company: 'CNPq', role: 'Undergraduate research, ML', dates: 'Aug 2023 — Apr 2024', note: 'MLPs vs CNNs on MNIST, 97.4% → 99.2% accuracy' },
];

export const building = [
  { name: 'ITA Jobs Commission', role: 'President', dates: '2023 — 2024', note: 'Ran Brazil’s largest countryside career fair, 1,800+ attendees' },
  { name: 'Fundação Estudar', role: 'Multiplicador', dates: 'Mar — Oct 2024', note: 'Workshops and mentoring for students from underrepresented backgrounds' },
  { name: 'Iniciativa Feynman', role: 'Co-founder & Coordinator', dates: 'Sep 2019 — Apr 2021', note: '0 → 81 volunteers in under 6 months, 350+ public-school students during COVID' },
];

export const medals = [
  {
    kind: 'gold' as const,
    rank: '1st',
    title: 'Top gold, 1st place overall',
    event: 'Iberoamerican Physics Olympiad',
    short: 'OIbF',
    year: '2020',
    ring: 'OLIMPÍADA IBEROAMERICANA DE FÍSICA · 2020 · ',
    logo: '/img/olympiads/oibf.png',
    note: '1st overall, plus the special prize for the best solution to Problem 2.',
  },
  {
    kind: 'silver' as const,
    rank: 'Ag',
    title: 'Silver medal',
    event: 'Nordic-Baltic Physics Olympiad',
    short: 'NBPhO',
    year: '2020',
    ring: 'NORDIC-BALTIC PHYSICS OLYMPIAD · 2020 · ',
    logo: '/img/olympiads/nbpho.png',
    note: 'Special prize for the best solution to Problem 1. 21.4 of 36.5 points, 16th overall, in Brazil’s first year as a guest.',
  },
];

// Proof, straight from the organizers' documents.
export const receipts = {
  certificate: {
    src: '/img/olympiads/oibf-2020-certificate.jpg',
    caption: 'OIbF virtual 2020 certificate, 5–13 December 2020',
    medalTable: 'https://drive.google.com/file/d/1Z2PJxCC9j0_KWcFwX-5_0-Jzsm5zoqWz/view',
    announcement: 'https://www.sbfisica.org.br/v1/sbf/olimpiada-iberoamericana-de-fisica-oibf-2020/',
  },
  oibfRow: {
    cols: ['Nombre', 'Apellido', 'País', 'Medalla', 'Premio especial'],
    row: ['Felipe', 'Farias Ribeiro Filho', 'Brasil', 'ORO', 'Mejor resolución del problema 2'],
    caption: 'Row 1 of the official OIbF 2020 medal table (46 awardees)',
  },
  nbpho: {
    href: 'https://nbpho.ee/wp-content/uploads/2020/05/NB_final_results_publish.pdf',
    total: 21.4,
    max: 36.5,
    rank: 16,
    problems: [
      { n: 1, got: 6, max: 6 },
      { n: 2, got: 2, max: 10 },
      { n: 3, got: 3, max: 3 },
      { n: 4, got: 5.2, max: 9 },
      { n: 5, got: 5.2, max: 8.5 },
    ],
  },
};

export const national = [
  { name: 'OBF', full: 'Brazilian Physics Olympiad', result: '4× gold' },
  { name: 'OBA', full: 'Brazilian Astronomy & Astronautics Olympiad', result: '2× gold' },
  { name: 'OBR', full: 'Brazilian Robotics Olympiad', result: '2× gold, silver' },
  { name: 'OBMEP', full: 'Brazilian Public Schools Math Olympiad', result: 'Gold' },
];

// "See the full list": the main medals, newest first. Placements and special
// prizes that aren't medals live on the medal cards instead.
export const medalList = [
  { year: 2020, medal: 'gold', name: 'Iberoamerican Physics Olympiad (OIbF)', scope: 'International' },
  { year: 2020, medal: 'silver', name: 'Nordic-Baltic Physics Olympiad (NBPhO), Tallinn Tech', scope: 'International' },
  { year: 2020, medal: 'gold', name: 'Brazilian Physics Olympiad (OBF)', scope: 'National' },
  { year: 2020, medal: 'gold', name: 'Brazilian Astronomy & Astronautics Olympiad (OBA)', scope: 'National' },
  { year: 2019, medal: 'gold', name: 'Brazilian Physics Olympiad (OBF)', scope: 'National' },
  { year: 2019, medal: 'gold', name: 'Brazilian Robotics Olympiad (OBR)', scope: 'National' },
  { year: 2019, medal: 'gold', name: 'National Science Olympiad (ONC)', scope: 'National' },
  { year: 2019, medal: 'gold', name: 'Brazilian Astronomy & Astronautics Olympiad (OBA)', scope: 'National' },
  { year: 2018, medal: 'gold', name: 'Brazilian Physics Olympiad (OBF)', scope: 'National' },
  { year: 2018, medal: 'silver', name: 'Brazilian Robotics Olympiad (OBR)', scope: 'National' },
  { year: 2018, medal: 'gold', name: 'Bahia Chemistry Olympiad (OBaQ)', scope: 'State' },
  { year: 2017, medal: 'gold', name: 'Brazilian Physics Olympiad (OBF)', scope: 'National' },
  { year: 2017, medal: 'gold', name: 'Brazilian Public Schools Math Olympiad (OBMEP)', scope: 'National' },
  { year: 2017, medal: 'gold', name: 'Brazilian Robotics Olympiad (OBR)', scope: 'National' },
  { year: 2017, medal: 'gold', name: 'Brazilian Public Schools Physics Olympiad (OBFEP)', scope: 'National' },
];

export const otherHonors = [
  { title: '2nd place', event: 'SkyLens · Nameless Hackathon (VC-backed), 2025', note: 'CBERS-4A satellite imagery from INPE, pansharpened to 2 m mosaics, to find urban growth in rural-taxed land', photo: '/img/skylens-award.jpg' },
];

export const education = {
  school: 'Instituto Tecnológico de Aeronáutica (ITA)',
  degree: 'Aerospace Engineering, Data Science minor',
  dates: 'Feb 2023 — Dec 2027',
  note: 'Run by the Brazilian Air Force since 1950 and widely regarded as the best engineering school in Brazil.',
  entry: [
    { value: '28th', label: 'place in the entrance exam' },
    { value: '4,033', label: 'open-track applicants' },
    { value: '144', label: 'seats' },
  ],
  logo: '/img/ita.png',
};

export const toolbox = [
  { area: 'AI & agents', items: ['LLM agents', 'Multi-agent orchestration', 'Tool use & MCP', 'RAG', 'Evals & guardrails', 'PyTorch'] },
  { area: 'Product', items: ['TypeScript', 'Node', 'Next.js', 'React', 'Fastify', 'FastAPI', 'Python'] },
  { area: 'Data', items: ['Postgres', 'pgvector', 'Snowflake', 'DynamoDB', 'XGBoost', 'SQL'] },
  { area: 'Infra', items: ['GCP Cloud Run', 'AWS', 'Terraform', 'Docker', 'GitHub Actions', 'Linux'] },
];

// Waypoints on the hero's trajectory plot, left to right.
export const flightPath = [
  { year: '2017–20', label: 'Olympiads · 50+ medals' },
  { year: '2019', label: 'Iniciativa Feynman' },
  { year: '2023', label: 'ITA · XP · BTG' },
  { year: '2025', label: 'Safra · LinkedIn · Credix' },
  { year: '2026', label: 'NG.CASH · MedAlvo' },
  { year: 'now', label: 'Founding engineer' },
];
