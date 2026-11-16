// All site copy lives here, so updating the site means editing this file.

export const person = {
  name: 'Felipe Ribeiro',
  role: 'AI engineer',
  location: 'São Paulo, Brazil',
  email: 'felipe.frf27@gmail.com',
  github: 'https://github.com/felipefrf',
  linkedin: 'https://www.linkedin.com/in/felipe-farias-ribeiro',
  now: 'Founding engineer at Hexagon, building Milo',
  nowPlace: 'San Francisco · remote',
};

// Big numbers under the hero. `count` animates from 0 when it scrolls into view.
export const impact = [
  { value: 'Top 10%', label: 'of my class at ITA', detail: 'Brazil’s most prestigious engineering school', logo: '/img/ita.png' },
  { value: '1st', label: 'overall, gold medal', detail: 'Iberoamerican Physics Olympiad 2020', accent: true },
  { value: '50+', count: 50, suffix: '+', label: 'olympiad medals', detail: 'Two international, 2017–2020' },
  { value: 'Best', label: 'satellite concept design', detail: 'Matsumoto-2, II SPOCS at ITA, 2026' },
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
      { value: '189k', label: 'official exam questions' },
      { value: '300+', label: 'institutions' },
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
      'Works offline and installs with pip; the same notes always give the same page',
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
      'An agent that handles intake, scheduling, questions, documents and handing off to the team',
      'Bookings that can’t double up, and every clinic’s data kept apart from day one',
      'A portal where the clinic sees every patient’s case and everything the agent did',
    ],
    stack: ['Google ADK', 'Gemini', 'Postgres', 'React', 'WhatsApp'],
    links: [
      { label: 'Open the clinic portal', href: '/curo/painel/?lang=en' },
      { label: 'Landing page', href: '/curo/' },
    ],
  },
  {
    slug: 'flights',
    name: 'Flight Price Finder',
    kind: 'Side project',
    year: '2026',
    blurb:
      'Finds the cheapest way between two cities, including hidden-city fares: a ticket to somewhere further that connects where you actually want to land. Every search proves it searched, because most of them find nothing, and that’s fine.',
    points: [
      'Real find: Salvador → São Paulo direct was R$381; a ticket to Florianópolis through São Paulo was R$248',
      'The demo replays four real searches: watch it check city after city on the map',
      'Treats São Paulo’s three airports as one city, and says plainly when there’s nothing to save',
    ],
    stack: ['Python', 'FastAPI', 'Google Flights'],
    links: [{ label: 'Try the demo', href: '/flights/' }],
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
      what: 'The app that walks event crews through their day, and the live board the office follows them on. More above, in its own section.',
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
    blurb: 'A little desktop companion for Mac that shows every AI coding agent you have running, at a glance.',
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
    blurb: 'Two synced subtitle languages on YouTube, one to understand and one to learn.',
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
    company: 'Hexagon',
    role: 'Founding Engineer',
    place: 'San Francisco · remote',
    dates: 'Sep 2026 — now',
    summary: 'Building Milo, an AI agent for every person on a team, each one running on its own private machine in the cloud with that person’s tools.',
    bullets: [
      'Shipped the Microsoft Teams and Google Chat integrations at parity with Slack and WhatsApp: the agent acts as the user, streams its replies, handles files and transcribes voice.',
      'Built the vault behind the agent’s web browser: passwords and one-time codes are filled in by name, so the model never sees them.',
      'Nothing ships without passing tests that replay real production cases in two languages, plus nightly AI-graded reviews and a tool that rebuilds any conversation end to end.',
    ],
  },
  {
    company: 'NG.CASH',
    role: 'Product Engineer',
    place: 'São Paulo · remote',
    dates: 'Jan 2026 — Sep 2026',
    summary: 'Production LLM agents and full-stack systems for a Brazilian fintech, where a wrong answer costs real money.',
    bullets: [
      'A WhatsApp agent that negotiates debts, with every price computed in code, never by the model: 19% faster, and not one leak across 34 attempts to trick it.',
      'Rebuilt the legacy payroll system from scratch, plus an AI pipeline that checks contractor invoices.',
      'Automated how Legal sorts court notices: the AI reads each document and pulls out what matters, removing ~95% of manual review.',
    ],
  },
  {
    company: 'Credix',
    role: 'ML Engineer, Credit & Risk',
    place: 'Belgium · remote',
    dates: 'Jul 2025 — Jan 2026',
    summary: 'Credit models for emerging-market B2B buyers that became the automated decision engine and drove seller pricing.',
    bullets: [
      'Models in production that rank buyers by how late they’re likely to pay and how much could be lost.',
      'Near-real-time credit decisions, with anomaly detection flagging fraud.',
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
  { company: 'Safra', role: 'US Equities Summer Intern', dates: 'Jan — Feb 2025', note: 'Read US companies’ annual reports at scale with NLP' },
  { company: 'BTG Pactual', role: 'Automation Engineer Intern', dates: 'Apr — Aug 2024', note: 'Automations for Legal and the reforestation business; a stint as PM' },
  { company: 'XP Inc.', role: 'Product Control Summer Intern', dates: 'Dec 2023 — Feb 2024', note: 'Spreadsheet automation for product control' },
];

export const building = [
  { name: 'ITA Jobs Commission', role: 'President', dates: '2023 — 2024', note: 'Ran Brazil’s largest countryside career fair, 1,800+ attendees' },
  { name: 'Iniciativa Feynman', role: 'Co-founder & Coordinator', dates: 'Sep 2019 — Apr 2021', note: '0 → 81 volunteers in under 6 months, 350+ public-school students during COVID' },
];

export const medals = [
  {
    kind: 'gold' as const,
    rank: '1st',
    title: 'Gold medal, 1st overall',
    event: 'Iberoamerican Physics Olympiad',
    short: 'OIbF',
    year: '2020',
    ring: 'OLIMPÍADA IBEROAMERICANA DE FÍSICA · 2020 · ',
    logo: '/img/olympiads/oibf.png',
    note: 'Plus the special prize for the best solution to Problem 2.',
  },
  {
    kind: 'silver' as const,
    rank: '16th',
    title: 'Silver medal, 16th overall',
    event: 'Nordic-Baltic Physics Olympiad',
    short: 'NBPhO',
    year: '2020',
    ring: 'NORDIC-BALTIC PHYSICS OLYMPIAD · 2020 · ',
    logo: '/img/olympiads/nbpho.png',
    note: 'Plus the special prize for the best solution to Problem 1, in Brazil’s first year as a guest country.',
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
  oibf: {
    src: '/img/olympiads/oibf-2020-results.webp',
    w: 1100,
    h: 754,
    caption: 'OIbF 2020 official results: gold, first on the list',
    href: 'https://drive.google.com/file/d/1Z2PJxCC9j0_KWcFwX-5_0-Jzsm5zoqWz/view',
  },
  nbpho: {
    src: '/img/olympiads/nbpho-2020-results.webp',
    w: 1600,
    h: 401,
    href: 'https://nbpho.ee/wp-content/uploads/2020/05/NB_final_results_publish.pdf',
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

// Photo gallery under the medals, newest first.
export const otherHonors = [
  {
    title: 'Best satellite concept',
    event: 'Matsumoto-2 · II SPOCS, ITA · July 2026',
    note: 'A C-band SAR satellite to map farmland in Rio Grande do Norte, designed by a team of six. Best graduation project at ITA’s satellite concept design seminar.',
    photo: '/img/spocs-award.webp',
    w: 1400,
    h: 1054,
    alt: 'Four of the Matsumoto-2 team holding “Melhor Trabalho de Graduação” certificates next to the satellite poster at ITA',
  },
  {
    title: 'Future Lab 2026',
    event: 'Telles Foundation · July–August 2026',
    note: 'One of five ITA students selected for the first edition, a six-week program for up to 50 people, all by nomination.',
    photo: '/img/futurelab.webp',
    w: 933,
    h: 1400,
    alt: 'Felipe listening during a Future Lab session in São Paulo',
    focus: '50% 30%',
  },
  {
    title: 'Brasil Project',
    event: 'Harvard & MIT · Cambridge, 2026',
    note: 'Invited to the conference where Brazilians at the frontier of research and industry discuss the country’s future.',
    photo: '/img/brasil-project.webp',
    w: 1400,
    h: 1050,
    alt: 'Felipe and three friends at the Brasil Project conference in Cambridge',
    focus: '50% 40%',
  },
  {
    title: '2nd place',
    event: 'SkyLens · Nameless Hackathon (VC-backed), 2025',
    note: 'CBERS-4A satellite imagery from INPE, pansharpened to 2 m mosaics, to find urban growth in rural-taxed land.',
    photo: '/img/skylens-award.webp',
    w: 1600,
    h: 1200,
    alt: 'The SkyLens team on stage at the Nameless Hackathon, under a screen that reads “2º lugar · SkyLens”',
  },
];

export const education = {
  school: 'Instituto Tecnológico de Aeronáutica (ITA)',
  degree: 'Aerospace Engineering, Data Science minor',
  dates: 'Feb 2023 — Dec 2027',
  note: 'Run by the Brazilian Air Force since 1950, and Brazil’s most prestigious engineering school.',
  entry: [
    { value: 'Top 10%', label: 'of the class' },
    { value: 'CNPq', label: 'funded undergraduate research in machine learning, 2023–24' },
    { value: 'Best', label: 'satellite concept design at II SPOCS, 2026' },
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
