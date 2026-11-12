// Animated system diagrams for the "Inside the systems" section.
// Coordinates live in a 1000×460 SVG box. Each run is illustrative: the
// architecture is real, the messages and numbers are examples.

export type SysNode = {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind?: 'channel' | 'model' | 'code' | 'store' | 'meta' | 'person';
};

export type SysEdge = {
  id: string;
  from: string;
  to: string;
  dashed?: boolean;
  route?: 'below' | 'above';
  /** explicit SVG path when the automatic curve would cross other nodes */
  d?: string;
};

export type SysStep = { edge: string; reverse?: boolean; log: string };

export type System = {
  id: string;
  tab: string;
  title: string;
  where: string;
  blurb: string;
  facts: { value: string; label: string }[];
  nodes: SysNode[];
  edges: SysEdge[];
  steps: SysStep[];
};

export const systems: System[] = [
  {
    id: 'cos',
    tab: 'Chief of staff',
    title: 'A chief of staff that never sleeps',
    where: 'Personal · 2026',
    blurb:
      'A Claude session on my server reads every channel, decides what needs me, and prepares the action. I approve on my phone; nothing goes out on its own.',
    facts: [
      { value: '7,600+', label: 'Claude Code sessions in 30 days' },
      { value: '0', label: 'messages sent without approval' },
    ],
    nodes: [
      { id: 'wa', label: 'WhatsApp', x: 10, y: 24, w: 150, h: 44, kind: 'channel' },
      { id: 'slack', label: 'Slack', x: 10, y: 84, w: 150, h: 44, kind: 'channel' },
      { id: 'mail', label: 'E-mail', x: 10, y: 144, w: 150, h: 44, kind: 'channel' },
      { id: 'granola', label: 'Granola', x: 10, y: 204, w: 150, h: 44, kind: 'channel' },
      { id: 'cal', label: 'Calendar & Drive', x: 10, y: 264, w: 150, h: 44, kind: 'channel' },
      { id: 'gh', label: 'GitHub', x: 10, y: 324, w: 150, h: 44, kind: 'channel' },
      { id: 'coord', label: 'Coordinator', sub: 'Claude · 15-min loop', x: 215, y: 150, w: 215, h: 84, kind: 'model' },
      { id: 'brain', label: 'Memory', sub: 'people · projects · style', x: 215, y: 340, w: 215, h: 70, kind: 'store' },
      { id: 'lanes', label: 'Lanes', sub: 'Claude sessions, server', x: 480, y: 24, w: 205, h: 70, kind: 'model' },
      { id: 'queue', label: 'Your turn', sub: 'approve in one tap', x: 480, y: 150, w: 205, h: 84, kind: 'person' },
      { id: 'night', label: 'Nightly learning', sub: 'Sonnet batch → memory', x: 480, y: 340, w: 205, h: 70, kind: 'model' },
      { id: 'out', label: 'Deliverables', sub: 'PRs · docs · PDFs', x: 740, y: 24, w: 250, h: 64, kind: 'store' },
      { id: 'send', label: 'WhatsApp sender', sub: 'confirms it in the chat DB', x: 740, y: 130, w: 250, h: 64, kind: 'code' },
      { id: 'email', label: 'E-mail sender', sub: 'port 587, after approval', x: 740, y: 236, w: 250, h: 64, kind: 'code' },
      { id: 'doc', label: 'Daily doc', sub: 'agenda written for you', x: 740, y: 342, w: 250, h: 64, kind: 'store' },
    ],
    edges: [
      { id: 'wa-coord', from: 'wa', to: 'coord' },
      { id: 'slack-coord', from: 'slack', to: 'coord' },
      { id: 'mail-coord', from: 'mail', to: 'coord' },
      { id: 'granola-coord', from: 'granola', to: 'coord' },
      { id: 'cal-coord', from: 'cal', to: 'coord' },
      { id: 'gh-coord', from: 'gh', to: 'coord' },
      { id: 'coord-brain', from: 'coord', to: 'brain' },
      { id: 'coord-queue', from: 'coord', to: 'queue' },
      { id: 'queue-lanes', from: 'queue', to: 'lanes' },
      { id: 'lanes-out', from: 'lanes', to: 'out' },
      { id: 'queue-send', from: 'queue', to: 'send' },
      { id: 'queue-email', from: 'queue', to: 'email' },
      { id: 'coord-doc', from: 'coord', to: 'doc', d: 'M405 234 C405 288 700 284 740 374' },
      { id: 'night-brain', from: 'night', to: 'brain', dashed: true },
    ],
    steps: [
      { edge: 'wa-coord', log: 'whatsapp · Marina: “revised proposal by Friday?”' },
      { edge: 'cal-coord', log: 'calendar → Thursday afternoon is free' },
      { edge: 'coord-brain', log: 'memory → client; Felipe writes short and warm' },
      { edge: 'coord-queue', log: 'draft + why → your phone: “send by Thu night?”' },
      { edge: 'queue-send', log: 'you tap Send → delivered, confirmed in the chat' },
      { edge: 'queue-lanes', log: 'you approve the lane → a Claude session starts' },
      { edge: 'lanes-out', log: 'lane → proposal PDF ready, link sent to you' },
      { edge: 'granola-coord', log: 'granola · meeting ended → 3 action items' },
      { edge: 'coord-doc', log: 'daily doc ← tomorrow’s agenda written' },
      { edge: 'night-brain', log: '02:00 · nightly pass learns people and pending items' },
    ],
  },
  {
    id: 'milo',
    tab: 'Milo',
    title: 'A personal AI for every employee',
    where: 'Stealth AI startup · now',
    blurb:
      'Every employee gets an agent in its own Linux microVM, with their own tools. Agents talk to each other over a permissioned company brain, act in a hosted browser, and never see a secret.',
    facts: [
      { value: '4', label: 'chat surfaces at parity' },
      { value: '0', label: 'secrets in model context' },
    ],
    nodes: [
      { id: 'slack', label: 'Slack', x: 20, y: 40, w: 150, h: 46, kind: 'channel' },
      { id: 'teams', label: 'Microsoft Teams', x: 20, y: 106, w: 150, h: 46, kind: 'channel' },
      { id: 'gchat', label: 'Google Chat', x: 20, y: 172, w: 150, h: 46, kind: 'channel' },
      { id: 'wa', label: 'WhatsApp', x: 20, y: 238, w: 150, h: 46, kind: 'channel' },
      { id: 'gateway', label: 'Gateway', sub: 'act-as-user OAuth · streaming', x: 212, y: 124, w: 232, h: 76, kind: 'code' },
      { id: 'agentA', label: 'Ana’s agent', sub: 'her microVM', x: 470, y: 30, w: 170, h: 64, kind: 'model' },
      { id: 'agentB', label: 'Bruno’s agent', sub: 'his microVM', x: 470, y: 130, w: 170, h: 64, kind: 'model' },
      { id: 'agentC', label: 'Carla’s agent', sub: 'her microVM', x: 470, y: 230, w: 170, h: 64, kind: 'model' },
      { id: 'brain', label: 'Company brain', sub: 'permissioned memory', x: 710, y: 40, w: 200, h: 64, kind: 'store' },
      { id: 'browser', label: 'Hosted browser', sub: 'live mode', x: 710, y: 170, w: 200, h: 64, kind: 'code' },
      { id: 'vault', label: 'Credential vault', sub: 'OTPs & cards by alias', x: 710, y: 300, w: 200, h: 64, kind: 'store' },
      { id: 'evals', label: 'Evals & autopsy', sub: 'ship-gates · nightly LLM judge', x: 230, y: 360, w: 410, h: 64, kind: 'meta' },
    ],
    edges: [
      { id: 'slack-gw', from: 'slack', to: 'gateway' },
      { id: 'teams-gw', from: 'teams', to: 'gateway' },
      { id: 'gchat-gw', from: 'gchat', to: 'gateway' },
      { id: 'wa-gw', from: 'wa', to: 'gateway' },
      { id: 'gw-a', from: 'gateway', to: 'agentA' },
      { id: 'gw-b', from: 'gateway', to: 'agentB' },
      { id: 'gw-c', from: 'gateway', to: 'agentC' },
      { id: 'a-b', from: 'agentA', to: 'agentB' },
      { id: 'a-brain', from: 'agentA', to: 'brain' },
      { id: 'a-browser', from: 'agentA', to: 'browser' },
      { id: 'vault-browser', from: 'vault', to: 'browser' },
      { id: 'evals-c', from: 'evals', to: 'agentC', dashed: true },
    ],
    steps: [
      { edge: 'teams-gw', log: 'teams · Ana: “book Chicago for Tuesday’s 10am client meeting”' },
      { edge: 'gw-a', log: 'gateway → Ana’s agent, in her microVM with her tools' },
      { edge: 'a-brain', log: 'agent → brain: travel policy + client address (allowed for Ana)' },
      { edge: 'a-b', log: 'agent ↔ Bruno’s agent: joining the meeting? → yes, book 2 seats' },
      { edge: 'vault-browser', log: 'vault → browser: {{corp_card}} by alias, never in the prompt' },
      { edge: 'a-browser', log: 'agent → browser: flights + hotel checked out, live view on' },
      { edge: 'gw-a', reverse: true, log: 'Ana’s agent → gateway: “Booked. Confirmations in your inbox.”' },
      { edge: 'teams-gw', reverse: true, log: 'gateway → teams: streamed reply as Ana’s assistant' },
      { edge: 'evals-c', log: 'autopsy: full trace kept and replayed in tonight’s eval suite' },
    ],
  },
  {
    id: 'ngcash',
    tab: 'Debt negotiation',
    title: 'The model decides the action, never the number',
    where: 'NG.CASH · 2026',
    blurb:
      'A WhatsApp agent that renegotiates debt. A planner picks the next move, deterministic code computes every value, and a judge checks the reply before it ships.',
    facts: [
      { value: '0/34', label: 'prompt-injection leaks' },
      { value: '−19%', label: 'latency' },
    ],
    nodes: [
      { id: 'wa', label: 'Customer', sub: 'WhatsApp', x: 10, y: 170, w: 150, h: 64, kind: 'person' },
      { id: 'whisper', label: 'Whisper', sub: 'voice → text', x: 210, y: 60, w: 160, h: 64, kind: 'model' },
      { id: 'guard', label: 'Injection guard', sub: 'tested on 34 attacks', x: 210, y: 268, w: 160, h: 64, kind: 'code' },
      { id: 'planner', label: 'Planner', sub: 'Gemini · picks the move', x: 405, y: 168, w: 195, h: 68, kind: 'model' },
      { id: 'pricing', label: 'Pricing engine', sub: 'deterministic code', x: 640, y: 50, w: 180, h: 68, kind: 'code' },
      { id: 'state', label: 'Deal state', sub: 'DynamoDB · S3', x: 640, y: 268, w: 180, h: 64, kind: 'store' },
      { id: 'judge', label: 'Judge', sub: 'Gemini · reviews', x: 850, y: 168, w: 145, h: 68, kind: 'model' },
    ],
    edges: [
      { id: 'wa-whisper', from: 'wa', to: 'whisper' },
      { id: 'whisper-guard', from: 'whisper', to: 'guard' },
      { id: 'guard-planner', from: 'guard', to: 'planner' },
      { id: 'planner-pricing', from: 'planner', to: 'pricing' },
      { id: 'planner-state', from: 'planner', to: 'state' },
      { id: 'planner-judge', from: 'planner', to: 'judge' },
      { id: 'judge-wa', from: 'judge', to: 'wa', route: 'below' },
    ],
    steps: [
      { edge: 'wa-whisper', log: 'whatsapp · voice note from the customer' },
      { edge: 'whisper-guard', log: 'whisper → “consigo pagar uns 200 por mês”' },
      { edge: 'guard-planner', log: 'guard → clean: no instructions hidden in the message' },
      { edge: 'planner-pricing', log: 'planner → action: offer_installments(budget ≈ 200)' },
      { edge: 'planner-pricing', reverse: true, log: 'pricing (code) → 6× R$ 198,40, inside policy' },
      { edge: 'planner-state', log: 'state ← offer #3 saved with the full audit trail' },
      { edge: 'planner-judge', log: 'judge → reply only uses computed numbers ✓' },
      { edge: 'judge-wa', log: '→ whatsapp: proposal sent, waiting for the customer' },
    ],
  },
  {
    id: 'medalvo',
    tab: 'MedAlvo engine',
    title: 'A question bank that runs itself',
    where: 'MedAlvo · founder',
    blurb:
      'Agents in cloud VMs turn official exams into a clean question bank. An adaptive engine then decides, for each student, what to ask next and when to review it.',
    facts: [
      { value: '189k', label: 'questions' },
      { value: '4', label: 'models in the loop' },
    ],
    nodes: [
      { id: 'sources', label: 'Official exams', sub: '300+ institutions', x: 10, y: 40, w: 150, h: 64, kind: 'store' },
      { id: 'scrapers', label: 'Scraper agents', sub: 'cloud VMs', x: 200, y: 40, w: 160, h: 64, kind: 'model' },
      { id: 'ocr', label: 'OCR + parsing', sub: 'text, images, keys', x: 400, y: 40, w: 160, h: 64, kind: 'code' },
      { id: 'dedupe', label: 'Dedup', sub: 'pgvector similarity', x: 600, y: 40, w: 160, h: 64, kind: 'code' },
      { id: 'qa', label: 'QA agent', sub: 'checks answer keys', x: 800, y: 40, w: 180, h: 64, kind: 'model' },
      { id: 'bank', label: 'Question bank', sub: '189k questions', x: 800, y: 200, w: 180, h: 68, kind: 'store' },
      { id: 'irt', label: 'IRT 2PL', sub: 'difficulty', x: 590, y: 170, w: 150, h: 58, kind: 'code' },
      { id: 'bkt', label: 'Knowledge tracing', sub: 'what you know', x: 590, y: 260, w: 150, h: 58, kind: 'code' },
      { id: 'fsrs', label: 'FSRS v6', sub: 'when to review', x: 590, y: 350, w: 150, h: 58, kind: 'code' },
      { id: 'picker', label: 'Thompson sampling', sub: 'picks the next one', x: 340, y: 255, w: 190, h: 68, kind: 'model' },
      { id: 'student', label: 'Student', sub: 'web & app', x: 60, y: 255, w: 170, h: 68, kind: 'person' },
    ],
    edges: [
      { id: 'src-scr', from: 'sources', to: 'scrapers' },
      { id: 'scr-ocr', from: 'scrapers', to: 'ocr' },
      { id: 'ocr-dd', from: 'ocr', to: 'dedupe' },
      { id: 'dd-qa', from: 'dedupe', to: 'qa' },
      { id: 'qa-bank', from: 'qa', to: 'bank' },
      { id: 'bank-irt', from: 'bank', to: 'irt' },
      { id: 'irt-pick', from: 'irt', to: 'picker' },
      { id: 'bkt-pick', from: 'bkt', to: 'picker' },
      { id: 'fsrs-pick', from: 'fsrs', to: 'picker' },
      { id: 'pick-stu', from: 'picker', to: 'student' },
      { id: 'stu-fsrs', from: 'student', to: 'fsrs', route: 'below', dashed: true },
    ],
    steps: [
      { edge: 'src-scr', log: 'scraper agents → a new official exam lands' },
      { edge: 'scr-ocr', log: 'OCR → 100 questions with images and the answer key' },
      { edge: 'ocr-dd', log: 'dedup → 0.94 cosine to an existing question: merged' },
      { edge: 'dd-qa', log: 'QA agent → answer key matches the official one ✓' },
      { edge: 'qa-bank', log: 'bank ← 99 new questions, tagged by specialty' },
      { edge: 'bank-irt', log: 'IRT → difficulty b = 1.3, fitted on past answers' },
      { edge: 'bkt-pick', log: 'knowledge tracing → p(knows bronchiolitis) = 0.41' },
      { edge: 'fsrs-pick', log: 'FSRS → a cardiology review is due today' },
      { edge: 'pick-stu', log: 'Thompson sampling → next: Pediatrics · Bronchiolitis' },
      { edge: 'stu-fsrs', log: 'student answers B (wrong) → mastery and schedule update' },
    ],
  },
];
