// Versão em português (pt-BR) de site.ts. Mesmas chaves, mesma ordem.

import type { Project, Job } from './site';
export type { Project, Job, Link } from './site';

export const person = {
  name: 'Felipe Ribeiro',
  role: 'Engenheiro de IA',
  location: 'São Paulo, Brasil',
  email: 'felipe.frf27@gmail.com',
  github: 'https://github.com/felipefrf',
  linkedin: 'https://www.linkedin.com/in/felipe-farias-ribeiro',
  now: 'Construindo numa startup de IA stealth',
  nowPlace: 'San Francisco · remoto',
};

// Números grandes abaixo do hero. `count` anima a partir de 0 quando entra na tela.
export const impact = [
  { value: '24º', label: 'de 4.033 no vestibular do ITA', detail: '144 vagas na escola de engenharia mais respeitada do Brasil', logo: '/img/ita.png' },
  { value: '1º', label: 'lugar geral, maior nota', detail: 'Olimpíada Iberoamericana de Física 2020', accent: true },
  { value: '50+', count: 50, suffix: '+', label: 'medalhas em olimpíadas', detail: 'Duas internacionais, 2017–2020' },
  { value: '1 de 5', label: 'alunos do ITA escolhidos', detail: 'Para o Future Lab, primeira edição, da Telles Foundation, 2026' },
  { value: 'Melhor', label: 'projeto conceitual de satélite', detail: 'Matsumoto-2, II SPOCS no ITA, 2026' },
];

export const featured: Project[] = [
  {
    slug: 'medalvo',
    name: 'MedAlvo',
    kind: 'Fundador',
    year: '2026 —',
    blurb:
      'Plataforma adaptativa de preparação para as provas de residência médica, operada como uma empresa que roda sozinha: agentes de IA em VMs na nuvem fazem scraping, OCR, deduplicação e QA do banco de questões e cuidam da operação do dia a dia. Já fatura.',
    points: [
      'FSRS v6 + Thompson Sampling decidem o que cada aluno vê em seguida',
      'IRT 2PL calibra a dificuldade; Bayesian Knowledge Tracing modela o que você sabe',
      'FastAPI + Postgres/pgvector no Cloud Run, React no front',
    ],
    stack: ['FastAPI', 'Postgres', 'pgvector', 'Cloud Run', 'React', 'AI agents'],
    links: [{ label: 'medalvo.com.br', href: 'https://medalvo.com.br' }],
    stats: [
      { value: '163k+', label: 'questões de provas oficiais' },
      { value: '2.045', label: 'provas anteriores completas' },
    ],
  },
  {
    slug: 'penpad',
    name: 'penpad',
    kind: 'Open source',
    year: '2026',
    blurb:
      'Transforma anotações em Markdown + LaTeX em páginas manuscritas realistas para iPad, Goodnotes e reMarkable. Um modelo de escrita varia cada glifo, e uma trava de legibilidade garante que tudo continue legível. Veja ele escrevendo.',
    points: [
      'Frações, integrais, raízes e vetores diagramados à mão',
      'Saída reproduzível por seed, offline, só pip install, CI em vários sistemas',
    ],
    stack: ['Python', 'resvg', 'LaTeX'],
    links: [
      { label: 'Página do projeto', href: '/penpad/' },
      { label: 'GitHub', href: 'https://github.com/felipefrf/penpad' },
    ],
  },
  {
    slug: 'curo',
    name: 'Curo',
    kind: 'Side project',
    year: '2026',
    blurb:
      'Uma camada de atendimento ao paciente, nativa do WhatsApp, para especialistas e clínicas: o paciente tem uma conversa só, e o Curo fala com o médico, o hospital e o convênio. Feito com meu irmão Rafael (MIT). Levamos a sério por um tempo, a ponto de fazer entrevista na Y Combinator.',
    points: [
      'Agente com 14 ferramentas para triagem, agendamento, FAQ, documentos e passagem para a equipe',
      'Agendamento determinístico com reservas idempotentes; isolamento por clínica desde o primeiro tenant',
      'Google ADK + Gemini na GCP, Postgres, portal da clínica em React',
    ],
    stack: ['Google ADK', 'Gemini', 'Postgres', 'React', 'WhatsApp'],
    links: [{ label: 'felipefrf.com/curo', href: '/curo/' }],
  },
  {
    slug: 'flights',
    name: 'Flight Price Finder',
    kind: 'Side project',
    year: '2026',
    status: 'Dados ao vivo do Google Flights via treg',
    blurb:
      'Acha o jeito mais barato de ir de uma cidade a outra, incluindo tarifas hidden-city: uma passagem para um destino mais distante, com conexão justamente onde você quer descer. Toda busca mostra que buscou, porque a maioria não acha nada, e tudo bem.',
    points: [
      'Achado real: SSA→CGH direto saía R$ 381; SSA→CGH→FLN saía R$ 248',
      'Agrupa aeroportos próximos (GRU/CGH/VCP) e tarifas com vários trechos num bilhete só',
      'As tarifas vêm do Google Flights via treg; roda na minha máquina atrás de um Cloudflare Tunnel + Access',
    ],
    stack: ['Python', 'treg', 'Google Flights', 'Cloudflare Tunnel'],
    links: [],
  },
];

export const apice = {
  name: 'Ápice',
  kind: 'Negócio paralelo',
  year: '2026',
  blurb:
    'Uma software house que eu e meu irmão tocamos em paralelo. Dois engenheiros, ITA e MIT: desenhamos o sistema e escrevemos o código nós mesmos, para empresas que precisam de software que aguenta o tranco.',
  href: 'https://software-house-six.vercel.app',
  work: [
    {
      client: 'Império Eventos',
      name: 'Império Logística',
      what: 'Uma torre de controle logística (Next.js) e um app de campo para iOS e Android (Expo) sobre Supabase, lendo o estoque do EstoqueNOW para que o depósito e as equipes de evento trabalhem com os mesmos dados.',
    },
    {
      client: 'Clínicas e especialistas',
      name: 'Agentes de atendimento',
      what: 'Agentes de WhatsApp para clínicas médicas que cuidam de triagem, agendamento e acompanhamento.',
    },
  ],
};

export const more: Project[] = [
  {
    slug: 'editable-pets',
    name: 'Editable Pets',
    kind: 'App macOS',
    year: '2026',
    blurb: 'Um companheiro de desktop para o Claude Code e o Codex. Hooks nativos mostram todas as sessões de agente em paralelo num relance.',
    stack: ['Swift', 'Hooks'],
    links: [{ label: 'GitHub', href: 'https://github.com/felipefrf/editable-pets' }],
  },
  {
    slug: 'yt-to-md',
    name: 'yt-to-md',
    kind: 'CLI',
    year: '2026',
    blurb: 'Transforma qualquer vídeo do YouTube em Markdown limpo e estruturado, feito para agentes de IA. Sem chave de API, sem custo.',
    stack: ['Python'],
    links: [{ label: 'GitHub', href: 'https://github.com/felipefrf/yt-to-md' }],
  },
  {
    slug: 'dual-subtitles',
    name: 'Dual Subtitles',
    kind: 'Extensão Chrome',
    year: '2026',
    blurb: 'Legendas em dois idiomas, sincronizadas, no YouTube: uma para entender e outra para aprender, num overlay em Shadow DOM.',
    stack: ['TypeScript', 'WXT', 'React'],
    links: [{ label: 'GitHub', href: 'https://github.com/felipefrf/dual-subtitles-extension' }],
  },
  {
    slug: 'x-reset',
    name: 'x-reset',
    kind: 'Ferramenta',
    year: '2026',
    blurb: 'Apaga em massa tweets, retweets e respostas antigas a partir do seu arquivo oficial do X. Roda no navegador e retoma de onde parou.',
    stack: ['TypeScript', 'Playwright'],
    links: [{ label: 'GitHub', href: 'https://github.com/felipefrf/x-reset' }],
  },
];

export const jobs: Job[] = [
  {
    company: 'Startup de IA stealth',
    role: 'Founding Engineer',
    place: 'San Francisco · remoto',
    dates: 'set 2026 — hoje',
    summary: 'Construindo o Milo, uma IA pessoal peer-to-peer para equipes. O agente de cada funcionário roda na própria microVM Linux, com as ferramentas dele.',
    bullets: [
      'Entreguei as integrações com Microsoft Teams e Google Chat no mesmo nível de Slack e WhatsApp: OAuth agindo como o usuário, streaming, arquivos e transcrição de voz.',
      'Construí a camada de credenciais do agente de navegador hospedado: um cofre criptografado em que OTPs e segredos são injetados por alias, sem nunca entrar no contexto do modelo.',
      'Eval-first: suítes bilíngues de ship-gate que reproduzem casos de produção, revisões noturnas com LLM como juiz e uma ferramenta de “autópsia” que reconstrói qualquer conversa de ponta a ponta.',
    ],
  },
  {
    company: 'NG.CASH',
    role: 'Product Engineer',
    place: 'São Paulo · remoto',
    dates: 'jan 2026 — set 2026',
    summary: 'Agentes de LLM em produção e sistemas full-stack para uma fintech brasileira, onde uma resposta errada custa dinheiro de verdade.',
    bullets: [
      'Agente de negociação de dívidas no WhatsApp, com orquestração multimodelo e precificação determinística no código: 19% menos latência e 0 vazamentos numa bateria de 34 ataques de prompt injection.',
      'Migrei a folha de pagamento legada para Fastify + React no Cloud Run com Terraform, mais um pipeline com Gemini que valida notas fiscais de prestadores.',
      'Automatizei a triagem de intimações judiciais do Jurídico com OCR multimodal e extração de entidades, eliminando ~95% da revisão manual.',
    ],
  },
  {
    company: 'Credix',
    role: 'ML Engineer, Credit & Risk',
    place: 'Bélgica · remoto',
    dates: 'jul 2025 — jan 2026',
    summary: 'Modelos de crédito para compradores B2B em mercados emergentes, que viraram o motor de decisão automatizado e passaram a definir o preço para os vendedores.',
    bullets: [
      'Classificadores XGBoost e de regressão logística que separam compradores em faixas de DPD e perda previstos, em produção.',
      'Pipelines em SQL + Python para decisão quase em tempo real, com detecção de anomalias sinalizando fraude.',
    ],
  },
  {
    company: 'LinkedIn',
    role: 'Sales Strategy Intern, Data & AI',
    place: 'Nova York · remoto',
    dates: 'fev 2025 — jul 2025',
    summary: 'Trabalhei do Brasil com o time de vendas de EUA e Canadá.',
    bullets: ['Entreguei um chatbot de LLM sobre os dados do Salesforce CRM que substituiu as previsões de receita que dependiam de analistas.'],
  },
];

// Passagens mais curtas: aparecem compactas abaixo dos cargos principais.
export const earlier = [
  { company: 'Safra', role: 'US Equities Summer Intern', dates: 'jan — fev 2025', note: 'Pipeline de NLP sobre 10-Ks do SEC EDGAR' },
  { company: 'BTG Pactual', role: 'Automation Engineer Intern', dates: 'abr — ago 2024', note: 'Automações para o Jurídico e o negócio de reflorestamento; um período como PM' },
  { company: 'XP Inc.', role: 'Product Control Summer Intern', dates: 'dez 2023 — fev 2024', note: 'Automação de planilhas para product control' },
  { company: 'CNPq', role: 'Iniciação científica, ML', dates: 'ago 2023 — abr 2024', note: 'MLPs vs CNNs no MNIST, acurácia de 97,4% → 99,2%' },
];

export const building = [
  { name: 'Comissão de Estágios do ITA', role: 'Presidente', dates: '2023 — 2024', note: 'Organizei a maior feira de carreiras do interior do Brasil, 1.800+ participantes' },
  { name: 'Fundação Estudar', role: 'Multiplicador', dates: 'mar — out 2024', note: 'Workshops e mentoria para estudantes de grupos sub-representados' },
  { name: 'Iniciativa Feynman', role: 'Cofundador e Coordenador', dates: 'set 2019 — abr 2021', note: '0 → 81 voluntários em menos de 6 meses, 350+ alunos de escola pública na pandemia' },
];

export const medals = [
  {
    kind: 'gold' as const,
    rank: '1º',
    title: 'Ouro com a maior nota, 1º lugar geral',
    event: 'Olimpíada Iberoamericana de Física',
    short: 'OIbF',
    year: '2020',
    ring: 'OLIMPÍADA IBEROAMERICANA DE FÍSICA · 2020 · ',
    logo: '/img/olympiads/oibf.png',
    note: '1º lugar geral, mais o prêmio especial pela melhor solução do Problema 2.',
  },
  {
    kind: 'silver' as const,
    rank: 'Ag',
    title: 'Medalha de prata',
    event: 'Olimpíada Nórdico-Báltica de Física',
    short: 'NBPhO',
    year: '2020',
    ring: 'NORDIC-BALTIC PHYSICS OLYMPIAD · 2020 · ',
    logo: '/img/olympiads/nbpho.png',
    note: 'Prêmio especial pela melhor solução do Problema 1. 21,4 de 36,5 pontos, 16º no geral, no primeiro ano do Brasil como convidado.',
  },
];

// A prova, direto dos documentos dos organizadores.
export const receipts = {
  certificate: {
    src: '/img/olympiads/oibf-2020-certificate.jpg',
    caption: 'Certificado da OIbF virtual 2020, de 5 a 13 de dezembro de 2020',
    medalTable: 'https://drive.google.com/file/d/1Z2PJxCC9j0_KWcFwX-5_0-Jzsm5zoqWz/view',
    announcement: 'https://www.sbfisica.org.br/v1/sbf/olimpiada-iberoamericana-de-fisica-oibf-2020/',
  },
  oibfRow: {
    cols: ['Nombre', 'Apellido', 'País', 'Medalla', 'Premio especial'],
    row: ['Felipe', 'Farias Ribeiro Filho', 'Brasil', 'ORO', 'Mejor resolución del problema 2'],
    caption: 'Linha 1 do quadro oficial de medalhas da OIbF 2020 (46 premiados)',
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
  { name: 'OBF', full: 'Olimpíada Brasileira de Física', result: '4× ouro' },
  { name: 'OBA', full: 'Olimpíada Brasileira de Astronomia e Astronáutica', result: '2× ouro' },
  { name: 'OBR', full: 'Olimpíada Brasileira de Robótica', result: '2× ouro, prata' },
  { name: 'OBMEP', full: 'Olimpíada Brasileira de Matemática das Escolas Públicas', result: 'Ouro' },
];

// "Ver a lista completa": as principais medalhas, das mais recentes para as mais antigas.
// Colocações e prêmios especiais que não são medalhas ficam nos cards de medalha.
export const medalList = [
  { year: 2020, medal: 'gold', name: 'Olimpíada Iberoamericana de Física (OIbF)', scope: 'Internacional' },
  { year: 2020, medal: 'silver', name: 'Olimpíada Nórdico-Báltica de Física (NBPhO), Tallinn Tech', scope: 'Internacional' },
  { year: 2020, medal: 'gold', name: 'Olimpíada Brasileira de Física (OBF)', scope: 'Nacional' },
  { year: 2020, medal: 'gold', name: 'Olimpíada Brasileira de Astronomia e Astronáutica (OBA)', scope: 'Nacional' },
  { year: 2019, medal: 'gold', name: 'Olimpíada Brasileira de Física (OBF)', scope: 'Nacional' },
  { year: 2019, medal: 'gold', name: 'Olimpíada Brasileira de Robótica (OBR)', scope: 'Nacional' },
  { year: 2019, medal: 'gold', name: 'Olimpíada Nacional de Ciências (ONC)', scope: 'Nacional' },
  { year: 2019, medal: 'gold', name: 'Olimpíada Brasileira de Astronomia e Astronáutica (OBA)', scope: 'Nacional' },
  { year: 2018, medal: 'gold', name: 'Olimpíada Brasileira de Física (OBF)', scope: 'Nacional' },
  { year: 2018, medal: 'silver', name: 'Olimpíada Brasileira de Robótica (OBR)', scope: 'Nacional' },
  { year: 2018, medal: 'gold', name: 'Olimpíada Baiana de Química (OBaQ)', scope: 'Estadual' },
  { year: 2017, medal: 'gold', name: 'Olimpíada Brasileira de Física (OBF)', scope: 'Nacional' },
  { year: 2017, medal: 'gold', name: 'Olimpíada Brasileira de Matemática das Escolas Públicas (OBMEP)', scope: 'Nacional' },
  { year: 2017, medal: 'gold', name: 'Olimpíada Brasileira de Robótica (OBR)', scope: 'Nacional' },
  { year: 2017, medal: 'gold', name: 'Olimpíada Brasileira de Física das Escolas Públicas (OBFEP)', scope: 'Nacional' },
];

// Galeria de fotos abaixo das medalhas, das mais recentes para as mais antigas.
export const otherHonors = [
  {
    title: 'Melhor projeto conceitual de satélite',
    event: 'Matsumoto-2 · II SPOCS, ITA · julho de 2026',
    note: 'Um satélite SAR em banda C para mapear áreas agrícolas no Rio Grande do Norte, projetado por um time de seis. Melhor trabalho de graduação no seminário de projeto conceitual de satélites do ITA.',
    photo: '/img/spocs-award.jpg',
    w: 1400,
    h: 1054,
    alt: 'Quatro integrantes do time do Matsumoto-2 segurando certificados de “Melhor Trabalho de Graduação” ao lado do pôster do satélite no ITA',
  },
  {
    title: 'Future Lab 2026',
    event: 'Telles Foundation · julho–agosto de 2026',
    note: 'Um dos cinco alunos do ITA selecionados para a primeira edição, um programa de seis semanas para até 50 pessoas, todas por indicação.',
    photo: '/img/futurelab.jpg',
    w: 933,
    h: 1400,
    alt: 'Felipe ouvindo durante uma sessão do Future Lab em São Paulo',
    focus: '50% 30%',
  },
  {
    title: 'Brasil Project',
    event: 'Harvard e MIT · Cambridge, 2026',
    note: 'Convidado para a conferência em que brasileiros na fronteira da pesquisa e da indústria discutem o futuro do país.',
    photo: '/img/brasil-project.jpg',
    w: 1400,
    h: 1050,
    alt: 'Felipe e três amigos na conferência Brasil Project, em Cambridge',
    focus: '50% 40%',
  },
  {
    title: '2º lugar',
    event: 'SkyLens · Nameless Hackathon (apoiado por VCs), 2025',
    note: 'Imagens do satélite CBERS-4A, do INPE, com pansharpening para mosaicos de 2 m, para achar expansão urbana em terras tributadas como rurais.',
    photo: '/img/skylens-award.jpg',
    w: 1600,
    h: 1200,
    alt: 'O time do SkyLens no palco do Nameless Hackathon, sob uma tela com “2º lugar · SkyLens”',
  },
];

export const education = {
  school: 'Instituto Tecnológico de Aeronáutica (ITA)',
  degree: 'Engenharia Aeroespacial, minor em Ciência de Dados',
  dates: 'fev 2023 — dez 2027',
  note: 'Mantido pela Força Aérea Brasileira desde 1950 e considerado por muitos a melhor escola de engenharia do Brasil.',
  entry: [
    { value: '24º', label: 'lugar no vestibular' },
    { value: '4.033', label: 'candidatos na ampla concorrência' },
    { value: '144', label: 'vagas' },
  ],
  logo: '/img/ita.png',
};

export const toolbox = [
  { area: 'IA e agentes', items: ['Agentes de LLM', 'Orquestração multiagente', 'Tool use e MCP', 'RAG', 'Evals e guardrails', 'PyTorch'] },
  { area: 'Produto', items: ['TypeScript', 'Node', 'Next.js', 'React', 'Fastify', 'FastAPI', 'Python'] },
  { area: 'Dados', items: ['Postgres', 'pgvector', 'Snowflake', 'DynamoDB', 'XGBoost', 'SQL'] },
  { area: 'Infra', items: ['GCP Cloud Run', 'AWS', 'Terraform', 'Docker', 'GitHub Actions', 'Linux'] },
];

// Pontos na trajetória do hero, da esquerda para a direita.
export const flightPath = [
  { year: '2017–20', label: 'Olimpíadas · 50+ medalhas' },
  { year: '2019', label: 'Iniciativa Feynman' },
  { year: '2023', label: 'ITA · XP · BTG' },
  { year: '2025', label: 'Safra · LinkedIn · Credix' },
  { year: '2026', label: 'NG.CASH · MedAlvo' },
  { year: 'hoje', label: 'Founding engineer' },
];
